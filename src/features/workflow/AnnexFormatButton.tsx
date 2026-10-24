import { useState } from 'react'
import { FilePen } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { catalog } from '../../catalog'
import { Dialog } from '../../components/Dialog'
import { createRequestDraft, withCurrentProfile } from '../../domain/annex'
import { ecuadorDate } from '../../domain/dates'
import { latestDraft } from '../../domain/workflow'
import { repository } from '../../storage/repository'
import { AnnexDraftEditor } from '../annexes/AnnexDraftEditor'

export function AnnexFormatButton({ templateId }: { templateId: string }) {
  const { workspace, run, busy } = useWorkspace()
  const [open, setOpen] = useState(false)
  const template = catalog.templates.find((item) => item.id === templateId)!
  const draft = latestDraft(workspace, templateId)

  async function openFormat() {
    const profile = workspace.profile
    if (!profile) return
    const current = draft
      ? withCurrentProfile(draft, profile)
      : createRequestDraft(templateId, profile, ecuadorDate(), workspace.drafts)
    if (current !== draft && !(await run(() => repository.saveDraft(current, draft?.revision ?? 0)))) return
    setOpen(true)
  }

  return (
    <>
      <button
        type="button"
        className="req-format-button"
        disabled={busy}
        title={`Llenar y descargar ${template.name}`}
        onClick={() => void openFormat()}
      >
        <FilePen size={14} aria-hidden="true" /> Formato
      </button>
      {open && draft && (
        <Dialog title={template.name} wide onClose={() => setOpen(false)}>
          <AnnexDraftEditor key={draft.id} initial={draft} label={template.name} />
        </Dialog>
      )}
    </>
  )
}
