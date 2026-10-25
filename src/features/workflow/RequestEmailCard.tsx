import { useState } from 'react'
import { Check, Copy, Mail } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { buildRequestEmail } from '../../domain/submission-email'
import type { RequestEmail } from '../../domain/types'
import { RequestAttachments } from './RequestAttachments'

function CopyIcon({ done }: { done: boolean }) {
  return done ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />
}

export function RequestEmailCard({ email }: { email: RequestEmail }) {
  const { workspace } = useWorkspace()
  const [copied, setCopied] = useState('')
  const { to, subject, body } = buildRequestEmail(email, workspace.profile)
  const copy = async (part: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(part)
  }
  return (
    <section className="request-email" aria-label="Correo de la solicitud">
      <div className="request-email-head">
        <Mail size={16} aria-hidden="true" />
        <span className="request-email-to">Para {to}</span>
        <button type="button" onClick={() => void copy('to', to)}>
          <CopyIcon done={copied === 'to'} /> Copiar destinatario
        </button>
      </div>
      <div className="request-email-head">
        <strong>{subject}</strong>
        <button type="button" onClick={() => void copy('subject', subject)}>
          <CopyIcon done={copied === 'subject'} /> Copiar asunto
        </button>
        <button type="button" onClick={() => void copy('body', body)}>
          <CopyIcon done={copied === 'body'} /> Copiar mensaje
        </button>
      </div>
      <p className="request-email-body">{body}</p>
      {email.attachments?.length ? <RequestAttachments attachments={email.attachments} /> : null}
    </section>
  )
}
