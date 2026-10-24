import { expect, it } from 'vitest'
import { withEvidence } from '../../src/features/workflow/evidence-actions'
import { emptyWorkspace } from '../../src/domain/types'
import type { DocumentVersion, TaskRecord } from '../../src/domain/types'

const version = (id: string, documentId: string): DocumentVersion => ({
  id,
  documentId,
  blobId: `blob-${id}`,
  originalName: `${id}.pdf`,
  mime: 'application/pdf',
  size: 1,
  sha256: id,
  createdAt: '2026-10-23T12:00:00.000Z',
  signatureStatus: 'unsigned',
  textualPdfStatus: 'unknown',
})
const task: TaskRecord = {
  id: 'propuesta',
  definitionId: 'propuesta',
  status: 'pending',
  requirementChecks: {},
  evidenceVersionIds: ['unsigned', 'other'],
  outputVersionIds: [],
  note: '',
  history: [],
}

it('keeps a single version per document when including a newer one', () => {
  const workspace = {
    ...emptyWorkspace(),
    versions: [version('unsigned', 'anexo-1'), version('signed', 'anexo-1'), version('other', 'cedula')],
  }
  expect(withEvidence(task, workspace, 'signed', true).evidenceVersionIds).toEqual(['other', 'signed'])
  expect(withEvidence(task, workspace, 'unsigned', false).evidenceVersionIds).toEqual(['other'])
})
