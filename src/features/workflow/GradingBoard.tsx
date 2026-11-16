import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ArrowRight, Lock, PartyPopper, Pencil, TriangleAlert } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { catalog } from '../../catalog'
import { gradeIds, gradingSummary, maximumGrade, passingAverage, type GradingSummary } from '../../domain/grading'
import type { InformationalStatus } from '../../domain/informational'
import { numeric } from '../../domain/numeric'
import type { WorkflowDefinition } from '../../domain/types'
import { applicableDependencies } from '../../domain/workflow'
import { repository } from '../../storage/repository'
import { persistTask } from './task-persistence'
import { taskFor } from './task-record'
import './grading.css'

const libraryStepId = 'biblioteca-firma-estudiante'

const recordsGrades = (id: string) =>
  !!catalog.workflowDefinitions
    .find((item) => item.id === id)
    ?.outputs?.some((requirement) => requirement.id === gradeIds[0])

const gradeText = (grade: number) =>
  new Intl.NumberFormat('es-EC', { maximumFractionDigits: 2 }).format(grade)

const percent = (grade: number) => `${(grade / maximumGrade) * 100}%`

const parsedGrade = (text: string) => {
  const grade = numeric(text.replace(',', '.'))
  return grade !== undefined && grade >= 0 && grade <= maximumGrade ? grade : undefined
}

function GradeInput({ label, initial, onSave }: { label: string; initial?: number; onSave: (grade: number) => void }) {
  const [text, setText] = useState(initial === undefined ? '' : String(initial))
  const grade = parsedGrade(text)
  const invalid = text.trim() !== '' && grade === undefined
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initial !== undefined) input.current?.focus()
  }, [initial])

  function commit() {
    if (grade !== undefined && grade !== initial) onSave(grade)
  }

  function confirmOnEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') commit()
  }

  return (
    <label className="grade-input">
      <span>¿Ya llegó? Regístrala</span>
      <span className="grade-input-box">
        <input
          inputMode="decimal"
          aria-label={`Nota del ${label.toLowerCase()}`}
          aria-invalid={invalid}
          placeholder="0–10"
          value={text}
          ref={input}
          onChange={(event) => setText(event.target.value)}
          onBlur={commit}
          onKeyDown={confirmOnEnter}
        />
        <span aria-hidden="true">/ 10</span>
      </span>
      {invalid && <small className="error">Escribe una nota de 0 a 10.</small>}
    </label>
  )
}

function gradeCardClass(grade: number | undefined, revealed: boolean, locked: boolean) {
  const states = [
    revealed && 'is-revealed',
    revealed && grade! < passingAverage && 'is-low',
    locked && 'is-locked',
  ]
  return ['grade-card', ...states.filter(Boolean)].join(' ')
}

