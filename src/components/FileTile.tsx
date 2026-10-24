import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Eye, FileImage, FileText, FileType2 } from 'lucide-react'
import type { DocumentVersion } from '../domain/types'
import { repository } from '../storage/repository'

type FileKind = 'pdf' | 'image' | 'word' | 'other'

const thumbnails = new Map<string, Promise<string>>()

export function fileKind(version: Pick<DocumentVersion, 'mime' | 'originalName'>): FileKind {
  if (version.mime === 'application/pdf' || /\.pdf$/i.test(version.originalName)) return 'pdf'
  if (version.mime.startsWith('image/') || /\.(png|jpe?g)$/i.test(version.originalName)) return 'image'
  if (/\.docx?$/i.test(version.originalName)) return 'word'
  return 'other'
}

function thumbnail(version: DocumentVersion, kind: FileKind, width = 360) {
  const key = `${version.blobId}:${kind === 'image' ? 0 : width}`
  let pending = thumbnails.get(key)
  if (!pending) {
    pending = repository.getBlob(version.blobId).then(async (blob) => {
      if (!blob) throw new Error('No se encontró el archivo original')
      if (kind === 'image') return URL.createObjectURL(blob)
      const { renderPdfThumbnail } = await import('./pdf-thumbnail')
      return renderPdfThumbnail(blob, width)
    })
    pending.catch(() => thumbnails.delete(key))
    thumbnails.set(key, pending)
  }
  return pending
}

function FileThumbnail({ version }: { version: DocumentVersion }) {
  const frame = useRef<HTMLSpanElement>(null)
  const [src, setSrc] = useState('')
  const kind = fileKind(version)
  const Icon = kind === 'image' ? FileImage : kind === 'word' ? FileType2 : FileText

  useEffect(() => {
    const element = frame.current
    // Thumbnails render lazily when the tile scrolls into view; without an observer the icon stays.
    if (!element || (kind !== 'pdf' && kind !== 'image') || typeof IntersectionObserver === 'undefined')
      return
    let active = true
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      observer.disconnect()
      thumbnail(version, kind)
        .then((url) => { if (active) setSrc(url) })
        .catch((failure) => console.warn(`Sin miniatura para ${version.originalName}`, failure))
    }, { rootMargin: '240px' })
    observer.observe(element)
    return () => {
      active = false
      observer.disconnect()
    }
  }, [version, kind])

  return (
    <span ref={frame} className={`file-thumb is-${kind} ${src ? 'has-image' : ''}`} aria-hidden="true">
      {src ? (
        <img src={src} alt="" />
      ) : (
        <span className="file-thumb-placeholder">
          <Icon size={28} strokeWidth={1.6} />
        </span>
      )}
    </span>
  )
}

export function FileTile({
  version,
  onPreview,
  muted = false,
  inline = false,
  label,
  children,
}: {
  version: DocumentVersion
  onPreview: () => void
  label?: string
  muted?: boolean
  // Inline tiles belong to a single-file card: no frame of their own, details beside the preview.
  inline?: boolean
  children?: ReactNode
}) {
  return (
    <div className={`file-tile ${muted ? 'is-muted' : ''} ${inline ? 'is-inline' : ''}`}>
      <button
        type="button"
        className="file-tile-preview"
        aria-label={label ?? `Vista previa de ${version.originalName}`}
        onClick={onPreview}
      >
        <FileThumbnail version={version} />
        <span className="file-tile-hover" aria-hidden="true">
          <Eye size={16} /> Ver
        </span>
      </button>
      <div className="file-tile-body">
        <div className="file-tile-meta">
          {label
            ? <span className="file-tile-name" title={version.originalName}>{version.originalName}</span>
            : <h3 title={version.originalName}>{version.originalName}</h3>}
        </div>
        {children && <div className="file-tile-actions">{children}</div>}
      </div>
    </div>
  )
}

// Large first-page view used by the requirement viewer; opens the full preview on click.
export function FilePage({ version, onOpen }: { version: DocumentVersion; onOpen: () => void }) {
  const [view, setView] = useState<{ id: string; src?: string; failed?: boolean }>()
  const kind = fileKind(version)
  const Icon = kind === 'image' ? FileImage : kind === 'word' ? FileType2 : FileText
  const src = view?.id === version.id ? view.src : undefined
  const failed = view?.id === version.id && view.failed

  useEffect(() => {
    if ((kind !== 'pdf' && kind !== 'image') || typeof IntersectionObserver === 'undefined') return
    let active = true
    thumbnail(version, kind, 900)
      .then((url) => { if (active) setView({ id: version.id, src: url }) })
      .catch((failure) => {
        console.warn(`Sin vista para ${version.originalName}`, failure)
        if (active) setView({ id: version.id, failed: true })
      })
    return () => { active = false }
  }, [version, kind])

  return (
    <button
      type="button"
      className={`file-page is-${kind}`}
      aria-label={`Vista previa de ${version.originalName}`}
      onClick={onOpen}
    >
      {src ? (
        <img src={src} alt="" />
      ) : (
        <span className="file-page-placeholder">
          <Icon size={40} strokeWidth={1.4} aria-hidden="true" />
          <span>{kind === 'word' || failed ? 'Sin vista previa · ábrelo para descargarlo' : 'Cargando vista…'}</span>
        </span>
      )}
      <span className="file-page-open" aria-hidden="true"><Eye size={15} /> Ver completo</span>
    </button>
  )
}
