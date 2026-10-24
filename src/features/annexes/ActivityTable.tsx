import { ArrowDown, ArrowUp, MoreHorizontal, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { parseNaturalDate, dateLabel } from '../../domain/natural-date'
import type { Activity } from '../../domain/types'

export function ActivityTable({ activities, readOnly = false, simple = false, monthlyPeriod, onChange }: {
  activities: Activity[]
  readOnly?: boolean
  simple?: boolean
  monthlyPeriod?: string
  onChange: (activities: Activity[]) => void
}) {
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [recognitionTime, setRecognitionTime] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setRecognitionTime(new Date()), 60000)
    return () => window.clearInterval(timer)
  }, [])
  const bounded = /^\d{4}-(0[1-9]|1[0-2])$/.test(monthlyPeriod ?? '')
  const min = bounded ? `${monthlyPeriod}-01` : undefined
  const max = bounded ? `${monthlyPeriod}-${new Date(Number(monthlyPeriod!.slice(0, 4)), Number(monthlyPeriod!.slice(5)), 0).getDate()}` : undefined
  const allowed = (date: string) => !date || !bounded || (date >= min! && date <= max!)
  const outside = `Esta fecha está fuera del informe. Elige una fecha de ${monthlyPeriod}.`
  const recognize = (text: string, now = recognitionTime) => parseNaturalDate(text, now, bounded ? Number(monthlyPeriod!.slice(0, 4)) : undefined)
  function describe(activity: Activity, description: string) {
    const parsed = recognize(description)
    let date = activity.date
    let message = ''
    if (parsed && 'error' in parsed) {
      message = parsed.error
      date = ''
    } else if (parsed) {
      date = allowed(parsed.date) ? parsed.date : ''
      if (!date) message = outside
    }
    setFeedback((previous) => ({ ...previous, [activity.id]: message }))
    onChange(activities.map((row) => row.id === activity.id ? { ...row, description, date } : row))
  }
  function changeDate(activity: Activity, date: string) {
    if (!allowed(date)) {
      setFeedback((previous) => ({ ...previous, [activity.id]: outside }))
      return
    }
    setFeedback((previous) => ({ ...previous, [activity.id]: '' }))
    onChange(activities.map((row) => row.id === activity.id ? { ...row, date } : row))
  }
  const move = (index: number, offset: number) => {
    const next = [...activities]
    const target = index + offset
    if (target < 0 || target >= next.length) return
    const activity = next.splice(index, 1)[0]
    next.splice(target, 0, activity)
    onChange(next)
  }
  const dateInput = (activity: Activity, index: number) => <input
    aria-label={`Fecha de actividad ${index + 1}`} readOnly={readOnly} type="date"
    min={min} max={max} aria-invalid={!!activity.date && !allowed(activity.date)} value={activity.date}
    onChange={(event) => changeDate(activity, event.target.value)} />
  const actions = (activity: Activity, index: number) => !readOnly && <div className="actions">
    <button type="button" aria-label={`Subir actividad ${index + 1}`} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={16} /></button>
    <button type="button" aria-label={`Bajar actividad ${index + 1}`} disabled={index === activities.length - 1} onClick={() => move(index, 1)}><ArrowDown size={16} /></button>
    <button type="button" aria-label={`Eliminar actividad ${index + 1}`} onClick={() => onChange(activities.filter((row) => row.id !== activity.id))}><Trash2 size={16} /></button>
  </div>
  return <section className={`activities${simple ? ' simple-activities' : ''}`}>
    <div className="activities-heading">
      <h3>Actividades realizadas</h3>
      {!readOnly && <button className="activity-add-heading" aria-label="Agregar actividad" title="Agregar actividad" type="button"
        onClick={() => onChange([...activities, { id: crypto.randomUUID(), date: '', description: '' }])}>
        <Plus size={18} aria-hidden="true" />{simple ? 'Agregar' : 'Agregar actividad'}
      </button>}
    </div>
    <table className={`document-activities${simple ? ' activity-register' : ''}`}>
      <thead>{simple ? <tr><th scope="col">Actividad</th><th scope="col">Fecha</th><th scope="col"><span className="activity-sr-only">Acciones</span></th></tr> : <tr><th scope="col">Fecha</th><th scope="col">Actividades realizadas</th></tr>}</thead>
      <tbody>
        {activities.map((activity, index) => {
          // Recover recognition feedback from saved text too, not just the last keystroke.
          const parsed = !activity.date ? recognize(activity.description) : null
          const detectedDate = activity.date || (parsed && !('error' in parsed) ? parsed.date : '')
          const invalid = !!detectedDate && !allowed(detectedDate)
          const message = feedback[activity.id] || (invalid ? outside : parsed && 'error' in parsed ? parsed.error : '')
          const textarea = <textarea rows={simple ? 1 : 3} readOnly={readOnly} aria-label={`Actividad ${index + 1}`}
            aria-describedby={message ? `activity-feedback-${activity.id}` : undefined}
            value={activity.description} placeholder="Ayer estuve en el curso haciendo…"
            onChange={(event) => describe(activity, event.target.value)} />
          const feedbackText = message && <small id={`activity-feedback-${activity.id}`} className="activity-date-feedback" aria-live="polite">{message}</small>
          if (simple) return <tr key={activity.id}>
            <td className="activity-description-cell">{textarea}</td>
            <td className="activity-register-date">
              <details className="activity-date-picker">
                <summary className="activity-date-text"
                  aria-label={detectedDate ? `Cambiar fecha: ${dateLabel(detectedDate)}` : `Elegir fecha de actividad ${index + 1}`}
                  title={message || 'Cambiar fecha'}>
                  {detectedDate ? detectedDate.split('-').reverse().join('/') : 'Sin fecha'}
                </summary>
                <div className="activity-date-popover"><span>Fecha de la actividad</span>{dateInput(activity, index)}</div>
              </details>
              {message && <small id={`activity-feedback-${activity.id}`} className="activity-row-feedback" title={message} aria-live="polite">{invalid ? 'Fuera del mes' : message}</small>}
            </td>
            <td className="activity-register-actions">
              {!readOnly && <details className="activity-row-menu">
                <summary aria-label={`Acciones de actividad ${index + 1}`} title="Acciones"><MoreHorizontal size={17} aria-hidden="true" /></summary>
                <div className="activity-row-menu-content">{actions(activity, index)}</div>
              </details>}
            </td>
          </tr>
          return <tr key={activity.id}>
            <td className="activity-date-cell">{dateInput(activity, index)}</td>
            <td>{textarea}{feedbackText}{actions(activity, index)}</td>
          </tr>
        })}
      </tbody>
    </table>
  </section>
}
