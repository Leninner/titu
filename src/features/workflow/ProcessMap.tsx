import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import {
  ArrowRight,
  CalendarClock,
  Circle,
  CircleCheck,
  CircleDot,
  FileText,
  Hourglass,
  ListChecks,
  Lock,
  X,
} from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { catalog } from '../../catalog'
import { processFolders, processMap, type NodeStatus, type ProcessNode } from '../../domain/process-map'
import { evidenceIdsForTask } from '../../domain/task-evidence'
import { unavailableAsOutput } from '../../domain/output-chain'
import type { DocumentVersion, TaskRecord, Workspace } from '../../domain/types'
import { latestDraft, requirementGap, taskInputs, taskOutputs } from '../../domain/workflow'
import { AnnexDocument } from '../annexes/AnnexDocument'
import { repository } from '../../storage/repository'
import { RequirementsPanel } from './RequirementsPanel'
import { addEvidence, signEvidence, withEvidence, type EvidenceField } from './evidence-actions'
import { fileRequirements, type FileHandlers } from './PrepareStep'
import { MonthlyReportCards } from './MonthlyReportCards'
import { persistTask } from './task-persistence'
import { taskFor } from './task-record'
import { ReportGuideLinks } from './ReportGuide'

const NODE_WIDTH = 228
const NODE_HEIGHT = 148
const GAP_X = 64
const GAP_Y = 24
const PADDING = 28
const LANE_GAP = 56

const statusText: Record<NodeStatus, string> = {
  done: 'Completado',
  waiting: 'En trámite',
  active: 'Disponible',
  blocked: 'Bloqueado',
}
const StatusIcon = { done: CircleCheck, waiting: Hourglass, active: CircleDot, blocked: Lock }
const edgeStates = ['is-done', 'is-ready', 'is-pending'] as const
const folderShort = { trabajo: 'Trabajo', calificadores: 'Calificadores', sustentacion: 'Sustentación' }

function useCompact(query = '(max-width: 760px)') {
  const [compact, setCompact] = useState(() => typeof window.matchMedia === 'function' && window.matchMedia(query).matches)
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const media = window.matchMedia(query)
    const change = () => setCompact(media.matches)
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [query])
  return compact
}

function shortDate(date: string) {
  return new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'short', timeZone: 'UTC' })
    .format(new Date(`${date}T12:00:00Z`))
    .replace('.', '')
}

function dateLabel(node: ProcessNode) {
  const event = node.event
  if (!event) return ''
  const range = event.endDate ? `${shortDate(event.startDate)} – ${shortDate(event.endDate)}` : shortDate(event.startDate)
  return event.localTime ? `${range} · ${event.localTime}` : range
}

function countdown(node: ProcessNode) {
  const reminder = node.reminder
  if (!reminder || node.status === 'done') return ''
  if (reminder.expired) return 'Venció'
  if (reminder.daysRemaining === 0) return 'Hoy'
  if (reminder.daysRemaining === 1) return 'Mañana'
  return reminder.daysRemaining <= 21 ? `Faltan ${reminder.daysRemaining} días` : ''
}

function urgency(node: ProcessNode) {
  const reminder = node.reminder
  if (!reminder || node.status === 'done') return ''
  if (reminder.expired) return 'is-late'
  return reminder.daysRemaining <= 7 ? 'is-soon' : ''
}

function statusName(node: ProcessNode) {
  if (node.next) return 'Siguiente paso'
  if (node.definition.optional && node.status === 'active') return 'Si lo necesitas'
  return statusText[node.status]
}

function nodeLabel(node: ProcessNode) {
  const parts = [node.definition.title, statusName(node).toLowerCase()]
  if (node.event) parts.push(`fecha clave ${dateLabel(node)}${countdown(node) ? `, ${countdown(node).toLowerCase()}` : ''}`)
  if (node.documents.total) parts.push(`${node.documents.done} de ${node.documents.total} documentos`)
  return parts.join(' · ')
}

