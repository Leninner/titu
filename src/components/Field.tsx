import type { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }
export function Field({ label, error, id, ...props }: Props) {
  const fieldId = id ?? props.name
  return (
    <label className="field" htmlFor={fieldId}>
      <span>{label}</span>
      <input
        {...props}
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
      />
      {error && (
        <small id={`${fieldId}-error`} className="error">
          {error}
        </small>
      )}
    </label>
  )
}
