import { monthLabel, type MonthProgress } from '../../domain/monthly-report'

const percent = (value: number) => `${value.toLocaleString('es')} %`

const signedPercent = (delta: number) => `${delta > 0 ? '+' : ''}${delta.toLocaleString('es')}`

const trendOf = (delta?: number) => (delta === undefined ? 'flat' : delta < 0 ? 'down' : delta > 0 ? 'up' : 'flat')

export function ThesisProgress({ current, summary }: { current?: MonthProgress; summary: string }) {
  const value = current?.progress
  const source = current ? `Según el Anexo 5 de ${monthLabel(current.month)}` : 'Sin porcentaje en los Anexo 5 incluidos'
  return (
    <section className="thesis-progress" aria-label="Avance de la tesis">
      <span className="thesis-progress-label">Avance de la tesis</span>
      <strong className="thesis-progress-value">{value === undefined ? '—' : percent(value)}</strong>
      <progress className="thesis-progress-bar" aria-label="Avance de la tesis" max={100} value={Math.min(value ?? 0, 100)} />
      <span className="thesis-progress-source">{source} · {summary}</span>
    </section>
  )
}

export function CardProgress({ item }: { item?: MonthProgress }) {
  if (item?.progress === undefined) return <p className="month-card-progress is-empty">Avance no leído del documento</p>
  return (
    <p className="month-card-progress">
      Avance declarado <strong>{percent(item.progress)}</strong>
      {item.delta !== undefined && (
        <span className={`month-card-delta is-${trendOf(item.delta)}`} title="Frente al mes anterior con dato">
          {signedPercent(item.delta)}
        </span>
      )}
    </p>
  )
}
