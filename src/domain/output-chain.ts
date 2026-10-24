import type { CatalogVersion, TaskRecord, WorkflowDefinition, Workspace } from './types'
import { applicableWorkflows, taskInputs } from './workflow'
import { taskFor } from './task-record'

const chainableStatuses = new Set<TaskRecord['status']>(['pending', 'preparing'])

function consumersOf(
  category: string,
  sourceDefinitionId: string,
  workspace: Workspace,
  catalog: CatalogVersion,
): WorkflowDefinition[] {
  return applicableWorkflows(workspace, catalog).filter(
    (definition) =>
      definition.id !== sourceDefinitionId &&
      !definition.optional &&
      taskInputs(definition, workspace).some((requirement) => requirement.category === category),
  )
}

export function outputUsage(
  category: string,
  sourceDefinitionId: string,
  workspace: Workspace,
  catalog: CatalogVersion,
): string[] {
  return consumersOf(category, sourceDefinitionId, workspace, catalog).map(
    (definition) => definition.title,
  )
}

function categoryOf(versionId: string, workspace: Workspace) {
  const documentId = workspace.versions.find((version) => version.id === versionId)?.documentId
  return workspace.documents.find((document) => document.id === documentId)
}

function withChainedVersion(task: TaskRecord, versionId: string, workspace: Workspace) {
  const document = categoryOf(versionId, workspace)
  if (!document) return task
  const selectedOfCategory = task.evidenceVersionIds.filter(
    (id) => categoryOf(id, workspace)?.category === document.category,
  )
  const siblings = selectedOfCategory.filter((id) => categoryOf(id, workspace)?.id === document.id)
  if (selectedOfCategory.length && !siblings.length) return task
  return {
    ...task,
    evidenceVersionIds: [
      ...task.evidenceVersionIds.filter((id) => !siblings.includes(id) && id !== versionId),
      versionId,
    ],
  }
}

export function chainOutput(
  versionId: string,
  sourceDefinitionId: string,
  workspace: Workspace,
  catalog: CatalogVersion,
): TaskRecord[] {
  const category = categoryOf(versionId, workspace)?.category
  if (!category) return []
  return consumersOf(category, sourceDefinitionId, workspace, catalog)
    .map((definition) => taskFor(definition.id, workspace))
    .filter((task) => chainableStatuses.has(task.status))
    .flatMap((task) => {
      const chained = withChainedVersion(task, versionId, workspace)
      return chained.evidenceVersionIds.join() === task.evidenceVersionIds.join() ? [] : [chained]
    })
}
