import type {
  CatalogVersion,
  Requirement,
  StudentProfile,
  TaskRecord,
  WorkflowDefinition,
  Workspace,
} from './types'
import { noDebtSubmissionDate, noDebtValidity } from './dates'
import { evidenceIdsForTask } from './task-evidence'
import { monthlyCoverage, monthlyGaps } from './monthly-report'
import { validateAnnex } from './annex'
import { numeric } from './numeric'
import { isThesisCategory } from './thesis-stages'
import { gradeIds, gradingSummary } from './grading'
import { taskFor } from './task-record'

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
  catalog: CatalogVersion,
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
  if (requirement.category === 'mensual')
    return monthlyGaps(monthlyCoverage(evidence, workspace, catalog, !!requirement.signed))[0]
  const signedEvidence = requirement.signed
    ? evidence.filter((version) => version.signatureStatus === 'reported-signed')
    : evidence
  if (!signedEvidence.length) return `Firma pendiente: ${requirement.label}`
  if (requirement.category === 'no-adeudar') {
    const submissionDate = noDebtSubmissionDate(workspace, now)
    const validities = signedEvidence.map((version) => noDebtValidity(version.issuedOn, submissionDate))
    if (validities.every((validity) => validity.status === 'expired'))
      return `No adeudar: ${validities[0].label}`
  }
  if (
    isThesisCategory(requirement.category) &&
    !signedEvidence.some(
      (version) =>
        version.mime === 'application/pdf' && version.textualPdfStatus === 'text-detected',
    )
  )
    return 'Verificar PDF del trabajo con texto seleccionable'
  return undefined
}

function textGap(requirement: Requirement, task: TaskRecord) {
  const value = task.requirementChecks[requirement.id]
  return typeof value === 'string' && value.trim() ? undefined : `Anotar: ${requirement.label}`
}

export const latestDraft = (workspace: Workspace, templateId: string) =>
  workspace.drafts
    .filter((draft) => draft.templateId === templateId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]

function annexGap(requirement: Requirement & { annex: string }, workspace: Workspace) {
  const draft = latestDraft(workspace, requirement.annex)
  return draft && validateAnnex(draft).valid ? undefined : `Completar: ${requirement.label}`
}

export function requirementGap(
  requirement: Requirement,
  task: TaskRecord,
  selectedIds: string[],
  workspace: Workspace,
  catalog: CatalogVersion,
  now: Date = new Date(),
): string | undefined {
  if (requirement.optional) return undefined
  if (requirement.annex) return annexGap({ ...requirement, annex: requirement.annex }, workspace)
  if (numericRequirementIds.has(requirement.id)) return numericGap(requirement, task)
  if (requirement.text) return textGap(requirement, task)
  if (!requirement.category)
    return task.requirementChecks[requirement.id] === true ? undefined : requirement.label
  return fileGap(
    { ...requirement, category: requirement.category },
    selectedIds,
    workspace,
    catalog,
    now,
  )
}

function averageGap(requirements: Requirement[], task: TaskRecord) {
  if (!gradeIds.every((id) => requirements.some((item) => item.id === id))) return undefined
  return gradingSummary(task.requirementChecks).passed === false
    ? 'Promedio inferior a 7: revisar o solicitar recalificación'
    : undefined
}

function requirementGaps(
  requirements: Requirement[],
  task: TaskRecord,
  selectedIds: string[],
  workspace: Workspace,
  catalog: CatalogVersion,
  now: Date,
) {
  return [
    ...requirements.map((requirement) =>
      requirementGap(requirement, task, selectedIds, workspace, catalog, now),
    ),
    averageGap(requirements, task),
  ].filter((gap): gap is string => !!gap)
}

export const applicableDependencies = (
  definition: WorkflowDefinition,
  workspace: Workspace,
  catalog: CatalogVersion,
) => {
  const applicableIds = new Set(applicableWorkflows(workspace, catalog).map((item) => item.id))
  return definition.dependsOn.filter((dependency) => applicableIds.has(dependency))
}

const definitionFor = (id: string, catalog: CatalogVersion) =>
  catalog.workflowDefinitions.find((item) => item.id === id)

export function informationalSources(
  definition: WorkflowDefinition,
  workspace: Workspace,
  catalog: CatalogVersion,
): WorkflowDefinition[] {
  return applicableDependencies(definition, workspace, catalog)
    .map((id) => definitionFor(id, catalog)!)
    .flatMap((dependency) =>
      dependency.informational ? informationalSources(dependency, workspace, catalog) : [dependency])
}

const taskCompleted = (id: string, workspace: Workspace) =>
  workspace.tasks.some((item) => item.definitionId === id && item.status === 'completed')

export function outputRecorded(
  source: WorkflowDefinition,
  outputIds: string[],
  workspace: Workspace,
  catalog: CatalogVersion,
) {
  const task = taskFor(source.id, workspace)
  return taskOutputs(source, workspace)
    .filter((requirement) => outputIds.includes(requirement.id))
    .some((requirement) =>
      !requirementGap({ ...requirement, optional: false }, task, task.outputVersionIds, workspace, catalog))
}

export function workflowCompleted(id: string, workspace: Workspace, catalog: CatalogVersion): boolean {
  const definition = definitionFor(id, catalog)
  if (definition?.informational)
    return informationalSources(definition, workspace, catalog).every((source) => taskCompleted(source.id, workspace))
  return taskCompleted(id, workspace)
}

function dependencyGaps(
  definition: WorkflowDefinition,
  workspace: Workspace,
  catalog: CatalogVersion,
) {
  return applicableDependencies(definition, workspace, catalog)
    .filter((dependency) => !workflowCompleted(dependency, workspace, catalog))
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
  definition: WorkflowDefinition,
  missingRequirements: string[],
  missingOutputs: string[],
) {
  if (missingRequirements.length) return [...missingRequirements]
  if (task.status === 'completed') return ['Resultado registrado']
  if (['submitted', 'waiting', 'observed'].includes(task.status))
    return missingOutputs.length ? missingOutputs : ['Completar el trámite con el resultado recibido']
  if (definition.inPerson) return ['Acudir en persona y registrar el resultado']
  return definition.directSend
    ? ['Enviar el correo con el ZIP y registrar el resultado']
    : ['Revisar paquete y registrar el envío manual']
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
    ...requirementGaps(taskInputs(definition, workspace), task, selectedIds, workspace, catalog, now),
    ...developmentGaps(definition, selectedIds, workspace),
    ...topicGaps(selectedIds, workspace),
    ...dayHourGaps(definition, selectedIds, workspace),
  ]
  const missingOutputs = requirementGaps(
    taskOutputs(definition, workspace),
    task,
    task.outputVersionIds,
    workspace,
    catalog,
    now,
  )
  const ready = missingRequirements.length === 0
  return {
    missingRequirements,
    missingOutputs,
    nextActions: nextActionsFor(task, definition, missingRequirements, missingOutputs),
    ready,
    canComplete: ready && missingOutputs.length === 0,
  }
}
