import type { TaskRecord, Workspace } from '../../domain/types'
import { catalog } from '../../catalog'
import { chainOutput } from '../../domain/output-chain'
import { repository } from '../../storage/repository'

const withTask = (workspace: Workspace, task: TaskRecord): Workspace => ({
  ...workspace,
  tasks: [...workspace.tasks.filter((item) => item.id !== task.id), task],
})

// Saves a task and offers each newly received output to the later workflows that ask for it.
export async function persistTask(next: TaskRecord, previous: TaskRecord) {
  let workspace = withTask(await repository.loadWorkspace(), next)
  const changed = new Map<string, TaskRecord>([[next.id, next]])
  const received = next.outputVersionIds.filter((id) => !previous.outputVersionIds.includes(id))
  for (const versionId of received)
    for (const task of chainOutput(versionId, next.definitionId, workspace, catalog)) {
      changed.set(task.id, task)
      workspace = withTask(workspace, task)
    }
  await repository.saveTasks([...changed.values()])
}
