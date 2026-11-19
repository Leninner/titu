import { NaturalDateInput } from '../../components/NaturalDateInput'
import type { ValidityDates } from '../../domain/dates'
import type { DocumentVersion } from '../../domain/types'

export function ValidityDateFields({
  version,
  onChange,
}: {
  version: DocumentVersion
  onChange: (dates: ValidityDates) => void
}) {
  return (
    <div className="req-viewer-dates">
      <NaturalDateInput
        label="Emisión"
        name={`emision-${version.id}`}
        value={version.issuedOn ?? ''}
        onChange={(issuedOn) => onChange({ issuedOn })}
      />
      <NaturalDateInput
        label="Vencimiento impreso"
        name={`vencimiento-${version.id}`}
        value={version.expiresOn ?? ''}
        onChange={(expiresOn) => onChange({ expiresOn })}
      />
    </div>
  )
}
