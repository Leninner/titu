import type { Modality, TemplateDefinition, TemplateField } from '../domain/types'
import content from './templates/source-content.json'

const all: Modality[] = ['research', 'article', 'complexivo']
const work: Modality[] = ['research', 'article']
const field = (
  key: string,
  label: string,
  required = true,
  type: TemplateField['type'] = 'text',
): TemplateField => ({ key, label, required, type })
const date = field('fecha', 'Fecha del documento', true, 'date')
const letter = [
  field('lugar', 'Lugar'),
  date,
  field('destinatario', 'Nombre y tratamiento del destinatario (verificar)'),
  field('telefono', 'Teléfono convencional', false),
  field('celular', 'Teléfono celular', false),
]
const companyLetter = letter.filter((item) => !['telefono', 'celular'].includes(item.key))
const report = [
  date,
  field('avance', 'Avance acumulado (%)', true, 'number'),
  field('observaciones', 'Observaciones del tutor', false, 'textarea'),
]
const specs: [string, string, number | keyof typeof content, Modality[], TemplateField[], string, boolean?][] = [
  [
    'anexo-1',
    'Anexo 1 · Selección de modalidad',
    5,
    all,
    [
      ...letter,
      field('profesorDiseno', 'Profesor de diseño de proyectos', false),
      field('proyectoCodigo', 'Resolución / código CONIN o CONVISO', false),
    ],
    'Estudiante y tutor sugerido',
  ],
  [
    'anexo-3',
    'Anexo 3 · Compromiso empresarial',
    8,
    work,
    companyLetter,
    'Representante de la empresa',
    true,
  ],
  [
    'anexo-4',
    'Anexo 4 · Cambio de modalidad',
    9,
    all,
    [
      ...letter,
      field('modalidadAnterior', 'Modalidad aprobada anteriormente'),
      field('modalidadNueva', 'Nueva modalidad u opción'),
      field('motivo', 'Motivo del cambio', true, 'textarea'),
    ],
    'Estudiante',
  ],
  ['anexo-5', 'Anexo 5 · Informe mensual', 10, work, report, 'Tutor'],
  ['anexo-8', 'Anexo 8 · Notificación sobre tutorías', 13, work, letter, 'Estudiante'],
  [
    'anexo-9',
    'Anexo 9 · Cambio de tutor',
    14,
    work,
    [...letter, field('motivo', 'Causa del cambio', true, 'textarea')],
    'Estudiante',
  ],
  [
    'anexo-10-article',
    'Anexo 10 · Calificadores de Artículo',
    15,
    ['article'],
    [...letter, field('temaIngles', 'Tema en inglés si lo requiere la revista', false)],
    'Estudiante',
  ],
  [
    'anexo-10-research',
    'Anexo 10 · Calificadores de Proyecto',
    16,
    ['research'],
    letter,
    'Estudiante',
  ],
  [
    'anexo-11',
    'Anexo 11 · Informe final de avance',
    3,
    work,
    report.filter((item) => item.key !== 'observaciones'),
    'Tutor',
  ],
  [
    'cumplimiento-empresarial',
    'Cumplimiento empresarial del 100%',
    18,
    work,
    companyLetter,
    'Representante de la empresa',
    true,
  ],
  [
    'recalificacion-research',
    'Recalificación del Proyecto corregido',
    19,
    ['research'],
    letter,
    'Estudiante',
  ],
  [
    'anexo-14-article',
    'Anexo 14 · Sustentación de Artículo',
    22,
    ['article'],
    letter,
    'Estudiante',
  ],
  [
    'anexo-14-research',
    'Anexo 14 · Sustentación de Proyecto',
    23,
    ['research'],
    letter,
    'Estudiante',
  ],
  [
    'anexo-14-complexivo',
    'Anexo 14 · Incorporación Complexivo',
    24,
    ['complexivo'],
    letter,
    'Estudiante',
  ],
  ['anexo-15', 'Anexo 15 · Solicitud de aptitud legal', 21, all, letter, 'Estudiante'],
  [
    'anexo-21',
    'Anexo 21 · Recalificación Complexivo',
    6,
    ['complexivo'],
    [...letter, field('motivo', 'Motivo de recalificación', true, 'textarea')],
    'Estudiante',
  ],
  [
    'solicitud-habilitantes',
    'Solicitud de requisitos habilitantes',
    'EST-01',
    all,
    [
      field('lugar', 'Lugar'),
      date,
      field('destinatario', 'Tratamiento y nombre del Coordinador de Carrera'),
      field('nivel', 'Nivel que cursas'),
      field('ciclo', 'Ciclo académico'),
      field('celular', 'Teléfono celular', false),
    ],
    'Estudiante',
  ],
]

