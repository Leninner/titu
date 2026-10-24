import { useState } from 'react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { catalog } from '../../catalog'
import { outputUsage } from '../../domain/output-chain'
import type { Requirement, TaskRecord, WorkflowDefinition, Workspace } from '../../domain/types'
import { fileRequirements, type FileHandlers } from './PrepareStep'
import { RequirementFields } from './RequirementFields'
import { RequirementsPanel } from './RequirementsPanel'

function usageNotes(outputs: Requirement[], definition: WorkflowDefinition, workspace: Workspace) {
  return Object.fromEntries(
    fileRequirements(outputs).flatMap((requirement) => {
      const titles = outputUsage(requirement.category, definition.id, workspace, catalog)
      return titles.length ? [[requirement.id, `Se usa en: ${titles.join(' · ')}`]] : []
    }),
  )
}

export function ResultStep({
  definition,
  task,
  outputs,
  missingInputs,
  canComplete,
  focusId,
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
  canComplete: boolean
  focusId?: string
  files: FileHandlers
  onTaskChange: (task: TaskRecord) => void
  onComplete: () => void
  onObserve: (note: string) => void
  onReopen: () => void
}) {
  const { workspace, busy } = useWorkspace()
  const [observation, setObservation] = useState<string>()
  const documents = fileRequirements(outputs)
  const otherOutputIds = workspace.tasks
    .filter((item) => item.id !== task.id)
    .flatMap((item) => item.outputVersionIds)
  return (
    <>
      <RequirementsPanel
        requirements={documents}
        selectedIds={task.outputVersionIds}
        anchorPrefix="task-output"
        focusId={focusId}
        layout="cards"
        purpose="result"
        notes={usageNotes(outputs, definition, workspace)}
        excludedIds={otherOutputIds}
        {...files}
      />
      <RequirementFields
        requirements={outputs}
        task={task}
        anchorPrefix="task-output"
        onChange={(id, value) =>
          onTaskChange({ ...task, requirementChecks: { ...task.requirementChecks, [id]: value } })}
      />
      {missingInputs.length > 0 && task.status !== 'completed' && (
        <div className="task-result-missing" role="note">
          <strong>Falta en la entrega</strong>
          <ul>
            {missingInputs.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}
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
