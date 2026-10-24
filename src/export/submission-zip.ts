import { zipSync } from 'fflate'
import type { WorkspaceSnapshot } from '../domain/types'
import { sha256 } from '../storage/restore'

// Control characters cannot appear in portable ZIP entry filenames.
// oxlint-disable eslint/no-control-regex
export function safeFilename(name: string): string {
  const last = name.split(/[\\/]/).pop() ?? 'documento'
  return last.replace(/[<>:"|?*\u0000-\u001f]/g, '_').replace(/^\.+/, '_') || 'documento'
}
export async function submissionZip(
  snapshot: WorkspaceSnapshot,
  versionIds: string[],
): Promise<Blob> {
  if (!versionIds.length) throw new Error('Selecciona al menos un archivo')
  const files: Record<string, Uint8Array> = Object.create(null)
  let total = 0
  for (const [index, id] of versionIds.entries()) {
    const version = snapshot.versions.find((v) => v.id === id)
    const blob = snapshot.blobs.find((b) => b.id === version?.blobId)?.data
    if (!version || !blob) throw new Error('Falta una versión del paquete')
    if (blob.size !== version.size || (await sha256(blob)) !== version.sha256)
      throw new Error('El archivo no coincide con su versión guardada')
    total += blob.size
    if (total > 250 * 1024 * 1024) throw new Error('El paquete supera 250 MiB')
    // Same numbering as the attachment list in the prepared email.
    files[`${index + 1}. ${safeFilename(version.originalName)}`] =
      new Uint8Array(await blob.arrayBuffer())
  }
  return new Blob([zipSync(files, { level: 0 }) as Uint8Array<ArrayBuffer>], {
    type: 'application/zip',
  })
}
export const createSubmissionZip = submissionZip
