import { useState } from 'react'
import { FilePen, Send, TriangleAlert } from 'lucide-react'
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
import { appendixStates, loadAppendixFiles, type AppendixState } from './request-appendices'

function currentDraft(templateId: string, profile: StudentProfile, workspace: Workspace, draft?: AnnexDraft) {
  return draft
    ? withCurrentProfile(draft, profile)
    : createRequestDraft(templateId, profile, ecuadorDate(), workspace.drafts)
}

function pdfLabel(states: AppendixState[]) {
  const included = states.filter((state) => state.version).map((state) => state.appendix.label)
  return ['PDF', ...included].join(' + ')
}

function MissingAppendices({ states }: { states: AppendixState[] }) {
  const missing = states.filter((state) => !state.version).map((state) => state.appendix.label)
  if (!missing.length) return null
  return (
    <a className="missing-appendix" href="#/documentos" title="Súbela en Documentos para unirla al PDF">
      <TriangleAlert size={14} aria-hidden="true" /> Falta {missing.join(', ')}
    </a>
  )
}

export function RequestButton({ requirement }: { requirement: Requirement }) {
  const { workspace, run, busy } = useWorkspace()
  const [open, setOpen] = useState(false)
  const { template: templateId, requestEmail } = requirement
  const template = catalog.templates.find((item) => item.id === templateId)
  const draft = templateId ? latestDraft(workspace, templateId) : undefined
  const title = template?.name ?? requirement.label
  const appendices = appendixStates(workspace, requirement.letterAppendices)

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
          {draft && (
            <AnnexDraftEditor
              key={draft.id}
              initial={draft}
              label={title}
              pdf={{ label: pdfLabel(appendices), appendices: () => loadAppendixFiles(appendices) }}
              extraActions={() => <MissingAppendices states={appendices} />}
            />
          )}
        </Dialog>
      )}
    </>
  )
}
