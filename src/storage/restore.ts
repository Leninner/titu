import type { AnnexDraft, BackupManifest, WorkspaceSnapshot } from '../domain/types'
import { backupManifestSchema, currentBackupFormat } from '../domain/schemas'
import { workflowDefinitions } from '../catalog/workflows'
import { migrateTaskRecords, moveReceivedFiles } from './migrate-workspace'

export interface ValidatedBackup {
  manifest: BackupManifest & { draftHistory?: AnnexDraft[] }
  snapshot: WorkspaceSnapshot & { draftHistory?: AnnexDraft[] }
}
export async function sha256(blob: Blob): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer())
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('')
}
function upgradedRecords(manifest: BackupManifest) {
  const records = manifest.records
  if (manifest.formatVersion === 1)
    return migrateTaskRecords(
      { ...records, modality: records.profile?.modalidad },
      workflowDefinitions,
      manifest.exportedAt,
    )
  return { tasks: moveReceivedFiles(records, workflowDefinitions), submissions: records.submissions }
}
function upgradeManifest(manifest: BackupManifest & { draftHistory?: AnnexDraft[] }) {
  if (manifest.formatVersion === currentBackupFormat) return manifest
  return {
    ...manifest,
    formatVersion: currentBackupFormat,
    records: { ...manifest.records, ...upgradedRecords(manifest) },
  }
}
export async function validateBackup(input: ValidatedBackup): Promise<ValidatedBackup> {
  const manifest = upgradeManifest(backupManifestSchema.parse(input.manifest))
  const records = manifest.records
  const assert = (condition: boolean) => {
    if (!condition) throw new Error('Respaldo inválido: referencias o hashes inconsistentes')
  }
  const unique = (items: { id: string }[]) => {
    const ids = new Set(items.map((x) => x.id))
    assert(ids.size === items.length)
    return ids
  }
  const documents = unique(records.documents)
  const versions = unique(records.versions)
  const drafts = unique(records.drafts)
  const tasks = unique(records.tasks)
  unique(records.submissions)
  unique(records.personalEvents)
  const blobs = unique(input.snapshot.blobs)
  unique(manifest.blobs)
  assert(blobs.size === manifest.blobs.length)
  for (const entry of manifest.blobs) {
    const blob = input.snapshot.blobs.find((x) => x.id === entry.id)?.data
    assert(!!blob && blob.size === entry.size && (await sha256(blob)) === entry.sha256)
  }
  const histories = manifest.draftHistory ?? records.drafts
  const revisionIds = new Set(histories.map((d) => `${d.id}:${d.revision}`))
  assert(revisionIds.size === histories.length)
  for (const draft of records.drafts) assert(revisionIds.has(`${draft.id}:${draft.revision}`))
  for (const history of histories)
    assert(history.revision <= (records.drafts.find((d) => d.id === history.id)?.revision ?? -1))
  for (const draft of [...records.drafts, ...histories]) {
    assert(drafts.has(draft.id) && draft.savedRevision === draft.revision)
    for (const source of draft.sourceMonthlyRevisions)
      assert(revisionIds.has(`${source.draftId}:${source.revision}`))
    for (const activity of draft.activities)
      if (activity.sourceDraftId)
        assert(
          activity.sourceRevision !== undefined &&
            revisionIds.has(`${activity.sourceDraftId}:${activity.sourceRevision}`),
        )
  }
  for (const v of records.versions) {
    const blob = manifest.blobs.find((b) => b.id === v.blobId)
    assert(
      documents.has(v.documentId) && !!blob && blob.sha256 === v.sha256 && blob.size === v.size,
    )
    if (v.sourceDraftId)
      assert(
        drafts.has(v.sourceDraftId) &&
          (v.revision === undefined || revisionIds.has(`${v.sourceDraftId}:${v.revision}`)),
      )
  }
  for (const task of records.tasks)
    assert([...task.evidenceVersionIds, ...task.outputVersionIds].every((id) => versions.has(id)))
  for (const s of records.submissions)
    assert(
      tasks.has(s.taskId) &&
        s.exactVersionIds.every((id) => versions.has(id)) &&
        (!s.acknowledgementBlobId || blobs.has(s.acknowledgementBlobId)),
    )
  return {
    manifest,
    snapshot: { ...records, blobs: input.snapshot.blobs, draftHistory: histories },
  }
}
