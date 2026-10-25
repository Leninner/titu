import { Plus } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { annexTitle, currentDraft, peopleSummary, type AnnexCard, type AnnexStatus } from '../../domain/annex-index'
import { downloadAnnex } from './export-annex'
import { DownloadMenu } from './DownloadMenu'

const statusLabels: Record<AnnexStatus, string> = {
  empty: 'Sin empezar',
  incomplete: 'Faltan datos',
  draft: 'Borrador',
  exported: 'Exportado',
  signed: 'Firmado',
}

export function AnnexIndexCard({
  card,
  onCreate,
  createBlockedReason,
}: {
  card: AnnexCard
  onCreate: () => void
  createBlockedReason?: string
}) {
  const { workspace, run, busy } = useWorkspace()
  const { template, draft, status, downloadable } = card
  const { code, title, period } = annexTitle(template, draft)
  const name = [code, title, period].filter(Boolean).join(' · ')
  return (
    <article className="annex-card" aria-label={name}>
      <div className="annex-card-top">
        <span className="annex-card-code">{code ?? 'Formato'}</span>
        <span className={`annex-status is-${status}`}>{statusLabels[status]}</span>
      </div>
      <h3>{title}</h3>
      {period && <p className="annex-card-period">{period}</p>}
      <p className="annex-card-people">{peopleSummary(template, workspace.profile?.modalidad)}</p>
      <div className="annex-card-actions">
        {draft ? (
          <>
            <a className="button primary" href={`#/anexos/${draft.id}`}>Abrir</a>
            <DownloadMenu
              name={name}
              disabled={busy || !downloadable}
              onDownload={(format) => void run(() => downloadAnnex(currentDraft(draft, workspace), format))}
            />
          </>
        ) : (
          <button
            type="button"
            className="primary"
            disabled={busy || !!createBlockedReason}
            title={createBlockedReason}
            aria-label={`Crear ${name}`}
            onClick={onCreate}
          >
            <Plus size={15} aria-hidden="true" /> Crear
          </button>
        )}
      </div>
      {createBlockedReason && !draft && <p className="annex-card-hint">{createBlockedReason}</p>}
    </article>
  )
}
