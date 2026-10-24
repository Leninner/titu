import type { DocumentVersion, TaskRecord, Workspace } from '../../domain/types'
import { repository } from '../../storage/repository'
import { systemFileName } from '../../domain/file-names'
import { reportAnalysis } from '../documents/report-analysis'

export type EvidenceField = 'evidenceVersionIds' | 'outputVersionIds'

// A task keeps one version per document: including a version replaces its siblings.
export function withEvidence(
  task: TaskRecord,
  workspace: Workspace,
  versionId: string,
  checked: boolean,
  field: EvidenceField = 'evidenceVersionIds',
): TaskRecord {
  if (!checked) return { ...task, [field]: task[field].filter((id) => id !== versionId) }
  const documentId = workspace.versions.find((version) => version.id === versionId)?.documentId
  const siblings = new Set(workspace.versions
    .filter((version) => version.documentId === documentId && version.id !== versionId)
    .map((version) => version.id))
  return {
    ...task,
    [field]: [...new Set([...task[field].filter((id) => !siblings.has(id)), versionId])],
  }
}

export async function uploadVersion(
  workspace: Workspace,
  file: File,
  category: string,
  documentId?: string,
): Promise<DocumentVersion> {
  if (file.size > 25 * 1024 * 1024) throw new Error('El máximo es 25 MiB por archivo')
  if (!/\.(pdf|docx?|jpe?g|png)$/i.test(file.name))
    throw new Error('Usa PDF, Word, JPG o PNG')
  const { inspectPdf } = await import('../documents/inspect-pdf')
  const textualPdfStatus = /\.pdf$/i.test(file.name) ? await inspectPdf(file) : 'unknown'
  const name = systemFileName(workspace, category, file.name, documentId)
  return repository.addDocumentVersion({
    file,
    originalName: name,
    name,
    documentId,
    category,
    signatureStatus: 'unsigned',
    textualPdfStatus,
    reportAnalysis: await reportAnalysis(file, category),
  })
}

export function withUploadedVersion(
  task: TaskRecord,
  workspace: Workspace,
  version: DocumentVersion,
  category: string,
  field: EvidenceField = 'evidenceVersionIds',
): TaskRecord {
  const replacedIds = new Set(workspace.versions
    .filter((item) => item.documentId === version.documentId || (category === 'personal' &&
      workspace.documents.some((document) =>
        document.id === item.documentId && document.category === 'personal')))
    .map((item) => item.id))
  return {
    ...task,
    [field]: [...new Set([...task[field].filter((id) => !replacedIds.has(id)), version.id])],
  }
}

export async function addEvidence(
  task: TaskRecord,
  workspace: Workspace,
  file: File,
  category: string,
  documentId?: string,
  field: EvidenceField = 'evidenceVersionIds',
): Promise<{ task: TaskRecord; version: DocumentVersion }> {
  const version = await uploadVersion(workspace, file, category, documentId)
  return { task: withUploadedVersion(task, workspace, version, category, field), version }
}

export async function signEvidence(
  task: TaskRecord,
  workspace: Workspace,
  version: DocumentVersion,
  signed: boolean,
  field: EvidenceField = 'evidenceVersionIds',
): Promise<TaskRecord> {
  const blob = await repository.getBlob(version.blobId)
  if (!blob) throw new Error('No se encontró el archivo original')
  const document = workspace.documents.find((item) => item.id === version.documentId)
  if (!document) throw new Error('No se encontró el documento')
  const updated = await repository.addDocumentVersion({
    file: blob,
    originalName: version.originalName,
    documentId: version.documentId,
    category: document.category,
    signatureStatus: signed ? 'reported-signed' : 'unsigned',
    textualPdfStatus: version.textualPdfStatus,
    issuedOn: version.issuedOn,
    expiresOn: version.expiresOn,
    reportAnalysis: version.reportAnalysis,
  })
  return {
    ...task,
    [field]: [...new Set([...task[field].filter((id) => id !== version.id), updated.id])],
  }
}
