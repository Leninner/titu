import { useWorkspace } from '../../app/WorkspaceContext'
import { downloadBlob } from '../../components/download'
import type { DocumentVersion, Requirement, TaskRecord, WorkflowDefinition } from '../../domain/types'
import { submissionZip } from '../../export/submission-zip'
import { repository } from '../../storage/repository'
import { FinalReportEditor } from './FinalReportEditor'
import { MonthlyReportCards } from './MonthlyReportCards'
import { RequirementFields } from './RequirementFields'
import { RequirementsPanel, type FileRequirement } from './RequirementsPanel'

export interface FileHandlers {
  onToggle: (versionId: string, checked: boolean) => void
  onUpload: (file: File, category: string, documentId?: string) => Promise<DocumentVersion>
  onSignatureChange: (version: DocumentVersion, signed: boolean) => Promise<void>
}

export const fileRequirements = (requirements: Requirement[]): FileRequirement[] =>
  requirements.flatMap((requirement) =>
    requirement.category && !requirement.annex ? [{ ...requirement, category: requirement.category }] : [])

export function PrepareStep({
  definition,
  task,
  inputs,
  selectedIds,
  ready,
  dirty,
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
  files: FileHandlers
  onTaskChange: (task: TaskRecord) => void
  onSave: () => void
}) {
  const { workspace, run, busy } = useWorkspace()
  const documents = fileRequirements(inputs)
  const inputCategories = new Set(inputs.map((requirement) => requirement.category))
  const monthly = documents.find((requirement) => requirement.category === 'mensual')
  const categoryOf = (version: DocumentVersion) =>
    workspace.documents.find((document) => document.id === version.documentId)?.category
  const otherSelectedVersions = workspace.versions.filter(
    (version) =>
      task.evidenceVersionIds.includes(version.id) &&
      !inputCategories.has(categoryOf(version) ?? ''),
  )
  return (
    <>
      {documents.some((requirement) => requirement !== monthly) && (
        <RequirementsPanel
          requirements={documents.filter((requirement) => requirement !== monthly)}
          selectedIds={selectedIds}
          anchorPrefix="task-requirement"
          layout="cards"
          {...files}
        />
      )}
      {inputs.some((requirement) => requirement.annex === 'anexo-11') && (
        <FinalReportEditor />
      )}
      {monthly && (
        <MonthlyReportCards selectedIds={selectedIds} signed={!!monthly.signed} files={files} />
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
      {!definition.autoComplete && <div className="task-followup">
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
      </div>}
    </>
  )
}
