import { useRef, useState, type DragEvent } from 'react'
import { CalendarPlus, RefreshCw, Upload, X } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { catalog } from '../../catalog'
import { errorMessage } from '../../components/download'
import { EvidencePreview } from '../../components/EvidencePreview'
import { FilePage } from '../../components/FileTile'
import {
  monthLabel,
  monthOverrideKey,
  monthlyCoverage,
  progressByMonth,
  rangeWith,
  rangeWithout,
  reportMonth,
  type MonthlyCoverage,
  type MonthProgress,
} from '../../domain/monthly-report'
import type { DocumentVersion, Workspace } from '../../domain/types'
import { repository } from '../../storage/repository'
import type { FileHandlers } from './PrepareStep'
import { CardProgress, ThesisProgress } from './ThesisProgress'

type MonthStatus = MonthlyCoverage['months'][number]['status']

const statusCopy: Record<MonthStatus, { text: string; tone: string }> = {
  done: { text: 'Listo', tone: 'done' },
  missing: { text: 'Pendiente', tone: 'pending' },
  unsigned: { text: 'Confirmar firma', tone: 'partial' },
  topic: { text: 'Tema distinto', tone: 'partial' },
}

const capitalized = (text: string) => text.charAt(0).toLocaleUpperCase('es') + text.slice(1)

function latestPerDocument(workspace: Workspace) {
  const monthlyDocuments = new Set(
    workspace.documents.filter((document) => document.category === 'mensual').map((document) => document.id),
  )
  return workspace.versions
    .filter((version) => monthlyDocuments.has(version.documentId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id))
}

function MonthCard({
  month,
  status,
  report,
  candidate,
  progress,
  removable,
  files,
  onRemove,
}: {
  month: string
  status: MonthStatus
  report?: DocumentVersion
  progress?: MonthProgress
  candidate?: DocumentVersion
  removable: boolean
  files: FileHandlers
  onRemove: () => void
}) {
  const { run } = useWorkspace()
  const input = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [signing, setSigning] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<DocumentVersion>()
  const shown = report ?? candidate
  const label = capitalized(monthLabel(month))
  const detected = shown?.reportAnalysis?.month

  async function upload(file?: File) {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const version = await files.onUpload(file, 'mensual', report?.documentId)
      await repository.saveSetting(monthOverrideKey(version.documentId), month)
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setUploading(false)
    }
  }

  async function sign(version: DocumentVersion, signed: boolean) {
    setSigning(true)
    await run(() => files.onSignatureChange(version, signed))
    setSigning(false)
  }

  const drop = {
    onDragOver: (event: DragEvent<HTMLElement>) => event.preventDefault(),
    onDrop: (event: DragEvent<HTMLElement>) => {
      event.preventDefault()
      void upload(event.dataTransfer.files[0])
    },
  }

  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <article className={`req-viewer month-card is-${statusCopy[status].tone}`} aria-label={`Anexo 5 de ${monthLabel(month)}`} {...drop}>
      <div className="req-viewer-head">
        <h4>{label}</h4>
        <span className={`req-status is-${statusCopy[status].tone}`}>{statusCopy[status].text}</span>
        {removable && (
          <button type="button" className="icon-button month-card-remove" aria-label={`Quitar ${monthLabel(month)}`} onClick={onRemove}>
            <X size={15} aria-hidden="true" />
          </button>
        )}
      </div>
      {shown ? (
        <>
          <FilePage version={shown} onOpen={() => setPreview(shown)} />
          <div className="req-viewer-bar">
            <strong title={shown.originalName}>{shown.originalName}</strong>
            {report && <CardProgress item={progress} />}
            <div className="req-viewer-controls">
              <label className="check">
                <input
                  type="checkbox"
                  checked={!!report}
                  aria-label={`Incluir ${shown.originalName} en esta entrega`}
                  onChange={(event) => files.onToggle(shown.id, event.target.checked)}
                />
                {report ? 'Incluido' : 'Usar en esta entrega'}
              </label>
              {report && (
                <label className="check">
                  <input
                    type="checkbox"
                    checked={report.signatureStatus === 'reported-signed'}
                    disabled={signing}
                    aria-label={`Firmado por el tutor: ${report.originalName}`}
                    onChange={(event) => void sign(report, event.target.checked)}
                  />
                  Firmado por el tutor
                </label>
              )}
              <button type="button" className="req-button" disabled={uploading} onClick={() => input.current?.click()}>
                <RefreshCw size={15} aria-hidden="true" /> {uploading ? 'Guardando…' : 'Reemplazar'}
              </button>
            </div>
          </div>
          {detected && detected !== month && (
            <p className="req-viewer-note">El documento indica {monthLabel(detected)}.</p>
          )}
          {status === 'topic' && <p className="req-viewer-note">El tema no coincide con el aprobado.</p>}
        </>
      ) : (
        <button type="button" className="req-drop" disabled={uploading} onClick={() => input.current?.click()}>
          <Upload size={22} aria-hidden="true" />
          <strong>{uploading ? 'Guardando…' : `Subir Anexo 5 de ${monthLabel(month)}`}</strong>
          <span>PDF, Word, JPG o PNG</span>
        </button>
      )}
      <input
        ref={input}
        className="visually-hidden"
        tabIndex={-1}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        aria-label={`Subir Anexo 5 de ${monthLabel(month)}`}
        onChange={(event) => {
          void upload(event.target.files?.[0])
          event.target.value = ''
        }}
      />
      {error && <p className="error" role="alert">{error}</p>}
      {preview && <EvidencePreview version={preview} onClose={() => setPreview(undefined)} />}
    </article>
  )
}

