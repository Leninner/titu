import type { TaskRecord, WorkflowDefinition, Workspace } from './types'

export function evidenceIdsForTask(
  task: TaskRecord,
  definition: WorkflowDefinition,
  workspace: Workspace,
): string[] {
  if (!definition.requirements.some((requirement) => requirement.category === 'personal'))
    return task.evidenceVersionIds

  const personalDocuments = new Set(
    workspace.documents
      .filter((document) => document.category === 'personal')
      .map((document) => document.id),
  )
  const personalVersions = workspace.versions.filter((version) =>
    personalDocuments.has(version.documentId),
  )
  if (
    !personalVersions.length ||
    task.evidenceVersionIds.some((id) => personalVersions.some((version) => version.id === id))
  )
    return task.evidenceVersionIds

  const latest = personalVersions.sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id),
  )[0]
  return [...task.evidenceVersionIds, latest.id]
}
