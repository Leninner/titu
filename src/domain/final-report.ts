import type { AnnexDraft, MonthlyReportAnalysis, StudentProfile } from './types'
import { createDraft, validateAnnex } from './annex'
import { withoutPageFurniture } from './monthly-report'

export function buildFinalReport(monthlyRevisions: AnnexDraft[]): AnnexDraft {
  if (!monthlyRevisions.length) throw new Error('Seleccionar al menos un informe mensual')
  const first = monthlyRevisions[0]
  const seen = new Set<string>()
  for (const monthly of monthlyRevisions) {
    if (monthly.templateId !== 'anexo-5') throw new Error('Solo se admiten informes mensuales')
    if (seen.has(monthly.id)) throw new Error('Seleccionar una sola revisión por informe mensual')
    seen.add(monthly.id)
    if (!validateAnnex(monthly).valid)
      throw new Error(`Revisar el informe mensual: ${monthly.name}`)
    if (
      monthly.profileSnapshot.id !== first.profileSnapshot.id ||
      monthly.profileSnapshot.tema !== first.profileSnapshot.tema ||
      monthly.profileSnapshot.modalidad !== first.profileSnapshot.modalidad
    )
      throw new Error('Los informes deben corresponder al mismo estudiante, tema y modalidad')
  }
  const result = createDraft('anexo-11', first.profileSnapshot)
  result.sourceMonthlyRevisions = monthlyRevisions.map((monthly) => ({
    draftId: monthly.id,
    revision: monthly.revision,
  }))
  result.activities = monthlyRevisions
    .flatMap((monthly) =>
      monthly.activities.map((activity) => ({
        ...activity,
        id: crypto.randomUUID(),
        sourceDraftId: monthly.id,
        sourceRevision: monthly.revision,
      })),
    )
    .sort((a, b) => a.date.localeCompare(b.date))
  // Percentages describe accumulated progress. They are never summed or inferred.
  result.fields = {
    fecha: '',
    avance: '',
    mensualesRevisados: '',
    ultimoAvanceMensual: [...monthlyRevisions]
      .sort((a, b) => a.monthlyPeriod.localeCompare(b.monthlyPeriod))
      .at(-1)!.fields.avance,
    actividadesMensualesSnapshot: JSON.stringify(
      result.activities.map(({ date, description, sourceDraftId, sourceRevision }) => ({
        date,
        description,
        sourceDraftId,
        sourceRevision,
      })),
    ),
  }
  return result
}
export function compareFinalReport(final: AnnexDraft, currentMonthly: AnnexDraft[]) {
  return final.sourceMonthlyRevisions.flatMap((source) => {
    const current = currentMonthly.find((draft) => draft.id === source.draftId)
    if (!current || current.revision !== source.revision)
      return [
        {
          draftId: source.draftId,
          previousRevision: source.revision,
          currentRevision: current?.revision,
          previousActivities: final.activities.filter(
            (activity) => activity.sourceDraftId === source.draftId,
          ),
          currentActivities: current?.activities ?? [],
        },
      ]
    return []
  })
}
export const isFinalReportStale = (final: AnnexDraft, currentMonthly: AnnexDraft[]) =>
  compareFinalReport(final, currentMonthly).length > 0

export const uploadedOrigin = 'archivos'

export interface UploadedMonthlyReport {
  versionId: string
  month: string
  analysis: MonthlyReportAnalysis
}

export function finalReportActivities(reports: UploadedMonthlyReport[]) {
  return [...reports]
    .sort((a, b) => a.month.localeCompare(b.month))
    .flatMap((report) => report.analysis.activities ?? [])
    .map((activity) => ({
      id: crypto.randomUUID(),
      date: activity.date,
      description: withoutPageFurniture(activity.description),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function finalReportFields(reports: UploadedMonthlyReport[], fecha: string) {
  const last = [...reports].sort((a, b) => a.month.localeCompare(b.month)).at(-1)
  return {
    fecha,
    avance: '100',
    origenMensual: uploadedOrigin,
    fuentesMensuales: JSON.stringify(reports.map((report) => report.versionId)),
    ultimoAvanceMensual: last?.analysis.progress === undefined ? '' : String(last.analysis.progress),
  }
}

export function buildFinalReportFromUploads(
  profile: StudentProfile,
  reports: UploadedMonthlyReport[],
  fecha: string,
): AnnexDraft {
  if (!reports.length) throw new Error('Sube al menos un Anexo 5 en los informes mensuales')
  const draft = createDraft('anexo-11', profile)
  draft.activities = finalReportActivities(reports)
  draft.fields = finalReportFields(reports, fecha)
  return draft
}
