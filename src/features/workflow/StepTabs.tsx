import { useRef, type KeyboardEvent } from 'react'
import { Check } from 'lucide-react'
import type { StepId, TaskStep } from '../../domain/task-steps'

export const stepTabId = (step: StepId) => `task-step-tab-${step}`
export const stepPanelId = (step: StepId) => `task-step-panel-${step}`

const keyOffsets: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }

export function StepTabs({
  steps,
  active,
  onSelect,
}: {
  steps: TaskStep[]
  active: StepId
  onSelect: (step: StepId) => void
}) {
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  function move(event: KeyboardEvent<HTMLButtonElement>) {
    const current = steps.findIndex((step) => step.id === active)
    const target =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? steps.length - 1
          : keyOffsets[event.key] !== undefined
            ? (current + keyOffsets[event.key] + steps.length) % steps.length
            : undefined
    if (target === undefined) return
    event.preventDefault()
    onSelect(steps[target].id)
    tabs.current[target]?.focus()
  }

  return (
    <div className="task-steps" role="tablist" aria-label="Pasos del trámite">
      {steps.map((step, index) => {
        const selected = step.id === active
        return (
          <button
            key={step.id}
            ref={(element) => {
              tabs.current[index] = element
            }}
            type="button"
            role="tab"
            id={stepTabId(step.id)}
            aria-selected={selected}
            aria-controls={stepPanelId(step.id)}
            tabIndex={selected ? 0 : -1}
            className={`task-step ${step.done ? 'is-done' : ''} ${selected ? 'is-active' : ''}`}
            onClick={() => onSelect(step.id)}
            onKeyDown={move}
          >
            <span className="task-step-marker" aria-hidden="true">
              {step.done ? <Check size={14} strokeWidth={3} /> : index + 1}
            </span>
            <span className="task-step-copy">
              <strong>{step.label}</strong>
              <span>{step.detail}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
