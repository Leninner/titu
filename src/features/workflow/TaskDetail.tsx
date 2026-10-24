import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useWorkspace } from '../../app/WorkspaceContext'
import { catalog } from '../../catalog'
import { withAutomaticCompletion } from '../../domain/auto-completion'
import { evidenceIdsForTask } from '../../domain/task-evidence'
import { taskSteps, type StepId } from '../../domain/task-steps'
import type { DocumentVersion, TaskRecord, TaskStatus, WorkflowDefinition } from '../../domain/types'
import { evaluateTask, taskInputs, taskOutputs } from '../../domain/workflow'
import { repository } from '../../storage/repository'
import { addEvidence, signEvidence, withEvidence, type EvidenceField } from './evidence-actions'
import { PrepareStep, type FileHandlers } from './PrepareStep'
import { ResultStep } from './ResultStep'
import { SendStep } from './SendStep'
import { StepTabs, stepPanelId, stepTabId } from './StepTabs'
import { persistTask } from './task-persistence'
import { TaskMoreMenu, TaskSectionDialog, type TaskSection } from './TaskMoreMenu'
import { taskFor } from './task-record'
import { useCurrentTime } from './use-current-time'

const withStatus = (task: TaskRecord, status: TaskStatus, note: string): TaskRecord => ({
  ...task,
  status,
  note,
  history: [...task.history, { at: new Date().toISOString(), status, note }],
})

export function TaskDetail({
  definition,
  headerTarget,
}: {
  definition: WorkflowDefinition
  headerTarget?: HTMLElement | null
}) {
  const { workspace, refresh, run } = useWorkspace()
  const now = useCurrentTime()
  const [task, setTask] = useState<TaskRecord>(() => taskFor(definition.id, workspace))
  const [savedTask, setSavedTask] = useState(task)
  const latest = useRef({ task, saved: task })
  const [section, setSection] = useState<TaskSection>()
  const { steps, initial } = taskSteps(task, definition, workspace, catalog, now)
  const [activeStep, setActiveStep] = useState<StepId>(initial)
  const evaluation = evaluateTask(task, workspace, catalog, now)
  const inputs = taskInputs(definition, workspace)
  const outputs = taskOutputs(definition, workspace)
  const selectedEvidenceIds = evidenceIdsForTask(task, definition, workspace)
  const step = steps.some((item) => item.id === activeStep) ? activeStep : initial

  function change(next: TaskRecord) {
    latest.current.task = next
    setTask(next)
  }

  function remember(next: TaskRecord) {
    latest.current = { task: next, saved: next }
    setTask(next)
    setSavedTask(next)
  }

  async function persistFiles(next: TaskRecord) {
    remember(await persistTask(next, latest.current.saved))
    await refresh()
  }

  const automaticStatus = withAutomaticCompletion(savedTask, workspace, catalog).status
  useEffect(() => {
    if (automaticStatus !== latest.current.saved.status) void persistFiles(latest.current.saved)
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [automaticStatus])

  const fileHandlers = (field: EvidenceField): FileHandlers => ({
    onToggle: (versionId, checked) => {
      const next = withEvidence(latest.current.task, workspace, versionId, checked, field)
      change(next)
      if (definition.autoComplete) void run(() => persistFiles(next))
    },
    onUpload: async (file, category, documentId) => {
      const added = await addEvidence(
        latest.current.task,
        await repository.loadWorkspace(),
        file,
        category,
        documentId,
        field,
      )
      await persistFiles(added.task)
      return added.version
    },
    onSignatureChange: async (version: DocumentVersion, signed: boolean) =>
      persistFiles(await signEvidence(latest.current.task, workspace, version, signed, field)),
  })

  async function save(status: TaskStatus = task.status, note = task.note) {
    await run(async () => remember(await persistTask(withStatus(task, status, note), savedTask)))
  }

  function submit() {
    void run(async () => {
      await persistTask(task, savedTask)
      await repository.recordSubmission({
        taskId: task.id,
        exactVersionIds: [...selectedEvidenceIds],
        recipient: '',
        sentAt: new Date().toISOString(),
        note: task.note,
      })
      remember(taskFor(definition.id, await repository.loadWorkspace()))
      setActiveStep('result')
    })
  }

  const taskMeta = (
    <div className="task-intro-side">
      <span className="task-role">Responsable: {definition.role}</span>
      <TaskMoreMenu onSelect={setSection} />
    </div>
  )

  return (
    <section className="task-detail">
      <p className="task-summary">
        {definition.summary}{' '}
        <button type="button" className="text-button" onClick={() => setSection('guide')}>
          Cómo se tramita
        </button>
      </p>
      {headerTarget ? createPortal(taskMeta, headerTarget) : taskMeta}
      {steps.length > 1 && <StepTabs steps={steps} active={step} onSelect={setActiveStep} />}
      <div
        className="task-step-panel"
        id={stepPanelId(step)}
        role={steps.length > 1 ? 'tabpanel' : undefined}
        aria-labelledby={steps.length > 1 ? stepTabId(step) : undefined}
      >
        {step === 'prepare' && (
          <PrepareStep
            definition={definition}
            task={task}
            inputs={inputs}
            selectedIds={selectedEvidenceIds}
            ready={evaluation.ready}
            dirty={JSON.stringify(task) !== JSON.stringify(savedTask)}
            files={fileHandlers('evidenceVersionIds')}
            onTaskChange={change}
            onSave={() => void save(task.status === 'pending' ? 'preparing' : task.status)}
          />
        )}
        {step === 'send' && (
          <SendStep definition={definition} task={task} ready={evaluation.ready} onSubmit={submit} />
        )}
        {step === 'result' && (
          <ResultStep
            definition={definition}
            task={task}
            outputs={outputs}
            missingInputs={evaluation.missingRequirements}
            canComplete={evaluation.canComplete}
            files={fileHandlers('outputVersionIds')}
            onTaskChange={change}
            onComplete={() => void save('completed')}
            onObserve={(note) => void save('observed', note)}
            onReopen={() => void save('preparing')}
          />
        )}
      </div>
      {section && (
        <TaskSectionDialog
          section={section}
          task={task}
          definition={definition}
          onClose={() => setSection(undefined)}
        />
      )}
    </section>
  )
}
