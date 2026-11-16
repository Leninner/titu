import { expect, it } from 'vitest'
import { gradingSummary } from '../../src/domain/grading'

it('hides the average until both grades are recorded', () => {
  expect(gradingSummary({ 'grade-1': 8.5 })).toEqual({ grades: [8.5, undefined], received: 1 })
})

it('reveals a passing average once both grades arrive', () => {
  expect(gradingSummary({ 'grade-1': 8, 'grade-2': '9' })).toEqual({
    grades: [8, 9],
    received: 2,
    average: 8.5,
    passed: true,
  })
})

it('flags an average below seven', () => {
  expect(gradingSummary({ 'grade-1': 6, 'grade-2': 7 })).toMatchObject({ average: 6.5, passed: false })
})

it('ignores grades outside zero to ten', () => {
  expect(gradingSummary({ 'grade-1': 12, 'grade-2': '' })).toEqual({ grades: [undefined, undefined], received: 0 })
})
