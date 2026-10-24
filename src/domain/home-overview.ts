import type { CatalogVersion, WorkflowDefinition, Workspace } from './types'
import { applicableWorkflows } from './workflow'
import { processMap, type ProcessNode } from './process-map'

const graders = ['calificadores-research', 'calificadores-article']
const legalAptitude = ['aptitud-legal-research', 'aptitud-legal-article', 'aptitud-legal-complexivo']

const eventWorkflows: Record<string, string[]> = {
  'calificadores-limite': graders,
  'consejo-calificadores': graders,
  'proceso-calificadores': graders,
  'notificacion-calificadores': graders,
  'calificaciones-limite': graders,
  'solicitud-no-adeudar': ['no-adeudar'],
  'emision-no-adeudar': ['no-adeudar'],
  'aptitud-solicitud': legalAptitude,
  'aptitud-elaboracion': legalAptitude,
  'dia-hora-limite': ['dia-hora'],
  'consejo-sustentacion': ['dia-hora'],
  'notificacion-sustentacion': ['dia-hora'],
  'sustentaciones-limite': ['defensa'],
  'complexivo-examen': ['complexivo'],
  'complexivo-segunda': ['complexivo'],
}

export function workflowForEvent(
  eventId: string,
  workspace: Workspace,
  catalog: CatalogVersion,
): WorkflowDefinition | undefined {
  const candidates = eventWorkflows[eventId] ?? []
  return applicableWorkflows(workspace, catalog).find((definition) => candidates.includes(definition.id))
}

const inProgress = (node: ProcessNode) => node.status === 'active' || node.status === 'waiting'

export function homeOverview(workspace: Workspace, catalog: CatalogVersion, now = new Date()) {
  const map = processMap(workspace, catalog, now)
  const focus = map.nodes.find((node) => node.next) ?? map.nodes.find((node) => node.status === 'waiting')
  return {
    focus,
    current: map.nodes.filter((node) => inProgress(node) && node !== focus),
    completed: map.completed,
    total: map.nodes.length,
    nodes: map.nodes,
  }
}

export const pendingLabel = (count: number) =>
  count === 1 ? 'Falta 1 requisito' : `Faltan ${count} requisitos`
