import type { TaskRecord, WorkflowDefinition, Workspace } from './types'
import { evidenceIdsForTask } from './task-evidence'

export function buildSubmissionEmail(
  definition: WorkflowDefinition,
  task: TaskRecord,
  workspace: Workspace,
) {
  const profile = workspace.profile
  const files = evidenceIdsForTask(task, definition, workspace)
    .map((id) => workspace.versions.find((version) => version.id === id))
    .filter((version) => version !== undefined)
  const subject = `${definition.title}${profile?.nombres ? ` | ${profile.nombres}` : ''}`
  const tutorReview = ['desarrollo', 'informe-final'].includes(definition.id)
  const greeting = tutorReview && profile?.tutor ? `Estimado/a ${profile.tutor}:` : 'Estimados/as:'
  const purpose = tutorReview
    ? 'Comparto el informe de avance de mi trabajo de titulación para su revisión y firma.'
    : `Remito la documentación correspondiente al trámite «${definition.title}», para su revisión.`
  const context = [
    profile?.carrera && `Carrera: ${profile.carrera}`,
    profile?.tema && `Tema aprobado: ${profile.tema}`,
  ]
    .filter(Boolean)
    .join('\n')
  const attachmentList = files.length
    ? files.map((version, index) => `${index + 1}. ${version.originalName}`).join('\n')
    : '[Agregar los documentos antes de enviar]'
  const signature = [
    profile?.nombres || '[Tu nombre]',
    profile?.cedula && `C.I. ${profile.cedula}`,
    profile?.email,
  ]
    .filter(Boolean)
    .join('\n')
  const body = [
    greeting,
    purpose,
    context,
    `Documentos adjuntos:\n${attachmentList}`,
    'Agradezco la confirmación de recepción. Quedo atento/a a cualquier observación.',
    `Atentamente,\n${signature}`,
  ]
    .filter(Boolean)
    .join('\n\n')
  return {
    subject,
    body,
    attachmentCount: files.length,
    fullText: `Asunto: ${subject}\n\n${body}`,
  }
}
