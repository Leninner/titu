import { useState } from 'react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { repository } from '../../storage/repository'
import { Field } from '../../components/Field'
import { modalityLabels, type Modality } from '../../domain/types'
import { BackupSettings } from './BackupSettings'

export function ProfileSettings() {
  const { workspace, run, busy } = useWorkspace()
  const [profile, setProfile] = useState(workspace.profile!)
  const [saved, setSaved] = useState(false)
  const textFields = {
    nombres: 'Nombres y apellidos',
    cedula: 'Cédula',
    email: 'Correo',
    direccion: 'Dirección',
    facultad: 'Facultad',
    carrera: 'Carrera',
    titulo: 'Título a obtener',
    tema: 'Tema aprobado',
    aprobacionFecha: 'Fecha de aprobación',
    aprobacionResolucion: 'Resolución de aprobación o cambio',
    tutor: 'Tutor',
  } as const
  return (
    <div className="page narrow">
      <h1>Tu expediente</h1>
      <p className="lead">Completa los datos a medida que los necesites.</p>
      <form
        onSubmit={async (event) => {
          event.preventDefault()
          setSaved(await run(() => repository.saveProfile(profile)))
        }}
      >
        <div className="form-grid">
          {Object.entries(textFields).map(([key, label]) => (
            <Field
              key={key}
              name={key}
              label={label}
              type={key === 'aprobacionFecha' ? 'date' : key === 'email' ? 'email' : 'text'}
              value={profile[key as keyof typeof textFields]}
              onChange={(event) => {
                setSaved(false)
                setProfile({ ...profile, [key]: event.target.value })
              }}
            />
          ))}
        </div>
        <label className="field">
          <span>Modalidad</span>
          <select
            value={profile.modalidad}
            onChange={(event) =>
              setProfile({ ...profile, modalidad: event.target.value as Modality })
            }
          >
            {Object.entries(modalityLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Período</span>
          <select
            value={profile.periodo}
            onChange={(event) => setProfile({ ...profile, periodo: event.target.value })}
          >
            <option value="2026-07-12">Julio – diciembre 2026</option>
            <option value="other">Otro período</option>
          </select>
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={profile.aplicaEmpresa}
            onChange={(event) => setProfile({ ...profile, aplicaEmpresa: event.target.checked })}
          />{' '}
          El trabajo se realiza en una empresa
        </label>
        <p className="hint">
          Cambiar de modalidad o período conserva tus archivos y envíos. Revisa los borradores
          afectados antes de exportarlos.
        </p>
        <div className="actions">
          <button className="primary" disabled={busy}>
            Guardar perfil
          </button>
          {saved && <output>Guardado</output>}
        </div>
      </form>
      <BackupSettings />
    </div>
  )
}
