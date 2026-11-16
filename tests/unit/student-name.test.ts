import { expect, it } from 'vitest'
import { shortName } from '../../src/domain/student-name'

it.each([
  ['Lenin Giovanni Mazabanda Pullutaxi', 'Lenin Mazabanda'],
  ['Lenin Mazabanda Pullutaxi', 'Lenin Mazabanda'],
  ['  Lenin   Mazabanda ', 'Lenin Mazabanda'],
  ['Lenin', 'Lenin'],
  ['', ''],
])('shortens %s to %s', (fullName, expected) => {
  expect(shortName(fullName)).toBe(expected)
})
