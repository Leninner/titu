import { zipSync } from 'fflate'
import type { SubmissionEntry } from '../domain/submission-entries'
import type { WorkspaceSnapshot } from '../domain/types'
import { sha256 } from '../storage/restore'

const maxPackageBytes = 250 * 1024 * 1024

async function verifiedBytes(snapshot: WorkspaceSnapshot, versionId: string) {
  const version = snapshot.versions.find((v) => v.id === versionId)
  const blob = snapshot.blobs.find((b) => b.id === version?.blobId)?.data
  if (!version || !blob) throw new Error('Falta una versión del paquete')
  if (blob.size !== version.size || (await sha256(blob)) !== version.sha256)
    throw new Error('El archivo no coincide con su versión guardada')
  return new Uint8Array(await blob.arrayBuffer())
}

export async function submissionZip(
  snapshot: WorkspaceSnapshot,
  entries: SubmissionEntry[],
): Promise<Blob> {
  if (!entries.length) throw new Error('Selecciona al menos un archivo')
  const files: Record<string, Uint8Array> = Object.create(null)
  let total = 0
  for (const entry of entries) {
    const bytes = await verifiedBytes(snapshot, entry.versionId)
    total += bytes.byteLength
    if (total > maxPackageBytes) throw new Error('El paquete supera 250 MiB')
    files[entry.name] = bytes
  }
  return new Blob([zipSync(files, { level: 0 }) as Uint8Array<ArrayBuffer>], {
    type: 'application/zip',
  })
}
