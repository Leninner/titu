import { useEffect, useRef, useState } from 'react'
import { CalendarCheck, CalendarClock, CalendarPlus } from 'lucide-react'
import { noDebtExpiry, noDebtValidity, shortDayLabel, type ValidityDates } from '../../domain/dates'
import type { DocumentVersion } from '../../domain/types'

function IssueDateEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (issuedOn: string) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => input.current?.focus(), [])
  return (
    <input
      ref={input}
      className="req-chip-date"
      type="date"
      aria-label="Fecha de emisión"
      defaultValue={value}
      onChange={(event) => event.target.value && onChange(event.target.value)}
    />
  )
}

export function NoDebtDates({
  version,
  submissionDate,
  onChange,
}: {
  version: DocumentVersion
  submissionDate: string
  onChange: (dates: ValidityDates) => void
}) {
  const [editing, setEditing] = useState(false)
  const { issuedOn } = version
  const validity = noDebtValidity(issuedOn, submissionDate)
  const save = (date: string) => {
    setEditing(false)
    onChange({ issuedOn: date })
  }
  if (editing) return <IssueDateEditor value={issuedOn ?? ''} onChange={save} />
  if (!issuedOn)
    return (
      <button type="button" className="req-chip is-action" onClick={() => setEditing(true)}>
        <CalendarPlus size={14} aria-hidden="true" /> Agregar emisión
      </button>
    )
  return (
    <>
      <button
        type="button"
        className="req-chip is-action"
        aria-label={`Cambiar emisión: ${shortDayLabel(issuedOn)}`}
        onClick={() => setEditing(true)}
      >
        <CalendarCheck size={14} aria-hidden="true" /> Emitido {shortDayLabel(issuedOn)}
      </button>
      <span className={`req-chip is-${validity.status}`} title={validity.label}>
        <CalendarClock size={14} aria-hidden="true" /> Vence {shortDayLabel(noDebtExpiry(issuedOn))}
      </span>
    </>
  )
}