function GradeCard({
  label,
  grade,
  locked,
  onSave,
}: {
  label: string
  grade?: number
  locked: boolean
  onSave: (grade: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const revealed = grade !== undefined && !editing

  function save(next: number) {
    setEditing(false)
    onSave(next)
  }

  return (
    <article className={gradeCardClass(grade, revealed, locked)} aria-label={label}>
      <span className="grade-card-label">{label}</span>
      {revealed ? (
        <>
          <strong className="grade-card-value" key={grade}>
            {gradeText(grade)}
            <span>/ 10</span>
          </strong>
          <span className="grade-card-bar" aria-hidden="true">
            <span style={{ width: percent(grade) }} />
          </span>
          <button type="button" className="grade-card-edit" onClick={() => setEditing(true)}>
            <Pencil size={13} aria-hidden="true" /> Corregir
          </button>
        </>
      ) : locked ? (
        <>
          <span className="grade-card-mystery" aria-hidden="true"><Lock size={26} /></span>
          <span className="grade-card-hint">Se habilita cuando tu solicitud de calificadores esté lista.</span>
        </>
      ) : (
        <>
          {grade === undefined && (
            <>
              <span className="grade-card-mystery" aria-hidden="true">?</span>
              <span className="grade-card-hint">
                <span className="grade-card-dots" aria-hidden="true"><i /><i /><i /></span>
                Esperando su nota
              </span>
            </>
          )}
          <GradeInput label={label} initial={grade} onSave={save} />
        </>
      )}
    </article>
  )
}

function AverageReveal({ summary }: { summary: GradingSummary }) {
  if (summary.average === undefined) {
    const missing = gradeIds.length - summary.received
    return (
      <div className="grade-average is-pending">
        <span className="grade-average-label">Promedio</span>
        <strong className="grade-average-value">?</strong>
        <p>
          {missing === gradeIds.length
            ? 'Se revela cuando lleguen las dos notas.'
            : 'Falta una nota para revelarlo.'}
        </p>
      </div>
    )
  }
  return (
    <div className={`grade-average ${summary.passed ? 'is-passed' : 'is-low'}`}>
      <span className="grade-average-label">Promedio</span>
      <strong className="grade-average-value" key={summary.average}>
        {gradeText(summary.average)}
        <span>/ 10</span>
      </strong>
      <span className="grade-average-scale" aria-hidden="true">
        <span className="grade-average-fill" style={{ width: percent(summary.average) }} />
        <span className="grade-average-mark" style={{ left: percent(passingAverage) }}>
          <span>{passingAverage}</span>
        </span>
      </span>
      {summary.passed ? (
        <>
          <p className="grade-average-verdict">
            <PartyPopper size={18} aria-hidden="true" /> ¡Aprobaste la calificación!
          </p>
          <p>Vuelve a Biblioteca con el trabajo corregido para empezar las firmas.</p>
          <a className="button primary" href={`#/proceso/${libraryStepId}`}>
            Ir a Biblioteca: firma del estudiante <ArrowRight size={16} aria-hidden="true" />
          </a>
        </>
      ) : (
        <>
          <p className="grade-average-verdict">
            <TriangleAlert size={18} aria-hidden="true" /> Promedio menor a 7
          </p>
          <p>
            La Unidad de Titulación convoca en 5 días término a calificadores, tutor y estudiante. Entregas el
            trabajo corregido en 8 días término y se vuelve a calificar.
          </p>
        </>
      )}
    </div>
  )
}

export function GradingBoard({ definition, status }: { definition: WorkflowDefinition; status: InformationalStatus }) {
  const { workspace } = useWorkspace()
  const designationId = applicableDependencies(definition, workspace, catalog).find(recordsGrades)
  return designationId ? <GradingPanel designationId={designationId} locked={status === 'blocked'} /> : null
}

function GradingPanel({ designationId, locked }: { designationId: string; locked: boolean }) {
  const { workspace, refresh } = useWorkspace()
  const summary = gradingSummary(taskFor(designationId, workspace).requirementChecks)

  async function saveGrade(id: string, grade: number) {
    const latest = await repository.loadWorkspace()
    const current = taskFor(designationId, latest)
    await persistTask({ ...current, requirementChecks: { ...current.requirementChecks, [id]: grade } }, current)
    await refresh()
  }

  return (
    <section className="grading-board" aria-labelledby="grading-board-title">
      <header className="grading-board-head">
        <h3 id="grading-board-title">Tus calificaciones</h3>
        <span>{summary.received} de {gradeIds.length} notas</span>
      </header>
      <div className="grading-cards">
        {gradeIds.map((id, index) => (
          <GradeCard
            key={id}
            label={`${index === 0 ? 'Primer' : 'Segundo'} calificador`}
            grade={summary.grades[index]}
            locked={locked}
            onSave={(grade) => void saveGrade(id, grade)}
          />
        ))}
      </div>
      <AverageReveal summary={summary} />
      <p className="grading-board-note">Las notas quedan guardadas en la designación de calificadores.</p>
    </section>
  )
}
