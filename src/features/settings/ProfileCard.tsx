import { useState, type FormEvent } from 'react'
import { Check, Pencil } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import type { StudentProfile } from '../../domain/types'
import { repository } from '../../storage/repository'
import { ProfileFieldInput } from './ProfileFieldInput'
import {
  displayValue,
  missingCount,
  sectionValues,
  visibleFields,
  type ProfileSection,
} from './profile-sections'

function CompletionTag({ missing }: { missing: number }) {
  return missing ? (
    <span className="settings-tag is-pending">
      {missing === 1 ? 'Falta 1 dato' : `Faltan ${missing} datos`}
    </span>
  ) : (
    <span className="settings-tag is-complete">
      <Check size={13} strokeWidth={3} aria-hidden="true" /> Completo
    </span>
  )
}

function ProfileData({ section, profile }: { section: ProfileSection; profile: StudentProfile }) {
  return (
    <dl className="profile-data">
      {visibleFields(section, profile).map((field) => {
        const value = displayValue(field, profile)
        return (
          <div key={field.key} className={field.wide ? 'is-wide' : undefined}>
            <dt>{field.label}</dt>
            <dd>{value || <span className="profile-empty">Sin completar</span>}</dd>
          </div>
        )
      })}
    </dl>
  )
}

export function ProfileCard({ section }: { section: ProfileSection }) {
  const { workspace, run, busy } = useWorkspace()
  const profile = workspace.profile!
  const [draft, setDraft] = useState<StudentProfile | null>(null)
  const [saved, setSaved] = useState(false)
  const titleId = `profile-${section.id}-title`

  function edit() {
    setSaved(false)
    setDraft(profile)
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    if (!draft) return
    const stored = await run(() =>
      repository.saveProfile({ ...profile, ...sectionValues(section, draft) }),
    )
    if (!stored) return
    setDraft(null)
    setSaved(true)
  }

  return (
    <section className="settings-card" aria-labelledby={titleId}>
      <header className="settings-card-header">
        <div>
          <h2 id={titleId}>{section.title}</h2>
          <p>{section.description}</p>
        </div>
        <div className="settings-card-status">
          {saved && <output>Guardado</output>}
          <CompletionTag missing={missingCount(section, draft ?? profile)} />
          {!draft && (
            <button type="button" aria-label={`Editar ${section.title}`} onClick={edit}>
              <Pencil size={15} aria-hidden="true" /> Editar
            </button>
          )}
        </div>
      </header>
      {draft ? (
        <form className="settings-card-form" onSubmit={save}>
          <div className="profile-form-grid">
            {visibleFields(section, draft).map((field) => (
              <div key={field.key} className={field.wide ? 'is-wide' : undefined}>
                <ProfileFieldInput
                  field={field}
                  profile={draft}
                  onChange={(value) => setDraft({ ...draft, [field.key]: value })}
                />
              </div>
            ))}
          </div>
          {section.hint && <p className="hint">{section.hint}</p>}
          <div className="actions">
            <button className="primary" disabled={busy}>
              Guardar
            </button>
            <button type="button" onClick={() => setDraft(null)}>
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <ProfileData section={section} profile={profile} />
      )}
    </section>
  )
}
