import { useEffect, useRef, useState, type ReactNode } from 'react'
import { BookOpen, History, MoreHorizontal, ScrollText, X } from 'lucide-react'
import type { TaskRecord, WorkflowDefinition } from '../../domain/types'
import { SourceCriteria } from './SourceCriteria'
import { statusLabels } from './task-record'

export type TaskSection = 'guide' | 'history' | 'sources'

const sectionTitles: Record<TaskSection, string> = {
  guide: 'Cómo se tramita',
  history: 'Historial de estados',
  sources: 'Fuentes y criterios',
}
const sectionIcons = { guide: BookOpen, history: History, sources: ScrollText }

const historyDate = (timestamp: string) =>
  new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Guayaquil',
  }).format(new Date(timestamp))

function GuideList({ definition }: { definition: WorkflowDefinition }) {
  return (
    <>
      <p className="task-guide-role">Responsable: {definition.role}</p>
      <ul className="task-guide">
        {definition.instructions.split(/(?<=\.)\s+/).map((sentence) => <li key={sentence}>{sentence}</li>)}
      </ul>
    </>
  )
}

function HistoryList({ task }: { task: TaskRecord }) {
  if (!task.history.length) return <p className="hint">Este trámite aún no cambia de estado.</p>
  return (
    <ol className="task-history">
      {[...task.history].reverse().map((entry, index) => (
        <li key={index}>
          <strong>{statusLabels[entry.status]}</strong>
          <span>{historyDate(entry.at)}</span>
          {entry.note && <p>{entry.note}</p>}
        </li>
      ))}
    </ol>
  )
}

function SectionDialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (typeof element.showModal === 'function' && !element.open) element.showModal()
    else element.setAttribute('open', '')
    return () => {
      if (typeof element.close === 'function' && element.open) element.close()
    }
  }, [])
  return (
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialog}
      className="task-section-dialog"
      aria-labelledby="task-section-dialog-title"
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <div className="task-section-dialog-head">
        <h2 id="task-section-dialog-title">{title}</h2>
        <button type="button" className="icon-button" aria-label="Cerrar" onClick={onClose}>
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="task-section-dialog-body">{children}</div>
    </dialog>
  )
}

export function TaskSectionDialog({
  section,
  task,
  definition,
  onClose,
}: {
  section: TaskSection
  task: TaskRecord
  definition: WorkflowDefinition
  onClose: () => void
}) {
  const content = {
    guide: () => <GuideList definition={definition} />,
    history: () => <HistoryList task={task} />,
    sources: () => <SourceCriteria sourceIds={definition.sourceIds} />,
  }
  return (
    <SectionDialog title={sectionTitles[section]} onClose={onClose}>
      {content[section]()}
    </SectionDialog>
  )
}

export function TaskMoreMenu({ onSelect }: { onSelect: (section: TaskSection) => void }) {
  const [open, setOpen] = useState(false)
  const menu = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !menu.current?.contains(event.target as Node))
        setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  return (
    <div className="task-more" ref={menu}>
      <button
        type="button"
        className="icon-button"
        aria-label="Más opciones del trámite"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <MoreHorizontal size={18} aria-hidden="true" />
      </button>
      {open && (
        <div className="task-more-menu" role="menu" aria-label="Más opciones del trámite">
          {(Object.keys(sectionTitles) as TaskSection[]).map((section) => {
            const Icon = sectionIcons[section]
            return (
              <button
                key={section}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false)
                  onSelect(section)
                }}
              >
                <Icon size={16} aria-hidden="true" /> {sectionTitles[section]}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
