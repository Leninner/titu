import type { Modality, Requirement, WorkflowDefinition } from '../domain/types'

const all: Modality[] = ['research', 'article', 'complexivo']
const work: Modality[] = ['research', 'article']
type Label = string | [label: string, detail: string]
const labelled = (text: Label) =>
  typeof text === 'string' ? { label: text } : { label: text[0], detail: text[1] }
const check = (id: string, text: Label): Requirement => ({ id, ...labelled(text) })
const doc = (id: string, text: Label, category = id, signed = true): Requirement => ({
  id,
  ...labelled(text),
  category,
  signed,
})
const personal = doc('personal', 'Cédula y papeleta de votación', 'personal', false)
const resolution = doc(
  'resolucion',
  ['Resolución de modalidad y tema', 'Resolución de Consejo Directivo que aprueba la modalidad y el tema, con sus modificaciones'],
  'resolucion',
)
const designation = doc(
  'resolucion-designacion',
  ['Designación de calificadores', 'Notificación del Consejo Directivo con los calificadores designados'],
  'resolucion-designacion',
)
const final = doc(
  'final',
  ['Anexo 11 · Informe final', 'Informe final del tutor al 100 %, con las mismas fechas y actividades de los informes mensuales'],
  'final',
)
const monthly = doc('mensual', ['Anexo 5 · Informes mensuales', 'Un informe por mes, firmado por el tutor, con el tema aprobado'], 'mensual')
const thesis = doc(
  'tesis',
  ['Trabajo de titulación', 'PDF con texto seleccionable (OCR)'],
  'tesis',
  false,
)
const business = {
  ...doc(
    'empresa',
    ['Cumplimiento empresarial', 'Informe de cumplimiento al 100 %, firmado por el coordinador de la empresa'],
    'empresa',
  ),
  companyOnly: true,
}
const noDebt = doc('no-adeudar', ['Formulario de no adeudar', 'Vigente: vale 30 días desde su emisión'], 'no-adeudar')
const legalCertificate = doc(
  'aptitud-legal',
  ['Certificado de aptitud legal', 'Emitido por Secretaría; es distinto de la solicitud Anexo 15'],
  'aptitud-legal',
)
const grades = [
  check('grade-1', ['Nota del primer calificador', 'Sobre 10, según su Anexo 12']),
  check('grade-2', ['Nota del segundo calificador', 'Sobre 10, según su Anexo 12']),
]
const gradeReports = doc(
  'notas',
  ['Anexo 12 · Calificaciones', 'Calificaciones consignadas por los dos calificadores'],
  'notas',
)
const request = (id: string, text: Label) => doc(id, text, id)
const approvalResolution = doc(
  'resolucion',
  ['Resolución de aprobación', 'Resolución de aprobación de modalidad, propuesta y designación del tutor'],
  'resolucion',
)
const attendance = check('attendance', ['Porcentaje de asistencia', 'Mínimo 70 % de asistencia a la preparación'])
const attendanceReport = doc('asistencia', ['Informe de asistencia', 'Emitido por el tutor'], 'asistencia')
const examResolutions = doc(
  'resolucion-examen',
  ['Resoluciones del examen', 'Incluye las de segunda oportunidad o recalificación, si aplican'],
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
  summary: 'Consigue el aval de tu propuesta, firma el Anexo 1 y envía la solicitud con sus adjuntos a informacion.fisei.',
  title: 'Propuesta y aprobación de modalidad',
  stage: 'propuesta',
  modalities: all,
  sourceIds: ['UT-05', 'UT-07'],
  dependsOn: [],
  requirements: [
    doc(
      'solicitud',
      ['Anexo 1 · Solicitud de modalidad', 'Solicitud de selección de modalidad y presentación de la propuesta, dirigida al Presidente de la Unidad de Titulación y firmada por el estudiante y el tutor sugerido (en complexivo, solo el estudiante)'],
      'solicitud',
    ),
    personal,
    {
      ...doc(
        'avales',
        ['Capturas de los avales', 'Capturas de los correos con el aval del Coordinador de Carrera y del docente miembro de la Unidad de Titulación'],
        'avales',
        false,
      ),
      modalities: work,
    },
    {
      ...doc(
        'compromiso',
        ['Anexo 3 · Carta de compromiso', 'Firmada por el representante de la institución contraparte, con el alcance del trabajo'],
        'compromiso',
      ),
      companyOnly: true,
      modalities: work,
    },
    {
      ...doc(
        'oficio-investigacion',
        ['Oficio de investigación', 'Oficio del Coordinador de la Unidad Operativa de Investigación; solo si el trabajo se vincula a un proyecto de investigación'],
        'oficio-investigacion',
      ),
      modalities: work,
      optional: true,
    },
    {
      ...doc(
        'propuesta-perfil',
        ['Anexo 2 · Propuesta del perfil', 'Propuesta del perfil desarrollada en Diseño de Proyectos con el tutor sugerido'],
        'propuesta-perfil',
        false,
      ),
      modalities: work,
    },
    {
      ...doc(
        'habilitantes',
        ['Requisitos habilitantes', 'Certificado actualizado; solo si la solicitud se presenta después de la verificación del récord académico'],
        'habilitantes',
      ),
      optional: true,
    },
  ],
  outputs: [doc('resolucion', ['Resolución de modalidad y tema', 'Resolución de Consejo Directivo que aprueba la modalidad, la opción, el tutor y el tema'], 'resolucion')],
  instructions:
    'La propuesta del perfil (Anexo 2), hecha en Diseño de Proyectos con el tutor sugerido, se envía por correo al Coordinador de Carrera y al docente de la Unidad de Titulación, con copia al tutor, para obtener su aval; las observaciones se corrigen y se reenvían. Con el aval se firma el Anexo 1, dirigido al Presidente de la Unidad de Titulación. La solicitud va a informacion.fisei@uta.edu.ec solo desde el correo institucional, hasta el fin de los exámenes de recuperación del penúltimo nivel, con los documentos sin unificar, numerados en el orden del anexo y en una carpeta comprimida. Las firmas son electrónicas o autógrafas, nunca mixtas ni una imagen pegada. El examen complexivo no lleva firmas de aval ni Anexo 2. La Unidad de Titulación verifica el récord académico y emite un acuerdo que el Consejo Directivo aprueba en un máximo de 8 días término; la resolución indica modalidad, opción, tutor y tema.',
  role: 'Estudiante, Unidad de Titulación y Consejo Directivo',
})
add({
  id: 'desarrollo',
  summary: 'Sube el Anexo 5 firmado por tu tutor de cada mes; se completa al tener todos.',
  autoComplete: true,
  title: 'Informes mensuales de avance',
  stage: 'desarrollo',
  modalities: work,
  sourceIds: ['UT-10'],
  dependsOn: ['propuesta'],
  requirements: [monthly],
  instructions:
    'El tutor firma un Anexo 5 por cada mes de desarrollo y lo envía por Quipux a la secretaría de la Unidad de Titulación, con copia al docente responsable de la Unidad de Titulación de la carrera y por correo al estudiante. Los plazos se cuentan desde la aprobación de la propuesta por el Consejo Directivo. Todos los informes llevan el tema aprobado o modificado por resolución; no puede haber documentos con temas distintos.',
  role: 'Tutor y estudiante',
})
add({
  id: 'informe-final',
  summary: 'Prepara el Anexo 11 con las actividades de tus Anexo 5, envíaselo a tu tutor y sube el firmado.',
  title: 'Informe final de avance del tutor',
  stage: 'desarrollo',
  modalities: work,
  sourceIds: ['UT-03'],
  dependsOn: ['desarrollo'],
  requirements: [
    {
      id: 'anexo-11',
      ...labelled([
        'Anexo 11 · Informe final',
        'Informe final al 100 % con las fechas y actividades de todos los Anexo 5',
      ]),
      category: 'final',
      annex: 'anexo-11',
    },
  ],
  outputs: [
    doc('final', ['Anexo 11 firmado', 'Firmado por el tutor y enviado por Quipux'], 'final'),
  ],
  instructions:
    'El Anexo 11 declara el 100 % de avance, la fecha de aprobación de la propuesta en Consejo Directivo y las mismas fechas y actividades de los informes mensuales. Lo firma solo el tutor y lo envía por Quipux a la secretaría de la Unidad de Titulación, con copia al docente responsable y por correo al estudiante.',
  role: 'Tutor',
})
const reviewEndorsement = doc(
  'aval-informes',
  ['Aval de revisión de informes', 'Emitido por la secretaría de la Unidad de Titulación (titulacion_fisei@uta.edu.ec)'],
  'aval-informes',
)
const enrollment = doc('matricula', ['Folio y matrícula', 'Certificado de folio y matrícula del período actual'], 'matricula')
const graderOutputs = [designation, gradeReports, ...grades]
const submissionRules =
  'Se envía a informacion.fisei@uta.edu.ec solo desde el correo institucional, con los documentos en PDF con OCR, sin unificar, numerados en el orden establecido y en una carpeta comprimida. Las firmas son electrónicas o autógrafas, nunca mixtas ni una imagen pegada. Si falta un requisito, el trámite se devuelve.'
