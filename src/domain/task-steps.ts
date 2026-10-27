import type { CatalogVersion, TaskRecord, WorkflowDefinition, Workspace } from './types'
import { ECUADOR_TIME_ZONE } from './dates'
import { evaluateTask, requirementGap, taskInputs } from './workflow'
import { evidenceIdsForTask } from './task-evidence'

export type StepId = 'prepare' | 'send' | 'result'

export interface TaskStep {
  id: StepId
  label: string
  done: boolean
  detail: string
}

const shortDate = (timestamp: string) =>
  new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'short', timeZone: ECUADOR_TIME_ZONE })
    .format(new Date(timestamp))
    .replace('.', '')

function prepareStep(
  task: TaskRecord,
  definition: WorkflowDefinition,
  workspace: Workspace,
  catalog: CatalogVersion,
  ready: boolean,
  now: Date,
): TaskStep {
  const selectedIds = evidenceIdsForTask(task, definition, workspace)
  const files = taskInputs(definition, workspace).filter(
    (requirement) => requirement.category && !requirement.optional,
  )
  const done = files.filter(
    (requirement) => !requirementGap(requirement, task, selectedIds, workspace, catalog, now),
  ).length
  return {
    id: 'prepare',
    label: 'Preparar',
    done: ready,
    detail: ready ? 'listo' : files.length ? `${done}/${files.length} docs` : 'pendiente',
  }
}

function sendStep(task: TaskRecord, workspace: Workspace): TaskStep {
  const latest = workspace.submissions
    .filter((submission) => submission.taskId === task.id)
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt))[0]
  return {
    id: 'send',
    label: 'Enviar',
    done: !!latest,
    detail: latest ? `enviado ${shortDate(latest.sentAt)}` : 'pendiente',
  }
}

function resultStep(task: TaskRecord): TaskStep {
  const completedAt = [...task.history].reverse().find((entry) => entry.status === 'completed')?.at
  const detail =
    task.status === 'completed'
      ? completedAt
        ? `completado ${shortDate(completedAt)}`
        : 'completado'
      : task.status === 'observed'
        ? 'observado'
        : 'pendiente'
  return { id: 'result', label: 'Resultado', done: task.status === 'completed', detail }
}

export function taskSteps(
  task: TaskRecord,
  definition: WorkflowDefinition,
  workspace: Workspace,
  catalog: CatalogVersion,
  now: Date = new Date(),
) {
  const result = resultStep(task)
  const ready = () => evaluateTask(task, workspace, catalog, now).ready
  if (definition.autoComplete) {
    const prepare = prepareStep(task, definition, workspace, catalog, ready(), now)
    return { steps: [prepare], initial: prepare.id }
  }
  const steps = taskInputs(definition, workspace).length
    ? [
        prepareStep(task, definition, workspace, catalog, ready(), now),
        ...(definition.inPerson ? [] : [sendStep(task, workspace)]),
        result,
      ]
    : [result]
  const initial = (steps.find((step) => !step.done) ?? result).id
  return { steps, initial }
}