function NodeContent({ node }: { node: ProcessNode }) {
  const Icon = StatusIcon[node.status]
  const total = node.documents.total + node.checks.total
  const done = node.documents.done + node.checks.done
  return (
    <>
      <span className="process-node-top">
        <span className={`process-node-folder is-${node.definition.optional ? 'otros' : node.folder}`}>
          {node.definition.optional ? 'Opcional' : folderShort[node.folder]}
        </span>
        <span className="process-node-status">
          <Icon size={14} aria-hidden="true" />
          {statusName(node)}
        </span>
      </span>
      <strong className="process-node-title">{node.definition.title}</strong>
      <span className="process-node-meta">
        {node.event && (
          <span className={`process-node-date ${urgency(node)}`}>
            <CalendarClock size={13} aria-hidden="true" />
            {dateLabel(node)}
            {countdown(node) && <em>{countdown(node)}</em>}
          </span>
        )}
        {total > 0 && (
          <span className="process-node-progress">
            {node.documents.total > 0 ? <FileText size={13} aria-hidden="true" /> : <ListChecks size={13} aria-hidden="true" />}
            {node.documents.total > 0
              ? `${node.documents.done}/${node.documents.total} documentos`
              : `${done}/${total} requisitos`}
            <span className="process-node-bar" aria-hidden="true">
              <span style={{ width: `${Math.round((done / total) * 100)}%` }} />
            </span>
          </span>
        )}
      </span>
    </>
  )
}

function AnnexPreviewSection({ templateId, label }: { templateId: string; label: string }) {
  const { workspace } = useWorkspace()
  const draft = latestDraft(workspace, templateId)
  return (
    <section className="process-dialog-annex" aria-label={label}>
      <h3>{label} <span>{draft ? `${draft.activities.length} ${draft.activities.length === 1 ? 'actividad' : 'actividades'}` : 'Sin crear'}</span></h3>
      {draft ? (
        <div className="document-canvas">
          <AnnexDocument draft={draft} onChange={() => {}} readOnly />
        </div>
      ) : (
        <p className="process-dialog-empty">Aún no está creado; se prepara en el trámite completo.</p>
      )}
    </section>
  )
}

