import { useState } from 'react'
import { FileSearch } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { parseApprovalResolution, type ResolutionData } from '../../domain/approval-resolution'
import type { StudentProfile } from '../../domain/types'
import { repository } from '../../storage/repository'
import { displayValue, profileField } from './profile-sections'

type ResolutionKey = keyof ResolutionData

interface Review {
  file: File
  found: ResolutionData
  selected: ResolutionKey[]
}

const unreadable =
  'No encontramos datos en este PDF. Verifica que sea la resolución de aprobación de modalidad y tema, con texto seleccionable.'

async function readResolution(file: File) {
  const { extractText } = await import('../documents/extract-text')
  return parseApprovalResolution(await extractText(file))
}

const changedKeys = (found: ResolutionData, profile: StudentProfile) =>
  (Object.keys(found) as ResolutionKey[]).filter((key) => found[key] !== profile[key])

const pick = (found: ResolutionData, keys: ResolutionKey[]) =>
  Object.fromEntries(keys.map((key) => [key, found[key]])) as ResolutionData

function ReviewRow({
  resolutionKey,
  review,
  profile,
  onToggle,
}: {
  resolutionKey: ResolutionKey
  review: Review
  profile: StudentProfile
  onToggle: (checked: boolean) => void
}) {
  const field = profileField(resolutionKey)
  const current = displayValue(field, profile)
  const proposed = displayValue(field, { ...profile, [resolutionKey]: review.found[resolutionKey] })
  const same = current === proposed
  return (
    <li>
      <label className="check">
        <input
          type="checkbox"
          checked={review.selected.includes(resolutionKey)}
          disabled={same}
          onChange={(event) => onToggle(event.target.checked)}
        />
        {field.label}
      </label>
      <p className="resolution-value">{proposed}</p>
      <small>{same ? 'Ya coincide' : `Actual: ${current || 'Sin completar'}`}</small>
    </li>
  )
}

export function ResolutionImport() {
  const { workspace, run, busy } = useWorkspace()
  const profile = workspace.profile!
  const [review, setReview] = useState<Review | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function open(file: File) {
    setReview(null)
    setError('')
    setMessage('')
    try {
      const found = await readResolution(file)
      if (!Object.keys(found).length) return setError(unreadable)
      setReview({ file, found, selected: changedKeys(found, profile) })
    } catch {
      setError(unreadable)
    }
  }

  function toggle(key: ResolutionKey, checked: boolean) {
    if (!review) return
    const selected = checked ? [...review.selected, key] : review.selected.filter((item) => item !== key)
    setReview({ ...review, selected })
  }

  async function apply() {
    if (!review) return
    const applied = await run(async () => {
      await repository.addDocumentVersion({
        file: review.file,
        originalName: review.file.name,
        category: 'resolucion',
        textualPdfStatus: 'text-detected',
      })
      await repository.saveProfile({ ...profile, ...pick(review.found, review.selected) })
    })
    if (!applied) return
    setReview(null)
    setMessage('Datos actualizados y resolución guardada en Documentos')
  }

  return (
    <div className="resolution-import">
      <div className="resolution-import-bar">
        <p>¿Ya tienes la resolución de aprobación de modalidad y tema? Súbela y llenamos estos datos por ti.</p>
        <label className={`button backup-file ${busy ? 'is-disabled' : ''}`}>
          <FileSearch size={16} aria-hidden="true" /> Llenar desde la resolución
          <input
            className="visually-hidden"
            type="file"
            accept=".pdf"
            aria-label="Subir resolución de aprobación"
            disabled={busy}
            onChange={async (event) => {
              const file = event.target.files?.[0]
              if (file) await open(file)
              event.target.value = ''
            }}
          />
        </label>
      </div>
      {message && <output className="resolution-message">{message}</output>}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {review && (
        <section className="notice resolution-review" aria-label="Datos encontrados en la resolución">
          <h3>Datos encontrados en {review.file.name}</h3>
          <p>Marca los datos que quieres usar. Los que ya coinciden no cambian.</p>
          <ul>
            {(Object.keys(review.found) as ResolutionKey[]).map((key) => (
              <ReviewRow
                key={key}
                resolutionKey={key}
                review={review}
                profile={profile}
                onToggle={(checked) => toggle(key, checked)}
              />
            ))}
          </ul>
          <div className="actions">
            <button className="primary" disabled={busy || !review.selected.length} onClick={() => void apply()}>
              Usar datos marcados
            </button>
            <button onClick={() => setReview(null)}>Cancelar</button>
          </div>
        </section>
      )}
    </div>
  )
}
