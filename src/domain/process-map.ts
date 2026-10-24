import type { CalendarEvent, CatalogVersion, Requirement, WorkflowDefinition, Workspace } from './types'
import { applicableWorkflows, evaluateTask, requirementGap, taskInputs, taskOutputs } from './workflow'
import { calendarForWorkspace, effectiveEvent, eventReminder } from './dates'
import { taskFor } from './task-record'
import { evidenceIdsForTask } from './task-evidence'
import { taskSteps } from './task-steps'

export type ProcessFolder = 'trabajo' | 'calificadores' | 'sustentacion'
export type NodeStatus = 'done' | 'waiting' | 'active' | 'blocked'

export const processFolders: { id: ProcessFolder; title: string; number: number }[] = [
  { id: 'trabajo', title: 'Proceso trabajo de titulación', number: 2 },
  { id: 'calificadores', title: 'Designación calificadores', number: 3 },
  { id: 'sustentacion', title: 'Sustentación', number: 4 },
]

export function folderFor(definition: WorkflowDefinition): ProcessFolder {
  if (definition.stage === 'calificadores') return 'calificadores'
  if (['aptitud', 'biblioteca', 'sustentacion', 'titulo'].includes(definition.stage))
    return 'sustentacion'
  return 'trabajo'
}

// Calendar milestones that bound each workflow, from the institutional period calendar.
const keyDates: Record<string, string> = {
  'informe-final': 'calificadores-limite',
  'calificadores-research': 'calificadores-limite',
  'calificadores-article': 'calificadores-limite',
  complexivo: 'complexivo-examen',
  'no-adeudar': 'solicitud-no-adeudar',
  'aptitud-legal-research': 'aptitud-solicitud',
  'aptitud-legal-article': 'aptitud-solicitud',
  'aptitud-legal-complexivo': 'aptitud-solicitud',
  'dia-hora': 'dia-hora-limite',
  defensa: 'sustentaciones-limite',
}

// Once a request is sent, the milestone that matters is the institutional response.
const responseDates: Record<string, string> = {
  'calificadores-research': 'calificaciones-limite',
  'calificadores-article': 'calificaciones-limite',
}

export interface ProcessNode {
  definition: WorkflowDefinition
  folder: ProcessFolder
  column: number
  row: number
  status: NodeStatus
  next: boolean
  step: 'prepare' | 'result'
  dependsOn: string[]
  event?: CalendarEvent
  reminder?: ReturnType<typeof eventReminder>
  documents: { done: number; total: number }
  checks: { done: number; total: number }
  missing: string[]
}

export interface ProcessEdge {
  from: string
  to: string
}

