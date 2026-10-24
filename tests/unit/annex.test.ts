import { expect, it } from 'vitest'
import { copyToNextMonth, validateAnnex } from '../../src/domain/annex'
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
