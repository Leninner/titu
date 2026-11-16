import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ArrowDown,
  ArrowRight,
  CalendarClock,
  Eye,
  EyeOff,
  Circle,
  CircleCheck,
  FileText,
  ListChecks,
  Lock,
  X,
} from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { statusIcons, statusText } from './workflow-icons'
import { catalog } from '../../catalog'
import { processFolders, processMap, type ProcessNode } from '../../domain/process-map'
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
import { shortDate } from '../calendar/short-date'
import { processPhases, type PhaseStep, type ProcessPhase } from '../../domain/process-phases'
import { informationalStatus } from '../../domain/informational'
import { GradingBoard } from './GradingBoard'


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
  if (node.definition.informational && node.status === 'waiting') return 'En revisión'
  if (node.definition.optional && node.status === 'active') return 'Si lo necesitas'
  return statusText[node.status]
}

function nodeLabel(node: ProcessNode) {
  const parts = [node.definition.title, statusName(node).toLowerCase()]
  if (node.event) parts.push(`fecha clave ${dateLabel(node)}${countdown(node) ? `, ${countdown(node).toLowerCase()}` : ''}`)
  if (node.documents.total) parts.push(`${node.documents.done} de ${node.documents.total} documentos`)
  return parts.join(' · ')
}

function NodeContent({ node, needs = [] }: { node: ProcessNode; needs?: ProcessNode[] }) {
  const Icon = statusIcons[node.status]
  const total = node.documents.total + node.checks.total
  const done = node.documents.done + node.checks.done
  return (
    <>
      <span className="process-node-top">
        {node.definition.optional && <span className="process-node-folder is-otros">Opcional</span>}
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
        {needs.length > 0 && (
          <span className="process-node-needs">
            <Lock size={12} aria-hidden="true" />
            Necesita: {needs.map((item) => item.definition.title).join(' · ')}
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

  const Icon = statusIcons[node.status]
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
          {definition.informational ? (
            <GradingBoard definition={definition} status={informationalStatus(definition, workspace, catalog)} />
          ) : documents.length > 0 ? (
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
        {!definition.informational && (
          <a className="button primary" href={`#/proceso/${definition.id}`}>
            Abrir trámite completo <ArrowRight size={16} aria-hidden="true" />
          </a>
        )}
      </div>
    </dialog>
  )
}

const completedKey = 'process-show-completed'

function savedShowCompleted() {
  try {
    return window.localStorage.getItem(completedKey) !== 'false'
  } catch {
    return true
  }
}

const phaseDone = (phase: ProcessPhase) => phase.total > 0 && phase.completed === phase.total

function StepCard({
  step,
  compact,
  selectedId,
  onOpen,
}: {
  step: PhaseStep
  compact: boolean
  selectedId?: string
  onOpen: (id: string) => void
}) {
  const { node, needs } = step
  const className = `process-node is-${node.status} ${node.next ? 'is-next' : ''} ${node.definition.id === selectedId ? 'is-selected' : ''}`
  return compact ? (
    <a className={className} href={`#/proceso/${node.definition.id}`} aria-label={nodeLabel(node)}>
      <NodeContent node={node} needs={needs} />
    </a>
  ) : (
    <button
      type="button"
      className={className}
      aria-label={nodeLabel(node)}
      aria-haspopup="dialog"
      onClick={() => onOpen(node.definition.id)}
    >
      <NodeContent node={node} needs={needs} />
    </button>
  )
}

function PhaseRow({
  phase,
  compact,
  selectedId,
  onOpen,
}: {
  phase: ProcessPhase
  compact: boolean
  selectedId?: string
  onOpen: (id: string) => void
}) {
  const done = phaseDone(phase)
  return (
    <section className={`process-phase ${done ? 'is-done' : ''}`} aria-labelledby={`phase-${phase.id}`}>
      <header className="process-phase-head">
        <span className="process-phase-number" aria-hidden="true">
          {done ? <CircleCheck size={16} /> : phase.number}
        </span>
        <h2 id={`phase-${phase.id}`}>{phase.title}</h2>
        <span className="process-phase-count">
          {phase.completed} de {phase.total}
        </span>
      </header>
      <ol className="process-phase-steps">
        {phase.steps.map((step, index) => (
          <li key={step.node.definition.id} className={index > 0 && !step.followsPrevious ? 'is-parallel' : undefined}>
            {index > 0 && step.followsPrevious && (
              <span className="process-phase-arrow" aria-hidden="true">
                {compact ? <ArrowDown size={16} /> : <ArrowRight size={16} />}
              </span>
            )}
            <StepCard step={step} compact={compact} selectedId={selectedId} onOpen={onOpen} />
          </li>
        ))}
      </ol>
    </section>
  )
}

export function ProcessMap({ now, viewToggle }: { now: Date; viewToggle: ReactNode }) {
  const { workspace } = useWorkspace()
  const map = processMap(workspace, catalog, now)
  const compact = useCompact()
  const [selectedId, setSelectedId] = useState<string>()
  const [showCompleted, setShowCompleted] = useState(savedShowCompleted)
  const selected = [...map.nodes, ...map.optional].find((node) => node.definition.id === selectedId)
  const nextNode = map.nodes.find((node) => node.next)
  const upcoming = map.nodes
    .filter((node) => node.event && node.status !== 'done' && !node.reminder?.expired)
    .sort((a, b) => a.event!.startDate.localeCompare(b.event!.startDate))[0]
  const phases = processPhases(map.nodes)
  const hidden = showCompleted ? [] : phases.filter(phaseDone)
  const visible = phases.filter((phase) => !hidden.includes(phase))

  function toggleCompleted() {
    const next = !showCompleted
    setShowCompleted(next)
    try {
      window.localStorage.setItem(completedKey, String(next))
    } catch {
      // The preference is a convenience; the map works without storage.
    }
  }

  function open(id: string) {
    if (compact) window.location.assign(`#/proceso/${id}`)
    else setSelectedId(id)
  }

  return (
    <div className="process-map">
      <div className="process-toolbar">
        <div className="process-toolbar-actions">
          {viewToggle}
          <button type="button" className="process-completed-toggle" aria-pressed={!showCompleted} onClick={toggleCompleted}>
            {showCompleted ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
            {showCompleted ? 'Ocultar completadas' : 'Ver completadas'}
          </button>
        </div>
        <ul className="process-legend" aria-label="Estados">
          {(['done', 'active', 'waiting', 'blocked'] as const).map((status) => {
            const Icon = statusIcons[status]
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
            <strong>{map.completed}</strong> de {map.total} trámites completados
          </span>
          <span className="process-summary-bar" aria-hidden="true">
            <span style={{ width: `${map.total ? (map.completed / map.total) * 100 : 0}%` }} />
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
      {hidden.length > 0 && (
        <p className="process-hidden-note">
          <CircleCheck size={15} aria-hidden="true" />
          {hidden.length === 1 ? 'Etapa completada oculta' : `${hidden.length} etapas completadas ocultas`}:{' '}
          {hidden.map((phase) => phase.title).join(' · ')}
        </p>
      )}
      <div className="process-phases" aria-label="Mapa del proceso">
        {visible.map((phase) => (
          <PhaseRow key={phase.id} phase={phase} compact={compact} selectedId={selectedId} onOpen={open} />
        ))}
      </div>
      <section className="process-extras" aria-labelledby="process-optional-title">
        <h2 id="process-optional-title">Fuera del recorrido principal</h2>
        <div className="process-extras-grid">
          <section className="process-guide-note" aria-labelledby="process-guide-title">
            <span className="process-node-folder is-guia">Consulta</span>
            <h2 id="process-guide-title">Guía del informe final</h2>
            <div className="process-guide-links">
              <ReportGuideLinks />
            </div>
          </section>
          {map.optional.map((node) => (
            <StepCard
              key={node.definition.id}
              step={{ node, followsPrevious: false, needs: [] }}
              compact={compact}
              selectedId={selectedId}
              onOpen={open}
            />
          ))}
        </div>
      </section>
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
