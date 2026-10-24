import { expect, it } from 'vitest'
import { workflowDefinitions } from '../../src/catalog/workflows'
import { emptyTask } from '../../src/domain/task-record'
import type { DocumentRecord, DocumentVersion, Submission, TaskRecord } from '../../src/domain/types'
import { migrateTaskRecords, type MigratableRecords } from '../../src/storage/migrate-workspace'

const legacyTask = (definitionId: string, changes: Partial<TaskRecord> = {}) => {
  const { outputVersionIds: _, ...task } = { ...emptyTask(definitionId), ...changes }
  return task
}
const version = (id: string, documentId: string): DocumentVersion => ({
  id,
  documentId,
  blobId: `blob-${id}`,
  originalName: `${id}.pdf`,
  mime: 'application/pdf',
  size: 1,
  sha256: id,
  createdAt: '2026-10-01T12:00:00.000Z',
  signatureStatus: 'reported-signed',
  textualPdfStatus: 'text-detected',
})
const documents: DocumentRecord[] = [
  { id: 'resolution', name: 'Resolución', category: 'resolucion', createdAt: '' },
  { id: 'debt', name: 'No adeudar', category: 'no-adeudar', createdAt: '' },
  { id: 'grades', name: 'Notas', category: 'notas', createdAt: '' },
]
const versions = [version('resolution-v', 'resolution'), version('debt-v', 'debt'), version('grades-v', 'grades')]
const submission = (taskId: string): Submission => ({
  id: `sent-${taskId}`,
  taskId,
  exactVersionIds: [],
  recipient: 'informacion.fisei',
  sentAt: '2026-10-05T12:00:00.000Z',
  note: '',
})
const migrate = (records: Partial<MigratableRecords>) =>
  migrateTaskRecords(
    { tasks: [], submissions: [], documents, versions, ...records },
    workflowDefinitions,
    '2026-10-23T12:00:00.000Z',
  )
const task = (tasks: TaskRecord[], definitionId: string) =>
  tasks.find((item) => item.definitionId === definitionId)

it('merges a completed approval into the proposal and reassigns its records', () => {
  const { tasks, submissions } = migrate({
    tasks: [
      legacyTask('propuesta', {
        status: 'submitted',
        note: 'Enviado',
        evidenceVersionIds: [],
        history: [{ at: '2026-10-05T12:00:00.000Z', status: 'submitted', note: '' }],
      }),
      legacyTask('aprobacion', {
        status: 'completed',
        note: 'Resolución recibida',
        evidenceVersionIds: ['resolution-v'],
        requirementChecks: { extra: true },
        history: [{ at: '2026-10-10T12:00:00.000Z', status: 'completed', note: '' }],
      }),
    ],
    submissions: [submission('aprobacion')],
  })
  expect(task(tasks, 'aprobacion')).toBeUndefined()
  expect(task(tasks, 'propuesta')).toMatchObject({
    status: 'completed',
    outputVersionIds: ['resolution-v'],
    requirementChecks: { extra: true },
    note: 'Enviado\n\nResolución recibida',
  })
  expect(task(tasks, 'propuesta')?.history.map((entry) => entry.status)).toEqual(['submitted', 'completed'])
  expect(submissions[0].taskId).toBe('propuesta')
})

it('reopens a completed request whose result was never registered', () => {
  const { tasks } = migrate({ tasks: [legacyTask('propuesta', { status: 'completed' })] })
  expect(task(tasks, 'propuesta')?.status).toBe('waiting')
  expect(task(tasks, 'propuesta')?.history.at(-1)?.status).toBe('waiting')
})

it('merges grades into the grader request of the profile modality', () => {
  const { tasks } = migrate({
    modality: 'article',
    tasks: [
      legacyTask('notas', {
        status: 'completed',
        evidenceVersionIds: ['grades-v'],
        requirementChecks: { 'grade-1': 8, 'grade-2': 9 },
      }),
    ],
  })
  expect(task(tasks, 'notas')).toBeUndefined()
  expect(task(tasks, 'calificadores-article')).toMatchObject({
    status: 'completed',
    outputVersionIds: ['grades-v'],
    requirementChecks: { 'grade-1': 8, 'grade-2': 9 },
  })
})

it('moves requirements that became outputs and keeps inputs in place', () => {
  const { tasks } = migrate({
    tasks: [
      legacyTask('no-adeudar', { evidenceVersionIds: ['debt-v'] }),
      legacyTask('aptitud-legal-research', { evidenceVersionIds: ['debt-v'] }),
    ],
  })
  expect(task(tasks, 'no-adeudar')).toMatchObject({ evidenceVersionIds: [], outputVersionIds: ['debt-v'] })
  expect(task(tasks, 'aptitud-legal-research')).toMatchObject({
    evidenceVersionIds: ['debt-v'],
    outputVersionIds: [],
  })
})