type Placement = Pick<TemplateDefinition, 'stage' | 'issuer' | 'signers' | 'signersByModality'>
const student = 'Estudiante'
const company = 'Empresa'
const companySigner = 'Representante de la empresa'
const placements: Record<string, Placement> = {
  'anexo-1': { stage: 'propuesta', issuer: student, signers: 'Estudiante y tutor sugerido', signersByModality: { complexivo: student } },
  'anexo-3': { stage: 'propuesta', issuer: company, signers: companySigner },
  'solicitud-habilitantes': { stage: 'propuesta', issuer: student, signers: student },
  'anexo-2': { stage: 'propuesta', issuer: student },
  'anexo-5': { stage: 'desarrollo', issuer: 'Tutor', signers: 'Tutor' },
  'anexo-11': { stage: 'desarrollo', issuer: 'Tutor', signers: 'Tutor' },
  'anexo-a': { stage: 'desarrollo', issuer: student },
  'guia-final': { stage: 'desarrollo', issuer: student },
  'anexo-13a': { stage: 'desarrollo', issuer: student },
  'anexo-13b': { stage: 'desarrollo', issuer: 'Unidad de Titulación' },
  'anexo-6': { stage: 'desarrollo', issuer: 'Tutor' },
  'anexo-10-article': { stage: 'calificadores', issuer: student, signers: student },
  'anexo-10-research': { stage: 'calificadores', issuer: student, signers: student },
  'cumplimiento-empresarial': { stage: 'calificadores', issuer: company, signers: companySigner },
  'anexo-12': { stage: 'calificadores', issuer: 'Calificadores' },
  'anexo-15': { stage: 'sustentacion', issuer: student, signers: student },
  'anexo-14-article': { stage: 'sustentacion', issuer: student, signers: student },
  'anexo-14-research': { stage: 'sustentacion', issuer: student, signers: student },
  'anexo-14-complexivo': { stage: 'sustentacion', issuer: student, signers: student },
  'no-adeudar': { stage: 'sustentacion', issuer: 'Tesorería' },
  'preliminares-article': { stage: 'sustentacion', issuer: student },
  'preliminares-research': { stage: 'sustentacion', issuer: student },
  'anexo-16': { stage: 'sustentacion', issuer: 'Tribunal' },
  'anexo-4': { stage: 'otros', issuer: student, signers: 'Estudiante, y el tutor sugerido si cambia a trabajo de titulación' },
  'anexo-8': { stage: 'otros', issuer: student, signers: student },
  'anexo-9': { stage: 'otros', issuer: student, signers: student },
  'recalificacion-research': { stage: 'otros', issuer: student, signers: student },
  'anexo-21': { stage: 'otros', issuer: student, signers: student },
  'anexo-7': { stage: 'otros', issuer: 'Tutor' },
}

export const templates: TemplateDefinition[] = specs.map(
  ([id, name, sourceRef, modalities, fields, role, companyOnly]) => {
    const sourceId = typeof sourceRef === 'string' ? sourceRef : (`UT-${String(sourceRef).padStart(2, '0')}` as keyof typeof content)
    const source = content[sourceId]
    return {
      id,
      name,
      sourceIds: [sourceId],
      version: '2026-10-22.1',
      kind: 'editable',
      role,
      modalities,
      fields,
      fixedText: source.text,
      notes: [
        'Fuente aportada el 22/10/2026. Revisar destinatarios y firmas antes de presentar.',
        ...(source.geometryVerified
          ? []
          : ['Geometría del original DOC pendiente de verificación visual.']),
      ],
      page: source.geometry,
      companyOnly,
      ...placements[id],
    }
  },
)

const references: [string, string, number, TemplateDefinition['kind'], string][] = [
  ['anexo-a', 'Anexo A · Referencia de tesis', 1, 'reference', 'Estudiante'],
  ['guia-final', 'Guía del informe final', 2, 'reference', 'Estudiante'],
  ['anexo-13a', 'Anexo 13A · Estructura del informe', 4, 'reference', 'Estudiante'],
  ['anexo-2', 'Anexo 2 · Estructura de propuesta', 7, 'reference', 'Estudiante'],
  ['anexo-6', 'Anexo 6 · Notificación del tutor', 11, 'reference', 'Tutor'],
  ['anexo-7', 'Anexo 7 · Baja del tema', 12, 'reference', 'Tutor'],
  ['anexo-12', 'Anexo 12 · Consignación de notas', 17, 'reference', 'Calificador'],
  ['no-adeudar', 'No adeudar · Obtener del sistema UTA', 20, 'external', 'Tesorería'],
  ['preliminares-article', 'Preliminares de Artículo', 25, 'reference', 'Estudiante'],
  ['preliminares-research', 'Preliminares de Proyecto', 26, 'reference', 'Estudiante'],
  ['anexo-16', 'Anexo 16 · Ficha de sustentación', 27, 'reference', 'Tribunal'],
]
const referenceModalities: Record<string, Modality[]> = {
  'no-adeudar': all,
  'preliminares-article': ['article'],
  'preliminares-research': ['research'],
}
for (const [id, name, number, kind, role] of references) {
  const sourceId = `UT-${String(number).padStart(2, '0')}` as keyof typeof content
  templates.push({
    id,
    name,
    sourceIds: [sourceId],
    version: '2026-10-22.1',
    kind,
    role,
    modalities: referenceModalities[id] ?? work,
    fields: [],
    fixedText: '',
    notes: [
      'Consultar la fuente institucional. No se genera un documento emitido por otra persona.',
    ],
    page: content[sourceId].geometry,
    ...placements[id],
  })
}
templates.push({
  id: 'anexo-13b',
  name: 'Anexo 13B · Fuente no aportada',
  sourceIds: ['UT-05'],
  version: '2026-10-22.1',
  kind: 'missing',
  role: 'Institución',
  modalities: ['article'],
  fields: [],
  fixedText: '',
  notes: ['Mencionado en UT-05, pero no aportado. Solicitar el formato a la Unidad de Titulación.'],
  page: { width: 595.3, height: 841.9, marginX: 85.05, marginY: 70.85 },
  ...placements['anexo-13b'],
})
