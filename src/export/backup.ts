import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'
import type { AnnexDraft, WorkspaceSnapshot } from '../domain/types'
import { backupManifestSchema, currentBackupFormat } from '../domain/schemas'
import { sha256, validateBackup, type ValidatedBackup } from '../storage/restore'

export const BACKUP_LIMITS = {
  compressed: 250 * 1024 * 1024,
  expanded: 500 * 1024 * 1024,
  entries: 5000,
}
const safePath = (path: string) =>
  !!path &&
  !path.startsWith('/') &&
  !path.includes('\\') &&
  !path.includes(':') &&
  !path.includes('\0') &&
  !path.split('/').some((p) => p === '..' || p === '.')
export function preflightZip(bytes: Uint8Array): Map<string, number> {
  const fail = () => {
    throw new Error('ZIP inválido o supera el límite permitido')
  }
  if (bytes.length > BACKUP_LIMITS.compressed || bytes.length < 22) return fail()
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let end = bytes.length - 22
  while (end >= Math.max(0, bytes.length - 65557) && view.getUint32(end, true) !== 0x06054b50) end--
  if (end < 0 || view.getUint32(end, true) !== 0x06054b50) return fail()
  const count = view.getUint16(end + 10, true)
  const centralSize = view.getUint32(end + 12, true)
  let offset = view.getUint32(end + 16, true)
  if (
    view.getUint16(end + 4, true) !== 0 ||
    view.getUint16(end + 6, true) !== 0 ||
    count !== view.getUint16(end + 8, true) ||
    count > BACKUP_LIMITS.entries ||
    offset + centralSize !== end ||
    end + 22 + view.getUint16(end + 20, true) !== bytes.length
  )
    return fail()
  let total = 0
  const entries = new Map<string, number>()
  const ranges: { start: number; end: number }[] = []
  for (let i = 0; i < count; i++) {
    if (offset + 46 > end || view.getUint32(offset, true) !== 0x02014b50) return fail()
    const flags = view.getUint16(offset + 8, true)
    const method = view.getUint16(offset + 10, true)
    const compressed = view.getUint32(offset + 20, true)
    const size = view.getUint32(offset + 24, true)
    const length = view.getUint16(offset + 28, true)
    const next =
      offset + 46 + length + view.getUint16(offset + 30, true) + view.getUint16(offset + 32, true)
    if (next > end) return fail()
    const name = strFromU8(bytes.subarray(offset + 46, offset + 46 + length))
    total += size
    if (
      (flags & 1) !== 0 ||
      ![0, 8].includes(method) ||
      !safePath(name) ||
      entries.has(name) ||
      total > BACKUP_LIMITS.expanded ||
      size === 0xffffffff ||
      compressed === 0xffffffff ||
      view.getUint16(offset + 34, true) !== 0
    )
      return fail()
    const local = view.getUint32(offset + 42, true)
    if (local + 30 > view.getUint32(end + 16, true) || view.getUint32(local, true) !== 0x04034b50)
      return fail()
    const localLength = view.getUint16(local + 26, true)
    const dataStart = local + 30 + localLength + view.getUint16(local + 28, true)
    const dataEnd = dataStart + compressed
    if (
      dataEnd > view.getUint32(end + 16, true) ||
      view.getUint16(local + 6, true) !== flags ||
      view.getUint16(local + 8, true) !== method ||
      strFromU8(bytes.subarray(local + 30, local + 30 + localLength)) !== name
    )
      return fail()
    if (
      !(flags & 8) &&
      (view.getUint32(local + 18, true) !== compressed || view.getUint32(local + 22, true) !== size)
    )
      return fail()
    ranges.push({ start: local, end: dataEnd })
    entries.set(name, size)
    offset = next
  }
  ranges.sort((a, b) => a.start - b.start)
  if (offset !== end || ranges.some((r, i) => i > 0 && r.start < ranges[i - 1].end)) return fail()
  return entries
}
export async function exportBackup(
  snapshot: WorkspaceSnapshot & { draftHistory?: AnnexDraft[] },
  catalogVersion: string,
): Promise<Blob> {
  const { blobs, draftHistory, ...records } = snapshot
  if (
    blobs.length + 1 > BACKUP_LIMITS.entries ||
    blobs.reduce((n, b) => n + b.data.size, 0) > BACKUP_LIMITS.expanded
  )
    throw new Error('El respaldo supera el límite permitido')
  const entries: Record<string, Uint8Array> = Object.create(null)
  const manifest = {
    formatVersion: currentBackupFormat,
    catalogVersion,
    exportedAt: new Date().toISOString(),
    records,
    blobs: [] as { id: string; path: string; size: number; sha256: string }[],
    draftHistory,
  }
  for (const [index, blob] of blobs.entries()) {
    const path = `blobs/${index}.bin`
    manifest.blobs.push({
      id: blob.id,
      path,
      size: blob.data.size,
      sha256: await sha256(blob.data),
    })
    entries[path] = new Uint8Array(await blob.data.arrayBuffer())
  }
  await validateBackup({ manifest, snapshot })
  entries['manifest.json'] = strToU8(JSON.stringify(manifest))
  if (Object.values(entries).reduce((n, b) => n + b.length, 0) > BACKUP_LIMITS.expanded)
    throw new Error('El respaldo supera el límite permitido')
  const zip = zipSync(entries, { level: 0 })
  preflightZip(zip)
  return new Blob([zip as Uint8Array<ArrayBuffer>], { type: 'application/zip' })
}
export async function importBackup(file: Blob): Promise<ValidatedBackup> {
  if (file.size > BACKUP_LIMITS.compressed) throw new Error('El ZIP supera el límite de 250 MiB')
  const bytes = new Uint8Array(await file.arrayBuffer())
  const expected = preflightZip(bytes)
  const entries = unzipSync(bytes)
  for (const [name, size] of expected)
    if (!entries[name] || entries[name].length !== size)
      throw new Error('Tamaño de entrada inconsistente')
  if (!entries['manifest.json']) throw new Error('Falta manifest.json')
  const manifest = backupManifestSchema.parse(JSON.parse(strFromU8(entries['manifest.json'])))
  const paths = new Set(manifest.blobs.map((b) => b.path))
  if (
    paths.size !== manifest.blobs.length ||
    paths.has('manifest.json') ||
    expected.size !== paths.size + 1
  )
    throw new Error('Entradas de respaldo inconsistentes')
  const blobs = manifest.blobs.map((entry) => {
    if (!safePath(entry.path) || !entries[entry.path])
      throw new Error('Falta un archivo del respaldo')
    return { id: entry.id, data: new Blob([entries[entry.path] as Uint8Array<ArrayBuffer>]) }
  })
  return validateBackup({
    manifest,
    snapshot: { ...manifest.records, blobs, draftHistory: manifest.draftHistory },
  })
}
