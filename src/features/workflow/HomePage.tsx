import { useEffect, useState } from 'react'
import { ArrowRight, ArrowUpRight, CalendarDays, FilePlus2, FolderPlus, Clock3 } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { catalog } from '../../catalog'
import { applicableWorkflows, evaluateTask } from '../../domain/workflow'
import { taskFor } from './task-record'
import { Timeline } from '../calendar/Timeline'
import { NaturalDateInput } from '../../components/NaturalDateInput'
import { repository } from '../../storage/repository'

export function HomePage() {
  const { workspace, run, busy } = useWorkspace()
  const [now, setNow] = useState(() => new Date())
  const [addingDate, setAddingDate] = useState(false)
  const [date, setDate] = useState('')
  const [title, setTitle] = useState('')
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])
  const definitions = applicableWorkflows(workspace, catalog).filter(
    (definition) => !definition.optional,
  )
  const outstanding = definitions.filter(
    (definition) => taskFor(definition.id, workspace).status !== 'completed',
  )
  const waiting = outstanding.filter((definition) =>
    ['waiting', 'submitted'].includes(taskFor(definition.id, workspace).status),
  )
  const next = outstanding.find(
    (definition) =>
      !['waiting', 'submitted'].includes(taskFor(definition.id, workspace).status) &&
      definition.dependsOn.every(
        (id) =>
          !definitions.some((item) => item.id === id) ||
          taskFor(id, workspace).status === 'completed',
      ),
  )
  const evaluation = next
    ? evaluateTask(taskFor(next.id, workspace), workspace, catalog, now)
    : null
  const dateLabel = new Intl.DateTimeFormat('es-EC', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Guayaquil',
  }).format(now)
  return (
    <div className="page home">
      <header className="home-heading">
        <div>
          <h1>
            {workspace.profile?.nombres
              ? `Hola, ${workspace.profile.nombres.split(' ')[0]}`
              : 'Tu titulación, paso a paso'}
          </h1>
          <p>{dateLabel}</p>
        </div>
        <span className="quiet-label">Tu espacio de titulación</span>
      </header>
      <section className="focus-action" aria-label="Tu próximo trámite">
        <div className="focus-copy">
          <h2>{next?.title ?? (waiting.length ? 'Esperando respuesta' : 'Todo al día')}</h2>
          {evaluation && (
            <p>
              {evaluation.missingRequirements.length
                ? `${evaluation.missingRequirements.length} requisitos por completar`
                : 'Los requisitos están registrados'}
            </p>
          )}
          {!next && waiting.length > 0 && <p>{waiting.length} gestiones en espera.</p>}
          <a
            className="button primary"
            href={
              next
                ? `#/proceso/${next.id}`
                : waiting.length
                  ? `#/proceso/${waiting[0].id}`
                  : '#/documentos'
            }
          >
            {next ? 'Continuar trámite' : waiting.length ? 'Ver seguimiento' : 'Ver documentos'}
            <ArrowRight size={17} />
          </a>
        </div>
        <div className="focus-index">
          <span>{definitions.length - outstanding.length}</span>
          <small>de {definitions.length} etapas</small>
          <div className="stage-ticks" aria-hidden="true">
            {definitions.map((definition) => (
              <i
                key={definition.id}
                className={taskFor(definition.id, workspace).status === 'completed' ? 'done' : ''}
              />
            ))}
          </div>
        </div>
      </section>
      <div className="home-workspace">
        <Timeline workspace={workspace} now={now} />
        <section className="home-shortcuts">
          <h2>A mano</h2>
          <a href="#/documentos" className="quick-action">
            <span>
              <FolderPlus size={19} />
            </span>
            <div>
              Agregar documentos<small>Arrástralos a su categoría</small>
            </div>
            <ArrowUpRight size={16} />
          </a>
          <a href="#/anexos" className="quick-action">
            <span>
              <FilePlus2 size={19} />
            </span>
            <div>
              Preparar un anexo
              <small>
                {workspace.drafts.length
                  ? `${workspace.drafts.length} borradores guardados`
                  : 'Word y PDF desde tus datos'}
              </small>
            </div>
            <ArrowUpRight size={16} />
          </a>
          <button
            className="quick-action"
            onClick={() => setAddingDate(!addingDate)}
            aria-expanded={addingDate}
          >
            <span>
              <CalendarDays size={19} />
            </span>
            <div>
              Agregar una fecha<small>Escribe como lo dirías</small>
            </div>
            <ArrowUpRight size={16} />
          </button>
          {addingDate && (
            <form
              className="quick-date"
              onSubmit={(event) => {
                event.preventDefault()
                if (!date || !title.trim()) return
                void run(async () => {
                  await repository.savePersonalEvent({
                    id: crypto.randomUUID(),
                    title: title.trim(),
                    kind: 'personal',
                    startDate: date,
                    timeZone: 'America/Guayaquil',
                    modalities: [workspace.profile!.modalidad],
                    periodId: workspace.profile!.periodo,
                    sourceIds: [],
                    certainty: 'Fecha personal registrada por el estudiante',
                  })
                  setAddingDate(false)
                  setTitle('')
                  setDate('')
                })
              }}
            >
              <label className="field">
                <span>¿Qué tienes pendiente?</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Reunión con mi tutor"
                  required
                />
              </label>
              <NaturalDateInput
                label="¿Cuándo?"
                value={date}
                onChange={setDate}
                placeholder="El 21 de noviembre"
              />
              <button className="primary" disabled={busy || !date}>
                Agregar a mi agenda
              </button>
            </form>
          )}
          {waiting.length > 0 && (
            <div className="waiting-list">
              <h3>
                <Clock3 size={15} /> Esperando respuesta
              </h3>
              {waiting.slice(0, 3).map((definition) => (
                <a key={definition.id} href={`#/proceso/${definition.id}`}>
                  {definition.title}
                  <ArrowUpRight size={13} />
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
      <aside className="backup-reminder">
        <span>Solo en este navegador.</span>
        <a href="#/ajustes">
          Guardar un respaldo <ArrowUpRight size={13} />
        </a>
      </aside>
    </div>
  )
}
