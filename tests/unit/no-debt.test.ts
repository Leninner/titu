import { expect, it } from 'vitest'
import { noDebtIssueDate } from '../../src/domain/no-debt'

it('reads the certificate date, the latest of the form dates', () => {
  const text = [
    'NO ADEUDA a ninguna de las siguientes dependencias: FECHA: 19/11/2026',
    '- BIBLIOTECA FACULTAD FECHA: 17/11/2026 NO ADEUDA',
    '- SECRETARIA DE FACULTAD FECHA: 19/11/2026 NO ADEUDA',
    '- LABORATORIOS Fecha: 18/11/2026',
  ].join(' ')
  expect(noDebtIssueDate(text)).toBe('2026-11-19')
})

it('returns nothing when the text has no date', () => {
  expect(noDebtIssueDate('FORMULARIO DE NO ADEUDAR')).toBeUndefined()
})
