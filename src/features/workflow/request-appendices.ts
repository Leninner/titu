import { latestCategoryVersion } from '../../domain/category-versions'
import type { DocumentVersion, LetterAppendix, Workspace } from '../../domain/types'
import { repository } from '../../storage/repository'

export interface AppendixState {
  appendix: LetterAppendix
  version?: DocumentVersion
}

export function appendixStates(workspace: Workspace, appendices: LetterAppendix[] = []): AppendixState[] {
  return appendices.map((appendix) => ({ appendix, version: latestCategoryVersion(workspace, appendix.category) }))
}

async function versionFile(version: DocumentVersion) {
  const blob = await repository.getBlob(version.blobId)
  if (!blob) throw new Error(`No se encontró el archivo ${version.originalName}`)
  return new Blob([blob], { type: version.mime })
}

export function loadAppendixFiles(states: AppendixState[]) {
  const versions = states.flatMap((state) => (state.version ? [state.version] : []))
  return Promise.all(versions.map(versionFile))
}
