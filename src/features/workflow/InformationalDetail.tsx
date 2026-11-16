import { ArrowRight, CalendarClock, Hourglass } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { catalog } from '../../catalog'
import { calendarForWorkspace, effectiveEvent, ECUADOR_TIME_ZONE } from '../../domain/dates'
import { informationalStatus, type InformationalStatus } from '../../domain/informational'
import type { WorkflowDefinition } from '../../domain/types'
import { applicableDependencies } from '../../domain/workflow'
import { keyDateFor } from '../../domain/process-map'
import { GuideTimeline } from './TaskMoreMenu'
import { useCurrentTime } from './use-current-time'
import './informational.css'
import { statusIcons } from './workflow-icons'

export const informationalLabels: Record<InformationalStatus, string> = {
  done: 'Completado',
  waiting: 'En revisión',
  blocked: 'Aún no empieza',
}

const longDate = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Intl.DateTimeFormat('es-EC', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: ECUADOR_TIME_ZONE,
  }).format(new Date(Date.UTC(year, month - 1, day, 12)))
}

function useKeyDate(definition: WorkflowDefinition) {
  const { workspace } = useWorkspace()
  const id = keyDateFor(definition.id)
  const event = calendarForWorkspace(workspace, catalog).find((item) => item.id === id)
  return event && effectiveEvent(event)
}

export function InformationalDetail({ definition }: { definition: WorkflowDefinition }) {
  const { workspace } = useWorkspace()
  const now = useCurrentTime()
  const status = informationalStatus(definition, workspace, catalog, now)
  const Icon = statusIcons[status]
  const event = useKeyDate(definition)
  const origins = applicableDependencies(definition, workspace, catalog)
    .map((id) => catalog.workflowDefinitions.find((item) => item.id === id)!)
  return (
    <section className="task-detail informational-detail">
      <div className="informational-hero">
        <span className={`process-panel-status is-${status}`}>
          <Icon size={14} aria-hidden="true" /> {informationalLabels[status]}
        </span>
        <p>{definition.summary}</p>
        {event && (
          <div className="informational-date">
            <CalendarClock size={20} aria-hidden="true" />
            <div>
              <span>{event.title}</span>
              <strong>{longDate(event.startDate)}</strong>
            </div>
          </div>
        )}
        {status === 'waiting' && (
          <p className="informational-waiting">
            <Hourglass size={15} aria-hidden="true" /> Los docentes están revisando tu trabajo. No tienes que
            enviar nada por ahora.
          </p>
        )}
        <div className="actions">
          {origins.map((origin) => (
            <a key={origin.id} className="button" href={`#/proceso/${origin.id}`}>
              Registrar las notas en {origin.title} <ArrowRight size={16} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
      <h2 className="informational-guide-title">Cómo avanza</h2>
      <GuideTimeline definition={definition} />
    </section>
  )
}
