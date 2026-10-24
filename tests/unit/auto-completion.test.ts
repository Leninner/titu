import { expect, it } from 'vitest'
import { catalog } from '../../src/catalog'
import { withAutomaticCompletion } from '../../src/domain/auto-completion'
import { rangeWith, rangeWithout } from '../../src/domain/monthly-report'
import { emptyTask } from '../../src/domain/task-record'
import { taskSteps } from '../../src/domain/task-steps'
import { emptyWorkspace, newProfile } from '../../src/domain/types'
import type { DocumentVersion, Workspace } from '../../src/domain/types'

const report = (id: string, month: string, signed: boolean): DocumentVersion => ({
  id,
  documentId: `document-${id}`,
  blobId: `blob-${id}`,
  originalName: `${id}.pdf`,
  mime: 'application/pdf',
  size: 1,
  sha256: id,
  createdAt: '2026-11-01T12:00:00.000Z',
  signatureStatus: signed ? 'reported-signed' : 'unsigned',
  textualPdfStatus: 'text-detected',
  reportAnalysis: { recognized: true, month },
})

function workspace(signedSeptember: boolean): Workspace {
  return {
    ...emptyWorkspace(),
    profile: { ...newProfile(), modalidad: 'research' },
    settings: { monthlyFrom: '2026-08', monthlyTo: '2026-09' },
    tasks: [{ ...emptyTask('propuesta'), status: 'completed' }],
    documents: ['agosto', 'septiembre'].map((id) => ({
      id: `document-${id}`, name: id, category: 'mensual', createdAt: '',
    })),
    versions: [report('agosto', '2026-08', true), report('septiembre', '2026-09', signedSeptember)],
  }
}

const development = { ...emptyTask('desarrollo'), evidenceVersionIds: ['agosto', 'septiembre'] }

it('completes the monthly reports once every month of the range is signed', () => {
  const completed = withAutomaticCompletion(development, workspace(true), catalog, '2026-11-02T12:00:00.000Z')
  expect(completed.status).toBe('completed')
  expect(completed.history).toEqual([{ at: '2026-11-02T12:00:00.000Z', status: 'completed', note: '' }])
})

it('reopens the monthly reports when a month loses its signature', () => {
  const reopened = withAutomaticCompletion({ ...development, status: 'completed' }, workspace(false), catalog)
  expect(reopened.status).toBe('preparing')
})

it('leaves workflows that are not automatic untouched', () => {
  const proposal = emptyTask('propuesta')
  expect(withAutomaticCompletion(proposal, workspace(true), catalog)).toBe(proposal)
})

it('shows the monthly reports without steps to send', () => {
  const definition = catalog.workflowDefinitions.find((item) => item.id === 'desarrollo')!
  expect(taskSteps(development, definition, workspace(true), catalog).steps.map((step) => step.id))
    .toEqual(['prepare'])
})

it('extends or trims the month range from its edges', () => {
  expect(rangeWith({ from: '2026-08', to: '2026-11' }, '2026-12')).toEqual({ from: '2026-08', to: '2026-12' })
  expect(rangeWith({ from: '2026-08', to: '2026-11' }, '2026-07')).toEqual({ from: '2026-07', to: '2026-11' })
  expect(rangeWith({}, '2026-08')).toEqual({ from: '2026-08', to: '2026-08' })
  expect(rangeWithout({ from: '2026-08', to: '2026-11' }, '2026-11')).toEqual({ from: '2026-08', to: '2026-10' })
  expect(rangeWithout({ from: '2026-08', to: '2026-11' }, '2026-08')).toEqual({ from: '2026-09', to: '2026-11' })
})
