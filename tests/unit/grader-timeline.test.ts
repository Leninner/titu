import { expect, it } from 'vitest'
import { catalog } from '../../src/catalog'
import { graderTimeline } from '../../src/domain/grader-timeline'
import { emptyWorkspace, newProfile } from '../../src/domain/types'

const workspace = { ...emptyWorkspace(), profile: { ...newProfile(), modalidad: 'research' as const } }

it('lists the council and grading milestones of the official agenda with the holiday shift', () => {
  const timeline = graderTimeline(workspace, catalog, new Date('2026-11-19T10:00:00-05:00'))
  expect(timeline.map(({ label, event, state }) => [label, event.startDate, state])).toEqual([
    ['Solicitud', '2026-11-18', 'past'],
    ['Consejo', '2026-11-19', 'today'],
    ['Resolución', '2026-11-23', 'upcoming'],
    ['Notificación', '2026-11-24', 'upcoming'],
    ['Notas', '2026-12-04', 'upcoming'],
  ])
})

it('has no grader milestones for complexivo', () => {
  const complexivo = { ...workspace, profile: { ...newProfile(), modalidad: 'complexivo' as const } }
  expect(graderTimeline(complexivo, catalog)).toEqual([])
})
