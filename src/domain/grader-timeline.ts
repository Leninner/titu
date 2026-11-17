import type { CalendarEvent, CatalogVersion, Workspace } from './types'
import { calendarForWorkspace, ecuadorDate, effectiveEvent } from './dates'

export type MilestoneState = 'past' | 'today' | 'upcoming'

export interface GraderMilestone {
  label: string
  event: CalendarEvent
  state: MilestoneState
}

const milestones: [eventId: string, label: string][] = [
  ['calificadores-limite', 'Solicitud'],
  ['consejo-calificadores', 'Consejo'],
  ['proceso-calificadores', 'Resolución'],
  ['notificacion-calificadores', 'Notificación'],
  ['calificaciones-limite', 'Notas'],
]

function milestoneState(date: string, today: string): MilestoneState {
  if (date === today) return 'today'
  return date < today ? 'past' : 'upcoming'
}

export function graderTimeline(
  workspace: Workspace,
  catalog: CatalogVersion,
  now: Date = new Date(),
): GraderMilestone[] {
  const events = new Map(calendarForWorkspace(workspace, catalog).map((event) => [event.id, event]))
  const today = ecuadorDate(now)
  return milestones.flatMap(([eventId, label]) => {
    const event = events.get(eventId)
    if (!event) return []
    const effective = effectiveEvent(event)
    return [{ label, event: effective, state: milestoneState(effective.startDate, today) }]
  })
}
