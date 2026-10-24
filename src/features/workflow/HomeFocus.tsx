import { ArrowRight, Flag } from 'lucide-react'
import { pendingLabel } from '../../domain/home-overview'
import type { ProcessNode } from '../../domain/process-map'
import { shortDate } from '../calendar/short-date'
import { StageIcon, statusIcons, statusText } from './workflow-icons'

const taskHref = (node: ProcessNode) => `#/proceso/${node.definition.id}`
const visibleMissing = 3

function daysText(days: number) {
  if (days === 0) return 'hoy'
  if (days === 1) return 'mañana'
  return `en ${days} días`
}

function KeyDate({ node }: { node: ProcessNode }) {
  if (!node.event || !node.reminder || node.reminder.expired) return null
  const date = node.event.endDate ?? node.event.startDate
  return (
    <p className={`focus-deadline${node.reminder.daysRemaining <= 7 ? ' is-soon' : ''}`}>
      <Flag size={14} aria-hidden="true" />
      {node.event.title} · {shortDate(date)} · {daysText(node.reminder.daysRemaining)}
    </p>
  )
}

function Missing({ node }: { node: ProcessNode }) {
  if (!node.missing.length) return null
  const hidden = node.missing.length - visibleMissing
  return (
    <ul className="focus-missing" aria-label="Lo que falta">
      {node.missing.slice(0, visibleMissing).map((item) => (
        <li key={item}>
          <a href={taskHref(node)}>{item}</a>
        </li>
      ))}
      {hidden > 0 && <li className="focus-missing-more">+{hidden}</li>}
    </ul>
  )
}

export function FocusCard({ node, completed, total, ticks }: {
  node?: ProcessNode
  completed: number
  total: number
  ticks: boolean[]
}) {
  const waiting = node?.status === 'waiting'
  return (
    <section className="focus-action" aria-label="Tu próximo trámite">
      <div className="focus-copy">
        {node && (
          <span className="focus-stage">
            <StageIcon stage={node.definition.stage} size={15} /> {waiting ? 'Esperando respuesta' : 'Siguiente paso'}
          </span>
        )}
        <h2>{node?.definition.title ?? 'Todo al día'}</h2>
        {node && !waiting && (
          <p>{node.missing.length ? pendingLabel(node.missing.length) : 'Los requisitos están registrados'}</p>
        )}
        {node && !waiting && <Missing node={node} />}
        {node && <KeyDate node={node} />}
        <a className="button primary" href={node ? taskHref(node) : '#/documentos'}>
          {node ? (waiting ? 'Ver seguimiento' : 'Continuar trámite') : 'Ver documentos'}
          <ArrowRight size={17} />
        </a>
      </div>
      <div className="focus-index">
        <span>{completed}</span>
        <small>de {total} etapas</small>
        <div className="stage-ticks" aria-hidden="true">
          {ticks.map((done, index) => <i key={index} className={done ? 'done' : ''} />)}
        </div>
      </div>
    </section>
  )
}

function progressText(node: ProcessNode) {
  if (node.status === 'waiting') return undefined
  if (!node.documents.total) return pendingLabel(node.missing.length)
  return `${node.documents.done}/${node.documents.total} docs`
}

export function CurrentTasks({ nodes }: { nodes: ProcessNode[] }) {
  if (!nodes.length) return null
  return (
    <section className="home-current" aria-label="En curso">
      <h2>En curso</h2>
      <div className="current-cards">
        {nodes.map((node) => {
          const Status = statusIcons[node.status]
          return (
            <a key={node.definition.id} className={`current-card is-${node.status}`} href={taskHref(node)}>
              <span className="current-card-icon">
                <StageIcon stage={node.definition.stage} size={18} />
              </span>
              <strong>{node.definition.title}</strong>
              <span className="current-card-status">
                <Status size={13} aria-hidden="true" /> {statusText[node.status]}
                {progressText(node) && <small>{progressText(node)}</small>}
              </span>
            </a>
          )
        })}
      </div>
    </section>
  )
}
