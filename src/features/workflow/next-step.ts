import type { Requirement, TaskRecord } from '../../domain/types'
import type { StepId, TaskStep } from '../../domain/task-steps'
import type { evaluateTask } from '../../domain/workflow'

export interface NextStep {
  title: string
  detail: string
  action: string
  step?: StepId
  target?: string
}

type Evaluation = ReturnType<typeof evaluateTask>

const sentStatuses = new Set<TaskRecord['status']>(['submitted', 'waiting', 'observed'])

const requirementFor = (requirements: Requirement[], message: string) =>
  requirements.find((requirement) => message.includes(requirement.label))

function inputStep(missing: string, inputs: Requirement[]): NextStep {
  if (missing.startsWith('Quita del paquete'))
    return {
      title: 'Revisa los archivos vinculados',
      detail: missing,
      action: 'Revisar archivos',
      step: 'prepare',
      target: 'other-files',
    }
  const requirement = requirementFor(inputs, missing)
  const isFile = missing.startsWith('Adjuntar:') || missing.startsWith('Firma pendiente:')
  return {
    title: isFile ? 'Agrega o vincula el documento' : 'Completa esta entrega',
    detail: missing,
    action: isFile ? 'Ver requisito' : 'Ver requisitos',
    step: 'prepare',
    target: requirement ? `requirement-${requirement.id}` : 'step-panel-prepare',
  }
}

function outputStep(missing: string, outputs: Requirement[]): NextStep {
  const requirement = requirementFor(outputs, missing)
  return {
    title: 'Registra el resultado recibido',
    detail: missing,
    action: 'Ver resultado',
    step: 'result',
    target: requirement ? `output-${requirement.id}` : 'step-panel-result',
  }
}

export function nextStepFor(
  task: TaskRecord,
  evaluation: Evaluation,
  steps: TaskStep[],
  inputs: Requirement[],
  outputs: Requirement[],
): NextStep {
  if (task.status === 'completed')
    return {
      title: 'Trámite completado',
      detail: 'El resultado institucional está registrado.',
      action: 'Ver trámites',
    }
  const [missingInput] = evaluation.missingRequirements
  if (missingInput?.startsWith('Resultado pendiente:'))
    return { title: 'Completa el trámite anterior', detail: missingInput, action: 'Ver trámites' }
  const sendStep = steps.find((step) => step.id === 'send')
  const sent = !sendStep || sendStep.done || sentStatuses.has(task.status)
  if (missingInput && !sent) return inputStep(missingInput, inputs)
  if (!sent)
    return {
      title: 'Prepara el envío',
      detail: 'Descarga el paquete, revisa el correo y registra el envío cuando lo hayas realizado.',
      action: 'Preparar envío',
      step: 'send',
      target: 'step-panel-send',
    }
  const [missingOutput] = evaluation.missingOutputs
  if (missingOutput) return outputStep(missingOutput, outputs)
  if (missingInput) return inputStep(missingInput, inputs)
  return {
    title: 'Completa el trámite',
    detail: 'El resultado recibido está registrado.',
    action: 'Ver resultado',
    step: 'result',
    target: 'step-panel-result',
  }
}
