import type { CalendarEvent } from '../domain/types'
import { addDays, effectiveEvent } from '../domain/dates'

const compactDate = (date: string) => date.replaceAll('-', '')
const utc = (date: string, time: string) =>
  new Date(`${date}T${time}:00-05:00`)
    .toISOString()
    .replaceAll('-', '')
    .replaceAll(':', '')
    .replace('.000', '')
const escapeText = (value: string) =>
  value
    .replaceAll('\\', '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replaceAll(';', '\\;')
    .replaceAll(',', '\\,')

// RFC 5545 limits physical lines to 75 octets, not 75 UTF-16 characters.
function fold(line: string): string {
  const encoder = new TextEncoder()
  let output = ''
  let bytes = 0
  for (const character of line) {
    const size = encoder.encode(character).length
    if (bytes + size > 75) {
      output += '\r\n '
      bytes = 1
    }
    output += character
    bytes += size
  }
  return output
}

export function exportCalendarIcs(events: CalendarEvent[], now: Date = new Date()): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Graduation Organizer//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]
  for (const original of events) {
    const event = effectiveEvent(original)
    const dates: string[] = []
    if (event.localTime) {
      if (event.kind === 'window' && event.endDate) {
        dates.push(
          `DTSTART:${utc(event.startDate, '00:00')}`,
          `DTEND:${utc(event.endDate, event.localTime)}`,
        )
      } else {
        dates.push(`DTSTART:${utc(event.startDate, event.localTime)}`)
      }
    } else {
      dates.push(
        `DTSTART;VALUE=DATE:${compactDate(event.startDate)}`,
        `DTEND;VALUE=DATE:${compactDate(addDays(event.endDate || event.startDate, 1))}`,
      )
    }
    const description = [
      `Fuentes: ${event.sourceIds.join(', ') || 'Registro personal'}`,
      event.certainty,
      event.localTime ? 'Hora Ecuador (America/Guayaquil)' : 'Hora no indicada',
      original.personalOverride
        ? `Fecha original: ${original.startDate}${original.endDate ? ` a ${original.endDate}` : ''}. Ajuste personal.`
        : '',
    ]
      .filter(Boolean)
      .join('\n')
    lines.push(
      'BEGIN:VEVENT',
      `UID:${encodeURIComponent(event.periodId)}-${encodeURIComponent(event.id)}@graduation-organizer.local`,
      `DTSTAMP:${now
        .toISOString()
        .replaceAll('-', '')
        .replaceAll(':', '')
        .replace(/\.\d{3}/, '')}`,
      ...dates,
      `SUMMARY:${escapeText(event.title)}`,
      `DESCRIPTION:${escapeText(description)}`,
    )
    for (const days of [7, 3, 1]) {
      const isWindow = event.kind === 'window' && !!event.endDate
      // All-day DTEND is exclusive, so move the alarm back one extra day.
      const before = isWindow && !event.localTime ? days + 1 : days
      lines.push(
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:${escapeText(event.title)}`,
        `TRIGGER${isWindow ? ';RELATED=END' : ''}:-P${before}D`,
        'END:VALARM',
      )
    }
    lines.push('END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.map(fold).join('\r\n') + '\r\n'
}
