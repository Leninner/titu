export interface RecognizedDate {
  date: string
  label: string
  matchedText: string
  inferredYear: boolean
}
export type NaturalDateResult = RecognizedDate | { error: string } | null
const months = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]
const monthNames = [
  'ene(?:ro)?',
  'feb(?:rero)?',
  'mar(?:zo)?',
  'abr(?:il)?',
  'may(?:o)?',
  'jun(?:io)?',
  'jul(?:io)?',
  'ago(?:sto)?',
  'sep(?:t(?:iembre)?)?|setiembre',
  'oct(?:ubre)?',
  'nov(?:iembre)?',
  'dic(?:iembre)?',
]
const weekdays = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
function calendarDate(year: number, month: number, day: number): Date | null {
  if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) return null
  const value = new Date(
    `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00:00Z`,
  )
  return value.getUTCFullYear() === year &&
    value.getUTCMonth() === month - 1 &&
    value.getUTCDate() === day
    ? value
    : null
}
export function dateLabel(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  return calendarDate(year, month, day) ? `${day} de ${months[month - 1]} de ${year}` : iso
}
export function parseNaturalDate(input: string, now: Date, referenceYear?: number): NaturalDateResult {
  if (!input.trim()) return null
  if (!Number.isFinite(now.getTime())) return { error: 'No se pudo determinar la fecha de hoy.' }
  const todayParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Guayaquil',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const part = (type: string) => Number(todayParts.find((item) => item.type === type)?.value)
  const today = calendarDate(part('year'), part('month'), part('day'))!
  const text = normalize(input)
  const candidates: RecognizedDate[] = []
  const consumed: { start: number; end: number }[] = []
  let invalid = false
  const add = (match: RegExpMatchArray, date: Date | null, inferredYear: boolean) => {
    const start = match.index ?? 0
    if (consumed.some((range) => start < range.end && start + match[0].length > range.start)) return
    consumed.push({ start, end: start + match[0].length })
    if (!date || date.getUTCFullYear() > 9999) {
      invalid = true
      return
    }
    const iso = date.toISOString().slice(0, 10)
    candidates.push({
      date: iso,
      label: dateLabel(iso),
      matchedText: input.slice(start, start + match[0].length),
      inferredYear,
    })
  }
  const resolve = (day: number, month: number, year?: number) => {
    if (year !== undefined) return calendarDate(year, month, day)
    if (referenceYear !== undefined) return calendarDate(referenceYear, month, day)
    for (
      let candidateYear = today.getUTCFullYear();
      candidateYear <= today.getUTCFullYear() + 8;
      candidateYear++
    ) {
      const candidate = calendarDate(candidateYear, month, day)
      if (candidate && candidate >= today) return candidate
    }
    return null
  }
  for (const match of text.matchAll(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/g))
    add(match, calendarDate(Number(match[1]), Number(match[2]), Number(match[3])), false)
  for (const match of text.matchAll(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d+))?\b/g))
    add(
      match,
      match[3] && match[3].length !== 4
        ? null
        : resolve(Number(match[1]), Number(match[2]), match[3] ? Number(match[3]) : undefined),
      !match[3],
    )
  const spanish = new RegExp(
    `\\b(?:el\\s+)?(\\d{1,2})\\s+(?:de\\s+)?(${monthNames.join('|')})(?:\\.?\\s+(?:de\\s+)?(\\d+))?\\b`,
    'g',
  )
  for (const match of text.matchAll(spanish)) {
    const month =
      monthNames.findIndex((pattern) => new RegExp(`^(?:${pattern})$`).test(match[2])) + 1
    add(
      match,
      match[3] && match[3].length !== 4
        ? null
        : resolve(Number(match[1]), month, match[3] ? Number(match[3]) : undefined),
      !match[3],
    )
  }
  const relative = (days: number) =>
    Number.isSafeInteger(days) && Math.abs(days) <= 36600
      ? new Date(today.getTime() + days * 86400000)
      : null
  for (const match of text.matchAll(/\b(?:pasado manana|anteayer|ayer|hoy|manana)\b/g))
    add(match, relative(({ hoy: 0, manana: 1, 'pasado manana': 2, ayer: -1, anteayer: -2 })[match[0]]!), false)
  for (const match of text.matchAll(/\ben\s+(\d+)\s+dias?\b/g))
    add(match, relative(Number(match[1])), false)
  for (const match of text.matchAll(
    /\b(?:el\s+)?proximo\s+(lunes|martes|miercoles|jueves|viernes|sabado|domingo)\b/g,
  ))
    add(match, relative((weekdays.indexOf(match[1]) - today.getUTCDay() + 7) % 7 || 7), false)
  for (const match of text.matchAll(/\bhace\s+(\d+)\s+dias?\b/g))
    add(match, relative(-Number(match[1])), false)
  for (const match of text.matchAll(/\b(?:el\s+)?(?:(?:pasado|ultimo)\s+(lunes|martes|miercoles|jueves|viernes|sabado|domingo)|(lunes|martes|miercoles|jueves|viernes|sabado|domingo)\s+pasado)\b/g))
    add(match, relative(-((today.getUTCDay() - weekdays.indexOf(match[1] || match[2]) + 7) % 7 || 7)), false)
  if (invalid) return { error: 'Esa fecha no es válida. Revisa el día, el mes y el año.' }
  if (new Set(candidates.map((candidate) => candidate.date)).size > 1)
    return { error: 'Encontré varias fechas distintas. Escribe solo la que quieres usar.' }
  return candidates[0] ?? null
}
