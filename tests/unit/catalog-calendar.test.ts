import { expect, it } from 'vitest'
import { calendarEvents } from '../../src/catalog'

it('preserves exact period dates, optional hours and modality boundaries', () => {
  expect(calendarEvents).toHaveLength(16)
  const event = (id: string) => calendarEvents.find((item) => item.id === id)!
  expect(event('calificadores-limite')).toMatchObject({
    startDate: '2026-11-19',
    localTime: '18:00',
    modalities: ['research', 'article'],
  })
  expect(event('biblioteca-revision')).toMatchObject({
    startDate: '2026-11-10',
    localTime: '08:30',
    kind: 'appointment',
    modalities: ['research', 'article'],
    sourceIds: ['BIB-01'],
  })
  expect(event('complexivo-examen').startDate).toBe('2026-12-04')
  expect(event('complexivo-segunda').startDate).toBe('2026-12-11')
  expect(event('emision-no-adeudar')).toMatchObject({
    startDate: '2026-12-07',
    localTime: undefined,
  })
  expect(event('aptitud-elaboracion')).toMatchObject({
    startDate: '2026-12-10',
    localTime: '16:00',
  })
  expect(event('dia-hora-limite')).toMatchObject({ startDate: '2026-12-10', localTime: '18:00' })
  expect(event('sustentaciones-limite')).toMatchObject({
    startDate: '2026-12-21',
    endDate: undefined,
    kind: 'deadline',
  })
  expect(calendarEvents.filter((item) => item.modalities.includes('complexivo'))).toHaveLength(2)
})
