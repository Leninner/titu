import { useState } from 'react'
import { ArrowRight, FolderOpen } from 'lucide-react'
import { modalityLabels, newProfile, type Modality } from '../../domain/types'
import { repository } from '../../storage/repository'
import { useWorkspace } from '../../app/WorkspaceContext'
import { Field } from '../../components/Field'
import { BackupSettings } from './BackupSettings'

export function Onboarding() {
  const [profile, setProfile] = useState(newProfile)
  const [restore, setRestore] = useState(false)
  const { run, busy } = useWorkspace()
  return (
    <main className="onboarding">
      <div className="onboarding-brand">
        <FolderOpen size={24} /> Mi titulación <span>FISEI</span>
      </div>
      <h1>
        Tu siguiente paso,
        <br />
        con todo a mano.
      </h1>
      <p className="lead">
        Organiza tus trámites, prepara tus informes y conserva lo que ya entregaste.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void run(() => repository.saveProfile(profile))
        }}
      >
        <Field
          name="nombres"
          label="¿Cómo te llamas?"
          placeholder="Tu nombre (opcional por ahora)"
          value={profile.nombres}
          onChange={(event) => setProfile({ ...profile, nombres: event.target.value })}
        />
        <label className="field">
          <span>Modalidad de titulación</span>
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
            <option value="other">Otro período · sin calendario confirmado</option>
          </select>
        </label>
        <label className="field">
          <span>¿En qué etapa estás?</span>
          <select
            value={profile.initialStage}
            onChange={(event) => setProfile({ ...profile, initialStage: event.target.value })}
          >
            {[
              'propuesta',
              'desarrollo',
              'calificadores',
              'aptitud',
              'biblioteca',
              'sustentacion',
              'titulo',
            ].map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </label>
        <p className="hint">
          Elegir una etapa no completa requisitos anteriores. Podrás registrar su evidencia después.
        </p>
        <div className="notice">
          <strong>Se guarda en este navegador.</strong>
          <p>
            Quien use este mismo perfil del navegador podrá acceder a tus datos. Si borras el
            almacenamiento, se perderán. Descarga respaldos para conservarlos o cambiar de equipo.
          </p>
        </div>
        <button className="primary" disabled={busy}>
          Crear mi expediente <ArrowRight size={18} />
        </button>
      </form>
      <button className="text-button" onClick={() => setRestore(!restore)}>
        Ya tengo un respaldo
      </button>
      {restore && <BackupSettings />}
    </main>
  )
}
