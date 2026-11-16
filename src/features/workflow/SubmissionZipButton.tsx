import { Download } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { downloadBlob } from '../../components/download'
import type { WorkflowDefinition } from '../../domain/types'
import { submissionEntries } from '../../domain/submission-entries'
import { submissionZip } from '../../export/submission-zip'
import { repository } from '../../storage/repository'

export function SubmissionZipButton({
  definition,
  selectedIds,
  ready,
  label,
}: {
  definition: WorkflowDefinition
  selectedIds: string[]
  ready: boolean
  label?: string
}) {
  const { workspace, busy, run } = useWorkspace()
  const download = () =>
    void run(async () =>
      downloadBlob(
        await submissionZip(
          await repository.snapshot(),
          submissionEntries(definition, workspace, selectedIds),
        ),
        `${ready ? 'paquete' : 'borrador'}-${definition.id}.zip`,
      ),
    )
  return (
    <button disabled={busy || !selectedIds.length} onClick={download}>
      <Download size={16} aria-hidden="true" />
      {label ?? `Descargar ${ready ? 'paquete ZIP' : 'borrador ZIP'}`}
    </button>
  )
}
