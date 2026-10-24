import { useRef, useState, type DragEvent } from 'react'
import { Circle, CircleAlert, CircleCheck, Plus, RefreshCw, Upload } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { FilePage, FileTile } from '../../components/FileTile'
import { EvidencePreview } from '../../components/EvidencePreview'
import { InfoTip } from '../../components/InfoTip'
import { errorMessage } from '../../components/download'
import { multiFileCategories } from '../../domain/file-names'
import { AnnexFormatButton } from './AnnexFormatButton'
import type { DocumentVersion, Requirement, Workspace } from '../../domain/types'

export type FileRequirement = Requirement & { category: string }
export type RequirementPurpose = 'delivery' | 'result'
type Status = 'done' | 'partial' | 'pending'

const purposeCopy = {
  delivery: {
    include: (name: string) => `Incluir ${name} en esta entrega`,
    included: 'Incluido',
    offer: 'Usar en esta entrega',
    outside: 'Está en Documentos, pero aún no forma parte de esta entrega.',
  },
  result: {
    include: (name: string) => `Registrar ${name} como resultado`,
    included: 'Registrado',
    offer: 'Registrar como resultado',
    outside: 'Está en Documentos, pero aún no figura como resultado de este trámite.',
  },
}

function requirementState(
  requirement: FileRequirement,
  selectedIds: string[],
  excludedIds: Set<string>,
  workspace: Workspace,
) {
  const documentIds = new Set(workspace.documents
    .filter((document) => document.category === requirement.category)
    .map((document) => document.id))
  const versions = workspace.versions
    .filter((version) => documentIds.has(version.documentId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id))
  const selected = versions.filter((version) => selectedIds.includes(version.id))
  const multiple = multiFileCategories.has(requirement.category)
  // A single-file requirement already covered offers replacement instead of more files.
  const replacing = !multiple && selected.length > 0
  // Older versions stay in Documents' history; only the newest of each unused document is offered.
  const usedDocuments = new Set(selected.map((version) => version.documentId))
  const available = requirement.category === 'personal' || replacing
    ? []
    : versions.filter((version, index) =>
      !usedDocuments.has(version.documentId) &&
      !excludedIds.has(version.id) &&
      versions.findIndex((item) => item.documentId === version.documentId) === index)
  const ready = selected.some(
    (version) => !requirement.signed || version.signatureStatus === 'reported-signed',
  )
  const status: Status = ready ? 'done' : selected.length ? 'partial' : 'pending'
  const statusText = ready
    ? 'Listo'
    : selected.length
      ? 'Confirmar firma'
      : requirement.optional ? 'Opcional' : 'Pendiente'
  return { requirement, selected, available, multiple, replacing, status, statusText }
}
type RequirementState = ReturnType<typeof requirementState>

const StatusIcon = { done: CircleCheck, partial: CircleAlert, pending: Circle }

function useFileDrop(onFiles: (files: FileList) => void, disabled: boolean) {
  const [dragging, setDragging] = useState(false)
  return {
    dragging,
    handlers: {
      onDragOver: (event: DragEvent<HTMLElement>) => {
        event.preventDefault()
        if (!disabled) setDragging(true)
      },
      onDragLeave: (event: DragEvent<HTMLElement>) => {
        if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget))
          setDragging(false)
      },
      onDrop: (event: DragEvent<HTMLElement>) => {
        event.preventDefault()
        setDragging(false)
        if (!disabled) onFiles(event.dataTransfer.files)
      },
    },
  }
}

function ListItem({
  state,
  active,
  anchorId,
  onSelect,
  onFiles,
}: {
  state: RequirementState
  active: boolean
  anchorId: string
  onSelect: () => void
  onFiles: (files: FileList) => void
}) {
  const { dragging, handlers } = useFileDrop(onFiles, false)
  const Icon = StatusIcon[state.status]
  const file = state.selected[0]
  return (
    // The row button is keyboard accessible; dropping files on it is a pointer shortcut.
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <li className={`req-item is-${state.status} ${active ? 'is-active' : ''} ${dragging ? 'is-dragging' : ''}`} {...handlers}>
      <button type="button" id={anchorId} aria-current={active ? 'true' : undefined} onClick={onSelect}>
        <Icon size={18} aria-hidden="true" />
        <span className="req-item-copy">
          <strong>{state.requirement.label}</strong>
          <span>
            {dragging
              ? 'Suelta para subir aquí'
              : file
                ? `${state.statusText} · ${file.originalName}${state.selected.length > 1 ? ` y ${state.selected.length - 1} más` : ''}`
                : state.statusText}
          </span>
        </span>
      </button>
    </li>
  )
}

