import { ArrowUpRight, Clock3 } from 'lucide-react'
import {
  calendarForWorkspace,
  daysBetween,
  ecuadorDate,
  effectiveEvent,
  eventReminder,
} from '../../domain/dates'
import type { Workspace } from '../../domain/types'
import { catalog } from '../../catalog'

function shortDate(date: string) {
  return new Intl.DateTimeFormat('es-EC', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`))
}

export function Timeline({ workspace, now }: { workspace: Workspace; now: Date }) {
  const today = ecuadorDate(now)
  const events = calendarForWorkspace(workspace, catalog).map(effectiveEvent)
  const expired = events.filter((event) => eventReminder(event, now).expired)
  const upcoming = events
    .filter((event) => !eventReminder(event, now).expired)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 4)
  const recent = expired
    .filter((event) => daysBetween(event.endDate ?? event.startDate, today) <= 7)
    .slice(-2)
  return (
    <section className="home-timeline">
      <div className="section-title">
        <h2>En el horizonte</h2>
        <a href="#/fechas">
          Toda la agenda <ArrowUpRight size={14} />
        </a>
      </div>
      <ol className="timeline-list">
        {recent.map((event) => (
          <li className="timeline-item past" key={event.id}>
            <span className="timeline-node" />
            <div className="timeline-date">
              {shortDate(event.endDate ?? event.startDate)} <span>Plazo pasado</span>
            </div>
            <a href="#/fechas">{event.title}</a>
          </li>
        ))}
        <li className="timeline-today">
          <span className="timeline-node" />
          <span>Hoy</span>
          <time dateTime={today}>{shortDate(today)}</time>
          <span className="today-line" />
        </li>
        {upcoming.map((event) => {
          const remaining = daysBetween(today, event.endDate ?? event.startDate)
          const active = event.kind === 'window' && event.startDate <= today
          return (
            <li className={`timeline-item ${remaining <= 3 ? 'near' : ''}`} key={event.id}>
              <span className="timeline-node" />
              <div className="timeline-date">
                <time dateTime={event.startDate}>
                  {shortDate(event.startDate)}
                  {event.endDate && ` – ${shortDate(event.endDate)}`}
                </time>
                <span>
                  {active
                    ? `Cierra ${remaining === 0 ? 'hoy' : `en ${remaining} días`}`
                    : event.kind === 'window'
                      ? `Abre en ${daysBetween(today, event.startDate)} días`
                      : remaining === 0
                        ? 'Hoy'
                        : remaining === 1
                          ? 'Mañana'
                          : `En ${remaining} días`}
                </span>
              </div>
              <a href="#/fechas">{event.title}</a>
              <small>
                {event.localTime ? (
                  <>
                    <Clock3 size={12} /> {event.kind === 'window' ? 'Cierre ' : ''}
                    {event.localTime} · Ecuador
                  </>
                ) : (
                  'Hora no indicada'
                )}
                {event.kind === 'administrative' ? ' · Institución' : ''}
              </small>
            </li>
          )
        })}
      </ol>
      {!upcoming.length && (
        <div className="timeline-empty">
          Sin próximas fechas confirmadas. <a href="#/fechas">Agrega una fecha personal.</a>
        </div>
      )}
    </section>
  )
}
