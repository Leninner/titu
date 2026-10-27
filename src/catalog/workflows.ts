import type { GuideIcon, Modality, Requirement, WorkflowDefinition } from '../domain/types'

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
    ['Empresa al 100 %', 'Informe de cumplimiento empresarial al 100 %, firmado por el representante de la empresa'],
    'empresa',
  ),
  companyOnly: true,
  template: 'cumplimiento-empresarial',
}
const noDebt = doc('no-adeudar', ['Formulario de no adeudar', 'Vigente: vale 30 días desde su emisión'], 'no-adeudar')
const legalCertificate = doc(
  'aptitud-legal',
  ['Certificado de aptitud legal', 'Emitido por Secretaría; es distinto de la solicitud Anexo 15'],
  'aptitud-legal',
)
const enablingCertificate: Requirement = {
  ...doc('habilitantes', ['Requisitos habilitantes', 'Certificado actualizado, emitido por Coordinación de Carrera'], 'habilitantes'),
  template: 'solicitud-habilitantes',
  requestEmail: {
    to: 'informacion.fisei@uta.edu.ec',
    subject: 'Solicitud de certificado de requisitos habilitantes',
    paragraphs: [
      'Estimados señores:',
      'Reciban un cordial saludo.',
      'Solicito de la manera más comedida su apoyo con la emisión del certificado de requisitos habilitantes.',
      'Adjunto la copia de mi cédula de ciudadanía.',
      'Quedo atento a su confirmación.',
    ],
    attachments: [{ label: 'Copia de cédula', category: 'personal' }],
  },
}
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
const step = (icon: GuideIcon, actor: string, text: string) => ({ icon, actor, text })
const sendRules = [
  'Solo desde el correo institucional, con los documentos en PDF con OCR, sin unificar, numerados en el orden establecido y en una carpeta comprimida.',
  'Firmas electrónicas o autógrafas, nunca mixtas ni una imagen pegada.',
  'Si falta un requisito, el trámite se devuelve.',
]
const definitions: WorkflowDefinition[] = []
function add(
  definition: Omit<WorkflowDefinition, 'outputs' | 'role'> &
    Partial<Pick<WorkflowDefinition, 'outputs' | 'role'>>,
) {
  definitions.push({
    role: 'Estudiante',
    ...definition,
    outputs: [...(definition.outputs ?? []), ...(definition.inPerson ? [] : [responseCaptures])],
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
        ['Anexo 3 · Compromiso', 'Firmada por el representante de la institución contraparte, con el alcance del trabajo'],
        'compromiso',
      ),
      companyOnly: true,
      modalities: work,
      template: 'anexo-3',
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
      ...enablingCertificate,
      ...labelled(['Requisitos habilitantes', 'Certificado actualizado; solo si la solicitud se presenta después de la verificación del récord académico']),
      optional: true,
    },
  ],
  outputs: [doc('resolucion', ['Resolución de modalidad y tema', 'Resolución de Consejo Directivo que aprueba la modalidad, la opción, el tutor y el tema'], 'resolucion')],
  guide: {
    steps: [
      step('prepare', 'Estudiante', 'Desarrolla la propuesta del perfil (Anexo 2) en Diseño de Proyectos con tu tutor sugerido.'),
      step('send', 'Estudiante', 'Envíala por correo al Coordinador de Carrera y al docente de la Unidad de Titulación, con copia al tutor, para pedir su aval.'),
      step('review', 'Coordinación y Unidad de Titulación', 'Revisan la propuesta; si hay observaciones, las corriges y la reenvías hasta recibir el aval por correo.'),
      step('sign', 'Estudiante y tutor sugerido', 'Con el aval, firman el Anexo 1 dirigido al Presidente de la Unidad de Titulación.'),
      step('send', 'Estudiante', 'Envía la solicitud con sus adjuntos a informacion.fisei@uta.edu.ec, hasta el fin de los exámenes de recuperación del penúltimo nivel.'),
      step('review', 'Unidad de Titulación', 'Verifica tu récord académico y emite un acuerdo de validación.'),
      step('council', 'Consejo Directivo', 'Aprueba en un máximo de 8 días término; la resolución indica modalidad, opción, tutor y tema.'),
    ],
    notes: [
      'Solo desde el correo institucional, con los documentos sin unificar, numerados en el orden del anexo y en una carpeta comprimida.',
      'Firmas electrónicas o autógrafas, nunca mixtas ni una imagen pegada.',
      'El examen complexivo no lleva firmas de aval ni Anexo 2.',
    ],
  },
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
  guide: {
    steps: [
      step('prepare', 'Tutor', 'Cada mes, el tutor llena el Anexo 5 con las actividades realizadas.'),
      step('sign', 'Tutor', 'Lo firma y lo envía por Quipux a la secretaría de la Unidad de Titulación, con copia al docente responsable.'),
      step('deliver', 'Estudiante', 'Recibes cada informe por correo y lo subes en su mes.'),
    ],
    notes: [
      'Los plazos se cuentan desde la aprobación de la propuesta por el Consejo Directivo.',
      'Todos los informes llevan el tema aprobado; no puede haber documentos con temas distintos.',
    ],
  },
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
  guide: {
    steps: [
      step('prepare', 'Estudiante', 'Prepara el Anexo 11 con las fechas y actividades de todos los Anexo 5 y el 100 % de avance.'),
      step('send', 'Estudiante', 'Envíaselo a tu tutor para que lo revise.'),
      step('sign', 'Tutor', 'Lo firma y lo envía por Quipux a la secretaría de la Unidad de Titulación, con copia al docente responsable.'),
      step('deliver', 'Estudiante', 'Recibes el Anexo 11 firmado y lo subes en Resultado.'),
    ],
    notes: [
      'Las fechas y actividades deben coincidir con las de los informes mensuales.',
    ],
  },
  role: 'Tutor',
})
const reviewEndorsement: Requirement = {
  ...doc(
    'aval-informes',
    ['Aval de informes', 'Aval de revisión de los informes mensuales e informe final, emitido por la secretaría de la Unidad de Titulación (titulacion_fisei@uta.edu.ec)'],
    'aval-informes',
  ),
  requestEmail: {
    to: 'titulacion_fisei@uta.edu.ec',
    subject: 'Aval de revisión de informes {{nombres}}',
    paragraphs: [
      'Solicito de la manera más comedida se emita el aval de revisión de los informes mensuales e informe final del trabajo de titulación desarrollado bajo la tutoría del {{tutor}}.',
    ],
    closing: 'Saludos',
  },
}
const enrollment = doc(
  'matricula',
  ['Folio y matrícula', 'Certificado de folio y matrícula del período actual, obtenido del sistema. Si tus datos no están en el sistema, se pide al Coordinador de Carrera'],
  'matricula',
)
const graderOutputs = [designation, gradeReports, ...grades]
add({
  id: 'calificadores-research',
  summary: 'Envía el Anexo 10 con tu trabajo terminado y espera a los calificadores y sus notas.',
  title: 'Designación de calificadores del Proyecto',
  stage: 'calificadores',
  modalities: ['research'],
  sourceIds: ['UT-16', 'UT-17', 'UT-21'],
  dependsOn: ['informe-final'],
  requirements: [
    {
      ...request('solicitud-calificadores', ['Anexo 10 · Solicitud', 'Solicitud de designación de calificadores del Proyecto, dirigida al Presidente del Consejo Directivo']),
      template: 'anexo-10-research',
    },
    { ...personal, ...labelled(['Cédula y papeleta de votación', 'Actualizadas, legibles y en tamaño real']) },
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
  guide: {
    steps: [
      step('prepare', 'Estudiante', 'Reúne los documentos en PDF con OCR y llena el Anexo 10 dirigido al Presidente del Consejo Directivo.'),
      step('send', 'Tutor', 'Envía el informe de similitud (máximo 10 %) al Consejo Directivo por Quipux y a tu correo.'),
      step('send', 'Estudiante', 'Envía la solicitud a informacion.fisei@uta.edu.ec dentro de las fechas del calendario académico.'),
      step('council', 'Consejo Directivo', 'Designa el par calificador y sus suplentes, al menos uno con pertinencia en el tema, y te notifica.'),
      step('grade', 'Calificadores', 'Cada uno consigna su nota en el Anexo 12 dentro de 8 días término.'),
    ],
    notes: [
      ...sendRules,
      'Los trámites se atienden en orden de llegada (Art. 142 del Código Orgánico Administrativo).',
      'Con un promedio menor a 7, la Unidad de Titulación convoca en 5 días término a calificadores, tutor y estudiante; entregas el trabajo corregido en 8 días término y se califica en 5. Si no lo entregas, repruebas la titulación.',
      'Consultas: secretaría de la Unidad de Titulación, titulacion_fisei@uta.edu.ec.',
    ],
  },
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
    {
      ...request('solicitud-calificadores', ['Anexo 10 · Solicitud', 'Solicitud de designación de calificadores del Artículo, dirigida al Presidente del Consejo Directivo']),
      template: 'anexo-10-article',
    },
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
  guide: {
    steps: [
      step('prepare', 'Estudiante', 'Reúne los documentos en PDF con OCR y llena el Anexo 10 dirigido al Presidente del Consejo Directivo.'),
      step('send', 'Estudiante', 'Envía la solicitud a informacion.fisei@uta.edu.ec.'),
      step('council', 'Consejo Directivo', 'Designa a dos calificadores y te notifica.'),
      step('grade', 'Calificadores', 'Cada uno consigna su nota en el Anexo 12.'),
    ],
    notes: [
      ...sendRules,
      'El tema va en español y en inglés solo si cambió para la publicación en la revista.',
      'La nota mínima es 7, porque el artículo ya cuenta con la carta de aceptación.',
    ],
  },
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
  guide: {
    steps: [
      step('calendar', 'Estudiante', 'Asiste a la preparación; necesitas al menos 70 % de asistencia.'),
      step('grade', 'Estudiante', 'Rinde el examen complexivo.'),
      step('council', 'Consejo Directivo', 'Emite una resolución por cada examen, incluidas la segunda oportunidad y la recalificación.'),
      step('download', 'Estudiante', 'Obtén las resoluciones en Información o en redi.uta.edu.ec.'),
    ],
    notes: [],
  },
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
  guide: {
    steps: [
      step('send', 'Estudiante', 'Solicítalo en servicios.uta.edu.ec, Sistema Integrado.'),
      step('review', 'Secretaría de Facultad', 'Genera la orden de pago y cada dependencia valida la solicitud.'),
      step('download', 'Estudiante', 'Descarga el formulario cuando su estado sea Finalizado.'),
    ],
    notes: [
      'Vale treinta días desde su emisión; después caduca.',
    ],
  },
  role: 'Estudiante, Secretaría de Facultad y dependencias',
})
for (const modality of all) {
  const modalityRequirements =
    modality === 'complexivo'
      ? [attendance, attendanceReport, { ...examResolutions, label: 'Resoluciones del examen' }]
      : [final, { ...gradeReports, ...labelled(['Calificaciones', 'Las dos notas de los calificadores, con promedio de 7 o más; se piden en la Unidad de Titulación (titulacion_fisei@uta.edu.ec)']) }]
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
      {
        ...request('solicitud-aptitud', ['Anexo 15 · Solicitud', 'Solicitud del certificado de aptitud legal, dirigida al Decano, en PDF con OCR e indicando la modalidad']),
        template: 'anexo-15',
      },
      { ...personal, ...labelled(['Cédula y papeleta de votación', 'Actualizadas, a color, en un solo archivo legible y en tamaño real']) },
      doc('record', ['Récord académico', 'Actualizado y obtenido del sistema, con la matrícula en titulación del período actual con la leyenda «En proceso». Si tus datos no están en el sistema, se pide al Coordinador de Carrera por informacion.fisei@uta.edu.ec'], 'record'),
      {
        ...enablingCertificate,
        ...labelled(['Requisitos habilitantes', 'Certificado actualizado de Coordinación de Carrera con la matrícula en noveno «En proceso», las asignaturas aprobadas y por aprobar, las fechas de inicio y fin de estudios, y la aprobación de segunda lengua, cultura física, prácticas laborales, servicio comunitario y modalidad y propuesta de titulación']),
      },
      noDebt,
      ...modalityRequirements,
    ],
    outputs: [legalCertificate],
    guide: {
      steps: [
        step('prepare', 'Estudiante', 'Llena el Anexo 15 dirigido al Decano y reúne sus anexos en PDF con OCR.'),
        step('send', 'Estudiante', 'Envía la solicitud a informacion.fisei@uta.edu.ec.'),
        step('review', 'Secretaría', 'Revisa los documentos y emite el certificado de aptitud legal.'),
      ],
      notes: [
        ...sendRules,
        'El certificado es distinto de la solicitud; sus anexos se presentan igual al pedir la fecha de sustentación.',
        'El formulario de no adeudar debe seguir vigente hasta que pidas día y hora.',
        'Si falta un requisito, el trámite no avanza y se te notifica para completarlo.',
      ],
    },
    role: 'Estudiante y Secretaría',
  })
}
add({
  id: 'biblioteca-revision',
  summary: 'Lleva tu trabajo sin firmas a Biblioteca el 10 de noviembre y obtén el aval inicial.',
  title: 'Biblioteca: revisión del trabajo sin firmas',
  stage: 'biblioteca',
  modalities: work,
  sourceIds: ['UT-22', 'UT-23', 'BIB-01'],
  dependsOn: [],
  inPerson: true,
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
  guide: {
    steps: [
      step('deliver', 'Estudiante', 'Acércate en persona a Biblioteca FISEI el 10 de noviembre, de 8:30 a 12:30 o de 14:30 a 16:30, con el trabajo sin firmas.'),
      step('library', 'Biblioteca (Monica Paredes)', 'Revisa el formato y emite el aval inicial para recoger las firmas.'),
    ],
    notes: [
      'Ten listos el índice, el formato, el resumen ejecutivo, el abstract y las palabras clave.',
      'La revisión es solo ese día y en esos horarios; no se envía por correo.',
      'Si no pasas la revisión, no se emite el aval.',
      'El Proyecto usa la plantilla del Anexo A y la estructura del Anexo 13A.',
    ],
  },
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
  guide: {
    steps: [
      step('sign', 'Estudiante', 'Firma la página de autoría y, en el Proyecto, la de derechos de autor.'),
    ],
    notes: [
      'Cada firma se recibe una por una antes de seguir con la siguiente.',
      'Cada firma electrónica debe poder verificarse.',
    ],
  },
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
  guide: {
    steps: [
      step('sign', 'Tutor', 'Firma la página de aprobación del tutor.'),
      step('sign', 'Calificadores', 'Los dos firman la página de aprobación del tribunal.'),
    ],
    notes: [
      'Siempre sobre la última versión firmada y una firma a la vez.',
      'Cada firma electrónica debe poder verificarse.',
    ],
  },
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
  guide: {
    steps: [
      step('send', 'Estudiante', 'Envía la versión con las firmas docentes a decanato.fisei@uta.edu.ec.'),
      step('sign', 'Decano', 'Firma como presidente del tribunal.'),
      step('library', 'Biblioteca', 'Valida todas las firmas y emite el aval final.'),
    ],
    notes: [
      'La portada lleva el mes en que se presentan los papeles para la defensa.',
    ],
  },
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
    ...all.map((modality) => ({
      ...request('solicitud-sustentacion', ['Anexo 14 · Solicitud', 'Solicitud de lugar, fecha y hora, dirigida al Presidente del Consejo Directivo, con la dirección del estudiante']),
      modalities: [modality],
      template: `anexo-14-${modality}`,
    })),
    { ...legalCertificate, ...labelled(['Certificado de aptitud legal', 'Con los mismos anexos presentados para obtenerlo']) },
    { ...noDebt, ...labelled(['Formulario de no adeudar', 'Vigente a la fecha de ingreso de la solicitud']) },
    doc('bachiller', ['Título de bachiller', 'Certificado de registro descargado del sitio del Ministerio de Educación, no el acta de grado del colegio'], 'bachiller'),
    { ...resolution, ...labelled(['Resoluciones de modalidad y tema', 'Resoluciones de Consejo Directivo de modalidad, tema y sus cambios; en complexivo, la de aprobación o cambio de modalidad']) },
    { ...designation, label: 'Notificación de calificadores designados', modalities: work },
    {
      ...business,
      ...labelled(['Empresa al 100 %', 'Carta de la empresa de haber concluido el trabajo al 100 %, con el tema aprobado o su modificación']),
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
  guide: {
    steps: [
      step('prepare', 'Estudiante', 'Llena el Anexo 14 dirigido al Presidente del Consejo Directivo y reúne los documentos en PDF con OCR.'),
      step('send', 'Estudiante', 'Envía la solicitud a informacion.fisei@uta.edu.ec.'),
      step('council', 'Consejo Directivo', 'Fija el lugar, la fecha y la hora y te notifica.'),
    ],
    notes: [
      ...sendRules,
      'Cada PDF se nombra con apellidos, nombres y número de cédula.',
      'Los anexos de aptitud legal son los mismos presentados para obtenerla.',
      'El examen complexivo solicita incorporación y solo presenta la resolución de aprobación o cambio de modalidad.',
    ],
  },
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
  guide: {
    steps: [
      step('calendar', 'Estudiante', 'Preséntate en la fecha y hora de tu notificación.'),
      step('grade', 'Tribunal', 'Cada miembro califica la sustentación (7), los recursos (1,5) y la expresión oral (1,5) en el Anexo 16.'),
      step('deliver', 'Estudiante', 'Recibes el acta de sustentación.'),
    ],
    notes: [
      'La fecha límite del calendario no es una cita individual.',
    ],
  },
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
  guide: {
    steps: [
      step('send', 'Secretaría', 'Te convoca por correo institucional con el lugar y la fecha.'),
      step('deliver', 'Estudiante', 'Retiras tu título.'),
    ],
    notes: [
      'El plazo aproximado de un mes y medio es orientativo, no oficial.',
    ],
  },
})
const exceptional = (
  definition: Pick<WorkflowDefinition, 'id' | 'title' | 'sourceIds' | 'modalities' | 'requirements' | 'summary' | 'guide'> &
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
    enablingCertificate,
  ],
  guide: {
    steps: [
      step('prepare', 'Estudiante', 'Llena el Anexo 4; si cambias a trabajo de titulación, indica la modalidad, el tema preliminar y el tutor sugerido, que también firma.'),
      step('send', 'Estudiante', 'Envíalo con sus adjuntos a informacion.fisei@uta.edu.ec.'),
      step('council', 'Consejo Directivo', 'Resuelve el cambio.'),
    ],
    notes: [
      'Se presenta una sola vez, al finalizar el período, o como excepción hasta 20 días término después del inicio de clases.',
    ],
  },
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
  guide: {
    steps: [
      step('prepare', 'Estudiante', 'Llena el Anexo 8 cuando tu tutor no atienda tres tutorías.'),
      step('send', 'Estudiante', 'Envíalo a informacion.fisei@uta.edu.ec.'),
    ],
    notes: [
      'Tres notificaciones justifican pedir el cambio de tutor.',
      'Las notificaciones por inasistencia del estudiante (Anexos 6 y 7) las presenta el tutor.',
    ],
  },
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
  guide: {
    steps: [
      step('prepare', 'Estudiante', 'Llena el Anexo 9 con la causa del cambio.'),
      step('send', 'Estudiante', 'Envíalo a informacion.fisei@uta.edu.ec.'),
      step('council', 'Consejo Directivo', 'Designa al nuevo tutor en un máximo de 10 días término.'),
    ],
    notes: [
      'Procede tras tres notificaciones de inasistencia del tutor o por una causa justificada.',
    ],
  },
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
  guide: {
    steps: [
      step('calendar', 'Unidad de Titulación', 'Su Presidente convoca a la reunión de trabajo dentro de 5 días término.'),
      step('send', 'Estudiante', 'Presenta el trabajo corregido dentro de 8 días término después de la reunión.'),
      step('grade', 'Calificadores', 'Recalifican dentro de 5 días término.'),
    ],
    notes: [
      'Procede con un promedio inferior a 7.',
      'Si no presentas a tiempo, se entiende que reprobaste.',
    ],
  },
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
  guide: {
    steps: [
      step('prepare', 'Estudiante', 'Llena el Anexo 21 con el motivo de la recalificación.'),
      step('send', 'Estudiante', 'Envíalo al Presidente de la Unidad de Titulación.'),
    ],
    notes: [
      'No lleva adjuntos.',
    ],
  },
})
export const workflowDefinitions = definitions
