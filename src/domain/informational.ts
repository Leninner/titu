import type { CatalogVersion, WorkflowDefinition, Workspace } from './types'
import { applicableDependencies, evaluateTask, workflowCompleted } from './workflow'
import { taskFor } from './task-record'

export type InformationalStatus = 'done' | 'waiting' | 'blocked'

export function informationalStatus(
  definition: WorkflowDefinition,
  workspace: Workspace,
  catalog: CatalogVersion,
  now: Date = new Date(),
): InformationalStatus {
  if (workflowCompleted(definition.id, workspace, catalog)) return 'done'
  const started = applicableDependencies(definition, workspace, catalog).some(
    (dependency) => evaluateTask(taskFor(dependency, workspace), workspace, catalog, now).ready,
  )
  return started ? 'waiting' : 'blocked'
}
