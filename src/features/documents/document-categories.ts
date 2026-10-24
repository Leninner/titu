import type { Workspace, CatalogVersion } from '../../domain/types'
import { applicableWorkflows, taskInputs, taskOutputs } from '../../domain/workflow'

const names: Record<string, string> = {
  personal: 'Identificación',
  solicitud: 'Solicitud de modalidad · Anexo 1',
  'solicitud-calificadores': 'Solicitud de calificadores · Anexo 10',
  'solicitud-aptitud': 'Solicitud de aptitud legal · Anexo 15',
  'solicitud-sustentacion': 'Solicitud de sustentación · Anexo 14',
  resolucion: 'Resolución de modalidad y tema',
  'resolucion-designacion': 'Designación de calificadores',
  'resolucion-tramite': 'Resoluciones de trámites excepcionales',
  compromiso: 'Carta de compromiso · Anexo 3',
  avales: 'Avales de la propuesta',
  'oficio-investigacion': 'Oficio de investigación',
  'propuesta-perfil': 'Propuesta del perfil · Anexo 2',
  mensual: 'Informes mensuales · Anexo 5',
  final: 'Informe final',
  'aval-informes': 'Aval del tutor',
  matricula: 'Matrícula',
  tesis: 'Trabajo de titulación',
  empresa: 'Cumplimiento empresarial',
  similitud: 'Informe de similitud',
  publicacion: 'Aceptación o publicación',
  notas: 'Calificaciones',
  asistencia: 'Asistencia',
  'resolucion-examen': 'Resolución de examen',
  'no-adeudar': 'No adeudar',
  record: 'Récord académico',
  habilitantes: 'Documentos habilitantes',
  'aptitud-legal': 'Aptitud legal',
  preliminares: 'Preliminares',
  articulo: 'Artículo académico',
  'aval-inicial': 'Aval inicial de Biblioteca',
  biblioteca: 'Aval final de Biblioteca',
  bachiller: 'Título de bachiller',
  'notificacion-defensa': 'Notificación de sustentación',
  resultado: 'Acta de sustentación',
  respuesta: 'Respuestas recibidas',
}

export function documentCategories(workspace: Workspace, catalog: CatalogVersion) {
  const categories = new Map<
    string,
    { id: string; name: string; description: string; signed: boolean; group: string }
  >()
  for (const workflow of applicableWorkflows(workspace, catalog).filter((item) => !item.optional)) {
    for (const requirement of [...taskInputs(workflow, workspace), ...taskOutputs(workflow, workspace)]) {
      if (!requirement.category) continue
      const id = requirement.category
      const group = ['personal', 'solicitud', 'solicitud-calificadores', 'solicitud-aptitud', 'solicitud-sustentacion', 'resolucion', 'compromiso', 'matricula', 'avales', 'oficio-investigacion', 'propuesta-perfil'].includes(id)
        ? 'Tu expediente'
        : [
              'mensual',
              'final',
              'aval-informes',
              'tesis',
              'empresa',
              'similitud',
              'publicacion',
              'articulo',
              'preliminares',
            ].includes(id)
          ? 'Tu trabajo'
          : 'El cierre'
      if (!categories.has(id))
        categories.set(id, {
          id,
          name: names[id] ?? requirement.label,
          description: requirement.label,
          signed: !!requirement.signed,
          group,
        })
      else if (requirement.signed)
        categories.get(id)!.signed = true
    }
  }
  for (const document of workspace.documents) {
    if (!categories.has(document.category))
      categories.set(document.category, {
        id: document.category,
        name: names[document.category] ?? 'Otros documentos',
        description: 'Archivos conservados de tu expediente',
        signed: false,
        group: 'Otros',
      })
  }
  if (!categories.has('other'))
    categories.set('other', {
      id: 'other',
      name: 'Otros documentos',
      description: 'Acuses, correos y evidencia adicional',
      signed: false,
      group: 'Otros',
    })
  return [...categories.values()]
}
export type DocumentCategory = ReturnType<typeof documentCategories>[number]

const fold = (text: string) =>
  text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase()

export function matchesCategory(category: DocumentCategory, query: string, workspace: Workspace) {
  const words = fold(query).split(/\s+/).filter(Boolean)
  if (!words.length) return true
  const documents = workspace.documents.filter((document) => document.category === category.id)
  const files = workspace.versions.filter((version) =>
    documents.some((document) => document.id === version.documentId),
  )
  const haystack = fold(
    [
      category.name,
      category.description,
      category.group,
      ...documents.map((document) => document.name),
      ...files.map((version) => version.originalName),
    ].join(' '),
  )
  return words.every((word) => haystack.includes(word))
}