function Viewer({
  id,
  state,
  purpose,
  note,
  uploading,
  error,
  onPick,
  onFiles,
  onToggle,
  onSignatureChange,
}: {
  id?: string
  state: RequirementState
  purpose: RequirementPurpose
  note?: string
  uploading: boolean
  error: string
  onPick: (documentId?: string) => void
  onFiles: (files: FileList) => void
  onToggle: (versionId: string, checked: boolean) => void
  onSignatureChange: (version: DocumentVersion, signed: boolean) => Promise<void>
}) {
  const { requirement, selected, available, replacing } = state
  const files = [...selected, ...available]
  const [focusId, setFocusId] = useState<string>()
  const [preview, setPreview] = useState<DocumentVersion | null>(null)
  const [changingSignature, setChangingSignature] = useState(false)
  const [signatureError, setSignatureError] = useState('')
  const focus = files.find((version) => version.id === focusId) ?? files[0]
  const included = focus ? selected.includes(focus) : false
  const { dragging, handlers } = useFileDrop(onFiles, uploading)
  const copy = purposeCopy[purpose]

  async function changeSignature(version: DocumentVersion, signed: boolean) {
    setChangingSignature(true)
    setSignatureError('')
    try {
      await onSignatureChange(version, signed)
    } catch (failure) {
      setSignatureError(errorMessage(failure))
    } finally {
      setChangingSignature(false)
    }
  }

  return (
    // The viewer supplements its upload buttons with file dropping.
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <article
      id={id}
      className={`req-viewer is-${state.status} ${dragging ? 'is-dragging' : ''}`}
      aria-label={requirement.label}
      {...handlers}
    >
      <div className="req-viewer-head">
        <h4>{requirement.label}</h4>
        {requirement.detail && <InfoTip label={requirement.label} text={requirement.detail} />}
        <span className={`req-status is-${state.status}`}>{state.statusText}</span>
        {requirement.category === 'mensual' && <a href="#/anexos">Crear Anexo 5</a>}
        {requirement.template && <AnnexFormatButton templateId={requirement.template} />}
      </div>
      {note && <p className="req-viewer-usage">{note}</p>}
      {focus ? (
        <>
          <FilePage version={focus} onOpen={() => setPreview(focus)} />
          <div className="req-viewer-bar">
            <strong title={focus.originalName}>{focus.originalName}</strong>
            <div className="req-viewer-controls">
              {included && requirement.category !== 'personal' && (
                <label className="check">
                  <input
                    type="checkbox"
                    checked
                    aria-label={copy.include(focus.originalName)}
                    onChange={(event) => onToggle(focus.id, event.target.checked)}
                  />
                  {copy.included}
                </label>
              )}
              {!included && (
                <label className="check">
                  <input
                    type="checkbox"
                    checked={false}
                    aria-label={copy.include(focus.originalName)}
                    onChange={(event) => onToggle(focus.id, event.target.checked)}
                  />
                  {copy.offer}
                </label>
              )}
              {included && requirement.signed && (
                <label className="check">
                  <input
                    type="checkbox"
                    checked={focus.signatureStatus === 'reported-signed'}
                    disabled={changingSignature}
                    aria-label={`Este archivo ya tiene las firmas requeridas: ${focus.originalName}`}
                    onChange={(event) => void changeSignature(focus, event.target.checked)}
                  />
                  Tiene firmas
                </label>
              )}
              {replacing ? (
                <button
                  type="button"
                  className="req-button"
                  disabled={uploading}
                  aria-label={`Reemplazar ${selected[0].originalName}`}
                  onClick={() => onPick(selected[0].documentId)}
                >
                  <RefreshCw size={15} aria-hidden="true" /> {uploading ? 'Guardando…' : 'Reemplazar'}
                </button>
              ) : (
                <button type="button" className="req-button" disabled={uploading} onClick={() => onPick()}>
                  <Plus size={15} aria-hidden="true" /> {uploading ? 'Guardando…' : 'Agregar otro archivo'}
                </button>
              )}
            </div>
          </div>
          {!included && <p className="req-viewer-note">{copy.outside}</p>}
          {files.length > 1 && (
            <div className="req-viewer-strip" aria-label="Archivos de este requisito">
              {files.map((version) => (
                <FileTile
                  key={version.id}
                  version={version}
                  inline
                  muted={!selected.includes(version)}
                  label={`Mostrar ${version.originalName}`}
                  onPreview={() => setFocusId(version.id)}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <button type="button" className="req-drop" disabled={uploading} onClick={() => onPick()}>
          <Upload size={22} aria-hidden="true" />
          <strong>{uploading ? 'Guardando…' : 'Subir archivo'}</strong>
          <span>PDF, Word, JPG o PNG</span>
        </button>
      )}
      {dragging && (
        <div className="file-drop-overlay" aria-hidden="true">
          {replacing ? 'Suelta para reemplazar el archivo' : 'Suelta para usar en este requisito'}
        </div>
      )}
      {(error || signatureError) && <p className="error" role="alert">{error || signatureError}</p>}
      {preview && <EvidencePreview version={preview} onClose={() => setPreview(null)} />}
    </article>
  )
}

export function RequirementsPanel({
  requirements,
  selectedIds,
  anchorPrefix,
  layout = 'split',
  purpose = 'delivery',
  notes = {},
  excludedIds = [],
  onToggle,
  onUpload,
  onSignatureChange,
}: {
  requirements: FileRequirement[]
  selectedIds: string[]
  anchorPrefix: string
  // 'cards' shows every requirement at once, each one its own drop target.
  layout?: 'split' | 'cards'
  purpose?: RequirementPurpose
  notes?: Record<string, string>
  excludedIds?: string[]
  onToggle: (versionId: string, checked: boolean) => void
  onUpload: (file: File, category: string, documentId?: string) => Promise<unknown>
  onSignatureChange: (version: DocumentVersion, signed: boolean) => Promise<void>
}) {
  const { workspace } = useWorkspace()
  const excluded = new Set(excludedIds)
  const states = requirements.map((requirement) =>
    requirementState(requirement, selectedIds, excluded, workspace))
  const [activeId, setActiveId] = useState(
    () => (states.find((state) => state.status !== 'done') ?? states[0])?.requirement.id,
  )
  const [uploadingId, setUploadingId] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const input = useRef<HTMLInputElement>(null)
  const target = useRef<{ id: string; documentId?: string } | null>(null)
  const active = states.find((state) => state.requirement.id === activeId) ?? states[0]

  async function upload(state: RequirementState, files: FileList | File[], documentId?: string) {
    const id = state.requirement.id
    setActiveId(id)
    if (files.length > 1 && !state.multiple) {
      setErrors({ ...errors, [id]: 'Este requisito admite un solo archivo.' })
      return
    }
    if (!files.length || uploadingId) return
    setUploadingId(id)
    setErrors({ ...errors, [id]: '' })
    const failed: string[] = []
    for (const file of Array.from(files)) {
      try {
        await onUpload(file, state.requirement.category, documentId ?? (state.replacing ? state.selected[0].documentId : undefined))
      } catch (failure) {
        failed.push(files.length > 1 ? `${file.name}: ${errorMessage(failure)}` : errorMessage(failure))
      }
    }
    setErrors((current) => ({ ...current, [id]: failed.join(' · ') }))
    setUploadingId('')
  }

  function pick(state: RequirementState, documentId?: string) {
    target.current = { id: state.requirement.id, documentId }
    input.current?.click()
  }

  if (!active) return null
  const fileInput = (
    <input
      ref={input}
      className="visually-hidden"
      tabIndex={-1}
      type="file"
      multiple
      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      aria-label={`Subir archivo para ${active.requirement.label}`}
      onChange={(event) => {
        const state = states.find((item) => item.requirement.id === target.current?.id) ?? active
        if (event.target.files) void upload(state, event.target.files, target.current?.documentId)
        target.current = null
        event.target.value = ''
      }}
    />
  )
  if (layout === 'cards')
    return (
      <div className="req-cards">
        {states.map((state) => (
          <Viewer
            key={state.requirement.id}
            id={`${anchorPrefix}-${state.requirement.id}`}
            state={state}
            purpose={purpose}
            note={notes[state.requirement.id]}
            uploading={uploadingId === state.requirement.id}
            error={errors[state.requirement.id] ?? ''}
            onPick={(documentId) => pick(state, documentId)}
            onFiles={(files) => void upload(state, files)}
            onToggle={onToggle}
            onSignatureChange={onSignatureChange}
          />
        ))}
        {fileInput}
      </div>
    )
  return (
    <div className="req-workspace">
      <ul className="req-list" aria-label="Requisitos con archivo">
        {states.map((state) => (
          <ListItem
            key={state.requirement.id}
            state={state}
            active={state === active}
            anchorId={`${anchorPrefix}-${state.requirement.id}`}
            onSelect={() => setActiveId(state.requirement.id)}
            onFiles={(files) => void upload(state, files)}
          />
        ))}
      </ul>
      <Viewer
        key={active.requirement.id}
        state={active}
        purpose={purpose}
        note={notes[active.requirement.id]}
        uploading={uploadingId === active.requirement.id}
        error={errors[active.requirement.id] ?? ''}
        onPick={(documentId) => pick(active, documentId)}
        onFiles={(files) => void upload(active, files)}
        onToggle={onToggle}
        onSignatureChange={onSignatureChange}
      />
      {fileInput}
    </div>
  )
}
