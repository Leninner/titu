import { Check } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { catalog } from '../../catalog'
import { ECUADOR_TIME_ZONE } from '../../domain/dates'
import { graderTimeline, type GraderMilestone, type MilestoneState } from '../../domain/grader-timeline'
import { useCurrentTime } from './use-current-time'
import './grader-timeline.css'

const stateNames: Record<MilestoneState, string> = {
  past: 'ya pasó',
  today: 'hoy',
  upcoming: 'próximo',
}

const shortDate = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'short', timeZone: ECUADOR_TIME_ZONE })
    .format(new Date(Date.UTC(year, month - 1, day, 12)))
    .replace('.', '')
}

function Milestone({ milestone }: { milestone: GraderMilestone }) {
  const { event, label, state } = milestone
  return (
    <li className={`grader-milestone is-${state}`} aria-current={state === 'today' ? 'date' : undefined}>
      <span className="grader-milestone-dot" aria-hidden="true">
        {state === 'past' && <Check size={12} strokeWidth={3} />}
      </span>
      <strong className="grader-milestone-date">{state === 'today' ? 'Hoy' : shortDate(event.startDate)}</strong>
      <span className="grader-milestone-label">{label}</span>
      <span className="visually-hidden">, {stateNames[state]}</span>
    </li>
  )
}

export function GraderTimeline() {
  const { workspace } = useWorkspace()
  const now = useCurrentTime()
  const milestones = graderTimeline(workspace, catalog, now)
  if (!milestones.length) return null
  return (
    <ol className="grader-timeline" aria-label="Fechas de la designación y calificación">
      {milestones.map((milestone) => <Milestone key={milestone.event.id} milestone={milestone} />)}
    </ol>
  )
}
