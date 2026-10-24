import { expect, it } from 'vitest'
import { catalog } from '../../src/catalog'
import { emptyTask } from '../../src/domain/task-record'
import { taskSteps } from '../../src/domain/task-steps'
import { emptyWorkspace, newProfile } from '../../src/domain/types'
import type { DocumentVersion, TaskRecord, Workspace } from '../../src/domain/types'
import { evaluateTask } from '../../src/domain/workflow'

const definition = (id: string) => catalog.workflowDefinitions.find((item) => item.id === id)!

const version = (id: string, signed = true): DocumentVersion => ({
  id,
  documentId: `document-${id}`,
  blobId: `blob-${id}`,
  originalName: `${id}.pdf`,
  mime: 'application/pdf',
  size: 1,
  sha256: id,
  createdAt: '2026-10-23T12:00:00.000Z',
  signatureStatus: signed ? 'reported-signed' : 'unsigned',
  textualPdfStatus: 'text-detected',
})

function proposalWorkspace(): Workspace {
  return {
    ...emptyWorkspace(),
    profile: { ...newProfile(), modalidad: 'research' },
    documents: [
      { id: 'document-personal', name: 'Cédula', category: 'personal', createdAt: '' },
      { id: 'document-solicitud', name: 'Anexo 1', category: 'solicitud', createdAt: '' },
      { id: 'document-resolucion', name: 'Resolución', category: 'resolucion', createdAt: '' },
    ],
    versions: [version('personal', false), version('solicitud'), version('resolucion')],
  }
}

const preparedProposal = (): TaskRecord => ({
  ...emptyTask('propuesta'),
  status: 'submitted',
  requirementChecks: { avales: true },
  evidenceVersionIds: ['personal', 'solicitud'],
})

it('shows each step state and opens on the first incomplete step', () => {
  const workspace = proposalWorkspace()
  workspace.submissions = [{
    id: 'sent',
    taskId: 'propuesta',
    exactVersionIds: ['personal', 'solicitud'],
    recipient: 'informacion.fisei',
    sentAt: '2026-11-03T15:00:00.000Z',
    note: '',
  }]
  const { steps, initial } = taskSteps(preparedProposal(), definition('propuesta'), workspace, catalog)
  expect(steps.map((step) => [step.id, step.done, step.detail])).toEqual([
    ['prepare', true, 'listo'],
    ['send', true, 'enviado 3 nov'],
    ['result', false, 'pendiente'],
  ])
  expect(initial).toBe('result')
})

it('counts prepared documents and starts on Preparar while inputs are missing', () => {
  const workspace = proposalWorkspace()
  const task = { ...preparedProposal(), status: 'preparing' as const, evidenceVersionIds: [] }
  const { steps, initial } = taskSteps(task, definition('propuesta'), workspace, catalog)
  expect(steps[0].detail).toBe('1/2 docs')
  expect(initial).toBe('prepare')
})

it('reports observed and completed results with their date', () => {
  const workspace = proposalWorkspace()
  const observed = { ...preparedProposal(), status: 'observed' as const }
  expect(taskSteps(observed, definition('propuesta'), workspace, catalog).steps[2].detail).toBe('observado')
  const completed = {
    ...preparedProposal(),
    status: 'completed' as const,
    history: [{ at: '2026-11-10T15:00:00.000Z', status: 'completed' as const, note: '' }],
  }
  const result = taskSteps(completed, definition('propuesta'), workspace, catalog)
  expect(result.steps[2]).toMatchObject({ done: true, detail: 'completado 10 nov' })
})

it('shows only Resultado for workflows without inputs to send', () => {
  const workspace = proposalWorkspace()
  for (const id of ['defensa', 'titulo', 'no-adeudar']) {
    const { steps, initial } = taskSteps(emptyTask(id), definition(id), workspace, catalog)
    expect(steps.map((step) => step.id)).toEqual(['result'])
    expect(initial).toBe('result')
  }
})

it('completes only when inputs are ready and every required output is registered', () => {
  const workspace = proposalWorkspace()
  const task = preparedProposal()
  const pending = evaluateTask(task, workspace, catalog)
  expect(pending.ready).toBe(true)
  expect(pending.canComplete).toBe(false)
  expect(pending.missingOutputs).toEqual([
    'Adjuntar: Resolución de Consejo Directivo de modalidad y tema',
  ])
  const received = evaluateTask({ ...task, outputVersionIds: ['resolucion'] }, workspace, catalog)
  expect(received.canComplete).toBe(true)
  const incomplete = evaluateTask(
    { ...task, evidenceVersionIds: [], outputVersionIds: ['resolucion'] },
    workspace,
    catalog,
  )
  expect(incomplete.canComplete).toBe(false)
})

it('requires both grades as received outputs of the grader request, not as inputs', () => {
  const workspace = proposalWorkspace()
  workspace.documents.push(
    { id: 'document-designacion', name: 'Designación', category: 'resolucion-designacion', createdAt: '' },
    { id: 'document-notas', name: 'Notas', category: 'notas', createdAt: '' },
  )
  workspace.versions.push(version('designacion'), version('notas'))
  const task = {
    ...emptyTask('calificadores-research'),
    outputVersionIds: ['designacion', 'notas'],
    requirementChecks: { 'grade-1': 6, 'grade-2': 7 },
  }
  const evaluation = evaluateTask(task, workspace, catalog)
  expect(evaluation.missingRequirements.join(' ')).not.toContain('Nota del primer calificador')
  expect(evaluation.missingOutputs).toEqual([
    'Promedio inferior a 7: revisar o solicitar recalificación',
  ])
  task.requirementChecks['grade-1'] = 7
  expect(evaluateTask(task, workspace, catalog).missingOutputs).toEqual([])
})
