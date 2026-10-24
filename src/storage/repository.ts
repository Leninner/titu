import type {
  AnnexDraft,
  CalendarEvent,
  DocumentVersion,
  StudentProfile,
  Submission,
  TaskRecord,
  Workspace,
  WorkspaceSnapshot,
} from '../domain/types'
import {
  draftSchema,
  eventSchema,
  profileSchema,
  submissionSchema,
  taskSchema,
} from '../domain/schemas'
import { storedBlob, WorkspaceDatabase } from './db'
import { sha256, validateBackup, type ValidatedBackup } from './restore'

export class StorageError extends Error {
  constructor(
    public code: 'conflict' | 'referenced' | 'invalid' | 'storage',
    message: string,
  ) {
    super(message)
  }
}
export interface AddDocumentInput {
  file: Blob
  originalName: string
  name?: string
  category?: string
  documentId?: string
  issuedOn?: string
  expiresOn?: string
  sourceDraftId?: string
  revision?: number
  signatureStatus?: DocumentVersion['signatureStatus']
  textualPdfStatus?: DocumentVersion['textualPdfStatus']
}
const mimeTypes: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
}
export class WorkspaceRepository {
  db: WorkspaceDatabase
  constructor(name?: string) {
    this.db = new WorkspaceDatabase(name)
  }
  async loadWorkspace(): Promise<Workspace> {
    return this.db.transaction('r', this.db.tables, async () => ({
      profile: (await this.db.profile.toArray())[0] ?? null,
      tasks: await this.db.tasks.toArray(),
      documents: await this.db.documents.toArray(),
      versions: await this.db.versions.toArray(),
      drafts: await this.db.drafts.toArray(),
      submissions: await this.db.submissions.toArray(),
      personalEvents: await this.db.personalEvents.toArray(),
      settings: Object.fromEntries((await this.db.settings.toArray()).map((x) => [x.id, x.value])),
    }))
  }
  async snapshot(): Promise<WorkspaceSnapshot & { draftHistory: AnnexDraft[] }> {
    return this.db.transaction('r', this.db.tables, async () => ({
      ...(await this.loadWorkspace()),
      blobs: (await this.db.blobs.toArray()).map((record) => ({
        id: record.id,
        data: storedBlob(record),
      })),
      draftHistory: await this.db.draftHistory.toArray(),
    }))
  }
  async saveProfile(profile: StudentProfile) {
    profile = profileSchema.parse(profile)
    await this.db.transaction('rw', this.db.profile, this.db.drafts, async () => {
      const old = (await this.db.profile.toArray())[0]
      if (old && old.id !== profile.id)
        throw new StorageError(
          'invalid',
          'Para cambiar estudiante, respalda y reemplaza el expediente',
        )
      if (
        old &&
        (old.modalidad !== profile.modalidad ||
          old.periodo !== profile.periodo ||
          old.tema !== profile.tema ||
          old.aprobacionResolucion !== profile.aprobacionResolucion)
      )
        await this.db.drafts.toCollection().modify({ needsReview: true })
      await this.db.profile.put(profile)
    })
  }
  async saveTask(task: TaskRecord) {
    await this.saveTasks([task])
  }
  async saveTasks(tasks: TaskRecord[]) {
    tasks = tasks.map((task) => taskSchema.parse(task))
    await this.db.transaction('rw', this.db.tasks, this.db.versions, async () => {
      for (const task of tasks) {
        for (const id of [...task.evidenceVersionIds, ...task.outputVersionIds])
          if (!(await this.db.versions.get(id)))
            throw new StorageError('invalid', 'Falta la evidencia seleccionada')
        await this.db.tasks.put(task)
      }
    })
  }
  async saveDraft(draft: AnnexDraft, expectedRevision: number): Promise<AnnexDraft> {
    draft = draftSchema.parse(draft)
    return this.db.transaction('rw', this.db.drafts, this.db.draftHistory, async () => {
      const current = await this.db.drafts.get(draft.id)
      if ((current?.revision ?? 0) !== expectedRevision)
        throw new StorageError(
          'conflict',
          'La revisión cambió en otra pestaña. Conserva tu copia antes de recargar',
        )
      const saved = {
        ...draft,
        revision: expectedRevision + 1,
        savedRevision: expectedRevision + 1,
        updatedAt: new Date().toISOString(),
      }
      await this.db.draftHistory.add(saved)
      await this.db.drafts.put(saved)
      return saved
    })
  }
  async getDraftRevision(id: string, revision: number) {
    return this.db.draftHistory.get([id, revision])
  }
  async addDocumentVersion(input: AddDocumentInput): Promise<DocumentVersion> {
    const extension = input.originalName.split('.').pop()?.toLowerCase() ?? ''
    if (!mimeTypes[extension] || input.file.size > 25 * 1024 * 1024)
      throw new StorageError('invalid', 'Admite PDF, Word, JPG o PNG de hasta 25 MiB')
    const data = await input.file.arrayBuffer()
    const digest = await sha256(new Blob([data]))
    const createdAt = new Date().toISOString()
    const documentId = input.documentId ?? crypto.randomUUID()
    const version: DocumentVersion = {
      id: crypto.randomUUID(),
      documentId,
      blobId: crypto.randomUUID(),
      originalName: input.originalName,
      mime: mimeTypes[extension],
      size: input.file.size,
      sha256: digest,
      createdAt,
      issuedOn: input.issuedOn,
      expiresOn: input.expiresOn,
      sourceDraftId: input.sourceDraftId,
      revision: input.revision,
      signatureStatus: input.signatureStatus ?? 'unsigned',
      textualPdfStatus: input.textualPdfStatus ?? 'unknown',
    }
    await this.db.transaction(
      'rw',
      [this.db.documents, this.db.versions, this.db.blobs, this.db.drafts, this.db.draftHistory],
      async () => {
        if (input.documentId && !(await this.db.documents.get(input.documentId)))
          throw new StorageError('invalid', 'El documento no existe')
        if (
          input.sourceDraftId &&
          (!(await this.db.drafts.get(input.sourceDraftId)) ||
            (input.revision !== undefined &&
              !(await this.db.draftHistory.get([input.sourceDraftId, input.revision]))))
        )
          throw new StorageError('invalid', 'Guarda la revisión del borrador antes de adjuntarla')
        if (!input.documentId)
          await this.db.documents.add({
            id: documentId,
            name: input.name ?? input.originalName,
            category: input.category ?? 'general',
            createdAt,
          })
        await this.db.blobs.add({ id: version.blobId, data, mime: input.file.type || version.mime })
        await this.db.versions.add(version)
      },
    )
    return version
  }
  async recordSubmission(input: Omit<Submission, 'id'> & { id?: string }): Promise<Submission> {
    const submission = submissionSchema.parse({ ...input, id: input.id ?? crypto.randomUUID() })
    await this.db.transaction(
      'rw',
      this.db.submissions,
      this.db.tasks,
      this.db.versions,
      this.db.blobs,
      async () => {
        const task = await this.db.tasks.get(submission.taskId)
        if (!task) throw new StorageError('invalid', 'El trámite no existe')
        for (const id of submission.exactVersionIds)
          if (!(await this.db.versions.get(id)))
            throw new StorageError('invalid', 'Falta una versión seleccionada')
        if (
          submission.acknowledgementBlobId &&
          !(await this.db.blobs.get(submission.acknowledgementBlobId))
        )
          throw new StorageError('invalid', 'Falta el acuse de recibo')
        await this.db.submissions.add(submission)
        await this.db.tasks.put({
          ...task,
          status: 'submitted',
          submittedAt: submission.sentAt,
          history: [
            ...task.history,
            { at: submission.sentAt, status: 'submitted', note: submission.note },
          ],
        })
      },
    )
    return submission
  }
  async getBlob(id: string) {
    const record = await this.db.blobs.get(id)
    return record ? storedBlob(record) : undefined
  }
  async savePersonalEvent(event: CalendarEvent) {
    await this.db.personalEvents.put(eventSchema.parse(event))
  }
  async saveSetting(id: string, value: string) {
    await this.db.settings.put({ id, value })
  }
  async removeVersion(id: string) {
    await this.db.transaction('rw', this.db.tables, async () => {
      const workspace = await this.loadWorkspace()
      if (
        workspace.tasks.some(
          (t) => t.evidenceVersionIds.includes(id) || t.outputVersionIds.includes(id),
        ) ||
        workspace.submissions.some((s) => s.exactVersionIds.includes(id))
      )
        throw new StorageError('referenced', 'Esta versión está vinculada a un trámite o envío')
      const version = await this.db.versions.get(id)
      if (!version) return
      await this.db.versions.delete(id)
      if (
        !(await this.db.versions.where('blobId').equals(version.blobId).count()) &&
        !workspace.submissions.some((s) => s.acknowledgementBlobId === version.blobId)
      )
        await this.db.blobs.delete(version.blobId)
      if (!(await this.db.versions.where('documentId').equals(version.documentId).count()))
        await this.db.documents.delete(version.documentId)
    })
  }
  async removeDraft(id: string) {
    await this.db.transaction('rw', this.db.tables, async () => {
      const workspace = await this.loadWorkspace()
      if (
        workspace.versions.some((v) => v.sourceDraftId === id) ||
        (await this.db.draftHistory.toArray()).some(
          (d) =>
            d.id !== id &&
            (d.sourceMonthlyRevisions.some((s) => s.draftId === id) ||
              d.activities.some((a) => a.sourceDraftId === id)),
        )
      )
        throw new StorageError('referenced', 'El borrador tiene versiones o informes vinculados')
      await this.db.drafts.delete(id)
      await this.db.draftHistory.where('id').equals(id).delete()
    })
  }
  async restoreWorkspace(input: ValidatedBackup) {
    const { snapshot } = await validateBackup(input)
    // Read Blob bytes before opening the transaction, so browser I/O cannot expire it.
    const storedBlobs = await Promise.all(
      snapshot.blobs.map(async (blob) => ({
        id: blob.id,
        data: await blob.data.arrayBuffer(),
        mime:
          blob.data.type ||
          snapshot.versions.find((version) => version.blobId === blob.id)?.mime ||
          '',
      })),
    )
    await this.db.transaction('rw', this.db.tables, async () => {
      for (const table of this.db.tables) await table.clear()
      if (snapshot.profile) await this.db.profile.add(snapshot.profile)
      await this.db.tasks.bulkAdd(snapshot.tasks)
      await this.db.documents.bulkAdd(snapshot.documents)
      await this.db.versions.bulkAdd(snapshot.versions)
      await this.db.blobs.bulkAdd(storedBlobs)
      await this.db.drafts.bulkAdd(snapshot.drafts)
      await this.db.draftHistory.bulkAdd(snapshot.draftHistory ?? snapshot.drafts)
      await this.db.submissions.bulkAdd(snapshot.submissions)
      await this.db.personalEvents.bulkAdd(snapshot.personalEvents)
      await this.db.settings.bulkAdd(
        Object.entries(snapshot.settings).map(([id, value]) => ({ id, value })),
      )
    })
  }
}
export const repository = new WorkspaceRepository()
