import type {
  DocumentRecord,
  DocumentVersion,
  Modality,
  Submission,
  TaskRecord,
  WorkflowDefinition,
} from '../domain/types'
import { emptyTask } from '../domain/task-record'

type StoredTask = Omit<TaskRecord, 'outputVersionIds'> & { outputVersionIds?: string[] }

export interface MigratableRecords {
  modality?: Modality
  tasks: StoredTask[]
  submissions: Submission[]
  documents: DocumentRecord[]
  versions: DocumentVersion[]
}

const unique = (ids: string[]) => [...new Set(ids)]

const receptionMerges = (modality?: Modality): [string, string][] => [
  ['aprobacion', 'propuesta'],
  ['notas', modality === 'article' ? 'calificadores-article' : 'calificadores-research'],
  ['biblioteca-aval-inicial', 'biblioteca-revision'],
  ['biblioteca-aval-final', 'biblioteca-decanato'],
]

function mergedStatus(source: TaskRecord | undefined, target: TaskRecord | undefined) {
  if (source?.status === 'completed') return 'completed'
  if (target?.status === 'completed') return 'waiting'
  return (target ?? source)!.status
}

function mergeTask(source: TaskRecord | undefined, target: TaskRecord | undefined, into: string, now: string) {
  const base = target ?? emptyTask(into)
  const status = mergedStatus(source, target)
  const reopened = target?.status === 'completed' && status === 'waiting'
  return {
    ...base,
    status,
    requirementChecks: { ...base.requirementChecks, ...source?.requirementChecks },
    outputVersionIds: unique([
      ...base.outputVersionIds,
      ...(source?.evidenceVersionIds ?? []),
      ...(source?.outputVersionIds ?? []),
    ]),
    submittedAt: base.submittedAt ?? source?.submittedAt,
    note: [base.note, source?.note].filter(Boolean).join('\n\n'),
    history: [
      ...base.history,
      ...(source?.history ?? []),
      ...(reopened ? [{ at: now, status, note: 'Falta registrar el resultado institucional' }] : []),
    ].sort((a, b) => a.at.localeCompare(b.at)),
  } satisfies TaskRecord
}

function mergeReceptions(records: MigratableRecords, tasks: TaskRecord[], now: string) {
  let submissions = records.submissions
  for (const [from, into] of receptionMerges(records.modality)) {
    const source = tasks.find((task) => task.definitionId === from)
    const target = tasks.find((task) => task.definitionId === into)
    if (!source && !target) continue
    const merged = mergeTask(source, target, into, now)
    tasks = [...tasks.filter((task) => task !== source && task !== target), merged]
    if (source)
      submissions = submissions.map((submission) =>
        submission.taskId === source.id ? { ...submission, taskId: merged.id } : submission,
      )
  }
  return { tasks, submissions }
}

function moveReceivedEvidence(
  task: TaskRecord,
  definitions: WorkflowDefinition[],
  records: MigratableRecords,
): TaskRecord {
  const definition = definitions.find((item) => item.id === task.definitionId)
  if (!definition) return task
  const inputCategories = new Set(
    definition.requirements
      .filter((requirement) => !requirement.annex)
      .map((requirement) => requirement.category),
  )
  const receivedCategories = new Set(
    definition.outputs
      .map((requirement) => requirement.category)
      .filter((category) => category && !inputCategories.has(category)),
  )
  const isReceived = (versionId: string) => {
    const documentId = records.versions.find((version) => version.id === versionId)?.documentId
    const category = records.documents.find((document) => document.id === documentId)?.category
    return receivedCategories.has(category)
  }
  const received = task.evidenceVersionIds.filter(isReceived)
  if (!received.length) return task
  return {
    ...task,
    evidenceVersionIds: task.evidenceVersionIds.filter((id) => !isReceived(id)),
    outputVersionIds: unique([...task.outputVersionIds, ...received]),
  }
}

export function moveReceivedFiles(
  records: MigratableRecords,
  definitions: WorkflowDefinition[],
): TaskRecord[] {
  return records.tasks.map((task) =>
    moveReceivedEvidence({ ...task, outputVersionIds: task.outputVersionIds ?? [] }, definitions, records),
  )
}

export function migrateTaskRecords(
  records: MigratableRecords,
  definitions: WorkflowDefinition[],
  now = new Date().toISOString(),
): { tasks: TaskRecord[]; submissions: Submission[] } {
  const normalized = records.tasks.map((task) => ({
    ...task,
    outputVersionIds: task.outputVersionIds ?? [],
  }))
  const merged = mergeReceptions(records, normalized, now)
  return {
    tasks: merged.tasks.map((task) => moveReceivedEvidence(task, definitions, records)),
    submissions: merged.submissions,
  }
}
