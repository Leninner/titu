import { useWorkspace } from '../../app/WorkspaceContext'
import type { AnnexDraft } from '../../domain/types'

export function DraftReviewNotice({ draft, update }: { draft: AnnexDraft; update: (next: AnnexDraft) => void }) {
  const { workspace } = useWorkspace()
  const profile = workspace.profile
  if (!draft.needsReview || !profile) return null
  return (
    <div className="notice">
      <p>Cambiaste la modalidad, el período, el tema o la resolución en tu perfil. Actualiza los datos del documento y revísalo antes de descargar.</p>
      <button
        type="button"
        onClick={() => update({ ...draft, profileSnapshot: { ...profile }, needsReview: false })}
      >
        Actualizar datos y revisar campos
      </button>
    </div>
  )
}
