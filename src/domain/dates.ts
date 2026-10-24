import type { CalendarEvent, CatalogVersion, Workspace } from './types'

export const ECUADOR_TIME_ZONE = 'America/Guayaquil'
const dayMilliseconds = 86_400_000

export function ecuadorDate(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ECUADOR_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * dayMilliseconds)
    .toISOString()
    .slice(0, 10)
}

export function daysBetween(from: string, to: string): number {
  return Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / dayMilliseconds,
  )
}

export function effectiveEvent(event: CalendarEvent): CalendarEvent {
  if (!event.personalOverride) return event
  // An override replaces the entire date/time tuple. Omitted end/time explicitly clear
  // those values, including when JSON backups omit undefined properties.
  return {
    ...event,
    startDate: event.personalOverride.startDate,
    endDate: event.personalOverride.endDate,
    localTime: event.personalOverride.localTime,
  }
}

export function eventDeadline(event: CalendarEvent): string {
  const effective = effectiveEvent(event)
  return effective.endDate || effective.startDate
}

export function eventReminder(event: CalendarEvent, now: Date = new Date()) {
  const effective = effectiveEvent(event)
  const deadline = eventDeadline(effective)
  const daysRemaining = daysBetween(ecuadorDate(now), deadline)
  const expired = effective.localTime
    ? now.getTime() > Date.parse(`${deadline}T${effective.localTime}:00-05:00`)
    : daysRemaining < 0
  const level = expired
    ? 'expired'
    : [7, 3, 1].includes(daysRemaining)
      ? String(daysRemaining)
      : null
  return { daysRemaining, expired, level }
}

export function calendarForWorkspace(
  workspace: Workspace,
  catalog: CatalogVersion,
): CalendarEvent[] {
  const profile = workspace.profile
  if (!profile) return []
  const applicable = [...catalog.calendarEvents, ...workspace.personalEvents].filter(
    (event) => event.periodId === profile.periodo && event.modalities.includes(profile.modalidad),
  )
  return [...new Map(applicable.map((event) => [event.id, event])).values()]
}

export function noDebtValidity(
  issuedOn: string | undefined,
  submissionDate: string,
  expiresOn?: string,
) {
  if (!issuedOn && !expiresOn)
    return { status: 'missing' as const, referenceDate: null, label: 'Pendiente de registrar' }
  const referenceDate = expiresOn || addDays(issuedOn!, 30)
  const difference = daysBetween(submissionDate, referenceDate)
  if (difference < 0)
    return {
      status: 'expired' as const,
      referenceDate,
      label: 'Vencido: revisar expediente con Secretaría',
    }
  if (difference === 0 && !expiresOn)
    return { status: 'verify' as const, referenceDate, label: 'Verificar vigencia' }
  return {
    status: 'valid' as const,
    referenceDate,
    label: expiresOn
      ? 'Dentro del vencimiento registrado'
      : 'Dentro de la referencia estimada de 30 días',
  }
}
