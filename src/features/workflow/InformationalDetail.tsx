import { CalendarClock } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { catalog } from '../../catalog'
import { calendarForWorkspace, effectiveEvent, ECUADOR_TIME_ZONE } from '../../domain/dates'
import { informationalLabel, informationalStage, informationalStatus } from '../../domain/informational'
import type { WorkflowDefinition } from '../../domain/types'
import { GuideTimeline } from './TaskMoreMenu'
import { InformationalBoard } from './InformationalBoard'
import { useCurrentTime } from './use-current-time'
import './informational.css'
import { statusIcons } from './workflow-icons'

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

function useStageDate(definition: WorkflowDefinition, now: Date) {
  const { workspace } = useWorkspace()
  const id = informationalStage(definition, workspace, catalog, now)?.keyDate
  const event = calendarForWorkspace(workspace, catalog).find((item) => item.id === id)
  return event && effectiveEvent(event)
}

export function InformationalDetail({ definition }: { definition: WorkflowDefinition }) {
  const { workspace } = useWorkspace()
  const now = useCurrentTime()
  const status = informationalStatus(definition, workspace, catalog, now)
  const Icon = statusIcons[status]
  const event = useStageDate(definition, now)
  return (
    <section className="task-detail informational-detail">
      <div className="informational-hero">
        <span className={`process-panel-status is-${status}`}>
          <Icon size={14} aria-hidden="true" /> {informationalLabel(definition, workspace, catalog, now)}
        </span>
        <p>{definition.summary}</p>
        {event && status !== 'done' && (
          <div className="informational-date">
            <CalendarClock size={20} aria-hidden="true" />
            <div>
              <span>{event.title}</span>
              <strong>{longDate(event.startDate)}</strong>
            </div>
          </div>
        )}
      </div>
      <div className="informational-board">
        <InformationalBoard definition={definition} status={status} />
      </div>
      <h2 className="informational-guide-title">Cómo avanza</h2>
      <GuideTimeline definition={definition} />
    </section>
  )
}
