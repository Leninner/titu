import { Download } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { catalog } from '../../catalog'
import { downloadBlob } from '../../components/download'
import { exportBackup } from '../../export/backup'
import { repository } from '../../storage/repository'

const backupDate = (timestamp: string) =>
  new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'America/Guayaquil',
  }).format(new Date(timestamp))

export function BackupExport() {
  const { workspace, run, busy } = useWorkspace()
  const lastBackup = workspace.settings.lastBackup
  return (
    <>
      <p className="settings-meta">
        Último respaldo:{' '}
        <strong>{lastBackup ? backupDate(lastBackup) : 'Todavía no has descargado uno'}</strong>
      </p>
      <button
        className="primary"
        disabled={busy}
        onClick={() =>
          void run(async () => {
            const blob = await exportBackup(await repository.snapshot(), catalog.version)
            downloadBlob(blob, 'mi-titulacion-respaldo.zip')
            await repository.saveSetting('lastBackup', new Date().toISOString())
          })
        }
      >
        <Download size={16} aria-hidden="true" /> Descargar respaldo completo
      </button>
    </>
  )
}
