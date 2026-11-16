import { useState } from 'react'
import { Upload } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { errorMessage } from '../../components/download'
import { importBackup } from '../../export/backup'
import { repository } from '../../storage/repository'

type PendingBackup = Awaited<ReturnType<typeof importBackup>>

function BackupSummary({ backup }: { backup: PendingBackup }) {
  const { records, blobs } = backup.manifest
  return (
    <p>
      {records.profile?.nombres || 'Sin perfil'} · {records.documents.length} documentos ·{' '}
      {records.drafts.length} borradores · {blobs.length} archivos/versiones
    </p>
  )
}

export function BackupImport() {
  const { run, busy } = useWorkspace()
  const [pending, setPending] = useState<PendingBackup | null>(null)
  const [error, setError] = useState('')

  async function read(file: File) {
    setPending(null)
    setError('')
    try {
      setPending(await importBackup(file))
    } catch (failure) {
      setError(errorMessage(failure))
    }
  }

  return (
    <>
      <label className={`button backup-file ${busy ? 'is-disabled' : ''}`}>
        <Upload size={16} aria-hidden="true" /> Elegir respaldo ZIP
        <input
          className="visually-hidden"
          type="file"
          accept=".zip"
          aria-label="Importar respaldo ZIP"
          disabled={busy}
          onChange={async (event) => {
            const file = event.target.files?.[0]
            if (file) await read(file)
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
          <BackupSummary backup={pending} />
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
    </>
  )
}
