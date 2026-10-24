import { describe, expect, it } from 'vitest'
import { buildSubmissionEmail } from '../../src/domain/submission-email'
import {
  emptyWorkspace,
  newProfile,
  type TaskRecord,
  type WorkflowDefinition,
} from '../../src/domain/types'

const definition: WorkflowDefinition = {
  id: 'propuesta',
  title: 'Presentar propuesta',
  stage: 'propuesta',
  modalities: ['research'],
  sourceIds: [],
  dependsOn: [],
  requirements: [],
  outputs: [],
  summary: '',
  instructions: '',
  role: 'Estudiante',
}
const task: TaskRecord = {
  id: 't',
  definitionId: 'propuesta',
  status: 'preparing',
  requirementChecks: {},
  evidenceVersionIds: [],
  outputVersionIds: [],
  note: '',
  history: [],
}
describe('correo preparado', () => {
  it('reutiliza datos sin destinatario ni afirmar envío', () => {
    const workspace = {
      ...emptyWorkspace(),
      profile: {
        ...newProfile(),
        nombres: 'María Muñoz',
        carrera: 'Software',
        tema: 'Tema aprobado',
      },
    }
    const email = buildSubmissionEmail(definition, task, workspace)
    expect(email.subject).toBe('Presentar propuesta | María Muñoz')
    expect(email.body).toContain('Tema aprobado')
    expect(email.fullText).not.toContain('Para:')
    expect(email.body).toContain('[Agregar los documentos antes de enviar]')
  })
  it('los informes solicitan revisión al tutor', () => {
    const workspace = { ...emptyWorkspace(), profile: { ...newProfile(), tutor: 'José Núñez' } }
    const email = buildSubmissionEmail(
      { ...definition, id: 'desarrollo' },
      task,
      workspace,
    )
    expect(email.body).toContain('Estimado/a José Núñez:')
    expect(email.body).toContain('revisión y firma')
  })
  it('incluye la identificación compartida sin volver a seleccionarla', () => {
    const workspace = {
      ...emptyWorkspace(),
      profile: newProfile(),
      documents: [{ id: 'identity', name: 'Identificación', category: 'personal', createdAt: '' }],
      versions: [{
        id: 'v1', documentId: 'identity', blobId: 'b1', originalName: 'cedula.pdf',
        mime: 'application/pdf', size: 10, sha256: '', createdAt: '2026-10-23T10:00:00Z',
        signatureStatus: 'unsigned' as const, textualPdfStatus: 'unknown' as const,
      }],
    }
    const email = buildSubmissionEmail(
      { ...definition, requirements: [
        { id: 'identity', label: 'Identificación actualizada', category: 'personal', signed: false },
      ] },
      task,
      workspace,
    )
    expect(email.attachmentCount).toBe(1)
    expect(email.body).toContain('cedula.pdf')
  })
})
