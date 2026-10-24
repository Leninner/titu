import { useEffect, useState } from 'react'
import { ArrowUpRight, CalendarDays, FilePlus2, FolderPlus } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { catalog } from '../../catalog'
import { homeOverview } from '../../domain/home-overview'
import { CurrentTasks, FocusCard } from './HomeFocus'
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
  const overview = homeOverview(workspace, catalog, now)
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
      <FocusCard
        node={overview.focus}
        completed={overview.completed}
        total={overview.total}
        ticks={overview.nodes.map((node) => node.status === 'done')}
      />
      <CurrentTasks nodes={overview.current} />
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