export function processMap(workspace: Workspace, catalog: CatalogVersion, now = new Date()) {
  const applicable = applicableWorkflows(workspace, catalog)
  const definitions = applicable.filter((item) => !item.optional)
  const ids = new Set(definitions.map((item) => item.id))
  const deps = new Map(definitions.map((item) => [item.id, item.dependsOn.filter((id) => ids.has(id))]))
  const children = new Map(definitions.map((item) => [item.id, [] as string[]]))
  for (const [id, parents] of deps) for (const parent of parents) children.get(parent)!.push(id)

  // Earliest column follows the longest dependency chain; nodes with slack are then pushed
  // as late as possible so parallel branches end right before the step that needs them.
  const earliest = new Map<string, number>()
  const visit = (id: string): number => {
    if (!earliest.has(id))
      earliest.set(id, Math.max(-1, ...deps.get(id)!.map(visit)) + 1)
    return earliest.get(id)!
  }
  definitions.forEach((item) => visit(item.id))
  const last = Math.max(0, ...earliest.values())
  const latest = new Map<string, number>()
  const settle = (id: string): number => {
    if (!latest.has(id)) {
      const next = children.get(id)!
      latest.set(id, next.length ? Math.min(...next.map(settle)) - 1 : last)
    }
    return latest.get(id)!
  }
  definitions.forEach((item) => settle(item.id))

  const rows = new Map<string, number>()
  const taken = new Set<string>()
  const place = (id: string, row: number) => {
    rows.set(id, row)
    taken.add(`${latest.get(id)}:${row}`)
  }
  for (const item of definitions)
    if (earliest.get(item.id) === latest.get(item.id) && !taken.has(`${latest.get(item.id)}:0`))
      place(item.id, 0)
  const rest = definitions.filter((item) => !rows.has(item.id))
  const preferredRow = (id: string) => children.get(id)!
    .map((child) => rows.get(child))
    .find((row) => row !== undefined && row > 0 && !taken.has(`${latest.get(id)}:${row}`))
  for (const column of [...new Set(rest.map((item) => latest.get(item.id)!))].sort((a, b) => b - a)) {
    // Within a column, nodes that continue an already placed branch keep its row first.
    const items = rest
      .filter((item) => latest.get(item.id) === column)
      .sort((a, b) => Number(preferredRow(b.id) !== undefined) - Number(preferredRow(a.id) !== undefined))
    for (const item of items) {
      let row = preferredRow(item.id) ?? 1
      while (taken.has(`${column}:${row}`)) row++
      place(item.id, row)
    }
  }

  const events = new Map(calendarForWorkspace(workspace, catalog).map((event) => [event.id, event]))
  const completed = new Set(
    workspace.tasks.filter((task) => task.status === 'completed').map((task) => task.definitionId),
  )
  const toNode = (definition: WorkflowDefinition, column: number, row: number): ProcessNode => {
    const task = taskFor(definition.id, workspace)
    const evaluation = evaluateTask(task, workspace, catalog, now)
    const step = taskSteps(task, definition, workspace, catalog, now).initial === 'result'
      ? 'result'
      : 'prepare'
    const requirements = step === 'result'
      ? taskOutputs(definition, workspace).filter((requirement) => !requirement.optional)
      : taskInputs(definition, workspace)
    const selectedIds = step === 'result'
      ? task.outputVersionIds
      : evidenceIdsForTask(task, definition, workspace)
    const isDone = (requirement: Requirement) =>
      !requirementGap(requirement, task, selectedIds, workspace, now)
    const documents = requirements.filter((requirement) => requirement.category)
    const checks = requirements.filter((requirement) => !requirement.category)
    const blocked = (deps.get(definition.id) ?? []).some((id) => !completed.has(id))
    const waiting = ['submitted', 'waiting', 'observed'].includes(task.status)
    const status: NodeStatus = task.status === 'completed'
      ? 'done'
      : waiting
        ? 'waiting'
        : blocked ? 'blocked' : 'active'
    const dateId = (waiting && responseDates[definition.id]) || keyDates[definition.id]
    const raw = dateId ? events.get(dateId) : undefined
    const event = raw ? effectiveEvent(raw) : undefined
    return {
      definition,
      folder: folderFor(definition),
      column,
      row,
      status,
      next: false,
      step,
      dependsOn: deps.get(definition.id) ?? [],
      event,
      reminder: event ? eventReminder(event, now) : undefined,
      documents: { done: documents.filter(isDone).length, total: documents.length },
      checks: { done: checks.filter(isDone).length, total: checks.length },
      missing: step === 'result' ? evaluation.missingOutputs : evaluation.missingRequirements,
    }
  }
  const nodes = definitions.map((definition) =>
    toNode(definition, latest.get(definition.id)!, rows.get(definition.id)!))
  const next = [...nodes]
    .filter((node) => node.status === 'active')
    .sort((a, b) => a.column - b.column || a.row - b.row)[0]
  if (next) next.next = true
  const edges: ProcessEdge[] = nodes.flatMap((node) =>
    node.dependsOn.map((from) => ({ from, to: node.definition.id })),
  )
  const rowCount = Math.max(0, ...nodes.map((node) => node.row)) + 1
  // Exceptional workflows sit in a lane below the route; column 0 holds the report guide.
  const optional = applicable
    .filter((item) => item.optional)
    .map((definition, index) => toNode(definition, index + 1, rowCount))
  return {
    nodes,
    optional,
    edges,
    columns: last + 1,
    rows: rowCount,
    completed: nodes.filter((node) => node.status === 'done').length,
  }
}
