import { useState } from 'react'
import { FilePen, Send } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { catalog } from '../../catalog'
import { Dialog } from '../../components/Dialog'
import { createRequestDraft, withCurrentProfile } from '../../domain/annex'
import { ecuadorDate } from '../../domain/dates'
import type { AnnexDraft, Requirement, StudentProfile, Workspace } from '../../domain/types'
import { latestDraft } from '../../domain/workflow'
import { repository } from '../../storage/repository'
import { AnnexDraftEditor } from '../annexes/AnnexDraftEditor'
import { RequestEmailCard } from './RequestEmailCard'

function currentDraft(templateId: string, profile: StudentProfile, workspace: Workspace, draft?: AnnexDraft) {
  return draft
    ? withCurrentProfile(draft, profile)
    : createRequestDraft(templateId, profile, ecuadorDate(), workspace.drafts)
}

export function RequestButton({ requirement }: { requirement: Requirement }) {
  const { workspace, run, busy } = useWorkspace()
  const [open, setOpen] = useState(false)
  const { template: templateId, requestEmail } = requirement
  const template = catalog.templates.find((item) => item.id === templateId)
  const draft = templateId ? latestDraft(workspace, templateId) : undefined
  const title = template?.name ?? requirement.label

  async function openRequest() {
    const profile = workspace.profile
    if (templateId && profile) {
      const current = currentDraft(templateId, profile, workspace, draft)
      if (current !== draft && !(await run(() => repository.saveDraft(current, draft?.revision ?? 0)))) return
    }
    setOpen(true)
  }

  return (
    <>
      <button
        type="button"
        className="req-format-button"
        disabled={busy}
        title={requestEmail ? `Solicitar ${requirement.label}` : `Llenar y descargar ${title}`}
        onClick={() => void openRequest()}
      >
        {requestEmail ? <Send size={14} aria-hidden="true" /> : <FilePen size={14} aria-hidden="true" />}
        {requestEmail ? 'Solicitar' : 'Formato'}
      </button>
      {open && (!templateId || draft) && (
        <Dialog title={title} wide={!!draft} onClose={() => setOpen(false)}>
          {requestEmail && <RequestEmailCard email={requestEmail} />}
          {draft && <AnnexDraftEditor key={draft.id} initial={draft} label={title} />}
        </Dialog>
      )}
    </>
  )
}
