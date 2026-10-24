import { expect, it } from 'vitest'
import { copyToNextMonth, createRequestDraft, validateAnnex, withCurrentProfile } from '../../src/domain/annex'
import { buildFinalReport, compareFinalReport } from '../../src/domain/final-report'
import { annexFixture } from '../fixtures/annexes'

it('validates progress including zero, dates, topic and activity content', () => {
  const draft = annexFixture()
  for (const progress of ['0', '100']) {
    draft.fields.avance = progress
    expect(validateAnnex(draft).valid).toBe(true)
  }
  draft.fields.avance = '101'
  expect(validateAnnex(draft).errors.avance).toBeDefined()
  draft.fields.fecha = '2026-02-30'
  draft.fields.tema = 'Un tema diferente'
  draft.activities[0].description = ''
  expect(validateAnnex(draft).errors).toHaveProperty('fecha')
  expect(validateAnnex(draft).errors).toHaveProperty('tema')
  expect(validateAnnex(draft).errors['activities.0.description']).toBeDefined()
})
it('copies next month without mutating original or carrying activities and progress', () => {
  const original = annexFixture()
  original.monthlyPeriod = '2026-12'
  const copy = copyToNextMonth(original)
  expect(copy.monthlyPeriod).toBe('2027-01')
  expect(copy.activities).toEqual([])
  expect(copy.fields.avance).toBe('')
  expect(original.activities).toHaveLength(2)
  expect(original.fields.avance).toBe('100')
})
it('consolidates exact activities with origins and detects stale sources', () => {
  const monthly = annexFixture()
  const final = buildFinalReport([monthly])
  expect(final.fields.avance).toBe('')
  expect(final.activities.map((activity) => activity.description)).toEqual(
    monthly.activities.map((activity) => activity.description),
  )
  expect(final.activities[0]).toMatchObject({
    sourceDraftId: monthly.id,
    sourceRevision: monthly.revision,
  })
  expect(validateAnnex(final).valid).toBe(false)
  final.fields = { ...final.fields, fecha: '2026-10-22', avance: '100', mensualesRevisados: 'true' }
  expect(validateAnnex(final).valid).toBe(true)
  expect(compareFinalReport(final, [{ ...monthly, revision: 2 }])).toHaveLength(1)
  expect(() => buildFinalReport([])).toThrow()
})
it('blocks export of activities outside the monthly report period', () => {
  const draft = annexFixture()
  draft.monthlyPeriod = '2026-11'
  draft.activities[0].date = '2026-10-31'
  expect(validateAnnex(draft).errors['activities.0.date']).toBeDefined()
})
it('rejects progress below the previous report, allowing equal progress', () => {
  const previous = annexFixture()
  previous.fields.avance = '65'
  const current = annexFixture()
  current.fields.avance = '64'
  expect(validateAnnex(current, previous).errors.avance).toContain('65%')
  current.fields.avance = '65'
  expect(validateAnnex(current, previous).errors.avance).toBeUndefined()
})

it('creates a request draft dated today in Ambato with the latest phone numbers', () => {
  const older = { ...annexFixture('anexo-1'), updatedAt: '2026-08-01T00:00:00Z' }
  older.fields = { ...older.fields, telefono: '032000000', celular: '0990000000' }
  const newer = { ...annexFixture('anexo-15'), updatedAt: '2026-09-01T00:00:00Z' }
  newer.fields = { ...newer.fields, telefono: '', celular: '0991111111' }
  const draft = createRequestDraft('anexo-10-research', older.profileSnapshot, '2026-10-23', [older, newer])
  expect(draft.templateId).toBe('anexo-10-research')
  expect(draft.fields).toEqual({
    lugar: 'Ambato',
    fecha: '2026-10-23',
    telefono: '032000000',
    celular: '0991111111',
  })
})

it('refreshes a request draft with the current profile only when it changed', () => {
  const draft = annexFixture('cumplimiento-empresarial')
  expect(withCurrentProfile(draft, draft.profileSnapshot)).toBe(draft)
  const profile = { ...draft.profileSnapshot, representante: 'Nuevo Gerente', celularRepresentante: '0998887776' }
  const refreshed = withCurrentProfile(draft, profile)
  expect(refreshed.profileSnapshot).toMatchObject({ representante: 'Nuevo Gerente', celularRepresentante: '0998887776' })
  expect(refreshed.fields).toEqual(draft.fields)
})

it('fills the academic cycle of a request from the profile period', () => {
  const profile = annexFixture('anexo-1').profileSnapshot
  expect(createRequestDraft('solicitud-habilitantes', profile, '2026-10-24').fields.ciclo).toBe('julio – diciembre 2026')
  expect(createRequestDraft('anexo-10-research', profile, '2026-10-24').fields.ciclo).toBeUndefined()
})
