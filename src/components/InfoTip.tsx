import { useId } from 'react'
import { Info } from 'lucide-react'

export function InfoTip({ label, text }: { label: string; text: string }) {
  const id = useId()
  return (
    <span className="info-tip">
      <button type="button" aria-label={`Detalle de ${label}`} aria-describedby={id}>
        <Info size={15} aria-hidden="true" />
      </button>
      <span id={id} role="tooltip" className="info-tip-text">
        {text}
      </span>
    </span>
  )
}
