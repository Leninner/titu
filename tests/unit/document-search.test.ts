import { describe, expect, it } from 'vitest'
import { catalog } from '../../src/catalog'
import { emptyWorkspace, newProfile } from '../../src/domain/types'
import { documentCategories, matchesCategory } from '../../src/features/documents/document-categories'

const workspace = () => ({ ...emptyWorkspace(), profile: newProfile() })
const search = (query: string, w = workspace()) =>
  documentCategories(w, catalog)
    .filter((category) => matchesCategory(category, query, w))
    .map((category) => category.id)

describe('document search', () => {
  it('ignores accents, case and word order', () => {
    expect(search('record')).toContain('record')
    expect(search('ACADEMICO récord')).toContain('record')
    expect(search('aptitud legal')).toEqual(['solicitud-aptitud', 'aptitud-legal'])
  })

  it('matches uploaded file names', () => {
    const w = workspace()
    w.documents.push({ id: 'd1', name: 'Mi archivo', category: 'personal', createdAt: '' })
    w.versions.push({
      id: 'v1', documentId: 'd1', blobId: 'b1', originalName: 'cedula-escaneada.pdf',
      mime: 'application/pdf', size: 1, sha256: '', createdAt: '',
      signatureStatus: 'unsigned', textualPdfStatus: 'unknown',
    })
    expect(search('escaneada', w)).toEqual(['personal'])
  })

  it('returns everything for an empty query', () => {
    expect(search('  ')).toHaveLength(documentCategories(workspace(), catalog).length)
  })
})
