import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import type { CalendarEvent } from '../../domain/types'
import { addDays, ecuadorDate, effectiveEvent, eventReminder } from '../../domain/dates'
import './calendar-board.css'

export interface CalendarBoardProps {
  events: CalendarEvent[]
  now: Date
  onSelectEvent?: (event: CalendarEvent) => void
}

const localDate = (date: string) => new Date(`${date}T12:00:00Z`)
const format = (date: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('es-EC', { ...options, timeZone: 'UTC' }).format(localDate(date))

export function calendarWeek(date: string): string[] {
  const day = localDate(date).getUTCDay()
  const monday = addDays(date, -((day + 6) % 7))
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index))
}

export function eventsOnDate(events: CalendarEvent[], date: string): CalendarEvent[] {
  return events
    .filter((original) => {
      const event = effectiveEvent(original)
      return date >= event.startDate && date <= (event.endDate || event.startDate)
    })
    .sort((a, b) => {
      const first = effectiveEvent(a)
      const second = effectiveEvent(b)
      return (
        (first.localTime || '').localeCompare(second.localTime || '') ||
        first.title.localeCompare(second.title)
      )
    })
}

export function eventTimeLabel(original: CalendarEvent, date: string): string {
  const event = effectiveEvent(original)
  if (event.kind === 'window') {
    if (date === (event.endDate || event.startDate)) {
      return event.localTime ? `Cierre ${event.localTime}` : 'Ventana · hora no indicada'
    }
    return 'Ventana'
  }
  return event.localTime || 'Hora no indicada'
}

export function nextCalendarDate(events: CalendarEvent[], now: Date): string | null {
  const today = ecuadorDate(now)
  const future = events
    .filter((event) => !eventReminder(event, now).expired)
    .map((original) => {
      const event = effectiveEvent(original)
      return event.startDate < today ? today : event.startDate
    })
    .sort()
  return future[0] || null
}

export function CalendarBoard({ events, now, onSelectEvent }: CalendarBoardProps) {
  const selectedDay = useRef<HTMLDivElement>(null)
  const today = ecuadorDate(now)
  const [selectedDate, setSelectedDate] = useState(() => nextCalendarDate(events, now) ?? today)
  useEffect(() => {
    const day = selectedDay.current
    const scroller = day?.closest('.calendar-board-scroll')
    if (day && scroller)
      scroller.scrollLeft +=
        day.getBoundingClientRect().left - scroller.getBoundingClientRect().left
  }, [selectedDate])
  const days = calendarWeek(selectedDate)
  const next = nextCalendarDate(events, now)
  const visibleEvents = events.filter((event) =>
    days.some((day) => eventsOnDate([event], day).length),
  )
  const weekLabel = `${format(days[0], { day: 'numeric', month: 'short' })} – ${format(days[6], { day: 'numeric', month: 'short', year: 'numeric' })}`

  return (
    <section className="calendar-board" aria-label="Calendario semanal de titulación">
      <header className="calendar-board-toolbar">
        <div className="calendar-board-heading">
          <h2>{format(selectedDate, { month: 'long', year: 'numeric' })}</h2>
          <span>{weekLabel}</span>
        </div>
        <div className="calendar-board-controls">
          <button
            type="button"
            className="calendar-board-today"
            onClick={() => setSelectedDate(today)}
          >
            Hoy
          </button>
          <div className="calendar-board-arrows">
            <button
              type="button"
              aria-label="Semana anterior"
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
            >
              <ChevronLeft size={17} />
            </button>
            <button
              type="button"
              aria-label="Semana siguiente"
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
            >
              <ChevronRight size={17} />
            </button>
          </div>
          <button
            type="button"
            className="calendar-board-next"
            disabled={!next}
            onClick={() => next && setSelectedDate(next)}
          >
            Próxima fecha <ArrowRight size={15} />
          </button>
        </div>
      </header>
      <section
        className="calendar-board-scroll"
        aria-label="Días de la semana, desplázate horizontalmente para verlos todos"
      >
        <div className="calendar-board-grid">
          {days.map((date) => {
            const dayEvents = eventsOnDate(events, date)
            const current = date === today
            const selected = date === selectedDate
            return (
              <div
                className={`calendar-board-day${current ? ' is-today' : ''}${selected ? ' is-selected' : ''}`}
                key={date}
                ref={selected ? selectedDay : undefined}
              >
                <button
                  type="button"
                  className="calendar-board-day-heading"
                  aria-pressed={selected}
                  aria-current={current ? 'date' : undefined}
                  aria-label={format(date, { weekday: 'long', day: 'numeric', month: 'long' })}
                  onClick={() => setSelectedDate(date)}
                >
                  <span className="calendar-board-weekday">
                    {format(date, { weekday: 'short' }).replace('.', '')}
                  </span>
                  <span className="calendar-board-day-number">
                    {format(date, { day: 'numeric' })}
                  </span>
                  <span className="calendar-board-current">{current ? 'Hoy' : '\u00a0'}</span>
                </button>
                <div className="calendar-board-day-events">
                  {dayEvents.map((event) => {
                    const label = eventTimeLabel(event, date)
                    const eventContent = (
                      <>
                        <span className="calendar-board-event-time">{label}</span>
                        <span className="calendar-board-event-title">{event.title}</span>
                        {event.personalOverride && (
                          <span className="calendar-board-event-adjusted">Fecha personal</span>
                        )}
                      </>
                    )
                    const className = `calendar-board-event kind-${event.kind}`
                    return onSelectEvent ? (
                      <button
                        type="button"
                        className={className}
                        key={event.id}
                        onClick={() => onSelectEvent(event)}
                        aria-label={`${event.title}. ${label}. ${format(date, { day: 'numeric', month: 'long' })}`}
                      >
                        {eventContent}
                      </button>
                    ) : (
                      <div className={className} key={event.id}>
                        {eventContent}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </section>
      <footer className="calendar-board-footer">
        <span>
          {visibleEvents.length
            ? `${visibleEvents.length} ${visibleEvents.length === 1 ? 'fecha en esta semana' : 'fechas en esta semana'}`
            : 'Sin fechas esta semana'}
        </span>
        <span>Hora Ecuador · Las fechas sin hora no son citas</span>
      </footer>
    </section>
  )
}
