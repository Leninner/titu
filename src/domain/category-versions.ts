import type { DocumentVersion, Workspace } from './types'

export function categoryVersions(workspace: Workspace, category: string): DocumentVersion[] {
  const documentIds = new Set(
    workspace.documents
      .filter((document) => document.category === category)
      .map((document) => document.id),
  )
  return workspace.versions.filter((version) => documentIds.has(version.documentId))
}

export function latestCategoryVersion(workspace: Workspace, category: string): DocumentVersion | undefined {
  return [...categoryVersions(workspace, category)].sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id),
  )[0]
}
