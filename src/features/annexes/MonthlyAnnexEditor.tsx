import { useEffect, useState, type ReactNode } from 'react'
import type { AnnexDraft, StudentProfile } from '../../domain/types'
import { Field } from '../../components/Field'
import { ActivityTable } from './ActivityTable'

const profileFields = {
  nombres: 'Estudiante', facultad: 'Facultad', carrera: 'Carrera',
  tema: 'Tema aprobado', tutor: 'Tutor', aprobacionFecha: 'Fecha de aprobación',
} as const

export function MonthlyAnnexEditor({ draft, onChange, errors = {}, progressNotice, minimumProgress = 0 }: {
  draft: AnnexDraft
  onChange: (draft: AnnexDraft) => void
  errors?: Record<string, string>
  progressNotice?: ReactNode
  minimumProgress?: number
}) {
  const [customDate, setCustomDate] = useState(false)
  const savedProgress = Number(draft.fields.avance)
  const needsInitialProgress = !draft.fields.avance?.trim() || !Number.isFinite(savedProgress) || savedProgress < minimumProgress
  const progress = needsInitialProgress ? minimumProgress : savedProgress
  useEffect(() => {
    if (needsInitialProgress) {
      onChange({ ...draft, fields: { ...draft.fields, avance: String(minimumProgress) } })
    }
  }, [draft, minimumProgress, needsInitialProgress, onChange])
  const monthDates = (month: string) => {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return { first: '', last: '' }
    return { first: `${month}-01`, last: `${month}-${new Date(Number(month.slice(0, 4)), Number(month.slice(5)), 0).getDate()}` }
  }
  const dates = monthDates(draft.monthlyPeriod)
  const selectedDate = customDate ? 'custom' : draft.fields.fechaModo || (draft.fields.fecha && draft.fields.fecha === dates.first ? 'first' : draft.fields.fecha && draft.fields.fecha === dates.last ? 'last' : 'custom')
  const setField = (key: string, value: string) => {
    if (key === 'avance' && (Number(value) < minimumProgress || Number(value) > 100)) return
    onChange({ ...draft, fields: { ...draft.fields, [key]: value } })
  }
  const missingProfile = Object.keys(profileFields).some((key) => !draft.profileSnapshot[key as keyof StudentProfile])
  return <section className="monthly-editor" aria-label="Registro del informe mensual">
    <header className="monthly-heading">
      <h2>Tu avance del mes</h2>
      <p>Elige el mes, actualiza tu avance y registra tus actividades.</p>
    </header>
    <div className="monthly-layout">
      <div className="monthly-main">
        <div className="monthly-basics">
          <Field name="monthlyPeriod" label="Mes del informe" type="month" value={draft.monthlyPeriod} error={errors.monthlyPeriod}
            onChange={(event) => {
              const monthlyPeriod = event.target.value
              const next = monthDates(monthlyPeriod)
              onChange({
                ...draft, monthlyPeriod, fields: {
                  ...draft.fields,
                  ...(selectedDate === 'first' || selectedDate === 'last' ? { fecha: next[selectedDate] } : {}),
                }
              })
            }} />
          <div className="monthly-progress">
            <div className="progress-label"><label htmlFor="monthly-progress">Avance acumulado (%)</label><output htmlFor="monthly-progress">{`${progress}%`}</output></div>
            <input id="monthly-progress" type="range" min={minimumProgress} max={100} step={1}
              value={progress} aria-invalid={!!errors.avance}
              aria-valuetext={`${progress} por ciento`}
              onChange={(event) => setField('avance', event.target.value)} />
            <div className="progress-stops" aria-label="Avances frecuentes">
              {[0, 25, 50, 75, 100].map((value) => <button key={value} type="button" disabled={value < minimumProgress}
                aria-label={`Registrar ${value}% de avance`} onClick={() => setField('avance', String(value))}>{value}%</button>)}
            </div>
            {minimumProgress > 0 && <small className="progress-minimum">Informe anterior: {minimumProgress}%. El avance no puede disminuir.</small>}
            {errors.avance && <small className="error">{errors.avance}</small>}
            {progressNotice && <div className="monthly-progress-notice">{progressNotice}</div>}
          </div>
        </div>

        <ActivityTable activities={draft.activities} monthlyPeriod={draft.monthlyPeriod} simple
          onChange={(activities) => onChange({ ...draft, activities })} />
        {errors.activities && <p className="error" role="alert">{errors.activities}</p>}
        <details className="monthly-observations-section">
          <summary>Observaciones del tutor <span>{draft.fields.observaciones ? '· registradas' : '· opcional'}</span></summary>
          <label className="field monthly-observations">
            <span>Observaciones del tutor <small>Opcional</small></span>
            <textarea value={draft.fields.observaciones ?? ''} rows={3}
              placeholder="Añade las observaciones que haya indicado tu tutor."
              onChange={(event) => setField('observaciones', event.target.value)} />
          </label>
        </details>
      </div>
      <aside className="monthly-document-settings" aria-label="Preparación del documento">
        <div className="monthly-date-choice">
          <h3>Fecha del documento</h3>
          <fieldset className="date-presets" aria-labelledby="document-date-label">
            {([['first', 'Primer día'], ['last', 'Último día'], ['custom', 'Personalizada']] as const).map(([mode, label]) => <button type="button" key={mode}
              aria-pressed={selectedDate === mode} disabled={mode !== 'custom' && !dates.first}
              onClick={() => {
                setCustomDate(mode === 'custom')
                onChange({ ...draft, fields: { ...draft.fields, fechaModo: mode, ...(mode !== 'custom' ? { fecha: dates[mode] } : {}) } })
              }}>{label}</button>)}
          </fieldset>
          {selectedDate === 'custom' ? <Field name="fecha" label="Fecha personalizada" type="date" value={draft.fields.fecha ?? ''}
            error={errors.fecha} onChange={(event) => setField('fecha', event.target.value)} />
            : <small className="date-preset-value">{draft.fields.fecha?.split('-').reverse().join('/')}</small>}
          {selectedDate !== 'custom' && errors.fecha && <small className="error">{errors.fecha}</small>}
        </div>
        <details className="monthly-profile" open={missingProfile || undefined}>
          <summary>Datos del informe{missingProfile ? ' · hay datos por completar' : ' · estudiante y tutor'}</summary>
          <p className="hint">Precargados desde tu perfil. Puedes revisar los datos de este informe aquí.</p>
          <div className="form-grid">
            {Object.entries(profileFields).map(([key, label]) => <Field key={key} name={`monthly-${key}`}
              label={label} type={key === 'aprobacionFecha' ? 'date' : 'text'}
              readOnly={key === 'tema'} value={String(draft.profileSnapshot[key as keyof StudentProfile])}
              error={errors[`profile.${key}`]}
              onChange={(event) => onChange({ ...draft, profileSnapshot: { ...draft.profileSnapshot, [key]: event.target.value } })} />)}
          </div>
          <a href="#/ajustes">Actualizar el tema aprobado en Ajustes</a>
        </details>
      </aside>
    </div>
  </section>
}
