import type { Workspace } from './types'

// Names used for uploaded files, so every package reads the same regardless of how the
// student named the original. Numbering is added only when the submission ZIP is built.
const systemNames: Record<string, string> = {
  personal: 'Copia de Cédula',
  solicitud: 'Solicitud firmada',
  resolucion: 'Resolución de Consejo Directivo',
  'resolucion-designacion': 'Notificación de calificadores designados',
  'resolucion-tramite': 'Resolución del trámite',
  compromiso: 'Carta de compromiso empresarial',
  mensual: 'Informe mensual Anexo 5',
  final: 'Informe final del tutor',
  'aval-informes': 'Aval del tutor',
  matricula: 'Matrícula',
  tesis: 'Trabajo de titulación',
  empresa: 'Cumplimiento empresarial',
  similitud: 'Informe de similitud',
  publicacion: 'Aceptación o publicación',
  articulo: 'Artículo académico',
  preliminares: 'Preliminares',
  notas: 'Calificaciones',
  asistencia: 'Informe de asistencia',
  'resolucion-examen': 'Resolución de examen',
  'no-adeudar': 'Certificado de no adeudar',
  record: 'Récord académico',
  'record-academico': 'Récord académico',
  habilitantes: 'Requisitos habilitantes',
  'aptitud-legal': 'Certificado de aptitud legal',
  'aval-inicial': 'Aval inicial de Biblioteca',
  biblioteca: 'Aval final de Biblioteca',
  'aval-biblioteca': 'Aval final de Biblioteca',
  bachiller: 'Registro del título de bachiller',
  'notificacion-defensa': 'Notificación de fecha de sustentación',
  resultado: 'Acta de sustentación',
  respuesta: 'Respuesta recibida',
}

// Categories whose requirement asks for several distinct files.
export const multiFileCategories = new Set([
  'mensual',
  'resolucion',
  'resolucion-examen',
  'notas',
  'habilitantes',
  'resolucion-tramite',
  'respuesta',
  'other',
])

function extension(name: string) {
  return name.match(/\.[a-z0-9]+$/i)?.[0].toLowerCase() ?? ''
}

export function systemFileName(
  workspace: Pick<Workspace, 'documents' | 'versions'>,
  category: string,
  uploadedName: string,
  documentId?: string,
) {
  const base = systemNames[category]
  if (!base) return uploadedName
  const ext = extension(uploadedName)
  if (documentId) {
    // A new version keeps the name its document already has, with the new file's extension.
    const current = workspace.versions
      .filter((version) => version.documentId === documentId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
    if (current) return `${current.originalName.replace(/\.[a-z0-9]+$/i, '')}${ext}`
  }
  const used = new Set(
    workspace.documents
      .filter((document) => document.category === category)
      .map((document) => document.name.replace(/\.[a-z0-9]+$/i, '')),
  )
  let name = base
  for (let index = 2; used.has(name); index++) name = `${base} ${index}`
  return `${name}${ext}`
}
