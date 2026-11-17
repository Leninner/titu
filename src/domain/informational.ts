import type { CatalogVersion, InformationalStage, WorkflowDefinition, Workspace } from './types'
import { calendarForWorkspace, ecuadorDate, effectiveEvent } from './dates'
import {
  applicableDependencies,
  evaluateTask,
  informationalSources,
  outputRecorded,
  workflowCompleted,
} from './workflow'
import { taskFor } from './task-record'

export type InformationalStatus = 'done' | 'waiting' | 'blocked'

const statusLabels: Record<Exclude<InformationalStatus, 'waiting'>, string> = {
  done: 'Completado',
  blocked: 'Aún no empieza',
}

function dependencyStarted(
  id: string,
  workspace: Workspace,
  catalog: CatalogVersion,
  now: Date,
) {
  const dependency = catalog.workflowDefinitions.find((item) => item.id === id)
  if (dependency?.informational) return workflowCompleted(id, workspace, catalog)
  return evaluateTask(taskFor(id, workspace), workspace, catalog, now).ready
}

function reachedByOutputs(
  stage: InformationalStage,
  definition: WorkflowDefinition,
  workspace: Workspace,
  catalog: CatalogVersion,
) {
  return !!stage.reachedWith && informationalSources(definition, workspace, catalog)
    .some((source) => outputRecorded(source, stage.reachedWith!, workspace, catalog))
}

function eventPassed(eventId: string, workspace: Workspace, catalog: CatalogVersion, now: Date) {
  const event = calendarForWorkspace(workspace, catalog).find((item) => item.id === eventId)
  return !!event && effectiveEvent(event).startDate < ecuadorDate(now)
}

const reachedByDate = (stage: InformationalStage, workspace: Workspace, catalog: CatalogVersion, now: Date) =>
  !!stage.reachedAfter && eventPassed(stage.reachedAfter, workspace, catalog, now)

export function informationalStatus(
  definition: WorkflowDefinition,
  workspace: Workspace,
  catalog: CatalogVersion,
  now: Date = new Date(),
): InformationalStatus {
  if (workflowCompleted(definition.id, workspace, catalog)) return 'done'
  const started = applicableDependencies(definition, workspace, catalog).some((id) =>
    dependencyStarted(id, workspace, catalog, now))
  const advanced = (definition.informational?.stages ?? []).some((stage) =>
    reachedByOutputs(stage, definition, workspace, catalog))
  return started || advanced ? 'waiting' : 'blocked'
}

function stageReached(
  stage: InformationalStage,
  definition: WorkflowDefinition,
  workspace: Workspace,
  catalog: CatalogVersion,
  now: Date,
) {
  return reachedByOutputs(stage, definition, workspace, catalog) || reachedByDate(stage, workspace, catalog, now)
}

export function informationalStage(
  definition: WorkflowDefinition,
  workspace: Workspace,
  catalog: CatalogVersion,
  now: Date = new Date(),
): InformationalStage | undefined {
  const stages = definition.informational?.stages ?? []
  const status = informationalStatus(definition, workspace, catalog, now)
  if (status === 'blocked') return stages[0]
  if (status === 'done') return stages.at(-1)
  return [...stages].reverse().find((stage, index) =>
    index === stages.length - 1 || stageReached(stage, definition, workspace, catalog, now))
}

export function informationalLabel(
  definition: WorkflowDefinition,
  workspace: Workspace,
  catalog: CatalogVersion,
  now: Date = new Date(),
) {
  const status = informationalStatus(definition, workspace, catalog, now)
  if (status !== 'waiting') return statusLabels[status]
  return informationalStage(definition, workspace, catalog, now)?.label ?? 'En revisión'
}
