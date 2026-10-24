import type { AnnexDraft } from '../domain/types'
import { validateAnnex } from '../domain/annex'
import { buildDocumentModel } from './document-model'

export class AnnexValidationError extends Error {
  constructor(public errors: Record<string, string>) {
    super('Revisa los campos obligatorios antes de exportar')
    this.name = 'AnnexValidationError'
  }
}
export async function renderAnnex(input: AnnexDraft, format: 'pdf' | 'docx'): Promise<Blob> {
  const draft = structuredClone(input)
  const validation = validateAnnex(draft)
  if (!validation.valid) throw new AnnexValidationError(validation.errors)
  const model = buildDocumentModel(draft)
  if (format === 'docx') return (await import('./docx')).renderDocx(model)
  return (await import('./pdf')).renderPdf(model)
}
