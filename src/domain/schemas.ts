import { z } from 'zod'

const id = z.string().min(1).max(200)
const text = z.string().max(1000000)
const date = z.iso.date()
const draftDate = z.union([z.literal(''), date])
const timestamp = z.iso.datetime()
const localTime = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
const monthlyPeriod = z.union([z.literal(''), z.string().regex(/^\d{4}-(?:0[1-9]|1[0-2])$/)])
const modality = z.enum(['research', 'article', 'complexivo'])
export const currentBackupFormat = 3
const status = z.enum(['pending', 'preparing', 'waiting', 'submitted', 'observed', 'completed'])
export const profileSchema = z.object({
  id,
  nombres: text,
  cedula: text,
  email: text,
  direccion: text,
  carrera: text,
  facultad: text,
  modalidad: modality,
  periodo: text,
  titulo: text,
  tema: text,
  aprobacionFecha: draftDate,
  aprobacionResolucion: text,
  tutor: text,
  aplicaEmpresa: z.boolean(),
  initialStage: text,
  empresa: text.default(''),
  representante: text.default(''),
  cargoRepresentante: text.default(''),
  cedulaRepresentante: text.default(''),
  emailRepresentante: text.default(''),
  telefonoRepresentante: text.default(''),
  celularRepresentante: text.default(''),
})
export const draftSchema = z.object({
  id,
  name: text,
  templateId: id,
  templateVersion: id,
  revision: z.number().int().nonnegative(),
  savedRevision: z.number().int().nonnegative(),
  profileSnapshot: profileSchema,
  fields: z.record(z.string(), text),
  activities: z.array(
    z.object({
      id,
      date: draftDate,
      description: text,
      sourceDraftId: id.optional(),
      sourceRevision: z.number().int().nonnegative().optional(),
    }),
  ),
  monthlyPeriod,
  sourceMonthlyRevisions: z.array(
    z.object({ draftId: id, revision: z.number().int().nonnegative() }),
  ),
  updatedAt: timestamp,
  needsReview: z.boolean().optional(),
})
export const taskSchema = z.object({
  id,
  definitionId: id,
  status,
  requirementChecks: z.record(z.string(), z.union([z.boolean(), z.number(), text])),
  evidenceVersionIds: z.array(id),
  outputVersionIds: z.array(id).default([]),
  submittedAt: timestamp.optional(),
  note: text,
  history: z.array(z.object({ at: timestamp, status, note: text })),
})
export const versionSchema = z.object({
  id,
  documentId: id,
  blobId: id,
  originalName: text,
  mime: text,
  size: z
    .number()
    .int()
    .nonnegative()
    .max(25 * 1024 * 1024),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  createdAt: timestamp,
  issuedOn: date.optional(),
  expiresOn: date.optional(),
  sourceDraftId: id.optional(),
  revision: z.number().int().nonnegative().optional(),
  signatureStatus: z.enum(['unsigned', 'pending', 'reported-signed']),
  textualPdfStatus: z.enum(['unknown', 'text-detected', 'no-text-detected']),
  reportAnalysis: z
    .object({
      recognized: z.boolean(),
      month: z.string().regex(/^\d{4}-(?:0[1-9]|1[0-2])$/).optional(),
      topic: text.optional(),
      progress: z.number().optional(),
      activities: z.array(z.object({ date, description: text })).optional(),
    })
    .optional(),
})
export const submissionSchema = z.object({
  id,
  taskId: id,
  exactVersionIds: z.array(id),
  recipient: text,
  sentAt: timestamp,
  acknowledgementBlobId: id.optional(),
  note: text,
})
export const eventSchema = z.object({
  id,
  title: text,
  kind: z.enum(['deadline', 'window', 'administrative', 'appointment', 'personal']),
  startDate: date,
  endDate: date.optional(),
  localTime: localTime.optional(),
  timeZone: text,
  modalities: z.array(modality),
  periodId: text,
  sourceIds: z.array(id),
  certainty: text,
  personalOverride: z
    .object({ startDate: date, endDate: date.optional(), localTime: localTime.optional() })
    .optional(),
})
export const workspaceSchema = z.object({
  profile: profileSchema.nullable(),
  tasks: z.array(taskSchema),
  documents: z.array(z.object({ id, name: text, category: text, createdAt: timestamp })),
  versions: z.array(versionSchema),
  drafts: z.array(draftSchema),
  submissions: z.array(submissionSchema),
  personalEvents: z.array(eventSchema),
  settings: z.record(z.string(), text),
})
export const backupManifestSchema = z.object({
  formatVersion: z.union([z.literal(1), z.literal(2), z.literal(currentBackupFormat)]),
  catalogVersion: id,
  exportedAt: timestamp,
  records: workspaceSchema,
  blobs: z.array(
    z.object({
      id,
      path: text,
      size: z.number().int().nonnegative(),
      sha256: z.string().regex(/^[a-f0-9]{64}$/),
    }),
  ),
  draftHistory: z.array(draftSchema).optional(),
})