function UnassignedCard({ versions, onAssign }: { versions: DocumentVersion[]; onAssign: (version: DocumentVersion, month: string) => void }) {
  return (
    <article className="req-viewer month-card is-partial" aria-label="Informes sin mes">
      <div className="req-viewer-head">
        <h4>Sin mes</h4>
        <span className="req-status is-partial">Asignar mes</span>
      </div>
      <ul className="month-card-unassigned">
        {versions.map((version) => (
          <li key={version.id}>
            <strong title={version.originalName}>{version.originalName}</strong>
            <label>
              <span className="visually-hidden">Mes del informe {version.originalName}</span>
              <input type="month" onChange={(event) => onAssign(version, event.target.value)} />
            </label>
          </li>
        ))}
      </ul>
    </article>
  )
}

function AddMonthCard({ onAdd }: { onAdd: (month: string) => void }) {
  const [picking, setPicking] = useState(false)
  return (
    <article className="req-viewer month-card month-card-add" aria-label="Agregar mes">
      {picking ? (
        <label className="month-card-picker">
          <span>Mes del informe</span>
          <input
            type="month"
            aria-label="Mes a agregar"
            onChange={(event) => {
              if (!event.target.value) return
              onAdd(event.target.value)
              setPicking(false)
            }}
          />
        </label>
      ) : (
        <button type="button" className="req-drop" onClick={() => setPicking(true)}>
          <CalendarPlus size={22} aria-hidden="true" />
          <strong>Agregar mes</strong>
        </button>
      )}
    </article>
  )
}

export function MonthlyReportCards({
  selectedIds,
  signed,
  files,
}: {
  selectedIds: string[]
  signed: boolean
  files: FileHandlers
}) {
  const { workspace, run } = useWorkspace()
  const versions = latestPerDocument(workspace)
  const selected = versions.filter((version) => selectedIds.includes(version.id))
  const coverage = monthlyCoverage(selected, workspace, catalog, signed)
  const saveRange = (range: { from?: string; to?: string }) =>
    void run(async () => {
      await repository.saveSetting('monthlyFrom', range.from ?? '')
      await repository.saveSetting('monthlyTo', range.to ?? '')
    })
  const candidateFor = (month: string) =>
    versions.find(
      (version) =>
        !selectedIds.includes(version.id) &&
        !selected.some((item) => item.documentId === version.documentId) &&
        reportMonth(version, workspace) === month,
    )
  const ready = coverage.months.filter((item) => item.status === 'done').length
  const progress = progressByMonth(coverage)
  return (
    <section className="month-cards-section" aria-label="Informes mensuales por mes">
      <ThesisProgress
        current={progress.current}
        summary={coverage.months.length ? `${ready} de ${coverage.months.length} meses listos` : 'Agrega el primer mes de informe'}
      />
      <div className="req-cards month-cards">
      {coverage.months.map((item, index) => (
        <MonthCard
          key={item.month}
          month={item.month}
          status={item.status}
          report={item.reports[0]}
          candidate={candidateFor(item.month)}
          progress={progress.months[index]}
          removable={!item.reports.length && (index === 0 || index === coverage.months.length - 1)}
          files={files}
          onRemove={() => saveRange(rangeWithout(coverage, item.month))}
        />
      ))}
      {coverage.unassigned.length > 0 && (
        <UnassignedCard
          versions={coverage.unassigned}
          onAssign={(version, month) =>
            void run(() => repository.saveSetting(monthOverrideKey(version.documentId), month))}
        />
      )}
      <AddMonthCard onAdd={(month) => saveRange(rangeWith(coverage, month))} />
      </div>
    </section>
  )
}
