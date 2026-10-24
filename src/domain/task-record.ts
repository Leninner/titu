import type { TaskRecord, Workspace } from './types'

export const emptyTask = (definitionId: string): TaskRecord => ({
  id: definitionId,
  definitionId,
  status: 'pending',
  requirementChecks: {},
  evidenceVersionIds: [],
  outputVersionIds: [],
  note: '',
  history: [],
})

export function taskFor(definitionId: string, workspace: Pick<Workspace, 'tasks'>): TaskRecord {
  return workspace.tasks.find((task) => task.definitionId === definitionId) ?? emptyTask(definitionId)
}
