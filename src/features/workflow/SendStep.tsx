import { useWorkspace } from '../../app/WorkspaceContext'
import type { TaskRecord, WorkflowDefinition } from '../../domain/types'
import { EmailComposer } from './EmailComposer'

const sentAtLabel = (timestamp: string) =>
  new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Guayaquil',
  }).format(new Date(timestamp))

export function SendStep({
  definition,
  task,
  ready,
  onSubmit,
}: {
  definition: WorkflowDefinition
  task: TaskRecord
  ready: boolean
  onSubmit: () => void
}) {
  const { workspace, busy } = useWorkspace()
  const submissions = workspace.submissions
    .filter((submission) => submission.taskId === task.id)
    .sort((a, b) => a.sentAt.localeCompare(b.sentAt))
  return (
    <>
      <EmailComposer definition={definition} task={task} />
      <div className="submission-confirm">
        <button className="primary" disabled={busy || !ready} onClick={onSubmit}>
          Confirmar envío
        </button>
        {!ready && <p className="hint">Preparar tiene requisitos pendientes.</p>}
      </div>
      {submissions.length > 0 && (
        <section className="task-submissions" aria-labelledby="task-submissions-title">
          <h3 id="task-submissions-title">Envíos confirmados</h3>
          <ul>
            {submissions.map((submission) => (
              <li key={submission.id}>
                {sentAtLabel(submission.sentAt)} · {submission.exactVersionIds.length} archivos
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
