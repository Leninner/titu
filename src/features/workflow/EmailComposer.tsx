import { useState } from 'react'
import { Check, Copy, Mail, Paperclip } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import type { TaskRecord, WorkflowDefinition } from '../../domain/types'
import { buildSubmissionEmail } from '../../domain/submission-email'

export function EmailComposer({
  definition,
  task,
  recipient,
  onRecipientChange,
}: {
  definition: WorkflowDefinition
  task: TaskRecord
  recipient: string
  onRecipientChange: (value: string) => void
}) {
  const { workspace, run } = useWorkspace()
  const [copyReceipt, setCopyReceipt] = useState({ part: '', content: '' })
  const [customBody, setCustomBody] = useState<{ body: string; original: string } | null>(null)
  const email = buildSubmissionEmail(definition, task, workspace, recipient)
  const body = customBody?.body ?? email.body
  const content = `${recipient}\n${email.subject}\n${body}`
  const copied = copyReceipt.content === content ? copyReceipt.part : ''
  const copy = (part: string, text: string) =>
    void run(async () => {
      await navigator.clipboard.writeText(text)
      setCopyReceipt({ part, content })
    })
  return (
    <section className="email-composer">
      <div className="email-heading">
        <div>
          <Mail size={18} />
          <h3>Tu correo, preparado</h3>
        </div>
        <span className="draft-tag">Borrador</span>
      </div>
      <div className="email-meta">
        <label>
          <span>Para</span>
          <input
            aria-label="Destinatario (verificar)"
            placeholder="Confirma el correo institucional"
            value={recipient}
            onChange={(event) => onRecipientChange(event.target.value)}
          />
        </label>
        <div>
          <span>Asunto</span>
          <strong>{email.subject}</strong>
          <button
            className="icon-button"
            title="Copiar asunto"
            aria-label="Copiar asunto"
            onClick={() => copy('subject', email.subject)}
          >
            {copied === 'subject' ? <Check size={15} /> : <Copy size={15} />}
          </button>
        </div>
      </div>
      <label className="email-body">
        <span className="visually-hidden">Mensaje de correo</span>
        <textarea
          value={body}
          onChange={(event) =>
            setCustomBody({
              body: event.target.value,
              original: customBody?.original ?? email.body,
            })
          }
          rows={13}
        />
      </label>
      {customBody && customBody.original !== email.body && (
        <p className="notice">
          Los datos o archivos cambiaron. Revisa tu mensaje editado o restablece el borrador para
          actualizarlo.
        </p>
      )}
      <div className="email-attachments">
        <Paperclip size={15} />
        <span>
          {email.attachmentCount
            ? `${email.attachmentCount} documentos seleccionados`
            : 'Todavía no seleccionaste documentos'}
        </span>
        <small>Adjunta el ZIP manualmente</small>
      </div>
      <div className="email-actions">
        <button
          className="primary"
          onClick={() =>
            copy(
              'all',
              `Para: ${recipient || '[Confirmar destinatario]'}\nAsunto: ${email.subject}\n\n${body}`,
            )
          }
        >
          {copied === 'all' ? <Check size={16} /> : <Copy size={16} />}
          {copied === 'all' ? 'Correo copiado' : 'Copiar correo completo'}
        </button>
        <button onClick={() => copy('body', body)}>
          {copied === 'body' ? 'Mensaje copiado' : 'Solo el mensaje'}
        </button>
        {customBody !== null && (
          <button className="text-button" onClick={() => setCustomBody(null)}>
            Restablecer borrador
          </button>
        )}
      </div>
    </section>
  )
}
