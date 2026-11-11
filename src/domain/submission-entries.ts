import { reportMonth } from './monthly-report'
import type { DocumentVersion, Requirement, WorkflowDefinition, Workspace } from './types'

export interface SubmissionEntry {
  versionId: string
  name: string
}

// oxlint-disable-next-line eslint/no-control-regex
const unsafeCharacters = /[<>:"|?*\u0000-\u001f]/g

export function safeFilename(name: string): string {
  const last = name.split(/[\\/]/).pop() ?? 'documento'
  return last.replace(unsafeCharacters, '_').replace(/^\.+/, '_') || 'documento'
}

function extensionOf(name: string) {
  const match = /\.[^.\\/]+$/.exec(name)
  return match ? match[0] : ''
}

function categoryOf(version: DocumentVersion, workspace: Workspace) {
  return workspace.documents.find((document) => document.id === version.documentId)?.category
}

function chronological(workspace: Workspace) {
  return (a: DocumentVersion, b: DocumentVersion) =>
    (reportMonth(a, workspace) ?? '').localeCompare(reportMonth(b, workspace) ?? '') ||
    a.createdAt.localeCompare(b.createdAt)
}

function standardNames(requirement: Requirement | undefined, versions: DocumentVersion[]) {
  const base = requirement?.submissionName
  if (!base) return versions.map((version) => safeFilename(version.originalName))
  return versions.map((version, index) => {
    const suffix = versions.length > 1 ? ` ${index + 1}` : ''
    return safeFilename(`${base}${suffix}${extensionOf(version.originalName)}`)
  })
}

function groupByRequirement(
  definition: WorkflowDefinition,
  versions: DocumentVersion[],
  workspace: Workspace,
) {
  const fileRequirements = definition.requirements.filter((requirement) => requirement.category)
  const groups = fileRequirements.map((requirement) => ({
    requirement,
    versions: versions
      .filter((version) => categoryOf(version, workspace) === requirement.category)
      .sort(chronological(workspace)),
  }))
  const grouped = new Set(groups.flatMap((group) => group.versions))
  const others = versions.filter((version) => !grouped.has(version))
  return [...groups, { requirement: undefined, versions: others }]
}

export function submissionEntries(
  definition: WorkflowDefinition,
  workspace: Workspace,
  versionIds: string[],
): SubmissionEntry[] {
  const versions = versionIds
    .map((id) => workspace.versions.find((version) => version.id === id))
    .filter((version) => version !== undefined)
  const named = groupByRequirement(definition, versions, workspace).flatMap(({ requirement, versions }) => {
    const names = standardNames(requirement, versions)
    return versions.map((version, index) => ({ versionId: version.id, name: names[index] }))
  })
  return named.map((entry, index) => ({ ...entry, name: `${index + 1}. ${entry.name}` }))
}
