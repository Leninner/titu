import { emptyWorkspace } from '../../domain/types'
import { useState } from 'react'
import { repository } from '../../storage/repository'
import { exportBackup, importBackup } from '../../export/backup'
import { catalog } from '../../catalog'
import { useWorkspace } from '../../app/WorkspaceContext'
import { downloadBlob, errorMessage } from '../../components/download'

export function BackupSettings() {
  const { workspace, run, busy } = useWorkspace()
  const [pending, setPending] = useState<Awaited<ReturnType<typeof importBackup>> | null>(null)
  const [error, setError] = useState('')
  const [replace, setReplace] = useState(false)
  return (
    <section className="settings-section">
      <h2>Respaldo y recuperación</h2>
      <p>
        El respaldo contiene tus datos personales y todos tus archivos. Guárdalo en un lugar seguro;
        no está cifrado.
      </p>
      <p className="hint">
        Último respaldo: {workspace.settings.lastBackup ?? 'Todavía no has descargado uno'}
      </p>
      {workspace.profile && (
        <button
          disabled={busy}
          onClick={() =>
            void run(async () => {
              const blob = await exportBackup(await repository.snapshot(), catalog.version)
              downloadBlob(blob, 'mi-titulacion-respaldo.zip')
              await repository.saveSetting('lastBackup', new Date().toISOString())
            })
          }
        >
          Descargar respaldo completo
        </button>
      )}
      <label className="field">
        <span>Importar respaldo ZIP</span>
        <input
          type="file"
          accept=".zip"
          disabled={busy}
          onChange={async (event) => {
            const file = event.target.files?.[0]
            if (!file) return
            setPending(null)
            setError('')
            try {
              setPending(await importBackup(file))
            } catch (error) {
              setError(errorMessage(error))
            }
            event.target.value = ''
          }}
        />
      </label>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {pending && (
        <div className="notice">
          <h3>Reemplazar el expediente completo</h3>
          <p>
            {pending.manifest.records.profile?.nombres || 'Sin perfil'} ·{' '}
            {pending.manifest.records.documents.length} documentos ·{' '}
            {pending.manifest.records.drafts.length} borradores · {pending.manifest.blobs.length}{' '}
            archivos/versiones
          </p>
          <p>
            El respaldo ha pasado la validación. Se sustituirán los datos de este navegador.
            Descarga primero tu respaldo actual si deseas conservarlo.
          </p>
          <div className="actions">
            <button
              className="danger"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  await repository.restoreWorkspace(pending)
                  setPending(null)
                })
              }
            >
              Confirmar reemplazo
            </button>
            <button onClick={() => setPending(null)}>Cancelar</button>
          </div>
        </div>
      )}
      {workspace.profile && (
        <div className="settings-section">
          <h3>Cambiar de estudiante</h3>
          <p>
            Este navegador mantiene un solo expediente. Descarga el respaldo antes de crear uno
            nuevo.
          </p>
          <button onClick={() => setReplace(true)}>Crear otro expediente</button>
          {replace && (
            <div className="notice">
              <p>
                Se borrarán los datos activos del navegador. El respaldo que hayas descargado
                seguirá siendo recuperable.
              </p>
              <div className="actions">
                <button
                  className="danger"
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      const clean = { ...emptyWorkspace(), blobs: [], draftHistory: [] }
                      const backup = await importBackup(await exportBackup(clean, catalog.version))
                      await repository.restoreWorkspace(backup)
                      window.location.hash = '/inicio'
                    })
                  }
                >
                  Confirmar reemplazo por expediente vacío
                </button>
                <button onClick={() => setReplace(false)}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
