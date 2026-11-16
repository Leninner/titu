import type { WorkflowDefinition } from './types'
import type { ProcessNode } from './process-map'

export type PhaseId = 'trabajo' | 'calificadores' | 'biblioteca' | 'sustentacion'

export const phases: { id: PhaseId; title: string }[] = [
  { id: 'trabajo', title: 'Trabajo de titulación' },
  { id: 'calificadores', title: 'Calificadores' },
  { id: 'biblioteca', title: 'Biblioteca' },
  { id: 'sustentacion', title: 'Sustentación y título' },
]

const stagePhases: Record<string, PhaseId> = {
  calificadores: 'calificadores',
  biblioteca: 'biblioteca',
  aptitud: 'sustentacion',
  sustentacion: 'sustentacion',
  titulo: 'sustentacion',
}

export const phaseFor = (definition: WorkflowDefinition): PhaseId =>
  stagePhases[definition.stage] ?? 'trabajo'

export interface PhaseStep {
  node: ProcessNode
  followsPrevious: boolean
  needs: ProcessNode[]
}

export interface ProcessPhase {
  id: PhaseId
  number: number
  title: string
  steps: PhaseStep[]
  completed: number
  total: number
}

const counted = (node: ProcessNode) => !node.definition.informational

export function processPhases(nodes: ProcessNode[]): ProcessPhase[] {
  const byId = new Map(nodes.map((node) => [node.definition.id, node]))
  const present = phases.filter((phase) => nodes.some((node) => phaseFor(node.definition) === phase.id))
  return present.map((phase, index) => {
    const members = nodes
      .filter((node) => phaseFor(node.definition) === phase.id)
      .sort((a, b) => a.column - b.column || a.row - b.row)
    const steps = members.map((node, position) => ({
      node,
      followsPrevious: position > 0 && node.dependsOn.includes(members[position - 1].definition.id),
      needs: node.dependsOn
        .map((id) => byId.get(id)!)
        .filter((dependency) => phaseFor(dependency.definition) !== phase.id && dependency.status !== 'done'),
    }))
    return {
      ...phase,
      number: index + 1,
      steps,
      completed: members.filter((node) => counted(node) && node.status === 'done').length,
      total: members.filter(counted).length,
    }
  })
}
