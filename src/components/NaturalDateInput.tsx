import { useId, useRef, useState } from 'react'
import { dateLabel, parseNaturalDate, type NaturalDateResult } from '../domain/natural-date'

interface NaturalDateInputProps {
  label: string
  name?: string
  value: string
  onChange: (date: string) => void
  required?: boolean
  placeholder?: string
}
export function NaturalDateInput(props: NaturalDateInputProps) {
  // A confirmed external date resets the editing buffer; typing never updates that prop.
  return <NaturalDateEditor key={props.value} {...props} />
}

function NaturalDateEditor({
  label,
  name,
  value,
  onChange,
  required,
  placeholder = 'Por ejemplo, el 21 de noviembre',
}: NaturalDateInputProps) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [input, setInput] = useState(value ? dateLabel(value) : '')
  const [editing, setEditing] = useState(false)
  const [parsed, setParsed] = useState<NaturalDateResult>(null)
  function edit(text: string) {
    inputRef.current?.setCustomValidity('Confirma la fecha reconocida o quita la fecha')
    setInput(text)
    setEditing(true)
    setParsed(parseNaturalDate(text, new Date()))
  }
  const recognized = parsed && !('error' in parsed) ? parsed : null
  const error = parsed && 'error' in parsed ? parsed.error : ''
  const confirm = () => {
    if (!recognized) return
    inputRef.current?.setCustomValidity('')
    onChange(recognized.date)
    setInput(recognized.label)
    setEditing(false)
    setParsed(null)
  }
  return (
    <div className="natural-date-input field">
      <label htmlFor={id}>
        {label}
        {required ? ' *' : ''}
      </label>
      <input
        ref={inputRef}
        required={required}
        id={id}
        name={name}
        type="text"
        value={input}
        placeholder={placeholder}
        autoComplete="off"
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={`${id}-feedback`}
        onChange={(event) => {
          edit(event.target.value)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            confirm()
          }
        }}
      />
      <div id={`${id}-feedback`} className="date-recognition" aria-live="polite">
        {recognized && (
          <>
            <button type="button" className="date-chip" onClick={confirm}>
              Usar {recognized.label}
            </button>
            {recognized.inferredYear && (
              <small>Próxima fecha con ese día y mes. Confirma el año.</small>
            )}
          </>
        )}
        {error && <small className="error">{error}</small>}
        {editing && input.trim() && !parsed && (
          <small>Prueba «21 nov», «mañana» o elige en el calendario.</small>
        )}
        {!editing && value && <small>Fecha elegida: {dateLabel(value)}</small>}
      </div>
      <div className="natural-date-actions">
        <details>
          <summary>Elegir en el calendario</summary>
          <label htmlFor={`${id}-calendar`}>Fecha en calendario</label>
          <input
            id={`${id}-calendar`}
            type="date"
            value={value}
            onChange={(event) => {
              if (event.target.value) {
                edit(event.target.value)
              }
            }}
          />
        </details>
        {(value || input) && (
          <button
            type="button"
            className="text-button"
            onClick={() => {
              inputRef.current?.setCustomValidity('')
              onChange('')
              setInput('')
              setEditing(false)
              setParsed(null)
            }}
          >
            Quitar fecha
          </button>
        )}
      </div>
    </div>
  )
}
