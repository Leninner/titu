import { describe, expect, it } from 'vitest'
import { ecuadorDate, eventReminder, noDebtValidity } from '../../src/domain/dates'
import type { CalendarEvent } from '../../src/domain/types'
const event: CalendarEvent = {
  id: 'e',
  title: 'Notas',
  kind: 'deadline',
  startDate: '2026-11-19',
  timeZone: 'America/Guayaquil',
  modalities: ['research'],
  periodId: '2026-07-12',
  sourceIds: [],
  certainty: 'confirmed',
}
describe('Ecuador dates', () => {
  it('keeps Ecuador day across UTC midnight', () =>
    expect(ecuadorDate(new Date('2026-11-20T02:00:00Z'))).toBe('2026-11-19'))
  it('expires unknown-time dates only on following local day', () => {
    expect(eventReminder(event, new Date('2026-11-20T04:59:00Z')).expired).toBe(false)
    expect(eventReminder(event, new Date('2026-11-20T05:00:00Z')).expired).toBe(true)
  })
  it('respects known closing time and reminder offsets', () => {
    expect(
      eventReminder({ ...event, localTime: '18:00' }, new Date('2026-11-19T23:00:01Z')).expired,
    ).toBe(true)
    for (const day of [7, 3, 1])
      expect(eventReminder(event, new Date(`2026-11-${19 - day}T12:00:00Z`)).level).toBe(
        String(day),
      )
  })
  it('uses issuance and marks uncertain day 30', () => {
    expect(noDebtValidity('2026-12-07', '2027-01-06').status).toBe('verify')
    expect(noDebtValidity('2026-12-07', '2027-01-07').status).toBe('expired')
    expect(noDebtValidity('2026-12-07', '2027-01-06', '2027-01-10').status).toBe('valid')
    expect(noDebtValidity(undefined, '2027-01-06').status).toBe('missing')
  })
})
it('uses window close and preserves original dates when personal overrides apply', () => {
  const window: CalendarEvent = {
    ...event,
    kind: 'window',
    startDate: '2026-11-16',
    endDate: '2026-11-20',
    localTime: '18:00',
  }
  expect(eventReminder(window, new Date('2026-11-19T23:00:01Z')).expired).toBe(false)
  const adjusted = {
    ...window,
    personalOverride: { startDate: '2026-12-01', endDate: '2026-12-02' },
  }
  expect(eventReminder(adjusted, new Date('2026-11-19T23:00:01Z')).expired).toBe(false)
  expect(adjusted.endDate).toBe('2026-11-20')
})
it('preserves cleared override time/end across JSON backups', async () => {
  const { effectiveEvent } = await import('../../src/domain/dates')
  const original: CalendarEvent = {
    ...event,
    endDate: '2026-11-20',
    localTime: '18:00',
    personalOverride: { startDate: '2026-12-01' },
  }
  const restored = JSON.parse(JSON.stringify(original)) as CalendarEvent
  expect(effectiveEvent(restored).localTime).toBeUndefined()
  expect(effectiveEvent(restored).endDate).toBeUndefined()
  expect(restored.localTime).toBe('18:00')
})
it('deduplicates official events with personal overrides', async () => {
  const { calendarForWorkspace } = await import('../../src/domain/dates')
  const { emptyWorkspace, newProfile } = await import('../../src/domain/types')
  const w = {
    ...emptyWorkspace(),
    profile: newProfile(),
    personalEvents: [{ ...event, personalOverride: { startDate: '2026-12-01' } }],
  }
  const c = {
    version: '1',
    sourceIds: [],
    templates: [],
    workflowDefinitions: [],
    calendarEvents: [event],
    conflicts: [],
  }
  expect(calendarForWorkspace(w, c)).toHaveLength(1)
  expect(calendarForWorkspace(w, c)[0].personalOverride?.startDate).toBe('2026-12-01')
})
