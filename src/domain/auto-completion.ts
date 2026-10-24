import type { CatalogVersion, TaskRecord, Workspace } from './types'
import { applicableWorkflows, evaluateTask } from './workflow'

function nextStatus(task: TaskRecord, ready: boolean): TaskRecord['status'] {
  if (ready) return 'completed'
  return ['completed', 'pending'].includes(task.status) ? 'preparing' : task.status
}

export function withAutomaticCompletion(
  task: TaskRecord,
  workspace: Workspace,
  catalog: CatalogVersion,
  at = new Date().toISOString(),
): TaskRecord {
  const definition = applicableWorkflows(workspace, catalog).find((item) => item.id === task.definitionId)
  if (!definition?.autoComplete) return task
  const status = nextStatus(task, evaluateTask(task, workspace, catalog).ready)
  if (status === task.status) return task
  return { ...task, status, history: [...task.history, { at, status, note: '' }] }
}
