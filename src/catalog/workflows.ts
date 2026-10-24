import type { Modality, Requirement, WorkflowDefinition } from '../domain/types'

const all: Modality[] = ['research', 'article', 'complexivo']
const work: Modality[] = ['research', 'article']
const check = (id: string, label: string): Requirement => ({ id, label })
const doc = (id: string, label: string, category = id, signed = true): Requirement => ({
  id,
  label,
  category,
  signed,
})
const personal = doc('personal', 'Cédula y papeleta de votación', 'personal', false)
const resolution = doc(
  'resolucion',
  'Resolución de Consejo Directivo de modalidad, tema y modificaciones',
  'resolucion',
)
const designation = doc(
  'resolucion-designacion',
  'Notificación de calificadores designados por Consejo Directivo',
  'resolucion-designacion',
)
const final = doc(
  'final',
  'Informe final del tutor al 100 %, con las actividades de los informes mensuales',
  'final',
)
const monthly = doc('mensual', 'Anexo 5 · Informes mensuales firmados por el tutor', 'mensual')
const thesis = doc(
  'tesis',
  'Trabajo de titulación en PDF con texto seleccionable (OCR)',
  'tesis',
  false,
)
const business = {
  ...doc('empresa', 'Anexo de cumplimiento empresarial al 100 %', 'empresa'),
  companyOnly: true,
}
const noDebt = doc('no-adeudar', 'Formulario de no adeudar vigente', 'no-adeudar')
const legalCertificate = doc(
  'aptitud-legal',
  'Certificado de aptitud legal emitido por Secretaría',
  'aptitud-legal',
)
const grades = [
  check('grade-1', 'Nota del primer calificador (sobre 10)'),
  check('grade-2', 'Nota del segundo calificador (sobre 10)'),
]
const gradeReports = doc('notas', 'Calificaciones emitidas por los dos calificadores', 'notas')
const attendance = check('attendance', 'Porcentaje de asistencia (mínimo 70 %)')
const attendanceReport = doc('asistencia', 'Informe de asistencia emitido por el tutor', 'asistencia')
const examResolutions = doc(
  'resolucion-examen',
  'Resoluciones del examen y, si aplica, de segunda oportunidad o recalificación',
  'resolucion-examen',
)
const responseCaptures: Requirement = {
  ...doc('respuesta', 'Capturas del correo de respuesta', 'respuesta', false),
  optional: true,
}
const definitions: WorkflowDefinition[] = []
function add(
  definition: Omit<WorkflowDefinition, 'outputs' | 'role'> &
    Partial<Pick<WorkflowDefinition, 'outputs' | 'role'>>,
) {
  definitions.push({
    role: 'Estudiante',
    ...definition,
    outputs: [...(definition.outputs ?? []), responseCaptures],
  })
}
add({
  id: 'propuesta',
  title: 'Propuesta y aprobación de modalidad',
  stage: 'propuesta',
  modalities: all,
  sourceIds: ['UT-05', 'UT-07'],
  dependsOn: [],
  requirements: [
    personal,
    doc('solicitud', 'Anexo 1 · Solicitud de modalidad, firmada por estudiante y tutor', 'solicitud'),
    { ...check('avales', 'Avales de la propuesta, obtenidos antes de las firmas'), modalities: work },
    {
      ...doc('compromiso', 'Anexo 11 · Carta de compromiso de la empresa', 'compromiso'),
      companyOnly: true,
    },
  ],
  outputs: [doc('resolucion', 'Resolución de Consejo Directivo de modalidad y tema', 'resolucion')],
  instructions:
    'Se envía desde el correo institucional a informacion.fisei, con cada documento numerado y en un archivo separado. El examen complexivo no lleva avales en el Anexo 1. El Consejo Directivo aprueba la modalidad y el tema mediante una resolución, que habilita el desarrollo del trabajo.',
  role: 'Estudiante y Consejo Directivo',
})
add({
  id: 'desarrollo',
  title: 'Informes mensuales de avance',
  stage: 'desarrollo',
  modalities: work,
  sourceIds: ['UT-10'],
  dependsOn: ['propuesta'],
  requirements: [monthly],
  instructions:
    'El tutor firma cada informe mensual y lo envía por Quipux al responsable de la Unidad de Titulación, con copia por correo al estudiante. Los plazos se cuentan desde la aprobación de la propuesta, no desde un día fijo del mes.',
  role: 'Tutor y estudiante',
})
add({
  id: 'informe-final',
  title: 'Informe final de avance del tutor',
  stage: 'desarrollo',
  modalities: work,
  sourceIds: ['UT-03'],
  dependsOn: ['desarrollo'],
  requirements: [
    final,
    check('coincidencia', 'Fechas y actividades iguales a las de todos los informes mensuales'),
  ],
  instructions:
    'El informe declara el 100 % de avance y repite exactamente las actividades de los informes mensuales. Lo revisa, firma y envía el tutor.',
  role: 'Tutor',
})
const graderRequest = [
  personal,
  final,
  monthly,
  doc(
    'aval-informes',
    'Aval de revisión de informes, emitido por la Unidad de Titulación',
    'aval-informes',
  ),
  resolution,
  doc('matricula', 'Certificado de folio y matrícula del período actual', 'matricula'),
  thesis,
]
const graderOutputs = [designation, gradeReports, ...grades]
add({
  id: 'calificadores-research',
  title: 'Designación de calificadores del Proyecto',
  stage: 'calificadores',
  modalities: ['research'],
  sourceIds: ['UT-16', 'UT-17', 'UT-21'],
  dependsOn: ['informe-final'],
  requirements: [
    ...graderRequest,
    business,
    doc('similitud', 'Informe de similitud generado desde la cuenta del tutor', 'similitud'),
    check('similarity', 'Porcentaje de similitud (máximo 10 %)'),
  ],
  outputs: graderOutputs,
  instructions:
    'El Anexo 10 del Proyecto se dirige al Decano y se envía a informacion.fisei con cada documento en PDF con OCR, separado y numerado. Un mismo documento no mezcla firmas autógrafas y electrónicas. El Consejo Directivo designa a los calificadores; cada uno emite una nota sobre 10 y el promedio mínimo es 7.',
  role: 'Estudiante, Consejo Directivo y calificadores',
})
add({
  id: 'calificadores-article',
  title: 'Designación de calificadores del Artículo',
  stage: 'calificadores',
  modalities: ['article'],
  sourceIds: ['UT-15', 'UT-17', 'UT-21'],
  dependsOn: ['informe-final'],
  requirements: [
    ...graderRequest,
    doc('publicacion', 'Publicación o carta de aceptación de la revista', 'publicacion'),
  ],
  outputs: graderOutputs,
  instructions:
    'El Anexo 10 del Artículo se dirige al Decano, con el tema en español y en inglés cuando la revista lo exige. No incluye el informe de similitud del Proyecto. El Consejo Directivo designa a los calificadores; cada uno emite una nota sobre 10 y el promedio mínimo es 7. Con un promedio inferior procede la recalificación.',
  role: 'Estudiante, Consejo Directivo y calificadores',
})
add({
  id: 'complexivo',
  title: 'Examen complexivo',
  stage: 'complexivo',
  modalities: ['complexivo'],
  sourceIds: ['UT-21', 'UT-24'],
  dependsOn: ['propuesta'],
  requirements: [attendanceReport],
  outputs: [attendance, examResolutions],
  instructions:
    'La asistencia mínima a la preparación es del 70 %. El Consejo Directivo emite una resolución por cada examen, incluidas la segunda oportunidad y la recalificación.',
  role: 'Tutor y Consejo Directivo',
})
add({
  id: 'no-adeudar',
  title: 'Formulario de no adeudar',
  stage: 'aptitud',
  modalities: all,
  sourceIds: ['UT-20', 'UT-21'],
  dependsOn: [],
  requirements: [],
  outputs: [doc('no-adeudar', 'Formulario de no adeudar emitido por Tesorería', 'no-adeudar')],
  instructions:
    'Tesorería emite el formulario desde el sistema de la UTA. Su vigencia de referencia es de 30 días y debe seguir vigente al ingresar la solicitud de fecha de sustentación.',
  role: 'Tesorería y estudiante',
})
for (const modality of all) {
  const modalityRequirements =
    modality === 'complexivo'
      ? [attendance, attendanceReport, { ...examResolutions, label: 'Resoluciones del examen' }]
      : [final, gradeReports, ...grades]
  add({
    id: `aptitud-legal-${modality}`,
    title: 'Certificado de aptitud legal',
    stage: 'aptitud',
    modalities: [modality],
    sourceIds: ['UT-21'],
    dependsOn: [
      'no-adeudar',
      modality === 'complexivo' ? 'complexivo' : `calificadores-${modality}`,
    ],
    requirements: [
      personal,
      doc('record', 'Récord académico actualizado', 'record'),
      doc('habilitantes', 'Requisitos habilitantes actualizados', 'habilitantes'),
      noDebt,
      ...modalityRequirements,
    ],
    outputs: [legalCertificate],
    instructions:
      'La solicitud es el Anexo 15; el certificado lo emite Secretaría y es un documento distinto de la solicitud. Un mismo documento no mezcla firmas autógrafas y electrónicas. El plazo de solicitud no se posterga.',
    role: 'Estudiante y Secretaría',
  })
}
add({
  id: 'biblioteca-revision',
  title: 'Biblioteca: revisión del trabajo sin firmas',
  stage: 'biblioteca',
  modalities: work,
  sourceIds: ['UT-22', 'UT-23'],
  dependsOn: [],
  requirements: [
    thesis,
    check(
      'estructura',
      'Proyecto en un solo archivo con preliminares; Artículo en dos archivos separados',
    ),
  ],
  outputs: [doc('aval-inicial', 'Aval inicial de Biblioteca para iniciar las firmas', 'aval-inicial')],
  instructions:
    'El trabajo se envía a Biblioteca sin firmas. Biblioteca lo revisa y emite un aval inicial que autoriza recoger las firmas.',
  role: 'Estudiante y Biblioteca',
})
add({
  id: 'biblioteca-firma-estudiante',
  title: 'Biblioteca: firma del estudiante',
  stage: 'biblioteca',
  modalities: work,
  sourceIds: ['UT-22', 'UT-23'],
  dependsOn: ['biblioteca-revision'],
  requirements: [doc('firma-estudiante', 'Trabajo firmado por el estudiante', 'tesis')],
  instructions:
    'El estudiante firma la versión revisada por Biblioteca. Cada firma posterior se hace sobre la versión ya firmada.',
})
add({
  id: 'biblioteca-firmas-docentes',
  title: 'Biblioteca: firmas del tutor y de los calificadores',
  stage: 'biblioteca',
  modalities: work,
  sourceIds: ['UT-22', 'UT-23'],
  dependsOn: ['biblioteca-firma-estudiante'],
  requirements: [
    check('tutor-firma', 'Firma del tutor'),
    check('calificador-1-firma', 'Firma del primer calificador'),
    check('calificador-2-firma', 'Firma del segundo calificador'),
    doc('docentes-firmados', 'Trabajo con las firmas del tutor y de los calificadores', 'tesis'),
  ],
  instructions:
    'Firman el tutor y los dos calificadores, sin un orden obligatorio entre ellos, siempre sobre la última versión firmada.',
  role: 'Tutor y calificadores',
})
add({
  id: 'biblioteca-decanato',
  title: 'Biblioteca: firma de Decanato y aval final',
  stage: 'biblioteca',
  modalities: work,
  sourceIds: ['UT-22', 'UT-23'],
  dependsOn: ['biblioteca-firmas-docentes'],
  requirements: [doc('decanato-firma', 'Trabajo firmado por Decanato', 'tesis')],
  outputs: [doc('biblioteca', 'Aval final de Biblioteca', 'biblioteca')],
  instructions:
    'Decanato firma la versión que ya tiene todas las firmas docentes. Biblioteca revisa las firmas y emite el aval final, que se presenta al pedir la fecha de sustentación.',
  role: 'Decanato y Biblioteca',
})
add({
  id: 'dia-hora',
  title: 'Solicitud de fecha de sustentación o incorporación',
  stage: 'sustentacion',
  modalities: all,
  sourceIds: ['UT-22', 'UT-23', 'UT-24'],
  dependsOn: [
    'aptitud-legal-research',
    'aptitud-legal-article',
    'aptitud-legal-complexivo',
    'biblioteca-decanato',
  ],
  requirements: [
    { ...noDebt, label: 'Formulario de no adeudar vigente a la fecha de ingreso' },
    { ...legalCertificate, label: 'Certificado de aptitud legal' },
    doc('bachiller', 'Certificado de registro del título de bachiller', 'bachiller'),
    { ...resolution, label: 'Resolución de Consejo Directivo de modalidad y tema' },
    { ...designation, label: 'Notificación de calificadores designados', modalities: work },
    { ...doc('biblioteca', 'Aval final de Biblioteca', 'biblioteca'), modalities: work },
    doc('solicitud', 'Anexo 14 · Solicitud de fecha y hora dirigida al Decano', 'solicitud'),
    check('mismas-versiones', 'Anexos idénticos a los presentados para aptitud legal'),
  ],
  outputs: [
    doc(
      'notificacion-defensa',
      'Notificación de fecha y hora de sustentación',
      'notificacion-defensa',
      false,
    ),
  ],
  instructions:
    'El Anexo 14 se dirige al Decano. El examen complexivo solicita incorporación. Los anexos son los mismos presentados para aptitud legal y el no adeudar debe estar vigente al ingresar la solicitud. El Consejo Directivo fija la fecha y la hora y las notifica.',
  role: 'Estudiante y Consejo Directivo',
})
add({
  id: 'defensa',
  title: 'Sustentación o incorporación',
  stage: 'sustentacion',
  modalities: all,
  sourceIds: ['UT-27', 'UT-24'],
  dependsOn: ['dia-hora'],
  requirements: [],
  outputs: [doc('resultado', 'Acta de sustentación o resultado de la incorporación', 'resultado')],
  instructions:
    'La fecha y la hora de cada estudiante llegan en la notificación de Consejo Directivo. La fecha límite del calendario no es una cita individual.',
  role: 'Tribunal e institución',
})
add({
  id: 'titulo',
  title: 'Retirar título',
  stage: 'titulo',
  modalities: all,
  sourceIds: ['UT-22', 'UT-23', 'UT-24'],
  dependsOn: ['defensa'],
  requirements: [],
  outputs: [
    check('convocatoria', 'Convocatoria institucional a la entrega del título'),
    check('retiro', 'Título retirado'),
  ],
  instructions:
    'Secretaría convoca por correo institucional con el lugar y la fecha de entrega. El plazo de un mes y medio es orientativo, no oficial.',
})
for (const [id, title, sourceIds, modalities] of [
  ['cambio-modalidad', 'Cambio de modalidad', ['UT-09'], all],
  ['notificacion-tutor', 'Notificación de falta de tutorías', ['UT-13'], work],
  ['cambio-tutor', 'Cambio de tutor', ['UT-14'], work],
  ['recalificacion-research', 'Recalificación del Proyecto corregido', ['UT-19'], ['research']],
  ['recalificacion-complexivo', 'Recalificación del examen complexivo', ['UT-06'], ['complexivo']],
] as [string, string, string[], Modality[]][]) {
  add({
    id,
    title,
    stage: 'otros',
    modalities,
    sourceIds,
    dependsOn: [],
    requirements: [doc('solicitud', 'Solicitud con los adjuntos que exige su formato', 'solicitud')],
    outputs: [doc('resolucion-tramite', 'Resolución del trámite', 'resolucion-tramite')],
    instructions:
      'Trámite excepcional. Se presenta con el formato de su fuente y se conservan las resoluciones anteriores. Los días término no equivalen a días calendario.',
    optional: true,
  })
}
export const workflowDefinitions = definitions
