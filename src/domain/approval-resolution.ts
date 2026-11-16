import type { Modality, StudentProfile } from './types'

export type ResolutionData = Partial<
  Pick<
    StudentProfile,
    | 'aprobacionResolucion'
    | 'aprobacionFecha'
    | 'nombres'
    | 'modalidad'
    | 'carrera'
    | 'periodo'
    | 'tema'
    | 'tutor'
  >
>

const months = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

const modalities: [RegExp, Modality][] = [
  [/PROYECTO DE INVESTIGACI[OÓ]N/i, 'research'],
  [/ART[IÍ]CULO ACAD[EÉ]MICO/i, 'article'],
  [/EXAMEN COMPLEXIVO/i, 'complexivo'],
]

const knownPeriods: Record<string, string> = { 'julio-diciembre-2026': '2026-07-12' }

const normalized = (text: string) => text.replace(/\s+/g, ' ').replace(/ ([,.:;”])/g, '$1').trim()

const pad = (value: number) => String(value).padStart(2, '0')

const titleCase = (text: string) =>
  text.toLocaleLowerCase('es').replace(/(^|[\s.])(\p{L})/gu, (_, before, letter) => before + letter.toLocaleUpperCase('es'))

const capture = (text: string, pattern: RegExp) => pattern.exec(text)?.[1]?.trim()

function approvalDate(text: string) {
  const match = /sesi[oó]n[^.]*?del d[ií]a (\d{1,2}) de (\p{L}+) de (\d{4})/iu.exec(text)
  const month = match ? months.indexOf(match[2].toLocaleLowerCase('es')) : -1
  return match && month >= 0 ? `${match[3]}-${pad(month + 1)}-${pad(Number(match[1]))}` : undefined
}

function modality(text: string) {
  const declared = capture(text, /APROBAR LA MODALIDAD DE TITULACI[OÓ]N:\s*([^,]+?)\s+PRESENTADA/i)
  return declared ? modalities.find(([pattern]) => pattern.test(declared))?.[1] : undefined
}

function period(text: string) {
  const match = /PERIODO ACAD[EÉ]MICO (\p{L}+) ?- ?(\p{L}+) (\d{4})/iu.exec(text)
  if (!match) return undefined
  return knownPeriods[[match[1], match[2], match[3]].join('-').toLocaleLowerCase('es')] ?? 'other'
}

function tutor(text: string) {
  const designated = capture(text, /DESIGNAR COMO TUTOR\/A .*? A EL\/LA (.+?), CONFORME/i)
  return designated && titleCase(designated)
}

export function parseApprovalResolution(raw: string): ResolutionData {
  const text = normalized(raw)
  const found: ResolutionData = {
    aprobacionResolucion: capture(text, /Resoluci[oó]n (\d+(?:-[A-Z]+)+-\d{4})/),
    aprobacionFecha: approvalDate(text),
    nombres: capture(text, /se[ñn]or\/ita ([^,]+?), estudiante/i),
    modalidad: modality(text),
    carrera: capture(text, /estudiante de la Carrera de ([^.,]+)/i),
    periodo: period(text),
    tema: capture(text, /PROPUESTA DEL TRABAJO DE TITULACI[OÓ]N: [“"](.+?)[”"]/i),
    tutor: tutor(text),
  }
  return Object.fromEntries(Object.entries(found).filter(([, value]) => value)) as ResolutionData
}
