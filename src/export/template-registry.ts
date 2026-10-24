import { templates } from '../catalog/templates'
import content from '../catalog/templates/source-content.json'

const identity =
  '{{nombres}} con cédula de ciudadanía No. {{cedula}}, estudiante de la Carrera de {{carrera}}, de la {{facultad}}'
const bodies: Record<string, string[]> = {
  'anexo-1': [
    `${identity}, solicito lo siguiente:`,
    'MODALIDAD: {{modalidad}}',
    'PROPUESTA\nOpción de trabajo de titulación: {{modalidad}}\nTema: {{tema}}\nNombre del tutor sugerido que avala la propuesta: {{tutor}}\nNombre del profesor de diseño de proyectos que avala la propuesta: {{profesorDiseno}}\nResolución / Código del Proyecto de Investigación/Vinculación, aprobado por el CONIN/CONVISO (de ser el caso): {{proyectoCodigo}}',
  ],
  'anexo-3': [
    '{{representante}} en mi calidad de {{cargoRepresentante}} de la Empresa {{empresa}}, me permito poner en su conocimiento la aceptación y respaldo para el desarrollo del Trabajo de Titulación: “{{tema}}” propuesto por el/la estudiante {{nombres}}, portador/a de la Cédula de Ciudadanía {{cedula}}, estudiante de la Carrera de {{carrera}}, {{facultad}} de la Universidad Técnica de Ambato.',
    'A nombre de la Institución a la cual represento, me comprometo a apoyar en el desarrollo del proyecto.',
    'Particular que comunico a usted para los fines pertinentes.',
  ],
  'anexo-4': [
    `${identity}, solicito que se realice el trámite respectivo para cambio de la modalidad u opción de titulación, de {{modalidadAnterior}}, aprobado según resolución de Consejo Directivo {{aprobacionResolucion}}, a la modalidad {{modalidadNueva}}, debido a {{motivo}}`,
    'En el caso de cambio a trabajo de Titulación: tema preliminar {{tema}}, nombre del tutor sugerido {{tutor}}.',
  ],
  'anexo-8': [
    `${identity}, al momento me encuentro desarrollando mi trabajo de Titulación con el tema: “{{tema}}”, mas es el caso de que el profesor {{tutor}} designado como Tutor de mi trabajo de Titulación no ha cumplido con 3 de las tutorías previstas en el cronograma del proyecto, lo cual incide en el avance de mi trabajo, por lo que comunico este particular a la Unidad de Titulación, a fin de que se tomen las medidas preventivas necesarias.`,
  ],
  'anexo-9': [
    `${identity}, al momento me encuentro desarrollando mi trabajo de Titulación con el tema: “{{tema}}”, solicito a esta Unidad realice el trámite para cambio de tutor del trabajo de Titulación ante el Consejo Directivo, en razón de: {{motivo}}`,
  ],
  'anexo-10-research': [
    `${identity}, habiendo completado los requisitos establecidos en el Artículo 10 del Reglamento para la Titulación de grado en la Universidad Técnica de Ambato, solicito muy comedidamente se realice la calificación del INFORME FINAL DEL TRABAJO DE TITULACIÓN MODALIDAD PROYECTO DE INVESTIGACIÓN con el tema: “{{tema}}”`,
  ],
  'anexo-10-article': [
    `${identity}, habiendo completado los requisitos establecidos en el Artículo 10 del Reglamento para la Titulación de grado en la Universidad Técnica de Ambato, solicito muy comedidamente se realice la calificación del INFORME FINAL DEL TRABAJO DE TITULACIÓN, MODALIDAD ARTÍCULO ACADÉMICO con el tema: “{{tema}}”`,
    'Tema en inglés (si ha existido cambio del tema aprobado para la publicación en la revista): {{temaIngles}}',
  ],
  'cumplimiento-empresarial': [
    '{{representante}} en mi calidad de {{cargoRepresentante}} de la Empresa {{empresa}}, me permito poner en su conocimiento que el Trabajo de Titulación con el tema: “{{tema}}” desarrollado en esta empresa por el/la señor/ita {{nombres}}, portador/a de la cédula de ciudadanía {{cedula}}, estudiante de la Carrera de {{carrera}} de la {{facultad}} de la Universidad Técnica de Ambato ha culminado exitosamente cumpliéndose con el 100% de los objetivos y actividades programadas.',
    'Particular que comunico a usted para los fines pertinentes.',
  ],
  'recalificacion-research': [
    `${identity}, al haber obtenido un promedio de las calificaciones del informe final del trabajo de titulación inferior a siete sobre diez puntos (7.0/10.0 puntos), según el numeral 6.4.3. del Instructivo del Reglamento para la Titulación de grado en la Universidad Técnica de Ambato, solicito muy comedidamente se realice la calificación del INFORME FINAL DEL TRABAJO DE TITULACIÓN CORREGIDO, MODALIDAD PROYECTO DE INVESTIGACIÓN con el tema: “{{tema}}”`,
  ],
  'anexo-14-research': [
    `${identity}, solicito se fije lugar, fecha y hora para la SUSTENTACIÓN ORAL DEL TRABAJO DE TITULACIÓN, MODALIDAD: PROYECTO DE INVESTIGACIÓN con el tema: “{{tema}}”, previo a la obtención del título de {{titulo}}.`,
  ],
  'anexo-14-article': [
    `${identity}, solicito se fije lugar, fecha y hora para la SUSTENTACIÓN ORAL DEL TRABAJO DE TITULACIÓN, MODALIDAD: ARTÍCULO ACADÉMICO con el tema: “{{tema}}”, previo a la obtención del título de {{titulo}}.`,
  ],
  'anexo-14-complexivo': [
    `${identity}, solicito se fije lugar, fecha y hora para la INCORPORACIÓN BAJO LA MODALIDAD: EXAMEN DE GRADO DE CARÁCTER COMPLEXIVO, previo a la obtención del título de {{titulo}}.`,
  ],
  'anexo-15': [
    `${identity}, solicito se me extienda el CERTIFICADO DE APTITUD LEGAL, documento que requiero para continuar con mi proceso de titulación, bajo la modalidad {{modalidad}}.`,
  ],
  'anexo-21': [
    `${identity}, solicito la recalificación del EXAMEN DE GRADO DE CARÁCTER COMPLEXIVO, previo a la obtención del título de {{titulo}}, por el siguiente motivo: {{motivo}}`,
  ],
}
export function getTemplateLayout(templateId: string) {
  const template = templates.find((item) => item.id === templateId)
  if (!template || template.kind !== 'editable') throw new Error('Plantilla no editable')
  const source = content[template.sourceIds[0] as keyof typeof content]
  const report = ['anexo-5', 'anexo-11'].includes(templateId)
  const lines = template.fixedText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  const withoutFieldCodes = (text: string) => text.replace(/\s*HYPERLINK "[^"]*"\s*/g, ' ')
  const noteIndex = template.fixedText.search(/(?:ADJUNTAR|Adjuntar|Adj:|NOTA:|NOTA\n)/)
  let notes =
    noteIndex < 0
      ? []
      : template.fixedText
          .slice(noteIndex)
          .split(/\n\s*\n/)
          .map((text) => withoutFieldCodes(text).trim())
          .filter(Boolean)
  if (templateId === 'anexo-15') {
    const index = template.fixedText.indexOf('Enviar la solicitud')
    if (index >= 0)
      notes = template.fixedText
        .slice(index)
        .split(/\n\s*\n/)
        .map((text) => withoutFieldCodes(text).trim())
        .filter(Boolean)
  }
  return {
    template,
    geometry: source.geometry,
    report,
    headings: report ? lines.slice(0, 2) : [],
    body: bodies[templateId] ?? [],
    notes,
    recipientRole: /anexo-10|anexo-14|recalificacion-research/.test(templateId)
      ? 'PRESIDENTE DE CONSEJO DIRECTIVO'
      : templateId === 'anexo-15'
        ? 'DECANO'
        : 'PRESIDENTE DE LA UNIDAD DE TITULACIÓN',
  }
}
