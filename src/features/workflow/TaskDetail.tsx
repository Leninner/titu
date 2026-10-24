import { useEffect, useState } from 'react'
import { ArrowRight, CircleCheck } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { catalog } from '../../catalog'
import { Button } from '../../components/ui/button'
import { evidenceIdsForTask } from '../../domain/task-evidence'
import { taskSteps, type StepId } from '../../domain/task-steps'
import type { DocumentVersion, TaskRecord, TaskStatus, WorkflowDefinition } from '../../domain/types'
import { evaluateTask, taskInputs, taskOutputs } from '../../domain/workflow'
import { repository } from '../../storage/repository'
import { addEvidence, signEvidence, withEvidence, type EvidenceField } from './evidence-actions'
import { nextStepFor } from './next-step'
import { PrepareStep, type FileHandlers } from './PrepareStep'
import { ResultStep } from './ResultStep'
import { SendStep } from './SendStep'
import { SourceDetails } from './SourceDetails'
import { StepTabs, stepPanelId, stepTabId } from './StepTabs'
import { persistTask } from './task-persistence'
import { statusLabels, taskFor } from './task-record'
import { useCurrentTime } from './use-current-time'

export function TaskDetail({ definition }: { definition: WorkflowDefinition }) {
  const { workspace, refresh, run } = useWorkspace()
  const now = useCurrentTime()
  const [task, setTask] = useState<TaskRecord>(() => taskFor(definition.id, workspace))
  const [savedTask, setSavedTask] = useState(task)
  const { steps, initial } = taskSteps(task, definition, workspace, catalog, now)
  const [activeStep, setActiveStep] = useState<StepId>(initial)
  const [scrollRequest, setScrollRequest] = useState<{ target: string }>()
  const [focusRequirement, setFocusRequirement] = useState<string>()
  const evaluation = evaluateTask(task, workspace, catalog, now)
  const inputs = taskInputs(definition, workspace)
  const outputs = taskOutputs(definition, workspace)
  const selectedEvidenceIds = evidenceIdsForTask(task, definition, workspace)
  const step = steps.some((item) => item.id === activeStep) ? activeStep : initial
  const nextStep = nextStepFor(task, evaluation, steps, inputs, outputs)

  useEffect(() => {
    if (scrollRequest)
      document.getElementById(`task-${scrollRequest.target}`)?.scrollIntoView({ behavior: 'smooth' })
  }, [scrollRequest])

  function remember(next: TaskRecord) {
    setTask(next)
    setSavedTask(next)
  }

  async function persistFiles(next: TaskRecord) {
    await persistTask(next, savedTask)
    remember(next)
    await refresh()
  }

  const fileHandlers = (field: EvidenceField): FileHandlers => ({
    onToggle: (versionId, checked) =>
      setTask((current) => withEvidence(current, workspace, versionId, checked, field)),
    onUpload: async (file, category, documentId) =>
      persistFiles(await addEvidence(task, workspace, file, category, documentId, field)),
    onSignatureChange: async (version: DocumentVersion, signed: boolean) =>
      persistFiles(await signEvidence(task, workspace, version, signed, field)),
  })

  async function save(status: TaskStatus = task.status, note = task.note) {
    const next = {
      ...task,
      status,
      note,
      history: [...task.history, { at: new Date().toISOString(), status, note }],
    }
    if (await run(() => persistTask(next, savedTask))) remember(next)
  }

  function submit(recipient: string, sentAt: string) {
    void run(async () => {
      await persistTask(task, savedTask)
      await repository.recordSubmission({
        taskId: task.id,
        exactVersionIds: [...selectedEvidenceIds],
        recipient,
        sentAt: new Date(`${sentAt}:00-05:00`).toISOString(),
        note: task.note,
      })
      remember(taskFor(definition.id, await repository.loadWorkspace()))
      setActiveStep('result')
    })
  }

  function goToNextStep() {
    if (!nextStep.step) {
      window.location.assign('#/proceso')
      return
    }
    setActiveStep(nextStep.step)
    const requirementId = nextStep.target?.replace(/^(requirement|output)-/, '')
    if (requirementId !== nextStep.target) setFocusRequirement(requirementId)
    if (nextStep.target) setScrollRequest({ target: nextStep.target })
  }

  return (
    <section className="task-detail">
      <div className="task-intro">
        <div>
          <h1>{definition.title}</h1>
          <p>{definition.instructions}</p>
        </div>
        <span className="task-role">Responsable: {definition.role}</span>
      </div>
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
            focusId={focusRequirement}
            files={fileHandlers('evidenceVersionIds')}
            onTaskChange={setTask}
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
            focusId={focusRequirement}
            files={fileHandlers('outputVersionIds')}
            onTaskChange={setTask}
            onComplete={() => void save('completed')}
            onObserve={(note) => void save('observed', note)}
            onReopen={() => void save('preparing')}
          />
        )}
      </div>
      <footer className="task-footer">
        {task.history.length > 0 && (
          <details>
            <summary>Historial de estados</summary>
            {task.history.map((entry, index) => (
              <p key={index}>
                {entry.at} · {statusLabels[entry.status]} · {entry.note}
              </p>
            ))}
          </details>
        )}
        <SourceDetails sourceIds={definition.sourceIds} />
      </footer>
      <aside className={`task-next ${evaluation.canComplete ? 'is-ready' : ''}`} aria-label="Siguiente paso">
        <div className="mx-auto flex w-full max-w-[var(--content-max-width)] items-center gap-3 px-5 py-3 min-[769px]:px-[26px] min-[1101px]:px-12">
          <div className="task-next-icon flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#eee5f8] text-[#583b88]" aria-hidden="true">
            {evaluation.canComplete ? <CircleCheck size={20} /> : <ArrowRight size={20} />}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <span className="block text-xs text-[#696273]">Siguiente paso</span>
            <strong className="mt-0.5 block truncate text-sm text-[#2d2938]">{nextStep.title}</strong>
            <small className="mt-0.5 hidden truncate text-xs text-[#696273] sm:block">{nextStep.detail}</small>
          </div>
          <Button onClick={goToNextStep} className="ml-auto">
            {nextStep.action}
            <ArrowRight size={16} />
          </Button>
        </div>
      </aside>
    </section>
  )
}