function ProcessDialog({
  node,
  nodes,
  onClose,
  onSelect,
}: {
  node: ProcessNode
  nodes: ProcessNode[]
  onClose: () => void
  onSelect: (id: string) => void
}) {
  const { workspace, refresh } = useWorkspace()
  const dialog = useRef<HTMLDialogElement>(null)
  const definition = node.definition
  const task = taskFor(definition.id, workspace)
  const result = node.step === 'result'
  const field: EvidenceField = result ? 'outputVersionIds' : 'evidenceVersionIds'
  const selectedIds = result ? task.outputVersionIds : evidenceIdsForTask(task, definition, workspace)
  const requirements = result ? taskOutputs(definition, workspace) : taskInputs(definition, workspace)
  const documents = fileRequirements(requirements)
  const checks = requirements.filter((requirement) => !requirement.category)
  const pendingDeps = node.dependsOn
    .map((id) => nodes.find((item) => item.definition.id === id))
    .filter((item): item is ProcessNode => !!item && item.status !== 'done')

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (typeof element.showModal === 'function' && !element.open) element.showModal()
    else element.setAttribute('open', '')
    return () => {
      if (typeof element.close === 'function' && element.open) element.close()
    }
  }, [])

  // Each change starts from the stored task so quick consecutive edits never undo each other.
  async function update(change: (current: TaskRecord, latest: Workspace) => TaskRecord | Promise<TaskRecord>) {
    const latest = await repository.loadWorkspace()
    const current = taskFor(definition.id, latest)
    await persistTask(await change(current, latest), current)
    await refresh()
  }

  const files: FileHandlers = {
    onToggle: (versionId, checked) =>
      void update((current, latest) => withEvidence(current, latest, versionId, checked, field)),
    onUpload: async (file, category, documentId) => {
      let uploaded: DocumentVersion | undefined
      await update(async (current, latest) => {
        const added = await addEvidence(current, latest, file, category, documentId, field)
        uploaded = added.version
        return added.task
      })
      return uploaded!
    },
    onSignatureChange: (version, signed) =>
      update((current, latest) => signEvidence(current, latest, version, signed, field)),
  }
  const monthly = documents.find((requirement) => requirement.category === 'mensual')
  const annex = result ? undefined : requirements.find((requirement) => requirement.annex)

  const Icon = StatusIcon[node.status]
  return (
    // Clicking the backdrop closes the dialog; Escape is handled by onCancel.
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialog}
      className="process-dialog"
      aria-labelledby="process-dialog-title"
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <div className="process-dialog-head">
        <div>
          <span className="process-dialog-tags">
            <span className={`process-node-folder is-${definition.optional ? 'otros' : node.folder}`}>
              {definition.optional ? 'Otros trámites' : processFolders.find((folder) => folder.id === node.folder)?.title}
            </span>
            <span className={`process-panel-status is-${node.status}`}>
              <Icon size={14} aria-hidden="true" /> {statusName(node)}
            </span>
          </span>
          <h2 id="process-dialog-title">{definition.title}</h2>
        </div>
        <button type="button" className="icon-button" aria-label="Cerrar detalle" onClick={onClose}>
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="process-dialog-body">
        <div className="process-dialog-info">
          {node.event && (
            <div className={`process-panel-date ${urgency(node)}`}>
              <CalendarClock size={18} aria-hidden="true" />
              <div>
                <strong>{dateLabel(node)}{countdown(node) && ` · ${countdown(node)}`}</strong>
                <span>{node.event.title}</span>
              </div>
            </div>
          )}
          <p className="process-panel-instructions">{definition.summary}</p>
          {pendingDeps.length > 0 && (
            <div className="process-panel-section">
              <h3>Antes necesitas</h3>
              <ul className="process-panel-deps">
                {pendingDeps.map((item) => (
                  <li key={item.definition.id}>
                    <button type="button" onClick={() => onSelect(item.definition.id)}>
                      <Lock size={14} aria-hidden="true" /> {item.definition.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {checks.length > 0 && (
            <div className="process-panel-section">
              <h3>{result ? 'Datos del resultado' : 'Otros requisitos'}</h3>
              <ul className="process-panel-checks">
                {checks.map((requirement) => {
                  const done = !requirementGap(requirement, task, selectedIds, workspace, catalog)
                  return (
                    <li key={requirement.id} className={done ? 'is-done' : ''}>
                      {done ? <CircleCheck size={16} aria-hidden="true" /> : <Circle size={16} aria-hidden="true" />}
                      <span>{requirement.label}</span>
                      <span className="visually-hidden">{done ? 'registrado' : 'pendiente'}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
        <div className="process-dialog-docs">
          {annex && <AnnexPreviewSection templateId={annex.annex!} label={annex.label} />}
          {documents.length > 0 ? (
            <>
              <h3>
                {result ? 'Resultado' : 'Documentos'}{' '}
                <span>{node.documents.done} de {node.documents.total} listos</span>
              </h3>
              {documents.some((requirement) => requirement !== monthly) && (
                <RequirementsPanel
                  requirements={documents.filter((requirement) => requirement !== monthly)}
                  selectedIds={selectedIds}
                  anchorPrefix="map-requirement"
                  layout="cards"
                  purpose={result ? 'result' : 'delivery'}
                  excludedIds={result ? unavailableAsOutput(task.id, workspace) : []}
                  {...files}
                />
              )}
              {monthly && <MonthlyReportCards selectedIds={selectedIds} signed={!!monthly.signed} files={files} />}
            </>
          ) : !annex && (
            <p className="process-dialog-empty">Este paso no pide documentos.</p>
          )}
        </div>
      </div>
      <div className="process-dialog-foot">
        <button type="button" onClick={onClose}>Cerrar</button>
        <a className="button primary" href={`#/proceso/${definition.id}`}>
          Abrir trámite completo <ArrowRight size={16} aria-hidden="true" />
        </a>
      </div>
    </dialog>
  )
}

export function ProcessMap({ now, viewToggle }: { now: Date; viewToggle: ReactNode }) {
  const { workspace } = useWorkspace()
  const map = processMap(workspace, catalog, now)
  const compact = useCompact()
  const [selectedId, setSelectedId] = useState<string>()
  const canvas = useRef<HTMLDivElement>(null)
  const pan = useRef<{ x: number; left: number } | null>(null)
  const everyNode = [...map.nodes, ...map.optional]
  const selected = everyNode.find((node) => node.definition.id === selectedId)
  const nextNode = map.nodes.find((node) => node.next)
  const upcoming = map.nodes
    .filter((node) => node.event && node.status !== 'done' && !node.reminder?.expired)
    .sort((a, b) => a.event!.startDate.localeCompare(b.event!.startDate))[0]
  const columns = Math.max(map.columns, map.optional.length + 1)
  const laneTop = PADDING + map.rows * (NODE_HEIGHT + GAP_Y) + LANE_GAP
  const width = PADDING * 2 + columns * NODE_WIDTH + (columns - 1) * GAP_X
  const height = laneTop + NODE_HEIGHT + PADDING
  const position = (node: ProcessNode) => ({
    x: PADDING + node.column * (NODE_WIDTH + GAP_X),
    y: node.definition.optional ? laneTop : PADDING + node.row * (NODE_HEIGHT + GAP_Y),
  })
  const nextId = nextNode?.definition.id

  useEffect(() => {
    const element = canvas.current
    const target = element?.querySelector<HTMLElement>('.process-node.is-next')
    if (element && target) element.scrollLeft = Math.max(0, target.offsetLeft - element.clientWidth / 3)
  }, [compact, nextId])

  function open(id: string) {
    if (compact) window.location.assign(`#/proceso/${id}`)
    else setSelectedId(id)
  }

  function startPan(event: ReactPointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('button, a') || event.pointerType !== 'mouse') return
    pan.current = { x: event.clientX, left: event.currentTarget.scrollLeft }
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.classList.add('is-panning')
  }
  function movePan(event: ReactPointerEvent<HTMLDivElement>) {
    if (pan.current) event.currentTarget.scrollLeft = pan.current.left - (event.clientX - pan.current.x)
  }
  function endPan(event: ReactPointerEvent<HTMLDivElement>) {
    pan.current = null
    event.currentTarget.classList.remove('is-panning')
  }

  const ordered = [...map.nodes].sort((a, b) => a.column - b.column || a.row - b.row)
  const nodeClass = (node: ProcessNode) =>
    `process-node is-${node.status} ${node.next ? 'is-next' : ''} ${node.definition.optional ? 'is-optional' : ''} ${node.definition.id === selectedId ? 'is-selected' : ''}`

  const guideNote = (
    <section className="process-guide-note" aria-labelledby="process-guide-title">
      <span className="process-node-folder is-guia">Consulta</span>
      <h2 id="process-guide-title">Guía del informe final</h2>
      <div className="process-guide-links">
        <ReportGuideLinks />
      </div>
    </section>
  )

  return (
    <div className="process-map">
      <div className="process-toolbar">
        {viewToggle}
        <ul className="process-legend" aria-label="Estados">
          {(['done', 'active', 'waiting', 'blocked'] as const).map((status) => {
            const Icon = StatusIcon[status]
            return (
              <li key={status} className={`is-${status}`}>
                <Icon size={14} aria-hidden="true" /> {statusText[status]}
              </li>
            )
          })}
        </ul>
      </div>
      <div className="process-summary">
        <div className="process-summary-progress">
          <span>
            <strong>{map.completed}</strong> de {map.nodes.length} trámites completados
          </span>
          <span className="process-summary-bar" aria-hidden="true">
            <span style={{ width: `${map.nodes.length ? (map.completed / map.nodes.length) * 100 : 0}%` }} />
          </span>
        </div>
        {nextNode && (
          <button type="button" className="process-summary-next" onClick={() => open(nextNode.definition.id)}>
            <span>Siguiente paso</span>
            <strong>{nextNode.definition.title}</strong>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        )}
        {upcoming && (
          <button type="button" className={`process-summary-date ${urgency(upcoming)}`} onClick={() => open(upcoming.definition.id)}>
            <CalendarClock size={16} aria-hidden="true" />
            <span>Próxima fecha</span>
            <strong>{dateLabel(upcoming)} · {upcoming.event!.title}</strong>
          </button>
        )}
      </div>
      {compact ? (
        <>
          <ol className="process-timeline" aria-label="Mapa del proceso">
            {[...new Set(ordered.map((node) => node.column))].map((column) => {
              const items = ordered.filter((node) => node.column === column)
              return (
                <li key={column} className="process-timeline-step">
                  {items.length > 1 && <span className="process-timeline-parallel">En paralelo</span>}
                  {items.map((node) => (
                    <a
                      key={node.definition.id}
                      className={nodeClass(node)}
                      href={`#/proceso/${node.definition.id}`}
                      aria-label={nodeLabel(node)}
                    >
                      <NodeContent node={node} />
                    </a>
                  ))}
                </li>
              )
            })}
          </ol>
          <div className="process-extras">
            {guideNote}
            <section className="process-extras-list" aria-labelledby="process-optional-title">
              <h2 id="process-optional-title">Otros trámites</h2>
              {map.optional.map((node) => (
                <a key={node.definition.id} className={nodeClass(node)} href={`#/proceso/${node.definition.id}`} aria-label={nodeLabel(node)}>
                  <NodeContent node={node} />
                </a>
              ))}
            </section>
          </div>
        </>
      ) : (
        <div
          ref={canvas}
          className="process-canvas"
          onPointerDown={startPan}
          onPointerMove={movePan}
          onPointerUp={endPan}
          onPointerCancel={endPan}
        >
          <div className="process-canvas-inner" style={{ width, height }}>
            <svg className="process-edges" width={width} height={height} aria-hidden="true">
              <defs>
                {edgeStates.map((state) => (
                  <marker
                    key={state}
                    id={`process-arrow-${state}`}
                    className={`process-arrow ${state}`}
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="5"
                    markerHeight="5"
                    orient="auto"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" />
                  </marker>
                ))}
              </defs>
              <line className="process-lane-line" x1={PADDING} x2={width - PADDING} y1={laneTop - LANE_GAP / 2} y2={laneTop - LANE_GAP / 2} />
              {map.edges.map((edge) => {
                const from = map.nodes.find((node) => node.definition.id === edge.from)!
                const to = map.nodes.find((node) => node.definition.id === edge.to)!
                const start = position(from)
                const end = position(to)
                const x1 = start.x + NODE_WIDTH
                const y1 = start.y + NODE_HEIGHT / 2
                const x2 = end.x
                const y2 = end.y + NODE_HEIGHT / 2
                const bend = Math.max(28, (x2 - x1) / 2)
                const state = from.status === 'done' ? (to.status === 'done' ? 'is-done' : 'is-ready') : 'is-pending'
                return (
                  <g key={`${edge.from}-${edge.to}`} className={`process-edge ${state}`}>
                    <path
                      d={`M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2 - 1} ${y2}`}
                      markerEnd={`url(#process-arrow-${state})`}
                    />
                    <circle cx={x1} cy={y1} r={4} />
                  </g>
                )
              })}
            </svg>
            <span className="process-lane-label" style={{ left: PADDING, top: laneTop - LANE_GAP / 2 - 10 }}>
              Fuera del recorrido principal
            </span>
            <div className="process-guide-slot" style={{ left: PADDING, top: laneTop, width: NODE_WIDTH, height: NODE_HEIGHT }}>
              {guideNote}
            </div>
            {[...ordered, ...map.optional].map((node) => {
              const { x, y } = position(node)
              return (
                <button
                  key={node.definition.id}
                  type="button"
                  className={nodeClass(node)}
                  style={{ left: x, top: y, width: NODE_WIDTH, height: NODE_HEIGHT }}
                  aria-label={nodeLabel(node)}
                  aria-haspopup="dialog"
                  onClick={() => setSelectedId(node.definition.id)}
                >
                  <NodeContent node={node} />
                </button>
              )
            })}
          </div>
        </div>
      )}
      {selected && !compact && (
        <ProcessDialog
          key={selected.definition.id}
          node={selected}
          nodes={map.nodes}
          onClose={() => setSelectedId(undefined)}
          onSelect={setSelectedId}
        />
      )}
    </div>
  )
}
