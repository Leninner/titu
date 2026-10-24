export type Modality = 'research' | 'article' | 'complexivo'
export type TaskStatus =
  | 'pending'
  | 'preparing'
  | 'waiting'
  | 'submitted'
  | 'observed'
  | 'completed'
export interface StudentProfile {
  id: string
  nombres: string
  cedula: string
  email: string
  direccion: string
  carrera: string
  facultad: string
  modalidad: Modality
  periodo: string
  titulo: string
  tema: string
  aprobacionFecha: string
  aprobacionResolucion: string
  tutor: string
  aplicaEmpresa: boolean
  initialStage: string
}
export interface Activity {
  id: string
  date: string
  description: string
  sourceDraftId?: string
  sourceRevision?: number
}
export interface AnnexDraft {
  id: string
  name: string
  templateId: string
  templateVersion: string
  revision: number
  savedRevision: number
  profileSnapshot: StudentProfile
  fields: Record<string, string>
  activities: Activity[]
  monthlyPeriod: string
  sourceMonthlyRevisions: { draftId: string; revision: number }[]
  updatedAt: string
  needsReview?: boolean
}
export interface TaskRecord {
  id: string
  definitionId: string
  status: TaskStatus
  requirementChecks: Record<string, boolean | number | string>
  evidenceVersionIds: string[]
  outputVersionIds: string[]
  submittedAt?: string
  note: string
  history: { at: string; status: TaskStatus; note: string }[]
}
export interface DocumentRecord {
  id: string
  name: string
  category: string
  createdAt: string
}
export interface ReportedActivity {
  date: string
  description: string
}
export interface MonthlyReportAnalysis {
  recognized: boolean
  month?: string
  topic?: string
  progress?: number
  activities?: ReportedActivity[]
}
export interface DocumentVersion {
  id: string
  documentId: string
  blobId: string
  originalName: string
  mime: string
  size: number
  sha256: string
  createdAt: string
  issuedOn?: string
  expiresOn?: string
  sourceDraftId?: string
  revision?: number
  signatureStatus: 'unsigned' | 'pending' | 'reported-signed'
  textualPdfStatus: 'unknown' | 'text-detected' | 'no-text-detected'
  reportAnalysis?: MonthlyReportAnalysis
}
export interface BlobRecord {
  id: string
  data: Blob
}
export interface Submission {
  id: string
  taskId: string
  exactVersionIds: string[]
  recipient: string
  sentAt: string
  acknowledgementBlobId?: string
  note: string
}
export interface CalendarEvent {
  id: string
  title: string
  kind: 'deadline' | 'window' | 'administrative' | 'appointment' | 'personal'
  startDate: string
  endDate?: string
  localTime?: string
  timeZone: string
  modalities: Modality[]
  periodId: string
  sourceIds: string[]
  certainty: string
  personalOverride?: { startDate: string; endDate?: string; localTime?: string }
}
export interface Source {
  id: string
  name: string
  sha256: string
  version: string
  excerptUrl: string
}
export interface TemplateField {
  key: string
  label: string
  required: boolean
  type?: 'text' | 'date' | 'number' | 'textarea'
}
export interface TemplateDefinition {
  id: string
  name: string
  sourceIds: string[]
  version: string
  kind: 'editable' | 'reference' | 'external' | 'missing'
  role: string
  modalities: Modality[]
  fields: TemplateField[]
  fixedText: string
  notes: string[]
  page: { width: number; height: number; marginX: number; marginY: number }
  companyOnly?: boolean
}
export interface Requirement {
  id: string
  label: string
  detail?: string
  companyOnly?: boolean
  signed?: boolean
  category?: string
  optional?: boolean
  modalities?: Modality[]
  annex?: string
}
export interface WorkflowDefinition {
  id: string
  title: string
  stage: string
  modalities: Modality[]
  sourceIds: string[]
  dependsOn: string[]
  requirements: Requirement[]
  outputs: Requirement[]
  optional?: boolean
  companyOnly?: boolean
  autoComplete?: boolean
  summary: string
  instructions: string
  role: string
}
export interface CatalogVersion {
  version: string
  sourceIds: string[]
  templates: TemplateDefinition[]
  workflowDefinitions: WorkflowDefinition[]
  calendarEvents: CalendarEvent[]
  conflicts: { id: string; evidence: string; decision: string }[]
}
export interface Workspace {
  profile: StudentProfile | null
  tasks: TaskRecord[]
  documents: DocumentRecord[]
  versions: DocumentVersion[]
  drafts: AnnexDraft[]
  submissions: Submission[]
  personalEvents: CalendarEvent[]
  settings: Record<string, string>
}
export interface WorkspaceSnapshot extends Workspace {
  blobs: BlobRecord[]
}
export interface BackupManifest {
  formatVersion: number
  catalogVersion: string
  exportedAt: string
  records: Workspace
  blobs: { id: string; path: string; size: number; sha256: string }[]
}
export const emptyWorkspace = (): Workspace => ({
  profile: null,
  tasks: [],
  documents: [],
  versions: [],
  drafts: [],
  submissions: [],
  personalEvents: [],
  settings: {},
})
export const newProfile = (): StudentProfile => ({
  id: crypto.randomUUID(),
  nombres: '',
  cedula: '',
  email: '',
  direccion: '',
  carrera: '',
  facultad: 'Facultad de Ingeniería en Sistemas, Electrónica e Industrial',
  modalidad: 'research',
  periodo: '2026-07-12',
  titulo: '',
  tema: '',
  aprobacionFecha: '',
  aprobacionResolucion: '',
  tutor: '',
  aplicaEmpresa: false,
  initialStage: 'propuesta',
})
export const modalityLabels: Record<Modality, string> = {
  research: 'Proyecto de Investigación',
  article: 'Artículo Académico',
  complexivo: 'Examen Complexivo',
}
