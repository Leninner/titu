import { templates } from '../catalog/templates'
import type { AnnexDraft, StudentProfile } from './types'

export interface AnnexValidation {
  valid: boolean
  errors: Record<string, string>
  warnings: Record<string, string>
}
export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T12:00:00Z`)
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
}
export function createDraft(
  templateId: string,
  profile: StudentProfile,
  monthlyPeriod = '',
): AnnexDraft {
  const template = templates.find((item) => item.id === templateId)
  if (!template || template.kind !== 'editable') throw new Error('Esta plantilla no admite edición')
  return {
    id: crypto.randomUUID(),
    name: template.name,
    templateId,
    templateVersion: template.version,
    revision: 1,
    savedRevision: 0,
    profileSnapshot: structuredClone(profile),
    fields: {},
    activities: [],
    monthlyPeriod,
    sourceMonthlyRevisions: [],
    updatedAt: new Date().toISOString(),
  }
}
export function validateAnnex(draft: AnnexDraft, previousMonthly?: AnnexDraft): AnnexValidation {
  const errors: Record<string, string> = {}
  const warnings: Record<string, string> = {}
  const template = templates.find((item) => item.id === draft.templateId)
  if (!template || template.kind !== 'editable')
    return { valid: false, errors: { templateId: 'Plantilla no editable o desconocida' }, warnings }
  if (draft.templateVersion !== template.version)
    errors.templateVersion = 'Revisar la versión de la plantilla antes de exportar'
  if (!template.modalities.includes(draft.profileSnapshot.modalidad))
    errors.modalidad = 'La plantilla no corresponde a la modalidad del perfil'
  if (template.companyOnly && !draft.profileSnapshot.aplicaEmpresa)
    errors.empresa = 'Esta plantilla solo aplica a trabajos en empresa o institución'
  for (const field of template.fields) {
    const value = draft.fields[field.key]?.trim() ?? ''
    if (field.required && !value) errors[field.key] = 'Campo obligatorio'
    else if (value && field.type === 'date' && !validDate(value))
      errors[field.key] = 'Fecha inválida'
  }
  const profile = draft.profileSnapshot
  const report = ['anexo-5', 'anexo-11'].includes(draft.templateId)
  const required: (keyof StudentProfile)[] = ['nombres', 'carrera', 'facultad']
  if (!report) required.push('cedula')
  if (!report && !template.companyOnly) required.push('email')
  if (draft.templateId === 'anexo-8') required.push('tutor')
  if (profile.modalidad !== 'complexivo' && draft.templateId !== 'anexo-15') required.push('tema')
  if (report) required.push('tutor', 'aprobacionFecha')
  if (draft.templateId.startsWith('anexo-14')) required.push('direccion', 'titulo')
  if (draft.templateId === 'anexo-21') required.push('titulo')
  if (draft.templateId === 'anexo-4') required.push('aprobacionResolucion')
  for (const key of required)
    if (!String(profile[key]).trim()) errors[`profile.${key}`] = 'Completar este dato del perfil'
  if (profile.aprobacionFecha && !validDate(profile.aprobacionFecha))
    errors['profile.aprobacionFecha'] = 'Fecha de aprobación inválida'
  if (draft.fields.tema !== undefined && draft.fields.tema !== profile.tema)
    errors.tema =
      'El tema debe coincidir con el perfil aprobado. Registrar la resolución de cambio en el perfil y revisar el borrador.'
  if (draft.needsReview)
    errors.needsReview = 'Revisar el borrador tras el cambio de perfil o modalidad'
  if (draft.templateId === 'anexo-5' && !/^\d{4}-(0[1-9]|1[0-2])$/.test(draft.monthlyPeriod))
    errors.monthlyPeriod = 'Seleccionar el mes del informe'
  if (report) {
    const progress = Number(draft.fields.avance)
    if (
      !draft.fields.avance?.trim() ||
      !Number.isFinite(progress) ||
      progress < 0 ||
      progress > 100
    )
      errors.avance = 'Indicar un porcentaje entre 0 y 100'
    if (!draft.activities.length) errors.activities = 'Añadir las actividades realmente reportadas'
    for (const [index, activity] of draft.activities.entries()) {
      if (!validDate(activity.date)) errors[`activities.${index}.date`] = 'Fecha inválida'
      if (!activity.description.trim())
        errors[`activities.${index}.description`] = 'Describir la actividad'
      if (draft.monthlyPeriod && !activity.date.startsWith(draft.monthlyPeriod))
        errors[`activities.${index}.date`] =
          `La actividad debe tener una fecha del mes ${draft.monthlyPeriod}.`
    }
    if (previousMonthly?.fields.avance?.trim() && Number.isFinite(Number(previousMonthly.fields.avance)) && Number(previousMonthly.fields.avance) <= 100 && progress < Number(previousMonthly.fields.avance))
      errors.avance = `El avance no puede ser menor al ${previousMonthly.fields.avance}% del informe anterior.`
    if (draft.templateId === 'anexo-11' && draft.fields.origenMensual === 'archivos') {
      if (progress !== 100) errors.avance = 'El cumplimiento final requiere declarar 100%'
      if (draft.fields.ultimoAvanceMensual && draft.fields.ultimoAvanceMensual !== '100')
        warnings.ultimoAvanceMensual = `El último Anexo 5 declara ${draft.fields.ultimoAvanceMensual}% de avance`
    } else if (draft.templateId === 'anexo-11') {
      if (progress !== 100) errors.avance = 'El cumplimiento final requiere declarar 100%'
      if (draft.fields.ultimoAvanceMensual !== '100')
        errors.ultimoAvanceMensual = 'El último mensual seleccionado debe respaldar el 100% final'
      const exactActivities = JSON.stringify(
        draft.activities.map(({ date, description, sourceDraftId, sourceRevision }) => ({
          date,
          description,
          sourceDraftId,
          sourceRevision,
        })),
      )
      if (draft.fields.actividadesMensualesSnapshot !== exactActivities)
        errors.activities =
          'Las fechas y actividades deben coincidir exactamente con las revisiones mensuales seleccionadas'
      if (!draft.sourceMonthlyRevisions.length)
        errors.sourceMonthlyRevisions = 'Seleccionar revisiones de informes mensuales'
      if (draft.fields.mensualesRevisados !== 'true')
        errors.mensualesRevisados =
          'Confirmar coincidencia exacta y consistencia de los informes mensuales seleccionados'
      if (
        draft.activities.some(
          (activity) =>
            !activity.sourceDraftId ||
            !draft.sourceMonthlyRevisions.some(
              (source) =>
                source.draftId === activity.sourceDraftId &&
                source.revision === activity.sourceRevision,
            ),
        )
      )
        errors.activities =
          'Todas las filas deben conservar su informe mensual y revisión de origen'
    }
  }
  return { valid: !Object.keys(errors).length, errors, warnings }
}
export function copyToNextMonth(draft: AnnexDraft): AnnexDraft {
  if (draft.templateId !== 'anexo-5' || !/^\d{4}-\d{2}$/.test(draft.monthlyPeriod))
    throw new Error('Seleccionar un informe mensual con mes válido')
  const [year, month] = draft.monthlyPeriod.split('-').map(Number)
  if (month < 1 || month > 12) throw new Error('Mes inválido')
  const next = `${month === 12 ? year + 1 : year}-${String(month === 12 ? 1 : month + 1).padStart(2, '0')}`
  const result = createDraft(draft.templateId, draft.profileSnapshot, next)
  result.name = `${templates.find((item) => item.id === draft.templateId)!.name} · ${next}`
  result.fields = { ...draft.fields, fecha: '', avance: '', observaciones: '' }
  return result
}

export function templateEvidenceCategory(templateId: string): string {
  const template = templates.find((item) => item.id === templateId)
  if (!template || template.kind !== 'editable')
    throw new Error('Plantilla no editable o desconocida')
  const categories: Record<string, string> = {
    'anexo-5': 'mensual',
    'anexo-11': 'final',
    'anexo-3': 'compromiso',
    'cumplimiento-empresarial': 'empresa',
  }
  return categories[templateId] ?? 'solicitud'
}
