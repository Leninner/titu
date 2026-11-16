import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { catalog } from '../../catalog'
import { emptyWorkspace } from '../../domain/types'
import { exportBackup, importBackup } from '../../export/backup'
import { repository } from '../../storage/repository'

async function replaceWithEmptyWorkspace() {
  const clean = { ...emptyWorkspace(), blobs: [], draftHistory: [] }
  const backup = await importBackup(await exportBackup(clean, catalog.version))
  await repository.restoreWorkspace(backup)
  window.location.hash = '/inicio'
}

export function ResetWorkspace() {
  const { run, busy } = useWorkspace()
  const [confirming, setConfirming] = useState(false)
  if (!confirming)
    return (
      <button onClick={() => setConfirming(true)}>
        <UserPlus size={16} aria-hidden="true" /> Crear otro expediente
      </button>
    )
  return (
    <div className="notice error">
      <p>
        Se borrarán los datos activos del navegador. El respaldo que hayas descargado seguirá
        siendo recuperable.
      </p>
      <div className="actions">
        <button
          className="danger"
          disabled={busy}
          onClick={() => void run(replaceWithEmptyWorkspace)}
        >
          Confirmar reemplazo por expediente vacío
        </button>
        <button onClick={() => setConfirming(false)}>Cancelar</button>
      </div>
    </div>
  )
}