add({
  id: 'calificadores-research',
  summary: 'Envía el Anexo 10 con tu trabajo terminado y espera a los calificadores y sus notas.',
  title: 'Designación de calificadores del Proyecto',
  stage: 'calificadores',
  modalities: ['research'],
  sourceIds: ['UT-16', 'UT-17', 'UT-21'],
  dependsOn: ['informe-final'],
  requirements: [
    request('solicitud-calificadores', ['Anexo 10 · Solicitud de calificadores', 'Solicitud de designación de calificadores del Proyecto, dirigida al Presidente del Consejo Directivo']),
    { ...personal, ...labelled(['Cédula y papeleta de votación', 'Legibles y en tamaño real']) },
    business,
    final,
    monthly,
    reviewEndorsement,
    doc('similitud', ['Informe de similitud', 'Reporte de Turnitin generado desde la cuenta del tutor, con un máximo de 10 %'], 'similitud', false),
    check('similarity', ['Porcentaje de similitud', 'Máximo 10 %']),
    { ...resolution, ...labelled(['Resolución de modalidad y tema', 'Resolución de Consejo Directivo de modalidad y tema, con sus cambios']) },
    enrollment,
    thesis,
  ],
  outputs: graderOutputs,
  instructions: `${submissionRules} El tutor envía además el informe de similitud al Consejo Directivo por Quipux. El Consejo Directivo designa a dos calificadores y lo notifica; cada uno consigna su calificación en el Anexo 12 dentro de 8 días término. El promedio mínimo es 7; con un promedio inferior procede la recalificación.`,
  role: 'Estudiante, Consejo Directivo y calificadores',
})
add({
  id: 'calificadores-article',
  summary: 'Envía el Anexo 10 con tu artículo aceptado y espera a los calificadores y sus notas.',
  title: 'Designación de calificadores del Artículo',
  stage: 'calificadores',
  modalities: ['article'],
  sourceIds: ['UT-15', 'UT-17', 'UT-21'],
  dependsOn: ['informe-final'],
  requirements: [
    request('solicitud-calificadores', ['Anexo 10 · Solicitud de calificadores', 'Solicitud de designación de calificadores del Artículo, dirigida al Presidente del Consejo Directivo']),
    personal,
    doc('publicacion', ['Publicación o aceptación', 'Constancia de publicación o carta de aceptación de la revista'], 'publicacion'),
    monthly,
    final,
    reviewEndorsement,
    { ...resolution, ...labelled(['Resolución de modalidad y tema', 'Resolución de Consejo Directivo de modalidad y tema, con sus cambios']) },
    enrollment,
    { ...thesis, ...labelled(['Artículo académico', 'PDF con texto seleccionable (OCR)']) },
  ],
  outputs: graderOutputs,
  instructions: `${submissionRules} El tema va en español y en inglés solo si cambió para la publicación en la revista. El Consejo Directivo designa a dos calificadores y lo notifica; cada uno consigna su calificación en el Anexo 12. La nota mínima es 7, porque el artículo ya cuenta con la carta de aceptación.`,
  role: 'Estudiante, Consejo Directivo y calificadores',
})
add({
  id: 'complexivo',
  summary: 'Asiste a la preparación y rinde el examen; guarda sus resoluciones.',
  title: 'Examen complexivo',
  stage: 'complexivo',
  modalities: ['complexivo'],
  sourceIds: ['UT-21', 'UT-24'],
  dependsOn: ['propuesta'],
  requirements: [attendanceReport],
  outputs: [attendance, examResolutions],
  instructions:
    'La asistencia mínima a la preparación es del 70 %. El Consejo Directivo emite una resolución por cada examen, incluidas la segunda oportunidad y la recalificación; se obtienen en Información o en redi.uta.edu.ec.',
  role: 'Tutor y Consejo Directivo',
})
add({
  id: 'no-adeudar',
  summary: 'Pide el formulario en el Sistema Integrado de la UTA y descárgalo cuando esté finalizado.',
  title: 'Formulario de no adeudar',
  stage: 'aptitud',
  modalities: all,
  sourceIds: ['UT-20', 'UT-21'],
  dependsOn: [],
  requirements: [],
  outputs: [doc('no-adeudar', ['Formulario de no adeudar', 'Firmado electrónicamente; se descarga cuando su estado es Finalizado y vale 30 días'], 'no-adeudar')],
  instructions:
    'Se solicita en servicios.uta.edu.ec, Sistema Integrado. La solicitud pasa a la Secretaría de Facultad, que genera la orden de pago; luego cada dependencia la valida. El formulario se descarga cuando su estado es Finalizado y vale treinta días desde su emisión; después caduca.',
  role: 'Estudiante, Secretaría de Facultad y dependencias',
})
for (const modality of all) {
  const modalityRequirements =
    modality === 'complexivo'
      ? [attendance, attendanceReport, { ...examResolutions, label: 'Resoluciones del examen' }]
      : [final, { ...gradeReports, ...labelled(['Calificaciones', 'Las dos calificaciones, solicitadas en la Unidad de Titulación']) }]
  add({
    id: `aptitud-legal-${modality}`,
  summary: 'Envía el Anexo 15 con tus documentos y espera el certificado de aptitud legal.',
    title: 'Certificado de aptitud legal',
    stage: 'aptitud',
    modalities: [modality],
    sourceIds: ['UT-21'],
    dependsOn: [
      'no-adeudar',
      modality === 'complexivo' ? 'complexivo' : `calificadores-${modality}`,
    ],
    requirements: [
      request('solicitud-aptitud', ['Anexo 15 · Solicitud de aptitud legal', 'Dirigida al Decano, en PDF con OCR e indicando la modalidad']),
      { ...personal, ...labelled(['Cédula y papeleta de votación', 'A color, en un solo archivo']) },
      doc('record', ['Récord académico', 'Con la matrícula en titulación con la leyenda «En proceso»'], 'record'),
      doc('habilitantes', ['Requisitos habilitantes', 'Certificado actualizado, emitido por Coordinación de Carrera'], 'habilitantes'),
      noDebt,
      ...modalityRequirements,
    ],
    outputs: [legalCertificate],
    instructions: `${submissionRules} El certificado lo emite Secretaría y es un documento distinto de la solicitud; sus anexos son los mismos documentos que se presentan después para pedir la fecha de sustentación.`,
    role: 'Estudiante y Secretaría',
  })
}
add({
  id: 'biblioteca-revision',
  summary: 'Envía tu trabajo sin firmas a Biblioteca y espera el aval inicial.',
  title: 'Biblioteca: revisión del trabajo sin firmas',
  stage: 'biblioteca',
  modalities: work,
  sourceIds: ['UT-22', 'UT-23'],
  dependsOn: [],
  requirements: [
    {
      ...thesis,
      ...labelled(['Trabajo sin firmas', 'Hojas preliminares y trabajo en un solo PDF con OCR, sin firmas']),
      modalities: ['research'],
    },
    {
      ...doc('preliminares', ['Hojas preliminares sin firmas', 'Unificadas en un PDF, sin firmas y sin el artículo'], 'preliminares', false),
      modalities: ['article'],
    },
  ],
  outputs: [doc('aval-inicial', ['Aval inicial de Biblioteca', 'Autoriza recoger las firmas'], 'aval-inicial')],
  instructions:
    'Se envía sin firmas al correo de Biblioteca FISEI (edissonhtoaza@uta.edu.ec), con el asunto «PROYECTO DE INVESTIGACIÓN – APELLIDOS Y NOMBRES» u «HOJAS PRELIMINARES Y ARTÍCULO ACADÉMICO – APELLIDOS Y NOMBRES». El Proyecto usa la plantilla del Anexo A y la estructura del Anexo 13A. Biblioteca revisa el formato y emite un aval inicial que autoriza recoger las firmas.',
  role: 'Estudiante y Biblioteca',
})
add({
  id: 'biblioteca-firma-estudiante',
  summary: 'Firma tu trabajo en la página de autoría.',
  title: 'Biblioteca: firma del estudiante',
  stage: 'biblioteca',
  modalities: work,
  sourceIds: ['UT-22', 'UT-23'],
  dependsOn: ['biblioteca-revision'],
  requirements: [doc('firma-estudiante', ['Trabajo firmado por el estudiante', 'Con la página de autoría (y derechos de autor en el Proyecto) firmada'], 'tesis')],
  instructions:
    'El estudiante firma la página de autoría y, en el Proyecto, la de derechos de autor. Cada firma se recibe una por una antes de seguir con la siguiente, y cada firma electrónica debe poder verificarse.',
})
add({
  id: 'biblioteca-firmas-docentes',
  summary: 'Consigue, una por una, las firmas de tu tutor y de los dos calificadores.',
  title: 'Biblioteca: firmas del tutor y de los calificadores',
  stage: 'biblioteca',
  modalities: work,
  sourceIds: ['UT-22', 'UT-23'],
  dependsOn: ['biblioteca-firma-estudiante'],
  requirements: [
    check('tutor-firma', ['Firma del tutor', 'En la página de aprobación del tutor']),
    check('calificador-1-firma', ['Firma del primer calificador', 'En la página de aprobación del tribunal']),
    check('calificador-2-firma', ['Firma del segundo calificador', 'En la página de aprobación del tribunal']),
    doc('docentes-firmados', ['Trabajo con firmas docentes', 'Versión con las firmas del tutor y de los dos calificadores'], 'tesis'),
  ],
  instructions:
    'El tutor firma la aprobación del tutor y los dos calificadores la aprobación del tribunal, siempre sobre la última versión firmada y una firma a la vez. Cada firma electrónica debe poder verificarse.',
  role: 'Tutor y calificadores',
})
add({
  id: 'biblioteca-decanato',
  summary: 'Lleva el trabajo firmado a Decanato y espera el aval final de Biblioteca.',
  title: 'Biblioteca: firma de Decanato y aval final',
  stage: 'biblioteca',
  modalities: work,
  sourceIds: ['UT-22', 'UT-23'],
  dependsOn: ['biblioteca-firmas-docentes'],
  requirements: [doc('decanato-firma', ['Trabajo firmado por Decanato', 'El Decano firma como presidente del tribunal'], 'tesis')],
  outputs: [doc('biblioteca', 'Aval final de Biblioteca', 'biblioteca')],
  instructions:
    'La versión con todas las firmas docentes se envía a decanato.fisei@uta.edu.ec para la firma del Decano, que siempre preside el tribunal. Luego vuelve a Biblioteca, que valida las firmas y emite el aval final. La portada lleva el mes en que se presentan los papeles para la defensa.',
  role: 'Decanato y Biblioteca',
})
add({
  id: 'dia-hora',
  summary: 'Envía el Anexo 14 con tu certificado de aptitud legal y espera la fecha de sustentación.',
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
    request('solicitud-sustentacion', ['Anexo 14 · Solicitud de sustentación', 'Solicitud de lugar, fecha y hora, dirigida al Presidente del Consejo Directivo, con la dirección del estudiante']),
    { ...legalCertificate, ...labelled(['Certificado de aptitud legal', 'Con los mismos anexos presentados para obtenerlo']) },
    { ...noDebt, ...labelled(['Formulario de no adeudar', 'Vigente a la fecha de ingreso de la solicitud']) },
    doc('bachiller', ['Título de bachiller', 'Certificado de registro descargado del sitio del Ministerio de Educación, no el acta de grado del colegio'], 'bachiller'),
    { ...resolution, ...labelled(['Resoluciones de modalidad y tema', 'Resoluciones de Consejo Directivo de modalidad, tema y sus cambios; en complexivo, la de aprobación o cambio de modalidad']) },
    { ...designation, label: 'Notificación de calificadores designados', modalities: work },
    {
      ...business,
      ...labelled(['Conclusión empresarial al 100 %', 'Carta de compromiso empresarial de haber concluido el trabajo al 100 %']),
      modalities: work,
    },
    {
      ...doc('tesis-final', ['Trabajo final firmado', 'Avalado y firmado, en PDF con OCR'], 'tesis'),
      modalities: ['research'],
    },
    {
      ...doc('tesis-final', ['Preliminares y artículo firmados', 'Firmados y avalados, en PDF con OCR'], 'tesis'),
      modalities: ['article'],
    },
    { ...doc('biblioteca', 'Aval final de Biblioteca', 'biblioteca'), modalities: work },
  ],
  outputs: [
    doc(
      'notificacion-defensa',
      ['Notificación de sustentación', 'Lugar, fecha y hora fijados por el Consejo Directivo'],
      'notificacion-defensa',
      false,
    ),
  ],
  instructions: `${submissionRules} Cada PDF se nombra con apellidos, nombres y número de cédula. Los anexos del certificado de aptitud legal son los mismos documentos presentados para obtenerlo. El examen complexivo solicita incorporación y solo presenta la resolución de aprobación o cambio de modalidad. El Consejo Directivo fija el lugar, la fecha y la hora y los notifica.`,
  role: 'Estudiante y Consejo Directivo',
})
add({
  id: 'defensa',
  summary: 'Presenta tu sustentación en la fecha notificada y guarda el acta.',
  title: 'Sustentación o incorporación',
  stage: 'sustentacion',
  modalities: all,
  sourceIds: ['UT-27', 'UT-24'],
  dependsOn: ['dia-hora'],
  requirements: [],
  outputs: [doc('resultado', ['Acta de sustentación', 'O resultado de la incorporación'], 'resultado')],
  instructions:
    'La fecha y la hora de cada estudiante llegan en la notificación de Consejo Directivo; la fecha límite del calendario no es una cita individual. Cada miembro del tribunal califica en el Anexo 16 la sustentación (7), los recursos (1,5) y la expresión oral (1,5).',
  role: 'Tribunal e institución',
})
add({
  id: 'titulo',
  summary: 'Espera la convocatoria por correo y retira tu título.',
  title: 'Retirar título',
  stage: 'titulo',
  modalities: all,
  sourceIds: ['UT-22', 'UT-23', 'UT-24'],
  dependsOn: ['defensa'],
  requirements: [],
  outputs: [
    check('convocatoria', ['Convocatoria recibida', 'Convocatoria institucional a la entrega del título']),
    check('retiro', 'Título retirado'),
  ],
  instructions:
    'Secretaría convoca por correo institucional con el lugar y la fecha de entrega. El plazo aproximado de un mes y medio es orientativo, no oficial.',
})
const exceptional = (
  definition: Pick<WorkflowDefinition, 'id' | 'title' | 'sourceIds' | 'modalities' | 'requirements' | 'summary' | 'instructions'> &
    Partial<Pick<WorkflowDefinition, 'outputs' | 'role'>>,
) =>
  add({
    stage: 'otros',
    dependsOn: [],
    outputs: [doc('resolucion-tramite', 'Resolución del trámite', 'resolucion-tramite')],
    optional: true,
    ...definition,
  })
