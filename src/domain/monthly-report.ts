import type {
  CatalogVersion,
  DocumentVersion,
  MonthlyReportAnalysis,
  ReportedActivity,
  Workspace,
} from './types'
import { calendarForWorkspace } from './dates'

const monthNames = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

const fold = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase()

const pad = (value: number) => String(value).padStart(2, '0')

const monthOf = (year: number, month: number) =>
  month >= 1 && month <= 12 && year >= 2000 && year <= 2100 ? `${year}-${pad(month)}` : undefined

function datesIn(text: string): string[] {
  const numeric = [...text.matchAll(/\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})\b/g)]
    .map(([, , month, year]) => monthOf(Number(year), Number(month)))
  const iso = [...text.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g)]
    .map(([, year, month]) => monthOf(Number(year), Number(month)))
  const written = [...text.matchAll(/\b\d{1,2}\s+de\s+([a-z]+)\s+(?:de|del)\s+(\d{4})\b/g)]
    .map(([, name, year]) => monthOf(Number(year), monthNames.indexOf(name) + 1))
  return [...numeric, ...iso, ...written].filter((month): month is string => !!month)
}

function mostFrequent(values: string[]) {
  const counts = new Map<string, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return [...counts].sort((a, b) => b[1] - a[1] || b[0].localeCompare(a[0]))[0]?.[0]
}

const fieldAfter = (text: string, label: RegExp, next: RegExp) =>
  text.match(new RegExp(`${label.source}\\s*:?\\s*([\\s\\S]*?)\\s*(?:${next.source}|$)`))?.[1].trim()

const datePattern = new RegExp(
  [
    String.raw`\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})\b`,
    String.raw`\b(\d{4})-(\d{2})-(\d{2})\b`,
    String.raw`\b(\d{1,2})\s+de\s+([a-záéíóú]+)\s+(?:de|del)\s+(\d{4})\b`,
  ].join('|'),
  'gi',
)

function isoDate(match: RegExpMatchArray) {
  const [, day, month, year, isoYear, isoMonth, isoDay, writtenDay, writtenMonth, writtenYear] = match
  const parts = day
    ? [Number(year), Number(month), Number(day)]
    : isoYear
      ? [Number(isoYear), Number(isoMonth), Number(isoDay)]
      : [Number(writtenYear), monthNames.indexOf(fold(writtenMonth)) + 1, Number(writtenDay)]
  const [y, m, d] = parts
  return monthOf(y, m) && d >= 1 && d <= 31 ? `${y}-${pad(m)}-${pad(d)}` : undefined
}

export function reportedActivities(rawText: string): ReportedActivity[] {
  const start = rawText.search(/porcentaje[^:]*:\s*[\d.,]*\s*%?\.?/i)
  const table = rawText.slice(Math.max(0, start)).split(/observaciones/i)[0]
  const body = start >= 0 ? table.replace(/^porcentaje[^:]*:\s*[\d.,]*\s*%?\.?/i, '') : table
  const matches = [...body.matchAll(datePattern)]
  return matches.flatMap((match, index) => {
    const date = isoDate(match)
    const end = matches[index + 1]?.index ?? body.length
    const description = body
      .slice(match.index! + match[0].length, end)
      .replace(/\s+/g, ' ')
      .replace(/^[\s|:.,;-]+|[\s|]+$/g, '')
      .trim()
    return date && description ? [{ date, description }] : []
  })
}

export function analyzeMonthlyReport(rawText: string): MonthlyReportAnalysis {
  const text = fold(rawText).replace(/\s+/g, ' ')
  const recognized = /informe mensual del avance/.test(text) || /anexo\s*5\b/.test(text)
  if (!recognized) return { recognized }
  const [header, table = ''] = text.split(/porcentaje de avance[^:]*:/)
  const headerDate = fieldAfter(header, /\bfecha/, /nombre del estudiante/)
  const progress = table.match(/^\s*(\d{1,3}(?:[.,]\d+)?)\s*%?/)?.[1]
  const topic = fieldAfter(header, /tema del trabajo de titulacion/, /fecha de aprobacion/)
  const activities = reportedActivities(rawText)
  return {
    recognized,
    month: mostFrequent(datesIn(table.split(/observaciones/)[0])) ?? datesIn(headerDate ?? '')[0],
    topic: topic || undefined,
    progress: progress ? Number(progress.replace(',', '.')) : undefined,
    ...(activities.length && { activities }),
  }
}

