import type { Table } from 'dexie'
import type { DocumentRecord, DocumentVersion, Submission, TaskRecord } from '../domain/types'
import { consolidateFiles, type FileRecords } from './consolidate-files'

type TableOf = <T>(name: string) => Table<T, string>

async function readFileRecords(table: TableOf): Promise<FileRecords> {
  const submissions = await table<Submission>('submissions').toArray()
  return {
    documents: await table<DocumentRecord>('documents').toArray(),
    versions: await table<DocumentVersion>('versions').toArray(),
    tasks: await table<TaskRecord>('tasks').toArray(),
    submissions,
    acknowledgementBlobIds: submissions.flatMap((submission) =>
      submission.acknowledgementBlobId ? [submission.acknowledgementBlobId] : [],
    ),
  }
}

async function replaceTable<T>(table: Table<T, string>, rows: T[]) {
  await table.clear()
  await table.bulkAdd(rows)
}

export async function writeConsolidatedFiles(
  table: TableOf,
  prepare: (records: FileRecords) => FileRecords = (records) => records,
) {
  const records = prepare(await readFileRecords(table))
  const consolidated = consolidateFiles(records)
  await replaceTable(table<DocumentRecord>('documents'), consolidated.documents)
  await replaceTable(table<DocumentVersion>('versions'), consolidated.versions)
  await replaceTable(table<TaskRecord>('tasks'), consolidated.tasks)
  await replaceTable(table<Submission>('submissions'), records.submissions)
  await table('blobs').bulkDelete(consolidated.freedBlobIds)
}
