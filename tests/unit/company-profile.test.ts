import { expect, it } from 'vitest'
import { draftWithCompanySnapshot, profileWithCompany } from '../../src/domain/company-profile'
import { newProfile } from '../../src/domain/types'
import { annexFixture } from '../fixtures/annexes'

function legacyCompanyDraft(updatedAt: string, empresa: string) {
  const draft = annexFixture('cumplimiento-empresarial')
  const snapshot = { ...draft.profileSnapshot } as Record<string, unknown>
  for (const key of ['empresa', 'representante', 'telefonoRepresentante', 'celularRepresentante']) delete snapshot[key]
  return {
    ...draft,
    updatedAt,
    profileSnapshot: snapshot as unknown as typeof draft.profileSnapshot,
    fields: { ...draft.fields, empresa, representante: 'Luis Gerente', telefono: '032000000', celular: '0990000000' },
  }
}

it('fills an empty company profile from the latest company draft', () => {
  const drafts = [legacyCompanyDraft('2026-08-01T00:00:00Z', 'Antigua'), legacyCompanyDraft('2026-09-01T00:00:00Z', 'Actual')]
  const profile = profileWithCompany({ ...newProfile(), empresa: '' }, drafts)
  expect(profile).toMatchObject({
    empresa: 'Actual',
    representante: 'Luis Gerente',
    telefonoRepresentante: '032000000',
    celularRepresentante: '0990000000',
  })
  expect(profileWithCompany({ ...newProfile(), empresa: 'Guardada' }, drafts).empresa).toBe('Guardada')
})

it('moves the company fields of an old draft into its profile snapshot', () => {
  const draft = draftWithCompanySnapshot(legacyCompanyDraft('2026-09-01T00:00:00Z', 'Actual'))
  expect(draft.profileSnapshot).toMatchObject({ empresa: 'Actual', celularRepresentante: '0990000000' })
  const letter = annexFixture('anexo-10-research')
  expect(draftWithCompanySnapshot(letter)).toBe(letter)
})
