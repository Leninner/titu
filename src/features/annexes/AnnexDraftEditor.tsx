import { useState, type ReactNode } from 'react'
import { CircleAlert, FileDown } from 'lucide-react'
import { errorMessage } from '../../components/download'
import { validateAnnex } from '../../domain/annex'
import type { AnnexDraft } from '../../domain/types'
import { AnnexDocument } from './AnnexDocument'
import { downloadAnnex } from './export-annex'
import { useDraftAutosave } from './useDraftAutosave'

export interface DraftActions {
  draft: AnnexDraft
  update: (next: AnnexDraft) => void
  working: boolean
  act: (action: () => Promise<void>) => Promise<void>
}

export function AnnexDraftEditor({
  initial,
  label,
  extraActions,
}: {
  initial: AnnexDraft
  label: string
  extraActions?: (actions: DraftActions) => ReactNode
}) {
  const { draft, update, flush, status } = useDraftAutosave(initial)
  const [error, setError] = useState('')
  const [working, setWorking] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const validation = validateAnnex(draft)
  const warnings = Object.values(validation.warnings)

  async function act(action: () => Promise<void>) {
    setWorking(true)
    setError('')
    try {
      await action()
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setWorking(false)
    }
  }

  const download = (format: 'pdf' | 'docx') =>
    act(async () => {
      setShowErrors(true)
      if (!validation.valid) throw new Error('Completa los campos marcados antes de descargar.')
      await downloadAnnex(await flush(), format)
    })

  return (
    <section className="annex-draft-editor" aria-label={label}>
      <div className="annex-draft-bar">
        <output className="save-status">{status}</output>
        {warnings.map((warning) => (
          <span key={warning} className="annex-draft-warning">
            <CircleAlert size={14} aria-hidden="true" /> {warning}
          </span>
        ))}
        <div className="annex-draft-actions">
          {extraActions?.({ draft, update, working, act })}
          <button type="button" disabled={working} aria-label="Descargar Word" onClick={() => void download('docx')}>
            <FileDown size={15} aria-hidden="true" /> Word
          </button>
          <button
            type="button"
            className="primary"
            disabled={working}
            aria-label="Descargar PDF"
            onClick={() => void download('pdf')}
          >
            <FileDown size={15} aria-hidden="true" /> PDF
          </button>
        </div>
      </div>
      {showErrors && !validation.valid && (
        <div className="notice error" role="alert">
          <ul>
            {[...new Set(Object.values(validation.errors))].map((message) => <li key={message}>{message}</li>)}
          </ul>
        </div>
      )}
      {error && <p className="error" role="alert">{error}</p>}
      <div className="document-canvas">
        <AnnexDocument draft={draft} onChange={update} errors={showErrors ? validation.errors : {}} />
      </div>
    </section>
  )
}
