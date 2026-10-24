import { useLayoutEffect, useRef } from 'react'
import type { AnnexDraft, StudentProfile } from '../../domain/types'
import { catalog } from '../../catalog'
import { buildDocumentModel, type DocumentParagraph } from '../../export/document-model'
import { ActivityTable } from './ActivityTable'

const profileLabels: Record<string, string> = {
  nombres: 'Estudiante', cedula: 'Cédula', email: 'Correo', direccion: 'Dirección',
  carrera: 'Carrera', facultad: 'Facultad', titulo: 'Título a obtener', tema: 'Tema aprobado',
  aprobacionFecha: 'Fecha de aprobación', aprobacionResolucion: 'Resolución de aprobación', tutor: 'Tutor',
}

function EditableText({ value, label, error, readOnly, onChange }: {
  value: string; label: string; error?: string; readOnly?: boolean; onChange: (value: string) => void
}) {
  const ref = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    if (ref.current && ref.current.textContent !== value) ref.current.textContent = value
  }, [value])
  return <span
    ref={ref}
    className={`document-field${readOnly ? ' is-readonly' : ''}`}
    contentEditable={readOnly ? false : 'plaintext-only'}
    suppressContentEditableWarning
    role={readOnly ? undefined : 'textbox'}
    aria-label={label}
    aria-invalid={!!error}
    aria-description={error}
    tabIndex={readOnly ? undefined : 0}
    data-placeholder={`[${label}]`}
    title={error || (readOnly ? 'Se actualiza desde Ajustes' : label)}
    onInput={(event) => onChange(event.currentTarget.innerText ?? event.currentTarget.textContent ?? '')}
  />
}

export function AnnexDocument({ draft, onChange, errors = {} }: {
  draft: AnnexDraft; onChange: (next: AnnexDraft) => void; errors?: Record<string, string>
}) {
  const template = catalog.templates.find((item) => item.id === draft.templateId)!
  // Render the export model with field markers, so document text and ordering stay shared.
  const marked = structuredClone(draft)
  const bindings = new Map<string, { key: string; profile: boolean; label: string }>()
  const marker = (key: string, profile: boolean, label: string) => {
    const token = `⟦${profile ? 'P' : 'F'}_${key.toUpperCase()}⟧`
    bindings.set(token, { key, profile, label })
    return token
  }
  for (const [key, label] of Object.entries(profileLabels)) {
    (marked.profileSnapshot as unknown as Record<string, unknown>)[key] = marker(key, true, label)
  }
  for (const field of template.fields) {
    if (field.key !== 'mensualesRevisados') marked.fields[field.key] = marker(field.key, false, field.label)
  }
  const model = buildDocumentModel(marked)
  const paragraph = (item: DocumentParagraph, index: number) => <p key={index}
    style={{ textAlign: item.center ? 'center' : undefined, fontWeight: item.bold ? 700 : undefined,
      marginBottom: `${item.spaceAfter ?? 8}pt`, fontSize: `${item.size ?? 12}pt` }}>
    {item.text.split(/(⟦[PF]_[A-Z]+⟧)/g).map((part, partIndex) => {
      const binding = bindings.get(part)
      if (!binding) return part
      const { key, profile, label } = binding
      const value = profile ? String(draft.profileSnapshot[key as keyof StudentProfile] ?? '') : draft.fields[key] ?? ''
      return <EditableText key={partIndex} value={value} label={label}
        error={errors[profile ? `profile.${key}` : key]} readOnly={profile && key === 'tema'}
        onChange={(next) => onChange(profile
          ? { ...draft, profileSnapshot: { ...draft.profileSnapshot, [key]: next } }
          : { ...draft, fields: { ...draft.fields, [key]: next } })} />
    })}
  </p>
  return <article className="annex-paper" aria-label="Documento editable">
    <header className="annex-paper-heading">{model.headings.map(paragraph)}</header>
    <div>{model.paragraphs.map(paragraph)}</div>
    {model.report && <ActivityTable activities={draft.activities}
      monthlyPeriod={draft.templateId === 'anexo-5' ? draft.monthlyPeriod : undefined}
      readOnly={draft.templateId === 'anexo-11'}
      onChange={(activities) => onChange({ ...draft, activities })} />}
    <div>{model.afterTable.map(paragraph)}</div>
    <div className="annex-signature">{model.signature.map(paragraph)}</div>
    {model.notes.length > 0 && <aside className="annex-notes">{model.notes.map((note, index) => <p key={index}>{note}</p>)}</aside>}
    <footer className="annex-paper-footer">{model.footer}</footer>
  </article>
}
