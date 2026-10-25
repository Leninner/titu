import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { ecuadorDate } from '../../domain/dates'

export function NewMonthlyCard({ onCreate }: { onCreate: (month: string) => void }) {
  const { busy } = useWorkspace()
  const [month, setMonth] = useState(() => ecuadorDate().slice(0, 7))
  return (
    <article className="annex-card is-new" aria-label="Nuevo informe mensual">
      <div className="annex-card-top">
        <span className="annex-card-code">Anexo 5</span>
      </div>
      <h3>Nuevo informe mensual</h3>
      <label className="field">
        <span>Mes del informe</span>
        <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
      </label>
      <div className="annex-card-actions">
        <button type="button" className="primary" disabled={busy || !month} onClick={() => onCreate(month)}>
          <Plus size={15} aria-hidden="true" /> Crear informe mensual
        </button>
      </div>
    </article>
  )
}
