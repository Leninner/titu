import { ArrowRight, Download, FileImage, FileText, FileType2, FileWarning } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { downloadBlob } from '../../components/download'
import { fileKind } from '../../components/FileTile'
import { latestCategoryVersion } from '../../domain/category-versions'
import type { DocumentVersion, RequestAttachment } from '../../domain/types'
import { repository } from '../../storage/repository'

const kindIcons = { pdf: FileText, image: FileImage, word: FileType2, other: FileText }

function StoredAttachment({ attachment, version }: { attachment: RequestAttachment; version: DocumentVersion }) {
  const { run, busy } = useWorkspace()
  const Icon = kindIcons[fileKind(version)]
  const download = () =>
    run(async () => {
      const blob = await repository.getBlob(version.blobId)
      if (!blob) throw new Error('No se encontró el archivo original')
      downloadBlob(blob, version.originalName)
    })
  return (
    <li className="request-attachment">
      <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
      <span className="request-attachment-copy">
        <strong title={version.originalName}>{version.originalName}</strong>
        <span>{attachment.label}</span>
      </span>
      <button type="button" disabled={busy} aria-label={`Descargar ${attachment.label}`} onClick={() => void download()}>
        <Download size={14} aria-hidden="true" /> Descargar
      </button>
    </li>
  )
}

function MissingAttachment({ attachment }: { attachment: RequestAttachment }) {
  return (
    <li className="request-attachment is-missing">
      <FileWarning size={22} strokeWidth={1.6} aria-hidden="true" />
      <span className="request-attachment-copy">
        <strong>{attachment.label}</strong>
        <span>Aún no la subes</span>
      </span>
      <a href="#/documentos">
        Ir a Documentos <ArrowRight size={14} aria-hidden="true" />
      </a>
    </li>
  )
}

export function RequestAttachments({ attachments }: { attachments: RequestAttachment[] }) {
  const { workspace } = useWorkspace()
  return (
    <section className="request-attachments" aria-label="Adjuntos">
      <h3>Adjuntos</h3>
      <ul>
        {attachments.map((attachment) => {
          const version = latestCategoryVersion(workspace, attachment.category)
          return version
            ? <StoredAttachment key={attachment.category} attachment={attachment} version={version} />
            : <MissingAttachment key={attachment.category} attachment={attachment} />
        })}
      </ul>
    </section>
  )
}
