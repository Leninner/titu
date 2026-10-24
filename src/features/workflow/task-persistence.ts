import type { TaskRecord, Workspace } from '../../domain/types'
import { catalog } from '../../catalog'
import { chainOutput } from '../../domain/output-chain'
import { withAutomaticCompletion } from '../../domain/auto-completion'
import { repository } from '../../storage/repository'

const withTask = (workspace: Workspace, task: TaskRecord): Workspace => ({
  ...workspace,
  tasks: [...workspace.tasks.filter((item) => item.id !== task.id), task],
})

export async function persistTask(requested: TaskRecord, previous: TaskRecord) {
  const loaded = await repository.loadWorkspace()
  const next = withAutomaticCompletion(requested, withTask(loaded, requested), catalog)
  let workspace = withTask(loaded, next)
  const changed = new Map<string, TaskRecord>([[next.id, next]])
  const received = next.outputVersionIds.filter((id) => !previous.outputVersionIds.includes(id))
  for (const versionId of received)
    for (const task of chainOutput(versionId, next.definitionId, workspace, catalog)) {
      changed.set(task.id, task)
      workspace = withTask(workspace, task)
    }
  await repository.saveTasks([...changed.values()])
  return next
}
