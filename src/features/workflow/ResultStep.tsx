import { useState } from 'react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { catalog } from '../../catalog'
import { outputUsage, unavailableAsOutput } from '../../domain/output-chain'
import type { Requirement, TaskRecord, WorkflowDefinition, Workspace } from '../../domain/types'
import { fileRequirements, type FileHandlers } from './PrepareStep'
import { RequirementFields } from './RequirementFields'
import { RequirementsPanel } from './RequirementsPanel'

function MissingList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="task-result-missing" role="note">
      <strong>{title}</strong>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  )
}

function usageTitles(outputs: Requirement[], definition: WorkflowDefinition, workspace: Workspace) {
  return Object.fromEntries(
    fileRequirements(outputs).flatMap((requirement) => {
      const titles = outputUsage(requirement.category, definition.id, workspace, catalog)
      return titles.length ? [[requirement.id, titles]] : []
    }),
  )
}

export function ResultStep({
  definition,
  task,
  outputs,
  missingInputs,
  missingOutputs,
  canComplete,
  files,
  onTaskChange,
  onComplete,
  onObserve,
  onReopen,
}: {
  definition: WorkflowDefinition
  task: TaskRecord
  outputs: Requirement[]
  missingInputs: string[]
  missingOutputs: string[]
  canComplete: boolean
  files: FileHandlers
  onTaskChange: (task: TaskRecord) => void
  onComplete: () => void
  onObserve: (note: string) => void
  onReopen: () => void
}) {
  const { workspace, busy } = useWorkspace()
  const [observation, setObservation] = useState<string>()
  const documents = fileRequirements(outputs)
  const unavailableIds = unavailableAsOutput(task.id, workspace)
  return (
    <>
      <RequirementsPanel
        requirements={documents}
        selectedIds={task.outputVersionIds}
        anchorPrefix="task-output"
        layout="cards"
        purpose="result"
        usage={usageTitles(outputs, definition, workspace)}
        excludedIds={unavailableIds}
        {...files}
      />
      <RequirementFields
        requirements={outputs}
        task={task}
        anchorPrefix="task-output"
        onChange={(id, value) =>
          onTaskChange({ ...task, requirementChecks: { ...task.requirementChecks, [id]: value } })}
      />
      {task.status !== 'completed' && (missingInputs.length > 0
        ? <MissingList title="Falta en la entrega" items={missingInputs} />
        : missingOutputs.length > 0 && <MissingList title="Falta para completar" items={missingOutputs} />)}
      {observation !== undefined && (
        <div className="task-observation">
          <label className="field">
            <span>Observación recibida</span>
            <textarea value={observation} onChange={(event) => setObservation(event.target.value)} />
          </label>
          <div className="actions">
            <button
              className="primary"
              disabled={busy || !observation.trim()}
              onClick={() => {
                onObserve(observation)
                setObservation(undefined)
              }}
            >
              Guardar observación
            </button>
            <button disabled={busy} onClick={() => setObservation(undefined)}>Cancelar</button>
          </div>
        </div>
      )}
      <div className="actions task-result-actions">
        {task.status === 'completed' ? (
          <button disabled={busy} onClick={onReopen}>Reabrir trámite</button>
        ) : (
          <button className="primary" disabled={busy || !canComplete} onClick={onComplete}>
            Completar trámite
          </button>
        )}
        {observation === undefined && task.status !== 'completed' && (
          <button disabled={busy} onClick={() => setObservation(task.note)}>
            Hay una observación
          </button>
        )}
      </div>
    </>
  )
}
