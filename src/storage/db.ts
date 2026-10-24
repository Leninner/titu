import Dexie, { type Table } from 'dexie'
import type {
  StudentProfile,
  TaskRecord,
  DocumentRecord,
  DocumentVersion,
  AnnexDraft,
  Submission,
  CalendarEvent,
} from '../domain/types'
import { workflowDefinitions } from '../catalog/workflows'
import { migrateTaskRecords, moveReceivedFiles } from './migrate-workspace'

export interface StoredBlobRecord {
  id: string
  data: Blob | ArrayBuffer | Uint8Array
  mime?: string
}

export function storedBlob(record: StoredBlobRecord): Blob {
  if (record.data instanceof Blob) return record.data
  const data = record.data instanceof ArrayBuffer ? record.data : new Uint8Array(record.data).buffer
  return new Blob([data], { type: record.mime ?? '' })
}

export class WorkspaceDatabase extends Dexie {
  profile!: Table<StudentProfile, string>
  tasks!: Table<TaskRecord, string>
  documents!: Table<DocumentRecord, string>
  versions!: Table<DocumentVersion, string>
  blobs!: Table<StoredBlobRecord, string>
  drafts!: Table<AnnexDraft, string>
  draftHistory!: Table<AnnexDraft, [string, number]>
  submissions!: Table<Submission, string>
  personalEvents!: Table<CalendarEvent, string>
  settings!: Table<{ id: string; value: string }, string>

  constructor(name = 'graduation-organizer') {
    super(name)
    this.version(1).stores({
      profile: 'id',
      tasks: 'id,definitionId',
      documents: 'id',
      versions: 'id,documentId,blobId',
      blobs: 'id',
      drafts: 'id',
      draftHistory: '[id+revision],id',
      submissions: 'id,taskId',
      personalEvents: 'id',
      settings: 'id',
    })
    // Indexed template/month lookup preserves every existing row and original blob.
    this.version(2).stores({ drafts: 'id,templateId,monthlyPeriod' })
    // New writes use ArrayBuffer: WebKit can reject native Blob/File storage.
    // Keep legacy Blob rows intact and decode both representations on reads.
    this.version(3).stores({ blobs: 'id' })
    this.version(4)
      .stores({})
      .upgrade(async (transaction) => {
        const profile = (await transaction.table<StudentProfile>('profile').toArray())[0]
        const migrated = migrateTaskRecords(
          {
            modality: profile?.modalidad,
            tasks: await transaction.table<TaskRecord>('tasks').toArray(),
            submissions: await transaction.table<Submission>('submissions').toArray(),
            documents: await transaction.table<DocumentRecord>('documents').toArray(),
            versions: await transaction.table<DocumentVersion>('versions').toArray(),
          },
          workflowDefinitions,
        )
        await transaction.table('tasks').clear()
        await transaction.table('tasks').bulkAdd(migrated.tasks)
        await transaction.table('submissions').bulkPut(migrated.submissions)
      })
    this.version(5)
      .stores({})
      .upgrade(async (transaction) => {
        const tasks = moveReceivedFiles(
          {
            tasks: await transaction.table<TaskRecord>('tasks').toArray(),
            submissions: [],
            documents: await transaction.table<DocumentRecord>('documents').toArray(),
            versions: await transaction.table<DocumentVersion>('versions').toArray(),
          },
          workflowDefinitions,
        )
        await transaction.table('tasks').bulkPut(tasks)
      })
  }
}
