import { createDraft } from '../../../src/domain/annex'
import { templates } from '../../../src/catalog'
import { newProfile } from '../../../src/domain/types'

export function annexFixture(templateId = 'anexo-5', count = 2) {
  const template = templates.find((item) => item.id === templateId)!
  const profile = {
    ...newProfile(),
    id: 'synthetic-student',
    nombres: 'María Muñoz Vásquez',
    cedula: '0000000000',
    email: 'estudiante@example.test',
    direccion: 'Dirección de prueba',
    carrera: 'Software',
    modalidad: template.modalities[0],
    titulo: 'Ingeniera de Software',
    tema: 'Investigación sintética de accesibilidad',
    tutor: 'José Núñez',
    aprobacionFecha: '2026-07-01',
    aprobacionResolucion: 'RES-SINTETICA',
    aplicaEmpresa: true,
  }
  const draft = createDraft(templateId, profile, templateId === 'anexo-5' ? '2026-10' : '')
  for (const field of template.fields)
    draft.fields[field.key] =
      field.type === 'date'
        ? '2026-10-22'
        : field.type === 'number'
          ? '100'
          : `Valor de prueba ${field.label}`
  draft.fields.destinatario = 'Autoridad revisada de prueba'
  draft.activities = Array.from({ length: count }, (_, index) => ({
    id: `activity-${index}`,
    date: `2026-10-${String((index % 28) + 1).padStart(2, '0')}`,
    description: `Actividad ${index + 1}: análisis, diseño y evaluación de accesibilidad para María.`,
  }))
  return draft
}

export function longAnnexFixture(templateId = 'anexo-5') {
  const draft = annexFixture(templateId, 40)
  draft.profileSnapshot.nombres = 'María de los Ángeles Muñoz Vásquez de la Investigación Sintética'
  draft.profileSnapshot.tema =
    'Evaluación de accesibilidad e interacción de sistemas de información académica en escenarios de conectividad variable, con participación de estudiantes y docentes, trazabilidad de decisiones y validación experimental. '
      .repeat(3)
      .trim()
  draft.profileSnapshot.direccion =
    'Avenida de la Investigación, edificio de pruebas, departamento de verificación de accesibilidad, sector académico de la ciudad de ejemplo'
  draft.fields.destinatario =
    'Doctora Autoridad Académica de Prueba con denominación extensa para verificar saltos de línea'
  if (draft.fields.motivo)
    draft.fields.motivo =
      'Se solicita revisar las condiciones documentadas y las observaciones del proceso, considerando las evidencias académicas y las fechas registradas. '
        .repeat(7)
        .trim()
  if (draft.fields.observaciones)
    draft.fields.observaciones =
      'Observación sintética para comprobar el ajuste de texto sin inventar información del tutor. '
        .repeat(6)
        .trim()
  for (const activity of draft.activities)
    activity.description +=
      ' Se compararon resultados, se registraron observaciones de accesibilidad y se preparó la evidencia del experimento con atención a caracteres españoles y texto seleccionable.'
  draft.activities[14].description +=
    ' Revisión extensa de evidencia y comprobación de resultados con anotaciones detalladas de los participantes sintéticos.'.repeat(
      25,
    )
  return draft
}
