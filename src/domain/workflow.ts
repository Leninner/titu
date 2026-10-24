import type {
  CatalogVersion,
  Requirement,
  StudentProfile,
  TaskRecord,
  WorkflowDefinition,
  Workspace,
} from './types'
import { ecuadorDate, noDebtValidity } from './dates'
import { evidenceIdsForTask } from './task-evidence'

export function applicableWorkflows(
  workspace: Workspace,
  catalog: CatalogVersion,
): WorkflowDefinition[] {
  const profile = workspace.profile
  if (!profile) return []
  return catalog.workflowDefinitions.filter(
    (definition) =>
      definition.modalities.includes(profile.modalidad) &&
      (!definition.companyOnly || profile.aplicaEmpresa),
  )
}

function applicableRequirements(requirements: Requirement[], profile: StudentProfile | null) {
  return requirements.filter(
    (requirement) =>
      (!requirement.companyOnly || !!profile?.aplicaEmpresa) &&
      (!requirement.modalities || (!!profile && requirement.modalities.includes(profile.modalidad))),
  )
}

export const taskInputs = (definition: WorkflowDefinition, workspace: Workspace) =>
  applicableRequirements(definition.requirements, workspace.profile)

export const taskOutputs = (definition: WorkflowDefinition, workspace: Workspace) =>
  applicableRequirements(definition.outputs, workspace.profile)

export function progress(workspace: Workspace, catalog: CatalogVersion) {
  const definitions = applicableWorkflows(workspace, catalog).filter(
    (definition) => !definition.optional,
  )
  const completed = definitions.filter((definition) =>
    workspace.tasks.some(
      (task) => task.definitionId === definition.id && task.status === 'completed',
    ),
  ).length
  return {
    completed,
    total: definitions.length,
    percent: definitions.length ? Math.round((completed / definitions.length) * 100) : 0,
  }
}

export const numericRequirementIds = new Set(['grade-1', 'grade-2', 'similarity', 'attendance'])

export const numericMaximum = (requirementId: string) =>
  requirementId.startsWith('grade-') ? 10 : 100

