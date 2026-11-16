import { Lock } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { catalog } from '../../catalog'
import type { WorkflowDefinition } from '../../domain/types'
import { applicableDependencies, workflowCompleted } from '../../domain/workflow'

export function PendingDependencies({ definition }: { definition: WorkflowDefinition }) {
  const { workspace } = useWorkspace()
  const pending = applicableDependencies(definition, workspace, catalog)
    .filter((id) => !workflowCompleted(id, workspace, catalog))
    .map((id) => catalog.workflowDefinitions.find((item) => item.id === id)!)
  if (!pending.length) return null
  return (
    <aside className="pending-dependencies" aria-label="Antes de este trámite">
      <Lock size={16} aria-hidden="true" />
      <p>
        Antes necesitas:{' '}
        {pending.map((item, index) => (
          <span key={item.id}>
            {index > 0 && ' · '}
            <a href={`#/proceso/${item.id}`}>{item.title}</a>
          </span>
        ))}
      </p>
    </aside>
  )
}
