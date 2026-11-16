import { expect, it } from 'vitest'
import { catalog } from '../../src/catalog'
import { processMap } from '../../src/domain/process-map'
import { processPhases } from '../../src/domain/process-phases'
import { emptyTask } from '../../src/domain/task-record'
import { emptyWorkspace, newProfile } from '../../src/domain/types'
import type { Modality, Workspace } from '../../src/domain/types'

const workspaceFor = (modalidad: Modality): Workspace => ({
  ...emptyWorkspace(),
  profile: { ...newProfile(), modalidad, aplicaEmpresa: false },
})
const ids = (phase: ReturnType<typeof processPhases>[number]) => phase.steps.map((step) => step.node.definition.id)

it('groups the research path into one row per phase, in order', () => {
  const rows = processPhases(processMap(workspaceFor('research'), catalog).nodes)
  expect(rows.map((row) => [row.number, row.title])).toEqual([
    [1, 'Trabajo de titulación'],
    [2, 'Calificadores'],
    [3, 'Biblioteca'],
    [4, 'Sustentación y título'],
  ])
  expect(rows.map(ids)).toEqual([
    ['propuesta', 'desarrollo', 'informe-final'],
    ['calificadores-research', 'calificacion'],
    ['biblioteca-revision', 'biblioteca-firma-estudiante', 'biblioteca-firmas-docentes', 'biblioteca-decanato'],
    ['no-adeudar', 'aptitud-legal-research', 'dia-hora', 'defensa', 'titulo'],
  ])
  expect(rows.every((row) => row.steps.slice(1).every((step) => step.followsPrevious))).toBe(true)
  expect(rows[1].total).toBe(1)
})

it('names the pending steps from other phases that block a step', () => {
  const workspace = workspaceFor('research')
  const library = () => processPhases(processMap(workspace, catalog).nodes)[2].steps[1]
  expect(library().needs.map((node) => node.definition.title)).toEqual(['Calificación del trabajo'])
  workspace.tasks.push({ ...emptyTask('calificadores-research'), status: 'completed' })
  expect(library().needs).toEqual([])
})

it('skips phases that do not apply to complexivo', () => {
  const rows = processPhases(processMap(workspaceFor('complexivo'), catalog).nodes)
  expect(rows.map((row) => row.title)).toEqual(['Trabajo de titulación', 'Sustentación y título'])
  expect(rows.map((row) => row.number)).toEqual([1, 2])
})
