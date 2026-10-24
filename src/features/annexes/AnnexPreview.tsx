import { useEffect, useRef, useState } from 'react'
import type { AnnexDraft } from '../../domain/types'
import { errorMessage } from '../../components/download'

export function AnnexPreview({ draft }: { draft: AnnexDraft }) {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('Preparando vista previa…')
  const generation = useRef(0)
  useEffect(() => {
    const revision = ++generation.current
    let obsolete = false
    const timeout = setTimeout(async () => {
      setStatus('Actualizando vista previa…')
      try {
        const { renderAnnex } = await import('../../export/render-annex')
        const blob = await renderAnnex(structuredClone(draft), 'pdf')
        if (obsolete || revision !== generation.current) return
        const next = URL.createObjectURL(blob)
        setUrl((previous) => {
          if (previous) URL.revokeObjectURL(previous)
          return next
        })
        setStatus('Vista previa actualizada')
      } catch (error) {
        if (!obsolete) setStatus(`Vista previa anterior · ${errorMessage(error)}`)
      }
    }, 700)
    return () => {
      obsolete = true
      clearTimeout(timeout)
    }
  }, [draft])
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url)
    },
    [url],
  )
  return (
    <section className="preview-pane" aria-label="Vista previa del documento">
      <output className="preview-status">{status}</output>
      {url ? (
        <iframe title="Vista previa PDF del anexo" src={url} />
      ) : (
        <div className="preview-empty">
          <p>Completa los campos obligatorios para ver el documento.</p>
          <small>La vista previa usa el mismo PDF que descargarás.</small>
        </div>
      )}
    </section>
  )
}
