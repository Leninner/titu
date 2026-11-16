import type { DocumentRecord, DocumentVersion, Submission, TaskRecord } from '../domain/types'

export interface FileRecords {
  documents: DocumentRecord[]
  versions: DocumentVersion[]
  tasks: TaskRecord[]
  submissions: Submission[]
  acknowledgementBlobIds: string[]
}

export interface ConsolidatedFiles {
  documents: DocumentRecord[]
  versions: DocumentVersion[]
  tasks: TaskRecord[]
  freedBlobIds: string[]
}

export const thesisStageCategories: Record<string, string> = {
  'recalificacion-research': 'tesis-corregido',
  'biblioteca-firma-estudiante': 'tesis-firma-estudiante',
  'biblioteca-firmas-docentes': 'tesis-firmas-docentes',
  'biblioteca-decanato': 'tesis-decanato',
  'dia-hora': 'tesis-decanato',
}

const newest = (a: DocumentVersion, b: DocumentVersion) =>
  b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id)

function sentVersionIds(submissions: Submission[]) {
  return new Set(submissions.flatMap((submission) => submission.exactVersionIds))
}

function currentVersionByDocument(versions: DocumentVersion[]) {
  const current = new Map<string, DocumentVersion>()
  for (const version of [...versions].sort(newest))
    if (!current.has(version.documentId)) current.set(version.documentId, version)
  return current
}

function replaceIds(ids: string[], replacement: Map<string, string>) {
  return [...new Set(ids.map((id) => replacement.get(id) ?? id))]
}

function withReplacedVersions(task: TaskRecord, replacement: Map<string, string>): TaskRecord {
  return {
    ...task,
    evidenceVersionIds: replaceIds(task.evidenceVersionIds, replacement),
    outputVersionIds: replaceIds(task.outputVersionIds, replacement),
  }
}

function freedBlobs(removed: DocumentVersion[], kept: DocumentVersion[], acknowledgementBlobIds: string[]) {
  const used = new Set([...kept.map((version) => version.blobId), ...acknowledgementBlobIds])
  return [...new Set(removed.map((version) => version.blobId))].filter((blobId) => !used.has(blobId))
}

export function consolidateFiles(records: FileRecords): ConsolidatedFiles {
  const sent = sentVersionIds(records.submissions)
  const current = currentVersionByDocument(records.versions)
  const isKept = (version: DocumentVersion) =>
    sent.has(version.id) || current.get(version.documentId) === version
  const kept = records.versions.filter(isKept)
  const removed = records.versions.filter((version) => !isKept(version))
  const replacement = new Map(removed.map((version) => [version.id, current.get(version.documentId)!.id]))
  const keptDocumentIds = new Set(kept.map((version) => version.documentId))
  return {
    documents: records.documents.filter((document) => keptDocumentIds.has(document.id)),
    versions: kept,
    tasks: records.tasks.map((task) => withReplacedVersions(task, replacement)),
    freedBlobIds: freedBlobs(removed, kept, records.acknowledgementBlobIds),
  }
}

interface StageCopy {
  version: DocumentVersion
  document: DocumentRecord
}

function stageCopy(version: DocumentVersion, source: DocumentRecord, category: string): StageCopy {
  const documentId = `${source.id}-${category}`
  return {
    version: { ...version, id: `${version.id}-${category}`, documentId },
    document: { ...source, id: documentId, category },
  }
}

function thesisStageCopies(records: FileRecords) {
  const copies = new Map<string, Map<string, StageCopy>>()
  for (const task of records.tasks) {
    const category = thesisStageCategories[task.definitionId]
    if (!category) continue
    const taskCopies = new Map<string, StageCopy>()
    for (const id of task.evidenceVersionIds) {
      const version = records.versions.find((item) => item.id === id)
      const document = records.documents.find((item) => item.id === version?.documentId)
      if (version && document?.category === 'tesis') taskCopies.set(id, stageCopy(version, document, category))
    }
    if (taskCopies.size) copies.set(task.id, taskCopies)
  }
  return copies
}

function withCopiedEvidence(task: TaskRecord, copies: Map<string, StageCopy> | undefined): TaskRecord {
  if (!copies) return task
  const replacement = new Map([...copies].map(([id, copy]) => [id, copy.version.id]))
  return { ...task, evidenceVersionIds: replaceIds(task.evidenceVersionIds, replacement) }
}

function withCopiedSubmission(submission: Submission, copies: Map<string, StageCopy> | undefined): Submission {
  if (!copies) return submission
  return {
    ...submission,
    exactVersionIds: submission.exactVersionIds.map((id) => copies.get(id)?.version.id ?? id),
  }
}

function uniqueById<T extends { id: string }>(items: T[]) {
  return [...new Map(items.map((item) => [item.id, item])).values()]
}

export function splitThesisStages(records: FileRecords): FileRecords {
  const copies = thesisStageCopies(records)
  if (!copies.size) return records
  const tasks = records.tasks.map((task) => withCopiedEvidence(task, copies.get(task.id)))
  const submissions = records.submissions.map((submission) =>
    withCopiedSubmission(submission, copies.get(submission.taskId)),
  )
  const allCopies = [...copies.values()].flatMap((taskCopies) => [...taskCopies.values()])
  const referenced = new Set([
    ...tasks.flatMap((task) => [...task.evidenceVersionIds, ...task.outputVersionIds]),
    ...submissions.flatMap((submission) => submission.exactVersionIds),
  ])
  const copiedIds = new Set([...copies.values()].flatMap((taskCopies) => [...taskCopies.keys()]))
  const versions = uniqueById([
    ...records.versions.filter((version) => !copiedIds.has(version.id) || referenced.has(version.id)),
    ...allCopies.map((copy) => copy.version),
  ])
  const documentIds = new Set(versions.map((version) => version.documentId))
  const documents = uniqueById([...records.documents, ...allCopies.map((copy) => copy.document)])
    .filter((document) => documentIds.has(document.id))
  return { ...records, documents, versions, tasks, submissions }
}