const numeric = (value: unknown): number | undefined => {
  if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function numericGap(requirement: Requirement, task: TaskRecord) {
  const value = numeric(task.requirementChecks[requirement.id])
  const max = numericMaximum(requirement.id)
  if (value === undefined || value < 0 || value > max)
    return `Registrar ${requirement.label} (0–${max})`
  if (requirement.id === 'similarity' && value > 10)
    return 'Similitud declarada superior al 10%: revisar con el tutor'
  if (requirement.id === 'attendance' && value < 70) return 'Asistencia inferior al mínimo de 70%'
  return undefined
}

function fileGap(
  requirement: Requirement & { category: string },
  selectedIds: string[],
  workspace: Workspace,
  now: Date,
) {
  const evidence = workspace.versions.filter(
    (version) =>
      selectedIds.includes(version.id) &&
      workspace.documents.some(
        (document) =>
          document.id === version.documentId && document.category === requirement.category,
      ),
  )
  if (!evidence.length) return `Adjuntar: ${requirement.label}`
  const signedEvidence = requirement.signed
    ? evidence.filter((version) => version.signatureStatus === 'reported-signed')
    : evidence
  if (!signedEvidence.length) return `Firma pendiente: ${requirement.label}`
  if (requirement.category === 'no-adeudar') {
    // The intended submission is the day/hour request, never the defense date.
    const submissionDate = workspace.settings.dayHourSubmissionDate || ecuadorDate(now)
    const validities = signedEvidence.map((version) =>
      noDebtValidity(version.issuedOn, submissionDate, version.expiresOn),
    )
    if (!validities.some((validity) => validity.status === 'valid'))
      return `No adeudar: ${validities[0].label}`
  }
  if (
    requirement.category === 'tesis' &&
    !signedEvidence.some(
      (version) =>
        version.mime === 'application/pdf' && version.textualPdfStatus === 'text-detected',
    )
  )
    return 'Verificar PDF del trabajo con texto seleccionable'
  return undefined
}

export function requirementGap(
  requirement: Requirement,
  task: TaskRecord,
  selectedIds: string[],
  workspace: Workspace,
  now: Date = new Date(),
): string | undefined {
  if (requirement.optional) return undefined
  if (numericRequirementIds.has(requirement.id)) return numericGap(requirement, task)
  if (!requirement.category)
    return task.requirementChecks[requirement.id] === true ? undefined : requirement.label
  return fileGap({ ...requirement, category: requirement.category }, selectedIds, workspace, now)
}

function averageGap(requirements: Requirement[], task: TaskRecord) {
  if (!['grade-1', 'grade-2'].every((id) => requirements.some((item) => item.id === id)))
    return undefined
  const first = numeric(task.requirementChecks['grade-1'])
  const second = numeric(task.requirementChecks['grade-2'])
  return first !== undefined && second !== undefined && (first + second) / 2 < 7
    ? 'Promedio inferior a 7: revisar o solicitar recalificación'
    : undefined
}

function requirementGaps(
  requirements: Requirement[],
  task: TaskRecord,
  selectedIds: string[],
  workspace: Workspace,
  now: Date,
) {
  return [
    ...requirements.map((requirement) =>
      requirementGap(requirement, task, selectedIds, workspace, now),
    ),
    averageGap(requirements, task),
  ].filter((gap): gap is string => !!gap)
}

function dependencyGaps(
  definition: WorkflowDefinition,
  workspace: Workspace,
  catalog: CatalogVersion,
) {
  const applicableIds = new Set(applicableWorkflows(workspace, catalog).map((item) => item.id))
  return definition.dependsOn
    .filter(
      (dependency) =>
        applicableIds.has(dependency) &&
        !workspace.tasks.some(
          (item) => item.definitionId === dependency && item.status === 'completed',
        ),
    )
    .map(
      (dependency) =>
        `Resultado pendiente: ${catalog.workflowDefinitions.find((item) => item.id === dependency)?.title || dependency}`,
    )
}

function developmentGaps(definition: WorkflowDefinition, selectedIds: string[], workspace: Workspace) {
  const foreign = workspace.versions.some(
    (version) =>
      selectedIds.includes(version.id) &&
      workspace.documents.find((document) => document.id === version.documentId)?.category !==
        'mensual',
  )
  return definition.id === 'desarrollo' && foreign
    ? ['Quita del paquete los archivos que no son Anexo 5']
    : []
}

function topicGaps(selectedIds: string[], workspace: Workspace) {
  return workspace.versions
    .filter((item) => selectedIds.includes(item.id) && item.sourceDraftId)
    .flatMap((version) => {
      const draft = workspace.drafts.find((item) => item.id === version.sourceDraftId)
      if (!draft || (version.revision !== undefined && version.revision !== draft.revision))
        return []
      const topic = draft.fields.tema || draft.profileSnapshot.tema
      return topic &&
        workspace.profile?.tema &&
        topic !== workspace.profile.tema &&
        !draft.fields.resolucionCambioTema?.trim()
        ? [`Tema distinto al aprobado: ${draft.name}. Corregir o registrar resolución de cambio`]
        : []
    })
}

function dayHourGaps(definition: WorkflowDefinition, selectedIds: string[], workspace: Workspace) {
  if (definition.id !== 'dia-hora') return []
  const legalTask = workspace.tasks.find(
    (item) => item.definitionId === `aptitud-legal-${workspace.profile?.modalidad}`,
  )
  const submission = workspace.submissions
    .filter((item) => item.taskId === legalTask?.id)
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt))[0]
  if (!submission?.exactVersionIds.length)
    return [
      'Registrar el envío histórico de aptitud legal con sus versiones exactas; si no están disponibles, revisar el expediente con Secretaría',
    ]
  const missing = submission.exactVersionIds.filter((id) => !selectedIds.includes(id))
  return missing.length
    ? [
        `Reutilizar las versiones exactas del envío de aptitud legal (${missing.length} pendientes); revisar cualquier sustitución con Secretaría`,
      ]
    : []
}

function nextActionsFor(
  task: TaskRecord,
  missingRequirements: string[],
  missingOutputs: string[],
) {
  if (missingRequirements.length) return [...missingRequirements]
  if (task.status === 'completed') return ['Resultado registrado']
  if (['submitted', 'waiting', 'observed'].includes(task.status))
    return missingOutputs.length ? missingOutputs : ['Completar el trámite con el resultado recibido']
  return ['Revisar paquete y registrar el envío manual']
}

export function evaluateTask(
  task: TaskRecord,
  workspace: Workspace,
  catalog: CatalogVersion,
  now: Date = new Date(),
) {
  const definition = applicableWorkflows(workspace, catalog).find(
    (item) => item.id === task.definitionId,
  )
  if (!definition)
    return {
      missingRequirements: ['Trámite no aplicable al perfil actual'],
      missingOutputs: [],
      nextActions: ['Revisar modalidad y datos del perfil'],
      ready: false,
      canComplete: false,
    }
  const selectedIds = evidenceIdsForTask(task, definition, workspace)
  const missingRequirements = [
    ...dependencyGaps(definition, workspace, catalog),
    ...requirementGaps(taskInputs(definition, workspace), task, selectedIds, workspace, now),
    ...developmentGaps(definition, selectedIds, workspace),
    ...topicGaps(selectedIds, workspace),
    ...dayHourGaps(definition, selectedIds, workspace),
  ]
  const missingOutputs = requirementGaps(
    taskOutputs(definition, workspace),
    task,
    task.outputVersionIds,
    workspace,
    now,
  )
  const ready = missingRequirements.length === 0
  return {
    missingRequirements,
    missingOutputs,
    nextActions: nextActionsFor(task, missingRequirements, missingOutputs),
    ready,
    canComplete: ready && missingOutputs.length === 0,
  }
}
