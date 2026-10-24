import { useEffect, useRef, useState } from 'react'
import { Download, X } from 'lucide-react'
import { downloadBlob, errorMessage } from './download'
import type { DocumentVersion } from '../domain/types'
import { repository } from '../storage/repository'

export function EvidencePreview({
  version,
  onClose,
}: {
  version: DocumentVersion
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [url, setUrl] = useState('')
  const [blob, setBlob] = useState<Blob | null>(null)
  const [error, setError] = useState('')
  const isPdf = version.mime === 'application/pdf' || /\.pdf$/i.test(version.originalName)
  const isImage = version.mime.startsWith('image/') || /\.(png|jpe?g)$/i.test(version.originalName)

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (typeof element.showModal === 'function') element.showModal()
    else element.setAttribute('open', '')
    return () => {
      if (typeof element.close === 'function' && element.open) element.close()
      else element.removeAttribute('open')
    }
  }, [])

  useEffect(() => {
    let active = true
    let objectUrl = ''
    void repository.getBlob(version.blobId)
      .then((savedBlob) => {
        if (!active) return
        if (!savedBlob) throw new Error('No se encontró el archivo original')
        setBlob(savedBlob)
        if (isPdf || isImage) {
          objectUrl = URL.createObjectURL(savedBlob)
          setUrl(objectUrl)
        }
      })
      .catch((failure) => {
        if (active) setError(errorMessage(failure))
      })
    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [version.blobId, isPdf, isImage])

  return (
    // Clicking the backdrop closes the dialog; Escape is handled by onCancel.
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialog}
      className="evidence-preview"
      aria-label={`Vista previa de ${version.originalName}`}
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <div className="evidence-preview-header">
        <div>
          <strong>{version.originalName}</strong>
          <span>Guardado en tu expediente</span>
        </div>
        <div className="evidence-preview-actions">
          <button
            type="button"
            className="icon-button"
            title="Descargar"
            aria-label={`Descargar ${version.originalName}`}
            disabled={!blob}
            onClick={() => blob && downloadBlob(blob, version.originalName)}
          >
            <Download size={17} aria-hidden="true" />
          </button>
          <button type="button" className="icon-button" aria-label="Cerrar vista previa" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="evidence-preview-body">
        {error && <p className="error" role="alert">{error}</p>}
        {!error && !blob && <output>Abriendo archivo…</output>}
        {!error && url && isImage && <img src={url} alt={`Vista previa de ${version.originalName}`} />}
        {!error && url && isPdf && <iframe src={url} title={`Vista previa de ${version.originalName}`} />}
        {!error && blob && !isPdf && !isImage && (
          <div className="evidence-preview-fallback">
            <p>Este formato no tiene vista previa en el navegador.</p>
            <button type="button" onClick={() => downloadBlob(blob, version.originalName)}>
              <Download size={16} aria-hidden="true" />
              Descargar archivo
            </button>
          </div>
        )}
      </div>
    </dialog>
  )
}
