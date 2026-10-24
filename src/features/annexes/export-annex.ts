import { templateEvidenceCategory } from '../../domain/annex'
import type { AnnexDraft, Workspace } from '../../domain/types'
import { repository } from '../../storage/repository'
import { downloadBlob } from '../../components/download'

export async function downloadAnnex(draft: AnnexDraft, format: 'pdf' | 'docx') {
  const { renderAnnex } = await import('../../export/render-annex')
  const blob = await renderAnnex(structuredClone(draft), format)
  const name = `${draft.name.replace(/[^\p{L}\p{N}_ -]/gu, '')}-r${draft.revision}.${format}`
  downloadBlob(blob, name)
  return { blob, name }
}

export async function exportAnnex(draft: AnnexDraft, format: 'pdf' | 'docx', workspace: Workspace) {
  const { blob, name } = await downloadAnnex(draft, format)
  const previous = workspace.versions.find((version) => version.sourceDraftId === draft.id)
  const version = await repository.addDocumentVersion({
    file: blob,
    originalName: name,
    documentId: previous?.documentId,
    category: templateEvidenceCategory(draft.templateId),
    sourceDraftId: draft.id,
    revision: draft.revision,
    signatureStatus: 'pending',
    textualPdfStatus: format === 'pdf' ? 'text-detected' : 'unknown',
  })
  return version
}
