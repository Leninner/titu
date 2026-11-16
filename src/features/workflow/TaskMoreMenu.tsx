import { useRef, useState } from 'react'
import {
  Award,
  BookOpen,
  CalendarClock,
  Download,
  FilePen,
  GraduationCap,
  History,
  Landmark,
  Library,
  MoreHorizontal,
  PenLine,
  ScrollText,
  SearchCheck,
  Send,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'
import type { GuideIcon, RubricCriterion, TaskRecord, WorkflowDefinition } from '../../domain/types'
import { Dialog } from '../../components/Dialog'
import { useDismiss } from '../../components/useDismiss'
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

const guideIcons: Record<GuideIcon, LucideIcon> = {
  prepare: FilePen,
  send: Send,
  sign: PenLine,
  review: SearchCheck,
  council: Landmark,
  grade: GraduationCap,
  library: Library,
  calendar: CalendarClock,
  download: Download,
  deliver: Award,
}

const points = (value: number) => new Intl.NumberFormat('es-EC').format(value)

function Rubric({ title, criteria }: { title: string; criteria: RubricCriterion[] }) {
  const total = criteria.reduce((sum, criterion) => sum + criterion.points, 0)
  const highest = Math.max(...criteria.map((criterion) => criterion.points))
  return (
    <section className="guide-rubric" aria-label={title}>
      <h3>{title}</h3>
      <ul>
        {criteria.map((criterion) => (
          <li key={criterion.label}>
            <span>{criterion.label}</span>
            <span className="guide-rubric-track" aria-hidden="true">
              <span style={{ width: `${(criterion.points / highest) * 100}%` }} />
            </span>
            <strong>{points(criterion.points)}</strong>
          </li>
        ))}
      </ul>
      <p>
        Total <strong>{points(total)}</strong>
      </p>
    </section>
  )
}

export function GuideTimeline({ definition }: { definition: WorkflowDefinition }) {
  return (
    <>
      <ol className="guide-timeline">
        {definition.guide.steps.map((item, index) => {
          const Icon = guideIcons[item.icon]
          return (
            <li key={index}>
              <span className="guide-timeline-icon" aria-hidden="true">
                <Icon size={16} />
              </span>
              <div>
                <span className="guide-timeline-actor">{item.actor}</span>
                <p>{item.text}</p>
              </div>
            </li>
          )
        })}
      </ol>
      {definition.guide.rubric && <Rubric {...definition.guide.rubric} />}
      {definition.guide.notes.length > 0 && (
        <section className="guide-notes" aria-labelledby="guide-notes-title">
          <h3 id="guide-notes-title">
            <TriangleAlert size={15} aria-hidden="true" /> Ten en cuenta
          </h3>
          <ul>
            {definition.guide.notes.map((note) => <li key={note}>{note}</li>)}
          </ul>
        </section>
      )}
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
    guide: () => <GuideTimeline definition={definition} />,
    history: () => <HistoryList task={task} />,
    sources: () => <SourceCriteria sourceIds={definition.sourceIds} />,
  }
  return (
    <Dialog title={sectionTitles[section]} onClose={onClose}>
      {content[section]()}
    </Dialog>
  )
}

export function TaskMoreMenu({ onSelect }: { onSelect: (section: TaskSection) => void }) {
  const [open, setOpen] = useState(false)
  const menu = useRef<HTMLDivElement>(null)
  useDismiss(open, menu, () => setOpen(false))

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
