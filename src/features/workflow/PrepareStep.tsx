import { useWorkspace } from '../../app/WorkspaceContext'
import { downloadBlob } from '../../components/download'
import type { DocumentVersion, Requirement, TaskRecord, WorkflowDefinition } from '../../domain/types'
import { submissionZip } from '../../export/submission-zip'
import { repository } from '../../storage/repository'
import { RequirementFields } from './RequirementFields'
import { RequirementsPanel, type FileRequirement } from './RequirementsPanel'

export interface FileHandlers {
  onToggle: (versionId: string, checked: boolean) => void
  onUpload: (file: File, category: string, documentId?: string) => Promise<void>
  onSignatureChange: (version: DocumentVersion, signed: boolean) => Promise<void>
}

export const fileRequirements = (requirements: Requirement[]): FileRequirement[] =>
  requirements.flatMap((requirement) =>
    requirement.category ? [{ ...requirement, category: requirement.category }] : [])

export function PrepareStep({
  definition,
  task,
  inputs,
  selectedIds,
  ready,
  dirty,
  focusId,
  files,
  onTaskChange,
  onSave,
}: {
  definition: WorkflowDefinition
  task: TaskRecord
  inputs: Requirement[]
  selectedIds: string[]
  ready: boolean
  dirty: boolean
  focusId?: string
  files: FileHandlers
  onTaskChange: (task: TaskRecord) => void
  onSave: () => void
}) {
  const { workspace, run, busy } = useWorkspace()
  const documents = fileRequirements(inputs)
  const inputCategories = new Set(documents.map((requirement) => requirement.category))
  const otherSelectedVersions = workspace.versions.filter(
    (version) =>
      task.evidenceVersionIds.includes(version.id) &&
      !inputCategories.has(
        workspace.documents.find((document) => document.id === version.documentId)?.category ?? '',
      ),
  )
  return (
    <>
      {documents.length > 0 && (
        <RequirementsPanel
          requirements={documents}
          selectedIds={selectedIds}
          anchorPrefix="task-requirement"
          focusId={focusId}
          layout="cards"
          {...files}
        />
      )}
      <RequirementFields
        requirements={inputs}
        task={task}
        anchorPrefix="task-requirement"
        onChange={(id, value) =>
          onTaskChange({ ...task, requirementChecks: { ...task.requirementChecks, [id]: value } })}
      />
      {otherSelectedVersions.length > 0 && (
        <details className="task-other-files" id="task-other-files" open={definition.id === 'desarrollo'}>
          <summary>Revisar archivos de otras categorías ({otherSelectedVersions.length})</summary>
          <p>Estos archivos siguen incluidos en el paquete.</p>
          {otherSelectedVersions.map((version) => (
            <label className="check" key={version.id}>
              <input type="checkbox" checked onChange={() => files.onToggle(version.id, false)} />
              {version.originalName}
            </label>
          ))}
        </details>
      )}
      <div className="task-followup">
        <label className="field">
          <span>Observaciones y seguimiento</span>
          <textarea
            value={task.note}
            onChange={(event) => onTaskChange({ ...task, note: event.target.value })}
          />
        </label>
        <output className="hint">
          {busy ? 'Guardando…' : dirty ? 'Cambios sin guardar' : 'Guardado'}
        </output>
        <div className="actions">
          <button className="primary" disabled={busy} onClick={onSave}>
            Guardar cambios
          </button>
          <button
            disabled={busy || !selectedIds.length}
            onClick={() =>
              void run(async () =>
                downloadBlob(
                  await submissionZip(await repository.snapshot(), selectedIds),
                  `${ready ? 'paquete' : 'borrador'}-${definition.id}.zip`,
                ),
              )
            }
          >
            Descargar {ready ? 'paquete ZIP' : 'borrador ZIP'}
          </button>
        </div>
      </div>
    </>
  )
}
