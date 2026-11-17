import { expect, it } from 'vitest'
import { catalog } from '../../src/catalog'
import { processMap } from '../../src/domain/process-map'
import { emptyTask } from '../../src/domain/task-record'
import { emptyWorkspace, newProfile } from '../../src/domain/types'
import type { Modality, Workspace } from '../../src/domain/types'

const workspaceFor = (modalidad: Modality): Workspace => ({
  ...emptyWorkspace(),
  profile: { ...newProfile(), modalidad },
})
const at = (map: ReturnType<typeof processMap>, id: string) =>
  map.nodes.find((node) => node.definition.id === id)!

it('lays the main path on the first row and ends parallel branches right before they are needed', () => {
  const map = processMap(workspaceFor('research'), catalog, new Date('2026-11-10T12:00:00-05:00'))
  const main = ['propuesta', 'desarrollo', 'informe-final', 'calificadores-research', 'calificacion',
    'biblioteca-firma-estudiante', 'biblioteca-firmas-docentes', 'biblioteca-decanato', 'dia-hora', 'defensa', 'titulo']
  expect(main.map((id) => [at(map, id).column, at(map, id).row])).toEqual(
    main.map((_, index) => [index, 0]),
  )
  expect(at(map, 'biblioteca-revision').row).toBe(1)
  expect(at(map, 'biblioteca-revision').column).toBe(at(map, 'biblioteca-firma-estudiante').column - 1)
  expect(at(map, 'aptitud-legal-research').column).toBe(at(map, 'dia-hora').column - 1)
  expect(at(map, 'no-adeudar').column).toBe(at(map, 'aptitud-legal-research').column - 1)
  expect(at(map, 'no-adeudar').row).toBe(1)
  const cells = map.nodes.map((node) => `${node.column}:${node.row}`)
  expect(new Set(cells).size).toBe(cells.length)
})

it('marks only the first available step as next and attaches its key calendar date', () => {
  const map = processMap(workspaceFor('research'), catalog, new Date('2026-11-10T12:00:00-05:00'))
  expect(map.nodes.filter((node) => node.next).map((node) => node.definition.id)).toEqual(['propuesta'])
  expect(at(map, 'desarrollo').status).toBe('blocked')
  expect(at(map, 'biblioteca-revision').status).toBe('active')
  expect(at(map, 'informe-final').event?.id).toBe('calificadores-limite')
  expect(at(map, 'informe-final').reminder?.daysRemaining).toBe(8)
})

it('skips grader steps for complexivo and links the exam date', () => {
  const map = processMap(workspaceFor('complexivo'), catalog)
  expect(map.nodes.some((node) => node.folder === 'calificadores')).toBe(false)
  expect(at(map, 'complexivo').event?.id).toBe('complexivo-examen')
})

it('moves the grader step from the council session to the grading deadline', () => {
  const workspace = workspaceFor('research')
  const before = new Date('2026-11-17T12:00:00-05:00')
  expect(at(processMap(workspace, catalog, before), 'calificacion')).toMatchObject({
    status: 'blocked',
    event: expect.objectContaining({ id: 'consejo-calificadores', startDate: '2026-11-19' }),
  })
  workspace.tasks.push({ ...emptyTask('calificadores-research'), status: 'waiting', requirementChecks: { 'grade-1': 8 } })
  expect(at(processMap(workspace, catalog, before), 'calificacion')).toMatchObject({
    status: 'waiting',
    stageLabel: 'Calificando',
    event: expect.objectContaining({ id: 'calificaciones-limite' }),
  })
})

it('shows the grading phase in review once the designation is ready and done with the grades', () => {
  const workspace = workspaceFor('research')
  const designation = { ...emptyTask('calificadores-research'), status: 'completed' as const }
  expect(at(processMap(workspace, catalog), 'calificacion').status).toBe('blocked')
  workspace.tasks.push(designation, { ...emptyTask('biblioteca-revision'), status: 'completed' })
  const map = processMap(workspace, catalog)
  expect(at(map, 'calificacion').status).toBe('done')
  expect(at(map, 'biblioteca-firma-estudiante').status).toBe('active')
})

it('counts only real workflows, without the informational grading step', () => {
  const map = processMap(workspaceFor('research'), catalog)
  const informational = map.nodes.filter((node) => node.definition.informational)
  expect(informational.map((node) => node.definition.id)).toEqual(['calificacion'])
  expect(map.total).toBe(map.nodes.length - 1)
})
