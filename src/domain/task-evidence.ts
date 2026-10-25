import { categoryVersions, latestCategoryVersion } from './category-versions'
import type { TaskRecord, WorkflowDefinition, Workspace } from './types'

export function evidenceIdsForTask(
  task: TaskRecord,
  definition: WorkflowDefinition,
  workspace: Workspace,
): string[] {
  if (!definition.requirements.some((requirement) => requirement.category === 'personal'))
    return task.evidenceVersionIds

  const personalVersions = categoryVersions(workspace, 'personal')
  const latest = latestCategoryVersion(workspace, 'personal')
  if (
    !latest ||
    task.evidenceVersionIds.some((id) => personalVersions.some((version) => version.id === id))
  )
    return task.evidenceVersionIds

  return [...task.evidenceVersionIds, latest.id]
}
