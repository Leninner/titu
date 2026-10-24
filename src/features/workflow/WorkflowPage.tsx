import { useState } from 'react'
import { ChevronRight, CircleCheck, List, Workflow } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { catalog } from '../../catalog'
import { applicableWorkflows, evaluateTask } from '../../domain/workflow'
import { taskFor, statusLabels } from './task-record'
import { ProcessMap } from './ProcessMap'
import { ReportGuideLinks } from './ReportGuide'
import { folderFor, processFolders } from '../../domain/process-map'
import { TaskDetail } from './TaskDetail'
import { useCurrentTime } from './use-current-time'

const viewKey = 'process-view'

function savedView(): 'map' | 'list' {
  try {
    return window.localStorage.getItem(viewKey) === 'list' ? 'list' : 'map'
  } catch {
    return 'map'
  }
}

export function WorkflowPage({
  selectedId,
  headerTarget,
}: {
  selectedId?: string
  headerTarget?: HTMLElement | null
}) {
  const { workspace } = useWorkspace()
  const now = useCurrentTime()
  const definitions = applicableWorkflows(workspace, catalog)
  const selected = definitions.find((definition) => definition.id === selectedId)
  const mainDefinitions = definitions.filter((definition) => !definition.optional)
  const [view, setView] = useState(savedView)
  function changeView(next: 'map' | 'list') {
    setView(next)
    try {
      window.localStorage.setItem(viewKey, next)
    } catch {
      // The view preference is a convenience; the page works without storage.
    }
  }
  const viewToggle = (
    <div className="segmented" aria-label="Vista del proceso">
      <button type="button" aria-pressed={view === 'map'} onClick={() => changeView('map')}>
        <Workflow size={15} aria-hidden="true" /> Mapa
      </button>
      <button type="button" aria-pressed={view === 'list'} onClick={() => changeView('list')}>
        <List size={15} aria-hidden="true" /> Lista
      </button>
    </div>
  )
  const guide = (
    <section className="workflow-guide" aria-labelledby="workflow-guide-title">
      <div className="workflow-guide-heading">
        <span className="workflow-guide-icon" aria-hidden="true">1</span>
        <div>
          <h2 id="workflow-guide-title">Guía del informe final</h2>
          <span className="workflow-guide-kind">Material de consulta</span>
        </div>
      </div>
      <div className="workflow-guide-links">
        <ReportGuideLinks />
      </div>
    </section>
  )
  return (
    <div className={`page${selected ? ' workflow-detail-page' : ' process-page'}`}>
      {selected ? (
        <TaskDetail key={selected.id} definition={selected} headerTarget={headerTarget} />
      ) : (
        <>
          {view === 'map' && (
            <>
              <ProcessMap now={now} viewToggle={viewToggle} />
            </>
          )}
          {view === 'list' && <div className="process-toolbar">{viewToggle}</div>}
          {view === 'list' && <div className="workflow-list">
            {guide}
            {processFolders.map((folder) => {
              const items = mainDefinitions.filter((definition) => folderFor(definition) === folder.id)
              return (
                <section className={`workflow-stage workflow-stage-${folder.id}`} aria-labelledby={`workflow-stage-${folder.id}`} key={folder.id}>
                  <div className="workflow-stage-heading">
                    <span className="workflow-stage-number" aria-hidden="true">{folder.number}</span>
                    <h2 id={`workflow-stage-${folder.id}`}>{folder.title}</h2>
                  </div>
                  {items.length ? (
                    <div className="workflow-stage-list">
                      {items.map((definition) => {
                        const task = taskFor(definition.id, workspace)
                        const result = evaluateTask(task, workspace, catalog, now)
                        const index = mainDefinitions.findIndex((item) => item.id === definition.id)
                        return (
                          <a
                            className="workflow-row"
                            href={`#/proceso/${definition.id}`}
                            aria-label={definition.title}
                            key={definition.id}
                          >
                            <span className={`step-number ${task.status === 'completed' ? 'complete' : ''}`}>
                              {task.status === 'completed' ? <CircleCheck size={20} /> : index + 1}
                            </span>
                            <div>
                              <h3>{definition.title}</h3>
                              <p>
                                {task.status === 'completed'
                                  ? 'Resultado confirmado'
                                  : result.missingRequirements[0] || 'Requisitos registrados'}
                              </p>
                            </div>
                            <span className="badge">{statusLabels[task.status]}</span>
                            <ChevronRight size={18} aria-hidden="true" />
                          </a>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="workflow-stage-empty">No aplica a tu modalidad.</p>
                  )}
                </section>
              )
            })}
          </div>}
          {view === 'list' && (
            <details className="optional-tasks">
              <summary>Otros trámites</summary>
              {definitions
                .filter((item) => item.optional)
                .map((definition) => (
                  <p key={definition.id}>
                    <a href={`#/proceso/${definition.id}`}>{definition.title}</a>
                  </p>
                ))}
            </details>
          )}
        </>
      )}
    </div>
  )
}