const monthAfter = (month: string, offset: number) => {
  const [year, value] = month.split('-').map(Number)
  const date = new Date(Date.UTC(year, value - 1 + offset, 1))
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`
}

export const monthLabel = (month: string) => {
  const [year, value] = month.split('-').map(Number)
  return `${monthNames[value - 1]} ${year}`
}

export const monthOverrideKey = (documentId: string) => `monthly-month:${documentId}`

export function reportMonth(version: DocumentVersion, workspace: Workspace) {
  return workspace.settings[monthOverrideKey(version.documentId)] || version.reportAnalysis?.month
}

export function monthlyRange(workspace: Workspace, catalog: CatalogVersion, months: string[] = []) {
  const approval = workspace.profile?.aprobacionFecha
  const deadline = calendarForWorkspace(workspace, catalog)
    .find((event) => event.id === 'calificadores-limite')?.startDate
  const from = workspace.settings.monthlyFrom ||
    (approval ? monthAfter(approval.slice(0, 7), 1) : [...months].sort()[0])
  const to = workspace.settings.monthlyTo || deadline?.slice(0, 7) || [...months].sort().at(-1)
  return { from, to }
}

export function monthsBetween(from?: string, to?: string) {
  if (!from || !to || from > to) return []
  const months = [from]
  while (months.at(-1)! < to && months.length < 36) months.push(monthAfter(months.at(-1)!, 1))
  return months
}

const normalizedTopic = (topic: string) => fold(topic).replace(/[^a-z0-9]+/g, ' ').trim()

export function monthlyCoverage(
  versions: DocumentVersion[],
  workspace: Workspace,
  catalog: CatalogVersion,
  signed: boolean,
) {
  const assigned = versions.map((version) => ({ version, month: reportMonth(version, workspace) }))
  const { from, to } = monthlyRange(workspace, catalog, assigned.flatMap((item) => item.month ?? []))
  const approvedTopic = workspace.profile?.tema ? normalizedTopic(workspace.profile.tema) : ''
  const months = monthsBetween(from, to).map((month) => {
    const reports = assigned.filter((item) => item.month === month).map((item) => item.version)
    const valid = reports.filter((version) => !signed || version.signatureStatus === 'reported-signed')
    const topic = valid.map((version) => version.reportAnalysis?.topic).find(Boolean)
    const status = !reports.length
      ? 'missing'
      : !valid.length
        ? 'unsigned'
        : approvedTopic && topic && normalizedTopic(topic) !== approvedTopic
          ? 'topic'
          : 'done'
    return { month, reports, status } as const
  })
  return {
    from,
    to,
    months,
    unassigned: assigned.filter((item) => !item.month).map((item) => item.version),
  }
}

export type MonthlyCoverage = ReturnType<typeof monthlyCoverage>

export type MonthProgress = { month: string; progress?: number; delta?: number }

const declaredProgress = (reports: DocumentVersion[]) =>
  reports.map((version) => version.reportAnalysis?.progress).find((value) => value !== undefined)

export function progressByMonth(coverage: MonthlyCoverage) {
  let previous: number | undefined
  const months = coverage.months.map(({ month, reports }): MonthProgress => {
    const progress = declaredProgress(reports)
    const delta = progress !== undefined && previous !== undefined ? progress - previous : undefined
    if (progress !== undefined) previous = progress
    return { month, progress, delta }
  })
  return { months, current: months.findLast((item) => item.progress !== undefined) }
}

const gapText = {
  missing: (month: string) => `Falta el Anexo 5 de ${monthLabel(month)}`,
  unsigned: (month: string) => `Firma pendiente: Anexo 5 de ${monthLabel(month)}`,
  topic: (month: string) => `Tema distinto al aprobado en el Anexo 5 de ${monthLabel(month)}`,
}

export function monthlyGaps(coverage: MonthlyCoverage) {
  return [
    ...coverage.unassigned.map((version) => `Asignar el mes del informe ${version.originalName}`),
    ...coverage.months.flatMap((item) => (item.status === 'done' ? [] : [gapText[item.status](item.month)])),
  ]
}

export function rangeWith(range: { from?: string; to?: string }, month: string) {
  return {
    from: !range.from || month < range.from ? month : range.from,
    to: !range.to || month > range.to ? month : range.to,
  }
}

export function rangeWithout(range: { from?: string; to?: string }, month: string) {
  if (range.from === month && range.to === month) return { from: undefined, to: undefined }
  if (range.from === month) return { ...range, from: monthAfter(month, 1) }
  if (range.to === month) return { ...range, to: monthAfter(month, -1) }
  return range
}
