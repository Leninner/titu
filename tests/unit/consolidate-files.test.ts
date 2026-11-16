import { expect, it } from 'vitest'
import { consolidateFiles, splitThesisStages, type FileRecords } from '../../src/storage/consolidate-files'
import { emptyTask } from '../../src/domain/task-record'
import type { DocumentVersion, Submission } from '../../src/domain/types'

const version = (id: string, documentId: string, createdAt: string, blobId = `blob-${id}`): DocumentVersion => ({
  id,
  documentId,
  blobId,
  originalName: `${id}.pdf`,
  mime: 'application/pdf',
  size: 1,
  sha256: id,
  createdAt,
  signatureStatus: 'unsigned',
  textualPdfStatus: 'text-detected',
})

const submission = (taskId: string, exactVersionIds: string[]): Submission => ({
  id: `sent-${taskId}`,
  taskId,
  exactVersionIds,
  recipient: 'informacion.fisei@uta.edu.ec',
  sentAt: '2026-11-02T10:00:00.000Z',
  note: '',
})

function records(overrides: Partial<FileRecords> = {}): FileRecords {
  return {
    documents: [{ id: 'cedula', name: 'Cédula', category: 'personal', createdAt: '' }],
    versions: [
      version('v1', 'cedula', '2026-11-01T10:00:00.000Z'),
      version('v2', 'cedula', '2026-11-02T10:00:00.000Z'),
      version('v3', 'cedula', '2026-11-03T10:00:00.000Z'),
    ],
    tasks: [],
    submissions: [],
    acknowledgementBlobIds: [],
    ...overrides,
  }
}

it('keeps only the latest file of each document and frees the blobs of the others', () => {
  const result = consolidateFiles(records())
  expect(result.versions.map((item) => item.id)).toEqual(['v3'])
  expect(result.freedBlobIds.sort()).toEqual(['blob-v1', 'blob-v2'])
})

it('keeps a sent file exactly as it was sent', () => {
  const task = { ...emptyTask('propuesta'), evidenceVersionIds: ['v1'] }
  const result = consolidateFiles(records({ tasks: [task], submissions: [submission(task.id, ['v1'])] }))
  expect(result.versions.map((item) => item.id).sort()).toEqual(['v1', 'v3'])
  expect(result.tasks[0].evidenceVersionIds).toEqual(['v1'])
  expect(result.freedBlobIds).toEqual(['blob-v2'])
})

it('moves unsent workflows from a replaced file to the current one', () => {
  const task = { ...emptyTask('propuesta'), evidenceVersionIds: ['v1', 'v2'], outputVersionIds: ['v2'] }
  const result = consolidateFiles(records({ tasks: [task] }))
  expect(result.tasks[0].evidenceVersionIds).toEqual(['v3'])
  expect(result.tasks[0].outputVersionIds).toEqual(['v3'])
})

it('keeps a blob that a remaining file or an acknowledgement still uses', () => {
  const result = consolidateFiles(records({
    versions: [
      version('v1', 'cedula', '2026-11-01T10:00:00.000Z', 'shared'),
      version('v2', 'cedula', '2026-11-02T10:00:00.000Z', 'receipt'),
      version('v3', 'cedula', '2026-11-03T10:00:00.000Z', 'shared'),
    ],
    acknowledgementBlobIds: ['receipt'],
  }))
  expect(result.freedBlobIds).toEqual([])
})

it('leaves already consolidated records unchanged', () => {
  const once = consolidateFiles(records())
  const twice = consolidateFiles({ ...records(), ...once })
  expect(twice.versions).toEqual(once.versions)
  expect(twice.freedBlobIds).toEqual([])
})

function thesisRecords(): FileRecords {
  const review = { ...emptyTask('biblioteca-revision'), evidenceVersionIds: ['draft'] }
  const dean = { ...emptyTask('biblioteca-decanato'), evidenceVersionIds: ['signed'] }
  return {
    documents: [{ id: 'thesis', name: 'Trabajo', category: 'tesis', createdAt: '' }],
    versions: [
      version('draft', 'thesis', '2026-11-01T10:00:00.000Z'),
      version('signed', 'thesis', '2026-11-05T10:00:00.000Z'),
    ],
    tasks: [review, dean],
    submissions: [submission(dean.id, ['signed'])],
    acknowledgementBlobIds: [],
  }
}

it('splits the thesis files by the stage of the workflow that uses them', () => {
  const split = splitThesisStages(thesisRecords())
  const result = consolidateFiles(split)
  const categoryOf = (versionId: string) => {
    const documentId = result.versions.find((item) => item.id === versionId)?.documentId
    return result.documents.find((item) => item.id === documentId)?.category
  }
  const dean = result.tasks.find((task) => task.definitionId === 'biblioteca-decanato')!
  const review = result.tasks.find((task) => task.definitionId === 'biblioteca-revision')!
  expect(categoryOf(review.evidenceVersionIds[0])).toBe('tesis')
  expect(categoryOf(dean.evidenceVersionIds[0])).toBe('tesis-decanato')
  expect(result.versions.find((item) => item.id === dean.evidenceVersionIds[0])?.blobId).toBe('blob-signed')
  expect(split.submissions[0].exactVersionIds).toEqual(dean.evidenceVersionIds)
  expect(result.versions).toHaveLength(2)
  expect(result.freedBlobIds).toEqual([])
})

it('splits the thesis files only once', () => {
  const once = splitThesisStages(thesisRecords())
  expect(splitThesisStages(once)).toEqual(once)
})
