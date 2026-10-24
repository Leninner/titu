import { expect, it } from 'vitest'
import { parseNaturalDate } from '../../src/domain/natural-date'

const now = new Date('2026-10-22T18:00:00Z')
it('parses Spanish dates and exposes inferred year for explicit confirmation', () => {
  expect(parseNaturalDate('el 21 de noviembre', now)).toEqual({
    date: '2026-11-21',
    label: '21 de noviembre de 2026',
    matchedText: 'el 21 de noviembre',
    inferredYear: true,
  })
  expect(parseNaturalDate('21 nov', now)).toMatchObject({ date: '2026-11-21', inferredYear: true })
  expect(parseNaturalDate('21/11/2026', now)).toMatchObject({
    date: '2026-11-21',
    inferredYear: false,
  })
  expect(parseNaturalDate('2026-11-21', now)).toMatchObject({
    date: '2026-11-21',
    inferredYear: false,
  })
})
it('uses Ecuador day instead of UTC or device day', () => {
  const midnightUtc = new Date('2026-11-01T02:00:00Z')
  expect(parseNaturalDate('hoy', midnightUtc)).toMatchObject({ date: '2026-10-31' })
  expect(parseNaturalDate('mañana', midnightUtc)).toMatchObject({ date: '2026-11-01' })
  expect(parseNaturalDate('en 3 días', now)).toMatchObject({ date: '2026-10-25' })
  expect(parseNaturalDate('el próximo lunes', now)).toMatchObject({ date: '2026-10-26' })
  expect(parseNaturalDate('el próximo lunes', new Date('2026-10-26T18:00:00Z'))).toMatchObject({
    date: '2026-11-02',
  })
})
it('selects the next occurrence including year rollover and leap years', () => {
  expect(parseNaturalDate('21 enero', now)).toMatchObject({
    date: '2027-01-21',
    label: '21 de enero de 2027',
    inferredYear: true,
  })
  expect(parseNaturalDate('29 feb', now)).toMatchObject({ date: '2028-02-29' })
  expect(parseNaturalDate('22 octubre', now)).toMatchObject({ date: '2026-10-22' })
})
it('rejects impossible dates and conflicting alternatives', () => {
  for (const value of [
    '31 de abril',
    '21/11/26',
    '21 nov 202',
    '29/02/2026',
    '2026-13-01',
    '0 nov',
    '21 nov o 22 nov',
    'mañana o el 21 de noviembre',
    'en 999999999 días',
  ])
    expect(parseNaturalDate(value, now)).toHaveProperty('error')
  expect(parseNaturalDate('21 nov y 21/11/2026', now)).toMatchObject({ date: '2026-11-21' })
  expect(parseNaturalDate('', now)).toBeNull()
  expect(parseNaturalDate('cuando confirme secretaría', now)).toBeNull()
})
it('recognizes past activity dates in full sentences', () => {
  expect(parseNaturalDate('ayer estuve en el curso haciendo x y y cosa', now)).toMatchObject({ date: '2026-10-21' })
  expect(parseNaturalDate('anteayer revisé el informe', now)).toMatchObject({ date: '2026-10-20' })
  expect(parseNaturalDate('hace 3 días hice pruebas', now)).toMatchObject({ date: '2026-10-19' })
  expect(parseNaturalDate('el lunes pasado documenté avances', now)).toMatchObject({ date: '2026-10-19' })
  expect(parseNaturalDate('el 7 de octubre hice pruebas', now, 2026)).toMatchObject({ date: '2026-10-07' })
})
