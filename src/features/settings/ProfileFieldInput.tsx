import { Field } from '../../components/Field'
import type { StudentProfile } from '../../domain/types'
import type { ProfileField } from './profile-sections'

export function ProfileFieldInput({
  field,
  profile,
  onChange,
}: {
  field: ProfileField
  profile: StudentProfile
  onChange: (value: string | boolean) => void
}) {
  const value = profile[field.key]
  if (field.input === 'checkbox')
    return (
      <label className="check">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
        />
        {field.label}
      </label>
    )
  if (field.input === 'select')
    return (
      <label className="field">
        <span>{field.label}</span>
        <select value={String(value)} onChange={(event) => onChange(event.target.value)}>
          {Object.entries(field.options ?? {}).map(([option, label]) => (
            <option key={option} value={option}>
              {label}
            </option>
          ))}
        </select>
      </label>
    )
  return (
    <Field
      name={field.key}
      label={field.label}
      type={field.input}
      placeholder={field.placeholder}
      value={String(value)}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
