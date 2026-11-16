import type { RequestEmail, StudentProfile, TaskRecord, WorkflowDefinition, Workspace } from './types'
import { shortName } from './student-name'
import { submissionEntries } from './submission-entries'
import { evidenceIdsForTask } from './task-evidence'

export function buildSubmissionEmail(
  definition: WorkflowDefinition,
  task: TaskRecord,
  workspace: Workspace,
) {
  const profile = workspace.profile
  const files = submissionEntries(definition, workspace, evidenceIdsForTask(task, definition, workspace))
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
    ? files.map((entry) => entry.name).join('\n')
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

type EmailValues = StudentProfile & { nombreCorto: string }

const placeholderLabels: Partial<Record<keyof EmailValues, string>> = {
  nombres: 'Tu nombre',
  nombreCorto: 'Tu nombre',
  tutor: 'Nombre del tutor',
}

function emailValues(profile: StudentProfile | null): Partial<EmailValues> {
  return profile ? { ...profile, nombreCorto: shortName(profile.nombres) } : {}
}

function fillPlaceholders(text: string, values: Partial<EmailValues>) {
  return text.replace(/\{\{(\w+)\}\}(\.?)/g, (_, key: keyof EmailValues, period: string) => {
    const value = String(values[key] || `[${placeholderLabels[key] ?? key}]`)
    return period && value.endsWith('.') ? value : `${value}${period}`
  })
}

export function buildRequestEmail(email: RequestEmail, profile: StudentProfile | null) {
  const values = emailValues(profile)
  const signature = `${email.closing ?? 'Atentamente,'}\n{{nombreCorto}}`
  const body = [...email.paragraphs, signature].map((text) => fillPlaceholders(text, values)).join('\n\n')
  return { to: email.to, subject: fillPlaceholders(email.subject, values), body }
}
