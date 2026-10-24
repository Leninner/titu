import { CalendarBoard } from './CalendarBoard'
import { NaturalDateInput } from '../../components/NaturalDateInput'
import { useEffect, useRef, useState } from 'react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { catalog } from '../../catalog'
import {
  calendarForWorkspace,
  effectiveEvent,
  eventReminder,
  noDebtValidity,
} from '../../domain/dates'
import { exportCalendarIcs } from '../../export/ics'
import { repository } from '../../storage/repository'
import { downloadBlob } from '../../components/download'
import type { CalendarEvent } from '../../domain/types'
import { Field } from '../../components/Field'
import { CalendarDays, Download, List } from 'lucide-react'
import './calendar-page.css'

const kindLabel: Record<CalendarEvent['kind'], string> = {
  deadline: 'Fecha límite',
  window: 'Ventana de gestión',
  administrative: 'Actuación institucional',
  appointment: 'Cita personal',
  personal: 'Fecha personal',
}

function formatDate(date: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('es-EC', { ...options, timeZone: 'UTC' }).format(
    new Date(`${date}T12:00:00Z`),
  )
}

export function CalendarPage() {
  const { workspace, run, busy } = useWorkspace()
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [issued, setIssued] = useState('')
  const [expiry, setExpiry] = useState('')
  const [delivery, setDelivery] = useState(workspace.settings.dayHourSubmissionDate ?? '')
  const events = calendarForWorkspace(workspace, catalog)
  const [view, setView] = useState<'agenda' | 'calendar'>('agenda')
  const orderedEvents = [...events].sort((left, right) => {
    const first = effectiveEvent(left)
    const second = effectiveEvent(right)
    return (
      first.startDate.localeCompare(second.startDate) ||
      (first.localTime || '').localeCompare(second.localTime || '') ||
      first.title.localeCompare(second.title)
    )
  })
  const [overrideId, setOverrideId] = useState('')
  const [overrideDate, setOverrideDate] = useState('')
  const [overrideEndDate, setOverrideEndDate] = useState('')
  const [overrideTime, setOverrideTime] = useState('')
  const overrideFormRef = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (overrideId) overrideFormRef.current?.scrollIntoView?.({ block: 'start' })
  }, [overrideId])
  function startOverride(event: CalendarEvent) {
    const displayed = effectiveEvent(event)
    setOverrideId(event.id)
    setOverrideDate(displayed.startDate)
    setOverrideEndDate(displayed.endDate || '')
    setOverrideTime(displayed.localTime || '')
  }
  const validDate = (value: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`))
  const validity =
    delivery &&
    validDate(delivery) &&
    (!issued || validDate(issued)) &&
    (!expiry || validDate(expiry))
      ? noDebtValidity(issued || undefined, delivery, expiry || undefined)
      : {
          label: 'Registra fechas completas de emisión o vencimiento y de ingreso de la solicitud',
          referenceDate: null,
        }
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Fechas</h1>
          <p className="lead">Tu agenda de titulación, en hora Ecuador.</p>
        </div>
      </div>
      {workspace.profile?.periodo !== '2026-07-12' && (
        <div className="notice">
          Sin calendario confirmado para este período. Puedes agregar tus fechas personales.
        </div>
      )}
      <div className="calendar-view-toolbar">
        <div>
          <h2>Fechas importantes</h2>
          <p>
            {events.length} {events.length === 1 ? 'fecha' : 'fechas'} para tu modalidad y período
          </p>
        </div>
        <fieldset className="calendar-view-switch">
          <legend className="visually-hidden">Modo de vista</legend>
          <button type="button" aria-pressed={view === 'agenda'} onClick={() => setView('agenda')}>
            <List size={17} aria-hidden="true" /> Agenda
          </button>
          <button type="button" aria-pressed={view === 'calendar'} onClick={() => setView('calendar')}>
            <CalendarDays size={17} aria-hidden="true" /> Calendario
          </button>
        </fieldset>
      </div>
      {view === 'calendar' ? (
        <CalendarBoard events={events} now={now} />
      ) : (
        <section className="agenda" aria-label="Agenda de fechas importantes">
          {orderedEvents.map((event) => {
            const reminder = eventReminder(event, now)
            const displayed = effectiveEvent(event)
            return (
              <article className={`agenda-row kind-${event.kind}`} key={event.id}>
                <time dateTime={displayed.startDate}>
                  {displayed.startDate.slice(8)}
                  <span>
                    {formatDate(displayed.startDate, { month: 'short' })}
                  </span>
                </time>
                <div className="agenda-row-content">
                  <div className="agenda-chips">
                    <span className={`agenda-chip kind-${event.kind}`}>{kindLabel[event.kind]}</span>
                    {event.personalOverride && <span className="agenda-chip is-adjusted">Fecha ajustada</span>}
                    {(reminder.level || (!reminder.expired && reminder.daysRemaining === 0)) && (
                      <span className={`agenda-chip ${reminder.expired ? 'is-expired' : 'is-soon'}`}>
                        {reminder.expired
                          ? event.kind === 'window'
                            ? 'Terminó'
                            : event.kind === 'administrative'
                              ? 'Ya pasó'
                              : 'Vencida'
                          : reminder.daysRemaining === 1
                            ? 'Mañana'
                            : reminder.daysRemaining === 0
                              ? 'Hoy'
                              : `En ${reminder.daysRemaining} días`}
                      </span>
                    )}
                  </div>
                  <h2>{event.title}</h2>
                  <p className="agenda-date-detail">
                    {displayed.endDate
                      ? `${formatDate(displayed.startDate, { day: 'numeric', month: 'long' })} al ${formatDate(displayed.endDate, { day: 'numeric', month: 'long', year: 'numeric' })}`
                      : formatDate(displayed.startDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    <span aria-hidden="true"> · </span>
                    {displayed.localTime
                      ? event.kind === 'window'
                        ? `Cierra a las ${displayed.localTime} (hora Ecuador)`
                        : `${displayed.localTime} (hora Ecuador)`
                      : 'Hora no indicada'}
                  </p>
                  <p className="agenda-source">
                    {event.sourceIds.length ? `Fuente: ${event.sourceIds.join(', ')}` : 'Registrada por ti'}
                  </p>
                  {event.personalOverride && (
                    <p className="agenda-original">
                      Fecha original: {event.startDate}
                      {event.endDate ? ` al ${event.endDate}` : ''} ·{' '}
                      {event.localTime || 'Hora no indicada'}.
                    </p>
                  )}
                  {event.sourceIds.length > 0 && (
                    <button
                      className="text-button"
                      onClick={() => startOverride(event)}
                    >
                      Registrar fecha personalizada
                    </button>
                  )}
                </div>
              </article>
            )
          })}
          {orderedEvents.length === 0 && (
            <p className="agenda-empty">Aún no hay fechas para este período. Puedes agregar una fecha personal abajo.</p>
          )}
        </section>
      )}
      <section className="calendar-connect" aria-labelledby="calendar-connect-title">
        <div>
          <h2 id="calendar-connect-title">Usar estas fechas en otro calendario</h2>
          <p>
            Descarga el archivo e impórtalo en Google Calendar, Outlook o Apple Calendar. Incluye
            avisos 7, 3 y 1 días antes; cada proveedor decide cómo mostrarlos.
          </p>
          <p className="calendar-connect-note">
            Es una copia: si cambias una fecha aquí, vuelve a descargar e importar el archivo.
            Los avisos de esta app aparecen al abrirla.
          </p>
        </div>
        <button
          type="button"
          disabled={!events.length}
          onClick={() =>
            downloadBlob(
              new Blob([exportCalendarIcs(events)], { type: 'text/calendar;charset=utf-8' }),
              'titulacion.ics',
            )
          }
        >
          <Download size={17} aria-hidden="true" /> Descargar .ics
        </button>
      </section>
      {overrideId && (
        <form
          ref={overrideFormRef}
          className="notice"
          onSubmit={(event) => {
            event.preventDefault()
            void run(async () => {
              const original = catalog.calendarEvents.find((event) => event.id === overrideId)!
              await repository.savePersonalEvent({
                ...original,
                personalOverride: {
                  startDate: overrideDate,
                  endDate: overrideEndDate || undefined,
                  localTime: overrideTime || undefined,
                },
              })
              setOverrideId('')
            })
          }}
        >
          <h2>Personalizar sin reemplazar la fuente</h2>
          <p>
            La fecha oficial permanece en el catálogo. Esto solo modifica tu agenda. Dejar el fin o
            la hora vacíos elimina esos valores de tu ajuste personal.
          </p>
          <Field
            name="overrideDate"
            type="date"
            label="Fecha personalizada"
            required
            value={overrideDate}
            onChange={(event) => setOverrideDate(event.target.value)}
          />
          <Field
            name="overrideEndDate"
            type="date"
            min={overrideDate}
            label="Fin de ventana (si corresponde)"
            value={overrideEndDate}
            onChange={(event) => setOverrideEndDate(event.target.value)}
          />
          <Field
            name="overrideTime"
            type="time"
            label="Hora Ecuador (opcional)"
            value={overrideTime}
            onChange={(event) => setOverrideTime(event.target.value)}
          />
          <div className="actions">
            <button
              disabled={
                busy ||
                !validDate(overrideDate) ||
                (!!overrideEndDate && overrideEndDate < overrideDate)
              }
            >
              Guardar fecha personal
            </button>
            <button type="button" onClick={() => setOverrideId('')}>
              Cancelar
            </button>
          </div>
        </form>
      )}
      <section className="settings-section">
        <h2>Agregar una cita o recordatorio</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void run(async () => {
              const personal: CalendarEvent = {
                id: crypto.randomUUID(),
                title,
                kind: 'personal',
                startDate: date,
                localTime: time || undefined,
                timeZone: 'America/Guayaquil',
                modalities: [workspace.profile!.modalidad],
                periodId: workspace.profile!.periodo,
                sourceIds: [],
                certainty: 'Fecha registrada por el estudiante',
              }
              await repository.savePersonalEvent(personal)
              setTitle('')
              setDate('')
              setTime('')
            })
          }}
        >
          <div className="form-grid">
            <Field
              name="eventTitle"
              label="Nombre"
              value={title}
              required
              onChange={(event) => setTitle(event.target.value)}
            />
            <NaturalDateInput
              name="eventDate"
              label="Fecha"
              value={date}
              required
              onChange={setDate}
            />
            <Field
              name="eventTime"
              label="Hora Ecuador (opcional)"
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
            />
          </div>
          <button className="primary" disabled={busy || !date}>
            Agregar fecha
          </button>
        </form>
      </section>
      <section className="settings-section">
        <h2>Revisar vigencia de no adeudar</h2>
        <p>
          La referencia se calcula desde la emisión real, para el ingreso de la solicitud de día y
          hora. Guarda la emisión y el vencimiento impreso junto al archivo en Documentos para
          usarlos en los trámites.
        </p>
        <div className="form-grid">
          <NaturalDateInput
            name="issued"
            label="Emisión real"
            value={issued}
            onChange={setIssued}
          />
          <NaturalDateInput
            name="expiry"
            label="Vencimiento impreso (si existe)"
            value={expiry}
            onChange={setExpiry}
          />
          <NaturalDateInput
            name="delivery"
            label="Ingreso de solicitud de día y hora"
            value={delivery}
            onChange={setDelivery}
          />
        </div>
        <output>
          {validity.label}
          {validity.referenceDate ? ` · ${validity.referenceDate}` : ''}
        </output>
        <button
          disabled={busy || !delivery}
          onClick={() => void run(() => repository.saveSetting('dayHourSubmissionDate', delivery))}
        >
          Guardar fecha de ingreso prevista
        </button>
      </section>
    </div>
  )
}
