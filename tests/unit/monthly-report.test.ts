import { expect, it } from 'vitest'
import { catalog } from '../../src/catalog'
import {
  analyzeMonthlyReport,
  monthOverrideKey,
  monthlyCoverage,
  monthlyGaps,
  progressByMonth,
} from '../../src/domain/monthly-report'
import { emptyWorkspace, newProfile } from '../../src/domain/types'
import type { DocumentVersion, MonthlyReportAnalysis, Workspace } from '../../src/domain/types'

const annex5 = (activityDates: string[], topic = 'Sistema de gestión de titulación') => `
ANEXO 5
INFORME MENSUAL DEL AVANCE DEL TRABAJO DE TITULACIÓN
UNIVERSIDAD TÉCNICA DE AMBATO
FECHA: 03/11/2026
NOMBRE DEL ESTUDIANTE: María Muñoz
MODALIDAD DE TITULACIÓN: Proyecto de Investigación
TEMA DEL TRABAJO DE TITULACIÓN: ${topic}
FECHA DE APROBACIÓN DE LA PROPUESTA DEL PERFIL DEL TRABAJO DE TITULACIÓN POR EL CONSEJO DIRECTIVO: 15/07/2026
PORCENTAJE DE AVANCE DE ACUERDO AL CRONOGRAMA: 45 %.
Fecha Actividad.
${activityDates.map((date) => `${date} Revisión de avances`).join('\n')}
OBSERVACIONES: Ninguna
NOMBRE Y FIRMA TUTOR TRABAJO TITULACIÓN`

it('reads the month from the activity table, the topic and the progress of an Anexo 5', () => {
  expect(analyzeMonthlyReport(annex5(['06/10/2026', '13/10/2026', '27/10/2026']))).toEqual({
    recognized: true,
    month: '2026-10',
    topic: 'sistema de gestion de titulacion',
    progress: 45,
    activities: [
      { date: '2026-10-06', description: 'Revisión de avances' },
      { date: '2026-10-13', description: 'Revisión de avances' },
      { date: '2026-10-27', description: 'Revisión de avances' },
    ],
  })
  expect(analyzeMonthlyReport(annex5(['8 de septiembre de 2026', '22 de septiembre de 2026'])).month)
    .toBe('2026-09')
  expect(analyzeMonthlyReport(annex5([])).month).toBe('2026-11')
})

it('reads each activity with its date from a flattened PDF table', () => {
  const text = 'ANEXO 5 INFORME MENSUAL DEL AVANCE PORCENTAJE DE AVANCE DE ACUERDO AL CRONOGRAMA: 60 %. ' +
    'Fecha Actividad. 02/09/2026 Diseño de la base de datos 16/09/2026 Pruebas del módulo de reportes, ' +
    'con el tutor 30 de septiembre de 2026 Ajustes OBSERVACIONES: ninguna'
  expect(analyzeMonthlyReport(text).activities).toEqual([
    { date: '2026-09-02', description: 'Diseño de la base de datos' },
    { date: '2026-09-16', description: 'Pruebas del módulo de reportes, con el tutor' },
    { date: '2026-09-30', description: 'Ajustes' },
  ])
})

it('does not recognize a file without the Anexo 5 format', () => {
  expect(analyzeMonthlyReport('Certificado de matrícula del período 2026')).toEqual({ recognized: false })
  expect(analyzeMonthlyReport('')).toEqual({ recognized: false })
})

const version = (id: string, analysis?: MonthlyReportAnalysis, signed = true): DocumentVersion => ({
  id,
  documentId: `document-${id}`,
  blobId: `blob-${id}`,
  originalName: `${id}.pdf`,
  mime: 'application/pdf',
  size: 1,
  sha256: id,
  createdAt: '2026-11-01T12:00:00.000Z',
  signatureStatus: signed ? 'reported-signed' : 'unsigned',
  textualPdfStatus: 'text-detected',
  reportAnalysis: analysis,
})

const workspace = (): Workspace => ({
  ...emptyWorkspace(),
  profile: { ...newProfile(), tema: 'Sistema de gestión de titulación' },
  settings: { monthlyFrom: '2026-08', monthlyTo: '2026-11' },
})

const report = (month: string, topic = 'sistema de gestion de titulacion') =>
  ({ recognized: true, month, topic })

it('requires one signed report with the approved topic for each month of the range', () => {
  const reports = [
    version('agosto', report('2026-08')),
    version('septiembre', report('2026-09'), false),
    version('octubre', report('2026-10', 'otro tema')),
  ]
  const coverage = monthlyCoverage(reports, workspace(), catalog, true)
  expect(coverage.months.map((item) => [item.month, item.status])).toEqual([
    ['2026-08', 'done'],
    ['2026-09', 'unsigned'],
    ['2026-10', 'topic'],
    ['2026-11', 'missing'],
  ])
  expect(monthlyGaps(coverage)).toEqual([
    'Firma pendiente: Anexo 5 de septiembre 2026',
    'Tema distinto al aprobado en el Anexo 5 de octubre 2026',
    'Falta el Anexo 5 de noviembre 2026',
  ])
})

it('asks to assign the month of an unrecognized file and honours a manual month', () => {
  const scanned = version('escaneado', { recognized: false })
  const w = workspace()
  expect(monthlyGaps(monthlyCoverage([scanned], w, catalog, true))[0])
    .toBe('Asignar el mes del informe escaneado.pdf')
  w.settings[monthOverrideKey(scanned.documentId)] = '2026-08'
  const coverage = monthlyCoverage([scanned], w, catalog, true)
  expect(coverage.unassigned).toEqual([])
  expect(coverage.months[0].status).toBe('done')
})

it('defaults the range from the month after approval to the graders deadline', () => {
  const w = { ...workspace(), settings: {} }
  w.profile = { ...w.profile!, aprobacionFecha: '2026-07-15' }
  const coverage = monthlyCoverage([], w, catalog, true)
  expect([coverage.from, coverage.to]).toEqual(['2026-08', '2026-11'])
})

it('follows the progress declared by each included report and its change from the previous month', () => {
  const reports = [
    version('agosto', { ...report('2026-08'), progress: 20 }),
    version('septiembre', { ...report('2026-09'), progress: 45 }),
    version('octubre', report('2026-10')),
    version('noviembre', { ...report('2026-11'), progress: 40 }),
  ]
  const progress = progressByMonth(monthlyCoverage(reports, workspace(), catalog, true))
  expect(progress.months).toEqual([
    { month: '2026-08', progress: 20, delta: undefined },
    { month: '2026-09', progress: 45, delta: 25 },
    { month: '2026-10', progress: undefined, delta: undefined },
    { month: '2026-11', progress: 40, delta: -5 },
  ])
  expect(progress.current).toEqual({ month: '2026-11', progress: 40, delta: -5 })
  expect(progressByMonth(monthlyCoverage([], workspace(), catalog, true)).current).toBeUndefined()
})
