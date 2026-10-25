import { expect, it } from 'vitest'
import { latestCategoryVersion } from '../../src/domain/category-versions'
import { emptyWorkspace, type DocumentVersion } from '../../src/domain/types'

const version = (id: string, documentId: string, createdAt: string): DocumentVersion => ({
  id,
  documentId,
  blobId: `blob-${id}`,
  originalName: `${id}.pdf`,
  mime: 'application/pdf',
  size: 1,
  sha256: id,
  createdAt,
  signatureStatus: 'unsigned',
  textualPdfStatus: 'unknown',
})

it('returns the newest version of a category across its documents', () => {
  const workspace = {
    ...emptyWorkspace(),
    documents: [
      { id: 'cedula', name: 'cedula.pdf', category: 'personal', createdAt: '2026-10-01' },
      { id: 'otro', name: 'otro.pdf', category: 'record', createdAt: '2026-10-01' },
    ],
    versions: [
      version('old', 'cedula', '2026-10-01T10:00:00Z'),
      version('new', 'cedula', '2026-10-03T10:00:00Z'),
      version('other', 'otro', '2026-10-05T10:00:00Z'),
    ],
  }
  expect(latestCategoryVersion(workspace, 'personal')?.id).toBe('new')
})

it('returns nothing when the category has no files', () => {
  expect(latestCategoryVersion(emptyWorkspace(), 'personal')).toBeUndefined()
})
