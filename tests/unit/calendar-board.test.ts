import { expect, it } from 'vitest'
import {
  calendarWeek,
  eventsOnDate,
  eventTimeLabel,
  nextCalendarDate,
} from '../../src/features/calendar/CalendarBoard'
import type { CalendarEvent } from '../../src/domain/types'

const windowEvent: CalendarEvent = {
  id: 'no-debt',
  title: 'Solicitud no adeudar',
  kind: 'window',
  startDate: '2026-11-16',
  endDate: '2026-11-20',
  localTime: '18:00',
  timeZone: 'America/Guayaquil',
  modalities: ['research'],
  periodId: '2026-07-12',
  sourceIds: ['CAL-01'],
  certainty: 'Confirmado',
}

it('lays out Monday through Sunday including a year boundary', () => {
  expect(calendarWeek('2027-01-01')).toEqual([
    '2026-12-28',
    '2026-12-29',
    '2026-12-30',
    '2026-12-31',
    '2027-01-01',
    '2027-01-02',
    '2027-01-03',
  ])
})
it('places an inclusive window on each applicable day without inventing a daily time', () => {
  expect(eventsOnDate([windowEvent], '2026-11-18')).toEqual([windowEvent])
  expect(eventsOnDate([windowEvent], '2026-11-21')).toEqual([])
  expect(eventTimeLabel(windowEvent, '2026-11-18')).toBe('Ventana')
  expect(eventTimeLabel(windowEvent, '2026-11-20')).toBe('Cierre 18:00')
})
it('places personal adjustments but preserves the original event for selection', () => {
  const adjusted = { ...windowEvent, personalOverride: { startDate: '2026-12-01' } }
  expect(eventsOnDate([adjusted], '2026-11-18')).toEqual([])
  expect(eventsOnDate([adjusted], '2026-12-01')[0]).toBe(adjusted)
  expect(eventTimeLabel(adjusted, '2026-12-01')).toBe('Ventana · hora no indicada')
})
it('jumps to next known future date and includes an ongoing window', () => {
  expect(nextCalendarDate([windowEvent], new Date('2026-11-18T15:00:00Z'))).toBe('2026-11-18')
  expect(nextCalendarDate([windowEvent], new Date('2026-11-20T23:01:00Z'))).toBeNull()
  const deadline = {
    ...windowEvent,
    kind: 'deadline' as const,
    startDate: '2026-11-19',
    endDate: undefined,
  }
  expect(nextCalendarDate([deadline], new Date('2026-11-18T15:00:00Z'))).toBe('2026-11-19')
  expect(eventTimeLabel({ ...deadline, localTime: undefined }, '2026-11-19')).toBe(
    'Hora no indicada',
  )
})
