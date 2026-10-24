import { expect, it } from 'vitest'
import { catalog } from '../../src/catalog'
import { processMap } from '../../src/domain/process-map'
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
  const main = ['propuesta', 'desarrollo', 'informe-final', 'calificadores-research',
    'aptitud-legal-research', 'dia-hora', 'defensa', 'titulo']
  expect(main.map((id) => [at(map, id).column, at(map, id).row])).toEqual(
    main.map((_, index) => [index, 0]),
  )
  const library = map.nodes.filter((node) => node.definition.id.startsWith('biblioteca-'))
  expect(new Set(library.map((node) => node.row))).toEqual(new Set([1]))
  expect(at(map, 'biblioteca-decanato').column).toBe(at(map, 'dia-hora').column - 1)
  expect(at(map, 'no-adeudar').column).toBe(at(map, 'aptitud-legal-research').column - 1)
  expect(at(map, 'no-adeudar').row).toBe(2)
  const cells = map.nodes.map((node) => `${node.column}:${node.row}`)
  expect(new Set(cells).size).toBe(cells.length)
})

it('marks only the first available step as next and attaches its key calendar date', () => {
  const map = processMap(workspaceFor('research'), catalog, new Date('2026-11-10T12:00:00-05:00'))
  expect(map.nodes.filter((node) => node.next).map((node) => node.definition.id)).toEqual(['propuesta'])
  expect(at(map, 'desarrollo').status).toBe('blocked')
  expect(at(map, 'biblioteca-revision').status).toBe('active')
  expect(at(map, 'informe-final').event?.id).toBe('calificadores-limite')
  expect(at(map, 'informe-final').reminder?.daysRemaining).toBe(9)
})

it('skips grader steps for complexivo and links the exam date', () => {
  const map = processMap(workspaceFor('complexivo'), catalog)
  expect(map.nodes.some((node) => node.folder === 'calificadores')).toBe(false)
  expect(at(map, 'complexivo').event?.id).toBe('complexivo-examen')
})
