import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Download, Plus, RefreshCw, Search, Trash2, Upload } from 'lucide-react'
import type { DocumentVersion } from '../../domain/types'
import { useWorkspace } from '../../app/WorkspaceContext'
import { EvidencePreview } from '../../components/EvidencePreview'
import { FileDropTarget } from '../../components/FileDropTarget'
import { FilePage, FileTile } from '../../components/FileTile'
import { repository } from '../../storage/repository'
import { downloadBlob, errorMessage } from '../../components/download'
import type { DocumentCategory } from './document-categories'
import { NaturalDateInput } from '../../components/NaturalDateInput'
import { multiFileCategories, systemFileName } from '../../domain/file-names'
import { reportAnalysis } from './report-analysis'

export function DocumentCard({ category }: { category: DocumentCategory }) {
  const { workspace, run, busy } = useWorkspace()
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [signed, setSigned] = useState(false)
  const [issuedOn, setIssuedOn] = useState('')
  const [expiresOn, setExpiresOn] = useState('')
  const [preview, setPreview] = useState<DocumentVersion | null>(null)
  const input = useRef<HTMLInputElement>(null)
  const targetDocument = useRef<string | undefined>(undefined)
  const documents = workspace.documents.filter((document) => document.category === category.id)
  const versions = workspace.versions
    .filter((version) => documents.some((document) => document.id === version.documentId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const current = documents
    .map((document) => versions.find((version) => version.documentId === document.id))
    .filter((version): version is DocumentVersion => !!version)
  const single = !multiFileCategories.has(category.id)
  const [focusId, setFocusId] = useState<string>()
  const focus = current.find((version) => version.documentId === focusId) ?? current[0]
  const hasSignature = versions[0]?.signatureStatus === 'reported-signed'
  const ready = versions.length > 0 && (!category.signed || hasSignature)
  const statusKey = ready ? 'done' : versions.length ? 'partial' : 'pending'
  const status = !versions.length
    ? 'Pendiente'
    : category.signed && !hasSignature
      ? 'Revisar firma'
      : 'Listo'

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 4000)
    return () => window.clearTimeout(timer)
  }, [notice])

  async function upload(files: FileList | File[]) {
    if (!files.length || uploading) return
    setUploading(true)
    setError('')
    setNotice('')
    const failed: string[] = []
    let saved = 0
    for (const file of Array.from(files)) {
      try {
        if (file.size > 25 * 1024 * 1024) throw new Error('El máximo es 25 MiB por archivo')
        if (!/\.(pdf|docx?|jpe?g|png)$/i.test(file.name))
          throw new Error('Usa PDF, Word, JPG o PNG')
        const { inspectPdf } = await import('./inspect-pdf')
        const textualPdfStatus = /\.pdf$/i.test(file.name) ? await inspectPdf(file) : 'unknown'
        // Names come from the category; read storage each time so batches number correctly.
        const name = systemFileName(await repository.loadWorkspace(), category.id, file.name, targetDocument.current)
        await repository.addDocumentVersion({
          file,
          originalName: name,
          name,
          documentId: targetDocument.current,
          category: category.id,
          signatureStatus: signed ? 'reported-signed' : 'unsigned',
          textualPdfStatus,
          issuedOn: issuedOn || undefined,
          expiresOn: expiresOn || undefined,
          reportAnalysis: await reportAnalysis(file, category.id),
        })
        saved++
      } catch (failure) {
        failed.push(`${file.name}: ${errorMessage(failure)}`)
      }
    }
    targetDocument.current = undefined
    setSigned(false)
    setError(failed.join(' · '))
    setNotice(saved === 1 ? 'Archivo agregado' : saved > 1 ? `${saved} archivos agregados` : '')
    setUploading(false)
  }

  function select(documentId?: string) {
    targetDocument.current = documentId
    input.current?.click()
  }

  async function changeSignature(version: DocumentVersion, signedNow: boolean) {
    await run(async () => {
      const blob = await repository.getBlob(version.blobId)
      if (!blob) throw new Error('No se encontró el archivo original')
      await repository.addDocumentVersion({
        file: blob,
        originalName: version.originalName,
        documentId: version.documentId,
        category: category.id,
        signatureStatus: signedNow ? 'reported-signed' : 'unsigned',
        textualPdfStatus: version.textualPdfStatus,
        issuedOn: version.issuedOn,
        expiresOn: version.expiresOn,
        reportAnalysis: version.reportAnalysis,
      })
    })
  }


  return (
    // The card supplements the keyboard-accessible upload button with file dropping.
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <article
      className={`req-viewer document-viewer is-${statusKey} ${dragging ? 'is-dragging' : ''}`}
      aria-label={category.name}
      onDragOver={(event) => {
        event.preventDefault()
        if (!uploading) setDragging(true)
      }}
      onDragLeave={(event) => {
        if (
          !(event.relatedTarget instanceof Node) ||
          !event.currentTarget.contains(event.relatedTarget)
        )
          setDragging(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        if (single && event.dataTransfer.files.length > 1) {
          setError('Esta categoría guarda un solo archivo. Suelta uno a la vez.')
          return
        }
        targetDocument.current = single ? current[0]?.documentId : undefined
        void upload(event.dataTransfer.files)
      }}
    >
      <div className="req-viewer-head">
        <h2>{category.name}</h2>
        <span className={`req-status is-${statusKey}`}>{status}</span>
      </div>
      <p className="req-viewer-desc">{category.description}</p>
      {focus ? (
        <>
          <FilePage version={focus} onOpen={() => setPreview(focus)} />
          <div className="req-viewer-bar">
            <h3 title={focus.originalName}>{focus.originalName}</h3>
            <div className="req-viewer-controls">
              {category.signed && (
                <label className="check">
                  <input
                    type="checkbox"
                    checked={focus.signatureStatus === 'reported-signed'}
                    disabled={busy}
                    aria-label={`Este archivo ya tiene las firmas requeridas: ${focus.originalName}`}
                    onChange={(event) => void changeSignature(focus, event.target.checked)}
                  />
                  Tiene firmas
                </label>
              )}
              {single ? (
                <button
                  type="button"
                  className="req-button"
                  disabled={uploading}
                  aria-label={`Reemplazar ${focus.originalName}`}
                  onClick={() => select(focus.documentId)}
                >
                  <RefreshCw size={15} aria-hidden="true" /> {uploading ? 'Guardando…' : 'Reemplazar'}
                </button>
              ) : (
                <FileDropTarget hasFile multiple uploading={uploading} onSelect={() => select()} />
              )}
            </div>
          </div>
          {current.length > 1 && (
            <div className="req-viewer-strip" aria-label={`Archivos de ${category.name}`}>
              {current.map((version) => (
                <FileTile
                  key={version.documentId}
                  version={version}
                  inline
                  muted={version !== focus}
                  label={`Mostrar ${version.originalName}`}
                  onPreview={() => setFocusId(version.documentId)}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <button type="button" className="req-drop" disabled={uploading} onClick={() => select()}>
          <Upload size={22} aria-hidden="true" />
          <strong>{uploading ? 'Guardando…' : single ? 'Subir archivo' : 'Subir archivos'}</strong>
          <span>PDF, Word, JPG o PNG</span>
        </button>
      )}
      <div className="file-row-links">
        {(category.signed || category.id === 'no-adeudar') && <details className="upload-options">
          <summary>
            Firma y fechas <span>opcional</span>
          </summary>
          <label className="check">
            <input
              type="checkbox"
              checked={signed}
              onChange={(event) => setSigned(event.target.checked)}
            />
            Los archivos de esta carga ya están firmados
          </label>
          <p className="hint">Solo registramos tu reporte; no validamos la firma.</p>
          {category.id === 'no-adeudar' && (
            <>
              <NaturalDateInput
                label="Emisión real"
                name={`emision-${category.id}`}
                value={issuedOn}
                onChange={setIssuedOn}
              />
              <NaturalDateInput
                label="Vencimiento impreso"
                name={`vencimiento-${category.id}`}
                value={expiresOn}
                onChange={setExpiresOn}
              />
            </>
          )}
        </details>}
        {versions.length > 0 && (
          <button
            type="button"
            className="file-row-link"
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          >
            Historial · {versions.length} {versions.length === 1 ? 'versión' : 'versiones'}
            {documents.length > 1 && ` en ${documents.length} documentos`}
            <ChevronDown size={15} aria-hidden="true" />
          </button>
        )}
      </div>
      {dragging && (
        <div className="file-drop-overlay" aria-hidden="true">
          {single && current.length ? 'Suelta para reemplazar el archivo' : `Suelta para guardar en ${category.name}`}
        </div>
      )}
      <input
        ref={input}
        className="visually-hidden"
        tabIndex={-1}
        type="file"
        multiple={!single}
        accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
        aria-label={`Agregar archivo a ${category.name}`}
        onChange={(event) => {
          if (event.target.files) void upload(event.target.files)
          event.target.value = ''
        }}
      />
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <output className="file-card-notice" aria-live="polite">{notice}</output>
      {expanded && (
        <div className="card-files">
          {documents.map((document) => (
            <div className="card-file" key={document.id}>
              <h4>{document.name}</h4>
              {versions
                .filter((version) => version.documentId === document.id)
                .map((version, index) => (
                  <div className="file-version document-version" key={version.id}>
                    <div>
                      <span className="file-name">{version.originalName}</span>
                      <small>
                        {version.signatureStatus === 'reported-signed'
                          ? 'Firma reportada por ti'
                          : 'Sin firma reportada'}
                        {index === 0 ? ' · Actual' : ''}
                      </small>
                      {version.issuedOn && (
                        <small>
                          Emitido: {version.issuedOn}
                          {version.expiresOn ? ` · Vence: ${version.expiresOn}` : ''}
                        </small>
                      )}
                      {version.textualPdfStatus === 'no-text-detected' && (
                        <small className="error">Sin texto detectable. Revisar OCR.</small>
                      )}
                    </div>
                    <div className="actions">
                      <button
                        className="icon-button"
                        title="Vista previa"
                        aria-label={`Vista previa de ${version.originalName}`}
                        onClick={() => setPreview(version)}
                      >
                        <Search size={16} />
                      </button>
                      <button
                        className="icon-button"
                        title="Descargar versión"
                        aria-label={`Descargar ${version.originalName}`}
                        onClick={() =>
                          void run(async () => {
                            const blob = await repository.getBlob(version.blobId)
                            if (blob) downloadBlob(blob, version.originalName)
                          })
                        }
                      >
                        <Download size={16} />
                      </button>
                      <button
                        className="icon-button"
                        title="Eliminar versión"
                        aria-label={`Eliminar ${version.originalName}`}
                        disabled={busy}
                        onClick={() => {
                          if (
                            window.confirm(
                              '¿Eliminar esta versión? Las versiones usadas en trámites o envíos están protegidas.',
                            )
                          )
                            void run(() => repository.removeVersion(version.id))
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              <button className="text-button" onClick={() => select(document.id)}>
                <Plus size={14} /> Subir nueva versión
              </button>
            </div>
          ))}
        </div>
      )}
      {preview && <EvidencePreview version={preview} onClose={() => setPreview(null)} />}
    </article>
  )
}
