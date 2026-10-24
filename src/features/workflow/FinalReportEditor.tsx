import { useState } from 'react'
import { CircleAlert, FileDown, FileText, FileType2, RefreshCw } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { catalog } from '../../catalog'
import { errorMessage } from '../../components/download'
import { validateAnnex } from '../../domain/annex'
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
import type { AnnexDraft, DocumentVersion, Workspace } from '../../domain/types'
import { latestDraft } from '../../domain/workflow'
import { repository } from '../../storage/repository'
import { AnnexDocument } from '../annexes/AnnexDocument'
import { downloadAnnex } from '../annexes/export-annex'
import { useDraftAutosave } from '../annexes/useDraftAutosave'

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

function DraftEditor({ initial }: { initial: AnnexDraft }) {
  const { workspace } = useWorkspace()
  const { draft, update, flush, status } = useDraftAutosave(initial)
  const [error, setError] = useState('')
  const [working, setWorking] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const validation = validateAnnex(draft)
  const warnings = Object.values(validation.warnings)

  async function act(action: () => Promise<void>) {
    setWorking(true)
    setError('')
    try {
      await action()
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setWorking(false)
    }
  }

  const reimport = () =>
    act(async () => {
      const reports = await readReports(workspace)
      update({
        ...draft,
        activities: finalReportActivities(reports),
        fields: { ...draft.fields, ...finalReportFields(reports, draft.fields.fecha || ecuadorDate()) },
      })
    })

  const download = (format: 'pdf' | 'docx') =>
    act(async () => {
      setShowErrors(true)
      if (!validation.valid) throw new Error('Completa los campos marcados antes de descargar.')
      await downloadAnnex(await flush(), format)
    })

  return (
    <section className="final-report" aria-label="Anexo 11 · Informe final">
      <div className="final-report-bar">
        <output className="save-status">{status}</output>
        {warnings.map((warning) => (
          <span key={warning} className="final-report-warning">
            <CircleAlert size={14} aria-hidden="true" /> {warning}
          </span>
        ))}
        <div className="final-report-actions">
          <button
            type="button"
            className="icon-button"
            disabled={working}
            aria-label="Volver a importar actividades de los Anexo 5"
            title="Volver a importar actividades de los Anexo 5"
            onClick={() => void reimport()}
          >
            <RefreshCw size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-button"
            disabled={working}
            aria-label="Descargar Word"
            title="Descargar Word"
            onClick={() => void download('docx')}
          >
            <FileType2 size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-button is-primary"
            disabled={working}
            aria-label="Descargar PDF"
            title="Descargar PDF"
            onClick={() => void download('pdf')}
          >
            <FileDown size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      {showErrors && !validation.valid && (
        <div className="notice error" role="alert">
          <ul>
            {[...new Set(Object.values(validation.errors))].map((message) => <li key={message}>{message}</li>)}
          </ul>
        </div>
      )}
      {error && <p className="error" role="alert">{error}</p>}
      <div className="document-canvas">
        <AnnexDocument draft={draft} onChange={update} errors={showErrors ? validation.errors : {}} />
      </div>
    </section>
  )
}

export function FinalReportEditor() {
  const { workspace, run } = useWorkspace()
  const draft = latestDraft(workspace, 'anexo-11')
  const sources = monthlySources(workspace)
  if (draft) return <DraftEditor key={draft.id} initial={draft} />
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
