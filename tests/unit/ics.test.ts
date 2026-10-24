import { expect, it } from 'vitest'
import { exportCalendarIcs } from '../../src/export/ics'
import type { CalendarEvent } from '../../src/domain/types'
const event: CalendarEvent = {
  id: 'e',
  title: 'Notas, firmas; revisión\nPersonal',
  kind: 'window',
  startDate: '2026-11-16',
  endDate: '2026-11-20',
  timeZone: 'America/Guayaquil',
  modalities: ['research'],
  periodId: '2026-07-12',
  sourceIds: ['CAL-01'],
  certainty: 'confirmed',
}
it('exports exclusive window end and escapes text with stable identity', () => {
  const ics = exportCalendarIcs([event])
  expect(ics).toContain('DTSTART;VALUE=DATE:20261116')
  expect(ics).toContain('DTEND;VALUE=DATE:20261121')
  expect(ics).toContain('Notas\\, firmas\\; revisión\\nPersonal')
  expect(ics).toContain('CAL-01')
  expect(ics.match(/UID:.+/)?.[0]).toBe(
    exportCalendarIcs([{ ...event, title: 'Changed' }]).match(/UID:.+/)?.[0],
  )
})
it('preserves timed closing boundary and UTC instant', () => {
  const ics = exportCalendarIcs([{ ...event, localTime: '18:00' }])
  expect(ics).toContain('DTEND:20261120T230000Z')
  expect(
    exportCalendarIcs([
      {
        ...event,
        kind: 'deadline',
        startDate: '2026-11-19',
        endDate: undefined,
        localTime: '18:00',
      },
    ]),
  ).toContain('DTSTART:20261119T230000Z')
})
it('folds Unicode lines at 75 bytes and keeps actual appointment times', () => {
  const ics = exportCalendarIcs([
    {
      ...event,
      kind: 'appointment',
      endDate: undefined,
      localTime: '09:15',
      title: 'Á'.repeat(100),
    },
  ])
  expect(ics).toContain('DTSTART:20261116T141500Z')
  for (const line of ics.split('\r\n'))
    expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75)
  expect(ics.replaceAll('\r\n ', '')).toContain('SUMMARY:' + 'Á'.repeat(100))
})

it('includes provider reminders before a deadline and before a timed window closes', () => {
  const deadline = exportCalendarIcs([{ ...event, kind: 'deadline', endDate: undefined }])
  expect(deadline).toContain('TRIGGER:-P7D')
  expect(deadline).toContain('TRIGGER:-P3D')
  expect(deadline).toContain('TRIGGER:-P1D')

  const window = exportCalendarIcs([{ ...event, localTime: '18:00' }])
  expect(window).toContain('TRIGGER;RELATED=END:-P1D')
})
