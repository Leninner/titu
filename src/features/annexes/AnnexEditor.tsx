import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useWorkspace } from '../../app/WorkspaceContext'
import { catalog } from '../../catalog'
import { validateAnnex } from '../../domain/annex'
import { exportAnnex } from './export-annex'
import type { AnnexDraft } from '../../domain/types'
import { repository } from '../../storage/repository'
import { downloadBlob, errorMessage } from '../../components/download'
import { ChevronRight, Download } from 'lucide-react'
import { AnnexDocument } from './AnnexDocument'
import { MonthlyAnnexEditor } from './MonthlyAnnexEditor'
import { useDraftAutosave } from './useDraftAutosave'
import { buildFinalReport } from '../../domain/final-report'

export function AnnexEditor({ initial, headerTarget }: { initial: AnnexDraft; headerTarget?: HTMLElement | null }) {
  const { workspace, refresh } = useWorkspace()
  const { draft, update, flush, status, error } = useDraftAutosave(initial)
  useEffect(() => {
    if (!workspace.profile) return
    const profileSnapshot = { ...initial.profileSnapshot }
    let changed = false
    for (const key of Object.keys(profileSnapshot) as (keyof typeof profileSnapshot)[]) {
      if (profileSnapshot[key] === '' && typeof workspace.profile[key] === 'string' && workspace.profile[key]) {
        Object.assign(profileSnapshot, { [key]: workspace.profile[key] })
        changed = true
      }
    }
    if (changed) update({ ...initial, profileSnapshot })
    // Hydrate once per mounted draft; subsequent edits belong to this document.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [exporting, setExporting] = useState(false)
  const [actionError, setActionError] = useState('')
  const [showValidation, setShowValidation] = useState(false)
  const [warningsAccepted, setWarningsAccepted] = useState(false)
  const template = catalog.templates.find((template) => template.id === draft.templateId)!
  const stale = draft.sourceMonthlyRevisions.filter(
    (source) =>
      workspace.drafts.find((monthly) => monthly.id === source.draftId)?.revision !==
      source.revision,
  )
  const prior = workspace.drafts
    .filter(
      (monthly) => monthly.templateId === 'anexo-5' && monthly.monthlyPeriod < draft.monthlyPeriod,
    )
    .sort((a, b) => b.monthlyPeriod.localeCompare(a.monthlyPeriod))[0]
  const validation = validateAnnex(draft, prior)
  const previousProgress = Number(prior?.fields.avance)
  const minimumProgress = prior?.fields.avance?.trim() && Number.isFinite(previousProgress) && previousProgress >= 0 && previousProgress <= 100 ? previousProgress : 0
  const warningList = Object.values(validation.warnings)

  async function exportDocument(format: 'pdf' | 'docx') {
    setShowValidation(true)
    setActionError('')
    if (!validation.valid) return
    if (warningList.length && !warningsAccepted) {
      setActionError('Revisa las advertencias y confirma los datos antes de exportar.')
      return
    }
    if (draft.needsReview || stale.length) {
      setActionError('Revisa los cambios del perfil o los informes mensuales antes de exportar.')
      return
    }
    setExporting(true)
    try {
      const latest = await flush()
      const latestValidation = validateAnnex(latest, prior)
      if (!latestValidation.valid)
        throw new Error(
          'Los datos cambiaron durante el guardado. Revisa los campos antes de exportar.',
        )
      await exportAnnex(latest, format, workspace)
      await refresh()
    } catch (error) {
      setActionError(errorMessage(error))
    } finally {
      setExporting(false)
    }
  }

  const warningNotice = (warningList.length > 0 && (
            <div className="notice">
              <ul>
                {warningList.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
              <label className="check">
                <input
                  type="checkbox"
                  checked={warningsAccepted}
                  onChange={(event) => setWarningsAccepted(event.target.checked)}
                />{' '}
                He revisado estas diferencias
              </label>
            </div>
          ))

  const toolbar = (
      <div className="editor-header">
        <div className="editor-identity">
          <nav className="editor-breadcrumb" aria-label="Ubicación del documento">
            <a href="#/anexos">Anexos</a>
            <ChevronRight size={15} aria-hidden="true" />
            <h1 aria-label={draft.name || 'Anexo sin nombre'}>
              <input
                className="editor-title-input"
                aria-label="Nombre del borrador"
                title="Cambiar nombre del documento"
                value={draft.name}
                placeholder="Anexo sin nombre"
                onChange={(event) => update({ ...draft, name: event.target.value })}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') event.currentTarget.blur()
                }}
              />
            </h1>
          </nav>
          <output className={error ? 'error' : 'save-status'}>{status}</output>
        </div>
        <div className="actions editor-downloads">
          <button aria-label="Descargar Word" disabled={exporting} onClick={() => void exportDocument('docx')}>
            <Download size={15} aria-hidden="true" /> Word
          </button>
          <button
            className="editor-download-pdf"
            aria-label="Descargar PDF"
            disabled={exporting}
            onClick={() => void exportDocument('pdf')}
          >
            <Download size={15} aria-hidden="true" />
            {exporting ? 'Generando…' : 'PDF'}
          </button>
        </div>
      </div>
  )

  return (
    <div className="editor-page">
      {headerTarget ? createPortal(toolbar, headerTarget) : toolbar}
      {(error || actionError) && (
        <div className="notice error" role="alert">
          {error || actionError}
          <button
            onClick={() =>
              downloadBlob(
                new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' }),
                'borrador-emergencia.json',
              )
            }
          >
            Descargar borrador de emergencia
          </button>
        </div>
      )}
      <div className="document-workspace">
        <div className="document-controls">
          {draft.needsReview && (
            <div className="notice">
              <p>
                Tu modalidad o período cambió. Comprueba si esta plantilla sigue siendo aplicable.
              </p>
              <button
                onClick={() =>
                  update({
                    ...draft,
                    profileSnapshot: { ...workspace.profile! },
                    needsReview: false,
                  })
                }
              >
                Actualizar datos y revisar campos
              </button>
            </div>
          )}
          {stale.length > 0 && (
            <div className="notice">
              <h3>Hay informes mensuales modificados</h3>
              {stale.map((source) => (
                <p key={source.draftId}>
                  Revisión incluida: {source.revision}. Actual:{' '}
                  {workspace.drafts.find((monthly) => monthly.id === source.draftId)?.revision ??
                    'no disponible'}
                  .
                </p>
              ))}
              <details>
                <summary>Comparar actividades</summary>
                <h4>Actividades incluidas</h4>
                {draft.activities.map((activity) => (
                  <p key={activity.id}>
                    {activity.date} · {activity.description}
                  </p>
                ))}
                <h4>Actividades actuales</h4>
                {workspace.drafts
                  .filter((monthly) =>
                    draft.sourceMonthlyRevisions.some((source) => source.draftId === monthly.id),
                  )
                  .flatMap((monthly) => monthly.activities)
                  .map((activity) => (
                    <p key={activity.id}>
                      {activity.date} · {activity.description}
                    </p>
                  ))}
              </details>
              <button
                onClick={() => {
                  try {
                    const rebuilt = buildFinalReport(
                      workspace.drafts.filter((monthly) =>
                        draft.sourceMonthlyRevisions.some(
                          (source) => source.draftId === monthly.id,
                        ),
                      ),
                    )
                    update({
                      ...draft,
                      activities: rebuilt.activities,
                      sourceMonthlyRevisions: rebuilt.sourceMonthlyRevisions,
                      fields: {
                        ...draft.fields,
                        ...rebuilt.fields,
                        avance: draft.fields.avance,
                        mensualesRevisados: 'false',
                      },
                    })
                  } catch (error) {
                    setActionError(errorMessage(error))
                  }
                }}
              >
                Reconstruir después de comparar
              </button>
            </div>
          )}
          {draft.templateId === 'anexo-11' && (
            <label className="check">
              <input
                type="checkbox"
                checked={draft.fields.mensualesRevisados === 'true'}
                onChange={(event) =>
                  update({
                    ...draft,
                    fields: { ...draft.fields, mensualesRevisados: String(event.target.checked) },
                  })
                }
              />{' '}
              Confirmo que las actividades coinciden con los mensuales seleccionados y están listas
              para revisión del tutor
            </label>
          )}
          {showValidation && !validation.valid && (
            <div className="notice error" role="alert">
              <h3>Revisa estos campos</h3>
              <ul>
                {Object.entries(validation.errors).map(([key, message]) => (
                  <li key={key}>{message}</li>
                ))}
              </ul>
            </div>
          )}
          {draft.templateId !== 'anexo-5' && warningNotice}

        </div>
        {draft.templateId === 'anexo-5' ? (
          <MonthlyAnnexEditor minimumProgress={minimumProgress} progressNotice={warningNotice} draft={draft} onChange={update} errors={showValidation ? validation.errors : {}} />
        ) : (
          <div className="document-canvas">
            <AnnexDocument draft={draft} onChange={update} errors={showValidation ? validation.errors : {}} />
          </div>
        )}
          <div className="editor-tools">
            {draft.templateId === 'anexo-5' && (
              <button
                onClick={async () => {
                  try {
                    const current = await flush()
                    const [year, month] = current.monthlyPeriod.split('-').map(Number)
                    const nextMonth = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 7)
                    const next = {
                      ...current,
                      id: crypto.randomUUID(),
                      name: `Anexo 5 · ${nextMonth}`,
                      monthlyPeriod: nextMonth,
                      activities: [],
                      fields: { ...current.fields, fecha: '', avance: '' },
                      revision: 0,
                      savedRevision: 0,
                    }
                    const saved = await repository.saveDraft(next, 0)
                    await refresh()
                    window.location.hash = `/anexos/${saved.id}`
                  } catch (error) {
                    setActionError(errorMessage(error))
                  }
                }}
              >
                Crear el siguiente mes
              </button>
            )}
            <button
              className="text-button danger-text"
              onClick={async () => {
                if (
                  !window.confirm(
                    '¿Eliminar este borrador? Los borradores con exportaciones o referencias se conservan.',
                  )
                )
                  return
                try {
                  await flush()
                  await repository.removeDraft(draft.id)
                  await refresh()
                  window.location.hash = '/anexos'
                } catch (error) {
                  setActionError(errorMessage(error))
                }
              }}
            >
              Eliminar borrador
            </button>
          </div>
          <p className="hint">
            {template.role}. La descarga queda pendiente de revisión y firma; no registra un envío.
            Editar el Word descargado no actualiza este borrador. PDF con texto seleccionable; no
            convierte adjuntos escaneados ni acredita firmas.
          </p>
      </div>
    </div>
  )
}
