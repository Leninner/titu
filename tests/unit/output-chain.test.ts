import { expect, it } from 'vitest'
import { catalog } from '../../src/catalog'
import { chainOutput, outputUsage } from '../../src/domain/output-chain'
import { emptyTask } from '../../src/domain/task-record'
import { evidenceIdsForTask } from '../../src/domain/task-evidence'
import { emptyWorkspace, newProfile } from '../../src/domain/types'
import type { DocumentVersion, Modality, Workspace } from '../../src/domain/types'
import { withEvidence } from '../../src/features/workflow/evidence-actions'

const version = (id: string, documentId: string, createdAt = '2026-11-01T12:00:00.000Z'): DocumentVersion => ({
  id,
  documentId,
  blobId: `blob-${id}`,
  originalName: `${id}.pdf`,
  mime: 'application/pdf',
  size: 1,
  sha256: id,
  createdAt,
  signatureStatus: 'reported-signed',
  textualPdfStatus: 'text-detected',
})

function workspaceWithResolution(modalidad: Modality = 'research'): Workspace {
  return {
    ...emptyWorkspace(),
    profile: { ...newProfile(), modalidad },
    documents: [{ id: 'resolution', name: 'Resolución', category: 'resolucion', createdAt: '' }],
    versions: [version('first', 'resolution')],
    tasks: [{ ...emptyTask('propuesta'), status: 'completed', outputVersionIds: ['first'] }],
  }
}

const chainedIds = (workspace: Workspace, versionId: string, definitionId: string) =>
  chainOutput(versionId, 'propuesta', workspace, catalog)
    .find((task) => task.definitionId === definitionId)?.evidenceVersionIds

it('selects a received resolution in the later workflows that ask for it', () => {
  const workspace = workspaceWithResolution()
  const chained = chainOutput('first', 'propuesta', workspace, catalog)
  expect(chained.map((task) => task.definitionId).sort()).toEqual([
    'calificadores-research',
    'dia-hora',
  ])
  expect(chained.every((task) => task.evidenceVersionIds.includes('first'))).toBe(true)
})

it('leaves submitted or completed workflows untouched', () => {
  const workspace = workspaceWithResolution()
  workspace.tasks.push(
    { ...emptyTask('calificadores-research'), status: 'submitted' },
    { ...emptyTask('dia-hora'), status: 'completed' },
  )
  expect(chainOutput('first', 'propuesta', workspace, catalog)).toEqual([])
})

it('replaces an older version of the same document and respects another chosen resolution', () => {
  const workspace = workspaceWithResolution()
  workspace.documents.push({ id: 'manual', name: 'Otra', category: 'resolucion', createdAt: '' })
  workspace.versions.push(version('second', 'resolution', '2026-11-02T12:00:00.000Z'), version('manual-version', 'manual'))
  workspace.tasks.push(
    { ...emptyTask('calificadores-research'), status: 'preparing', evidenceVersionIds: ['first'] },
    { ...emptyTask('dia-hora'), evidenceVersionIds: ['manual-version'] },
  )
  expect(chainedIds(workspace, 'second', 'calificadores-research')).toEqual(['second'])
  expect(chainedIds(workspace, 'second', 'dia-hora')).toBeUndefined()
})

it('keeps an unchecked chained resolution unselected when the workflow opens again', () => {
  const workspace = workspaceWithResolution()
  const graders = chainOutput('first', 'propuesta', workspace, catalog)
    .find((task) => task.definitionId === 'calificadores-research')!
  const unchecked = withEvidence(graders, workspace, 'first', false)
  workspace.tasks.push(unchecked)
  const definition = catalog.workflowDefinitions.find((item) => item.id === unchecked.definitionId)!
  expect(evidenceIdsForTask(unchecked, definition, workspace)).not.toContain('first')
})

it('names the later workflows of the student modality that use an output', () => {
  expect(outputUsage('resolucion', 'propuesta', workspaceWithResolution('research'), catalog)).toEqual([
    'Designación de calificadores del Proyecto',
    'Solicitud de fecha de sustentación o incorporación',
  ])
  expect(outputUsage('resolucion', 'propuesta', workspaceWithResolution('complexivo'), catalog)).toEqual([
    'Solicitud de fecha de sustentación o incorporación',
  ])
  expect(outputUsage('respuesta', 'propuesta', workspaceWithResolution(), catalog)).toEqual([])
})
