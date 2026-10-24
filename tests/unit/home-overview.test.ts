import { expect, it } from 'vitest'
import { catalog } from '../../src/catalog'
import { homeOverview, pendingLabel, workflowForEvent } from '../../src/domain/home-overview'
import { emptyTask } from '../../src/domain/task-record'
import { emptyWorkspace, newProfile, type Modality, type Workspace } from '../../src/domain/types'

const workspaceFor = (modalidad: Modality, tasks: Workspace['tasks'] = []): Workspace => ({
  ...emptyWorkspace(),
  profile: { ...newProfile(), modalidad },
  tasks,
})

it('links each institutional date to the workflow of the student modality', () => {
  expect(workflowForEvent('calificadores-limite', workspaceFor('research'), catalog)?.id).toBe('calificadores-research')
  expect(workflowForEvent('calificadores-limite', workspaceFor('article'), catalog)?.id).toBe('calificadores-article')
  expect(workflowForEvent('aptitud-solicitud', workspaceFor('complexivo'), catalog)?.id).toBe('aptitud-legal-complexivo')
  expect(workflowForEvent('calificadores-limite', workspaceFor('complexivo'), catalog)).toBeUndefined()
  expect(workflowForEvent('personal-1', workspaceFor('research'), catalog)).toBeUndefined()
})

it('focuses on the next workflow and lists the other ones in progress', () => {
  const workspace = workspaceFor('research', [
    { ...emptyTask('propuesta'), status: 'completed' },
    { ...emptyTask('desarrollo'), status: 'submitted' },
  ])
  const overview = homeOverview(workspace, catalog, new Date('2026-10-24T12:00:00Z'))
  expect(overview.focus?.status).toBe('active')
  expect(overview.current.map((node) => node.definition.id)).toContain('desarrollo')
  expect(overview.current).not.toContain(overview.focus)
  expect(overview.current.every((node) => ['active', 'waiting'].includes(node.status))).toBe(true)
})

it('agrees in number when counting what is missing', () => {
  expect(pendingLabel(1)).toBe('Falta 1 requisito')
  expect(pendingLabel(3)).toBe('Faltan 3 requisitos')
})
