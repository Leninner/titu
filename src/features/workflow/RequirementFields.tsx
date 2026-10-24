import { Field } from '../../components/Field'
import { InfoTip } from '../../components/InfoTip'
import type { Requirement, TaskRecord } from '../../domain/types'
import { numericMaximum, numericRequirementIds } from '../../domain/workflow'

type CheckValue = TaskRecord['requirementChecks'][string]

export function RequirementFields({
  requirements,
  task,
  anchorPrefix,
  onChange,
}: {
  requirements: Requirement[]
  task: TaskRecord
  anchorPrefix: string
  onChange: (id: string, value: CheckValue) => void
}) {
  const numeric = requirements.filter((requirement) => numericRequirementIds.has(requirement.id))
  const checks = requirements.filter(
    (requirement) =>
      !requirement.category && !requirement.annex && !numericRequirementIds.has(requirement.id),
  )
  return (
    <>
      {numeric.length > 0 && (
        <div className="task-requirement-fields">
          {numeric.map((requirement) => {
            const value = task.requirementChecks[requirement.id]
            return (
              <div className="task-requirement-card" id={`${anchorPrefix}-${requirement.id}`} key={requirement.id}>
                <Field
                  name={requirement.id}
                  label={requirement.label}
                  type="number"
                  min="0"
                  max={String(numericMaximum(requirement.id))}
                  step="0.1"
                  value={typeof value === 'number' || typeof value === 'string' ? value : ''}
                  onChange={(event) =>
                    onChange(requirement.id, event.target.value === '' ? '' : Number(event.target.value))}
                />
                {requirement.detail && <InfoTip label={requirement.label} text={requirement.detail} />}
              </div>
            )
          })}
        </div>
      )}
      {checks.length > 0 && (
        <div className="task-requirement-checks">
          {checks.map((requirement) => (
            <div className="task-requirement-check-row" id={`${anchorPrefix}-${requirement.id}`} key={requirement.id}>
              <label className="check task-requirement-check">
                <input
                  type="checkbox"
                  aria-label={requirement.label}
                  checked={task.requirementChecks[requirement.id] === true}
                  onChange={(event) => onChange(requirement.id, event.target.checked)}
                />
                <span>{requirement.label}</span>
              </label>
              {requirement.detail && <InfoTip label={requirement.label} text={requirement.detail} />}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