exceptional({
  id: 'cambio-modalidad',
  summary: 'Envía el Anexo 4 con tus adjuntos para cambiar de modalidad.',
  title: 'Cambio de modalidad',
  sourceIds: ['UT-09'],
  modalities: all,
  requirements: [
    request('solicitud-cambio-modalidad', ['Anexo 4 · Solicitud de cambio', 'Dirigida al Presidente de la Unidad de Titulación; firma también el tutor sugerido si el cambio es a trabajo de titulación']),
    { ...personal, ...labelled(['Cédula', 'Copia legible']) },
    approvalResolution,
    doc('habilitantes', ['Requisitos habilitantes', 'Certificado actualizado, emitido por Coordinación de Carrera'], 'habilitantes'),
  ],
  instructions:
    'Se presenta una sola vez, al finalizar el período académico, o como excepción hasta 20 días término después del inicio de clases, a informacion.fisei@uta.edu.ec. Si el cambio es a trabajo de titulación, la solicitud indica la modalidad, el tema preliminar y el tutor sugerido, que también firma.',
})
exceptional({
  id: 'notificacion-tutor',
  summary: 'Notifica con el Anexo 8 que tu tutor no atendió tres tutorías.',
  title: 'Notificación de inasistencia del tutor',
  sourceIds: ['UT-13'],
  modalities: work,
  requirements: [
    request('solicitud-notificacion-tutor', ['Anexo 8 · Notificación', 'Notificación del estudiante sobre las tutorías no atendidas por el tutor']),
    { ...personal, ...labelled(['Cédula', 'Copia legible']) },
    approvalResolution,
  ],
  outputs: [],
  instructions:
    'El estudiante notifica a la Unidad de Titulación, por informacion.fisei@uta.edu.ec, cuando el tutor no atiende tres tutorías. Tres notificaciones justifican pedir el cambio de tutor. Las notificaciones del tutor por inasistencia del estudiante (Anexos 6 y 7) las presenta el tutor.',
})
exceptional({
  id: 'cambio-tutor',
  summary: 'Envía el Anexo 9 para pedir un nuevo tutor.',
  title: 'Cambio de tutor',
  sourceIds: ['UT-14'],
  modalities: work,
  requirements: [
    request('solicitud-cambio-tutor', ['Anexo 9 · Solicitud de cambio de tutor', 'Con su causa, dirigida al Presidente de la Unidad de Titulación']),
    { ...personal, ...labelled(['Cédula', 'Copia legible']) },
    approvalResolution,
  ],
  outputs: [doc('resolucion-tramite', ['Resolución del nuevo tutor', 'Resolución de Consejo Directivo que designa al nuevo tutor'], 'resolucion-tramite')],
  instructions:
    'Procede tras tres notificaciones de inasistencia del tutor o por una causa justificada. Se envía a informacion.fisei@uta.edu.ec. El Consejo Directivo designa al nuevo tutor en un máximo de 10 días término.',
})
exceptional({
  id: 'recalificacion-research',
  summary: 'Corrige tu trabajo tras la reunión y envíalo para una nueva calificación.',
  title: 'Recalificación del Proyecto corregido',
  sourceIds: ['UT-19'],
  modalities: ['research'],
  requirements: [
    request('solicitud-recalificacion', ['Solicitud de recalificación', 'Dirigida al Presidente del Consejo Directivo']),
    personal,
    doc('acta-recalificacion', ['Acta de reunión', 'Firmada por el Presidente de la Unidad de Titulación, el tutor, los calificadores y el estudiante'], 'acta-recalificacion'),
    doc('similitud', ['Informe de similitud', 'Turnitin actualizado desde la cuenta del tutor, máximo 10 %'], 'similitud', false),
    { ...thesis, ...labelled(['Trabajo corregido', 'PDF con texto seleccionable (OCR)']) },
  ],
  outputs: [gradeReports, ...grades],
  instructions:
    'Procede con un promedio inferior a 7. El Presidente de la Unidad de Titulación convoca a la reunión de trabajo dentro de 5 días término; el estudiante presenta el trabajo corregido dentro de 8 días término después de la reunión, o se entiende que reprobó. Los calificadores recalifican dentro de 5 días término.',
  role: 'Estudiante, Unidad de Titulación y calificadores',
})
exceptional({
  id: 'recalificacion-complexivo',
  summary: 'Envía el Anexo 21 con el motivo de la recalificación.',
  title: 'Recalificación del examen complexivo',
  sourceIds: ['UT-06'],
  modalities: ['complexivo'],
  requirements: [
    request('solicitud-recalificacion', ['Anexo 21 · Solicitud de recalificación', 'Con su motivo, dirigida al Presidente de la Unidad de Titulación']),
  ],
  instructions: 'La solicitud expone el motivo de la recalificación y no lleva adjuntos.',
})
export const workflowDefinitions = definitions
