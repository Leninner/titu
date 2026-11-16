import type { ReactNode } from 'react'
import { Archive, RotateCcw, Users } from 'lucide-react'
import { BackupExport } from './BackupExport'
import { BackupImport } from './BackupImport'
import { ResetWorkspace } from './ResetWorkspace'

function ActionCard({
  id,
  icon,
  title,
  description,
  children,
}: {
  id: string
  icon: ReactNode
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="settings-card settings-action-card" aria-labelledby={`${id}-title`}>
      <span className="settings-card-icon" aria-hidden="true">
        {icon}
      </span>
      <div className="settings-action-body">
        <h2 id={`${id}-title`}>{title}</h2>
        <p>{description}</p>
        {children}
      </div>
    </section>
  )
}

export function BackupPanel() {
  return (
    <>
      <p className="notice">
        <strong>Se guarda solo en este navegador.</strong> El respaldo contiene tus datos personales
        y todos tus archivos. Guárdalo en un lugar seguro; no está cifrado.
      </p>
      <ActionCard
        id="backup-export"
        icon={<Archive size={18} />}
        title="Respaldo y recuperación"
        description="Descarga un ZIP con todo tu expediente para conservarlo o llevarlo a otro equipo."
      >
        <BackupExport />
      </ActionCard>
      <ActionCard
        id="backup-import"
        icon={<RotateCcw size={18} />}
        title="Recuperar un respaldo"
        description="Reemplaza el expediente de este navegador por uno descargado antes. Verás un resumen antes de confirmar."
      >
        <BackupImport />
      </ActionCard>
      <ActionCard
        id="backup-reset"
        icon={<Users size={18} />}
        title="Cambiar de estudiante"
        description="Este navegador mantiene un solo expediente. Descarga el respaldo antes de crear uno nuevo."
      >
        <ResetWorkspace />
      </ActionCard>
    </>
  )
}
