import { useState } from 'react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { Field } from '../../components/Field'
import type { TaskRecord, WorkflowDefinition } from '../../domain/types'
import { EmailComposer } from './EmailComposer'

export function SendStep({
  definition,
  task,
  ready,
  onSubmit,
}: {
  definition: WorkflowDefinition
  task: TaskRecord
  ready: boolean
  onSubmit: (recipient: string, sentAt: string) => void
}) {
  const { workspace, busy } = useWorkspace()
  const [recipient, setRecipient] = useState('')
  const [sentAt, setSentAt] = useState('')
  const submissions = workspace.submissions
    .filter((submission) => submission.taskId === task.id)
    .sort((a, b) => a.sentAt.localeCompare(b.sentAt))
  return (
    <>
      <div id="task-email" className="task-email-step">
        <EmailComposer
          definition={definition}
          task={task}
          recipient={recipient}
          onRecipientChange={setRecipient}
        />
      </div>
      <section className="submission-register" aria-labelledby="submission-register-title">
        <h3 id="submission-register-title">Registro del envío</h3>
        <Field
          name="sentAt"
          label="Fecha y hora del envío realizado (Ecuador)"
          type="datetime-local"
          value={sentAt}
          onChange={(event) => setSentAt(event.target.value)}
        />
        <button
          disabled={busy || !sentAt || !recipient || (!ready && !task.note.trim())}
          onClick={() => onSubmit(recipient, sentAt)}
        >
          Confirmar que ya lo envié
        </button>
        {!ready && (
          <p className="hint">Un envío histórico incompleto se registra con sus faltantes en Observaciones.</p>
        )}
      </section>
      {submissions.length > 0 && (
        <section className="task-submissions" aria-labelledby="task-submissions-title">
          <h3 id="task-submissions-title">Entregas registradas</h3>
          {submissions.map((submission) => (
            <p key={submission.id}>
              {submission.sentAt} · {submission.recipient} · {submission.exactVersionIds.length}{' '}
              versiones fijadas. {submission.note}
            </p>
          ))}
        </section>
      )}
    </>
  )
}
