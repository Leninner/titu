import { FileText, RefreshCw } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { catalog } from '../../catalog'
import { ecuadorDate } from '../../domain/dates'
import {
  buildFinalReportFromUploads,
  finalReportActivities,
  finalReportFields,
  type UploadedMonthlyReport,
} from '../../domain/final-report'
import { analyzeMonthlyReport, reportMonth } from '../../domain/monthly-report'
import { evidenceIdsForTask } from '../../domain/task-evidence'
import { taskFor } from '../../domain/task-record'
import type { DocumentVersion, Workspace } from '../../domain/types'
import { latestDraft } from '../../domain/workflow'
import { repository } from '../../storage/repository'
import { AnnexDraftEditor, type DraftActions } from '../annexes/AnnexDraftEditor'

function monthlySources(workspace: Workspace) {
  const definition = catalog.workflowDefinitions.find((item) => item.id === 'desarrollo')!
  const selected = evidenceIdsForTask(taskFor('desarrollo', workspace), definition, workspace)
  const monthlyDocuments = new Set(
    workspace.documents.filter((document) => document.category === 'mensual').map((document) => document.id),
  )
  return workspace.versions.filter(
    (version) => selected.includes(version.id) && monthlyDocuments.has(version.documentId),
  )
}

async function analysisOf(version: DocumentVersion) {
  if (version.reportAnalysis?.activities) return version.reportAnalysis
  const blob = await repository.getBlob(version.blobId)
  if (!blob) return version.reportAnalysis ?? { recognized: false }
  const { extractText } = await import('../documents/extract-text')
  return analyzeMonthlyReport(await extractText(new File([blob], version.originalName)))
}

async function readReports(workspace: Workspace): Promise<UploadedMonthlyReport[]> {
  const reports = await Promise.all(
    monthlySources(workspace).map(async (version) => ({
      versionId: version.id,
      month: reportMonth(version, workspace) ?? '',
      analysis: await analysisOf(version),
    })),
  )
  return reports.filter((report) => report.month)
}

function ReimportButton({ draft, update, working, act }: DraftActions) {
  const { workspace } = useWorkspace()
  const reimport = () =>
    act(async () => {
      const reports = await readReports(workspace)
      update({
        ...draft,
        activities: finalReportActivities(reports),
        fields: { ...draft.fields, ...finalReportFields(reports, draft.fields.fecha || ecuadorDate()) },
      })
    })
  return (
    <button
      type="button"
      disabled={working}
      title="Vuelve a leer las actividades de los Anexo 5"
      onClick={() => void reimport()}
    >
      <RefreshCw size={15} aria-hidden="true" /> Reimportar actividades
    </button>
  )
}

export function FinalReportEditor() {
  const { workspace, run } = useWorkspace()
  const draft = latestDraft(workspace, 'anexo-11')
  const sources = monthlySources(workspace)
  if (draft)
    return (
      <AnnexDraftEditor
        key={draft.id}
        initial={draft}
        label="Anexo 11 · Informe final"
        extraActions={(actions) => <ReimportButton {...actions} />}
      />
    )
  return (
    <section className="final-report-start" aria-label="Anexo 11 · Informe final">
      <FileText size={24} aria-hidden="true" />
      <h3>Anexo 11 · Informe final</h3>
      {sources.length ? (
        <>
          <p>Se arma con las actividades de los {sources.length} Anexo 5 de tus informes mensuales.</p>
          <button
            type="button"
            className="primary"
            onClick={() =>
              void run(async () => {
                const created = buildFinalReportFromUploads(
                  workspace.profile!,
                  await readReports(workspace),
                  ecuadorDate(),
                )
                await repository.saveDraft(created, 0)
              })
            }
          >
            Crear Anexo 11
          </button>
        </>
      ) : (
        <p>
          Primero sube los Anexo 5 en <a href="#/proceso/desarrollo">Informes mensuales de avance</a>.
        </p>
      )}
    </section>
  )
}
