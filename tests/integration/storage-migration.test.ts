import Dexie from 'dexie'
import { afterEach, expect, it } from 'vitest'
import { storedBlob, WorkspaceDatabase } from '../../src/storage/db'
import { newProfile } from '../../src/domain/types'

const name = 'workspace-migration-test'
afterEach(async () => {
  await Dexie.delete(name)
})
it.each([1, 2])(
  'upgrades a v%i workspace without clearing records or original bytes',
  async (version) => {
    const old = new Dexie(name)
    old.version(1).stores({
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
    if (version === 2) old.version(2).stores({ drafts: 'id,templateId,monthlyPeriod' })
    const profile = newProfile()
    const draft = {
      id: 'draft',
      name: 'Informe',
      templateId: 'anexo-5',
      templateVersion: '1',
      revision: 1,
      savedRevision: 1,
      profileSnapshot: profile,
      fields: {},
      activities: [],
      monthlyPeriod: '2026-10',
      sourceMonthlyRevisions: [],
      updatedAt: '2026-10-22T18:00:00.000Z',
    }
    await old.table('profile').add(profile)
    await old.table('drafts').add(draft)
    await old.table('draftHistory').add(draft)
    await old.table('blobs').add({ id: 'blob', data: new Blob(['unaltered evidence']) })
    old.close()
    const updated = new WorkspaceDatabase(name)
    try {
      await updated.open()
      expect(updated.verno).toBe(6)
      expect(await updated.profile.get(profile.id)).toEqual(profile)
      expect(await updated.drafts.where('templateId').equals('anexo-5').toArray()).toEqual([draft])
      expect(await updated.draftHistory.get(['draft', 1])).toEqual(draft)
      expect(await storedBlob((await updated.blobs.get('blob'))!).text()).toBe('unaltered evidence')
      updated.close()
      const failedOpen = new Promise<void>((resolve, reject) => {
        const request = indexedDB.open(name, 10)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          request.result.close()
          resolve()
        }
      })
      await expect(failedOpen).rejects.toMatchObject({ name: 'VersionError' })
      await updated.open()
      expect(await updated.profile.get(profile.id)).toEqual(profile)
      expect(await updated.drafts.get('draft')).toEqual(draft)
    } finally {
      updated.close()
    }
  },
)
it('merges reception workflows and moves received files when upgrading from v3', async () => {
  const old = new Dexie(name)
  old.version(3).stores({
    profile: 'id',
    tasks: 'id,definitionId',
    documents: 'id',
    versions: 'id,documentId,blobId',
    blobs: 'id',
    drafts: 'id,templateId,monthlyPeriod',
    draftHistory: '[id+revision],id',
    submissions: 'id,taskId',
    personalEvents: 'id',
    settings: 'id',
  })
  const legacyTask = (definitionId: string, status: string, evidenceVersionIds: string[]) => ({
    id: definitionId,
    definitionId,
    status,
    requirementChecks: {},
    evidenceVersionIds,
    note: '',
    history: [],
  })
  await old.table('profile').add({ ...newProfile(), modalidad: 'research' })
  await old.table('documents').add({ id: 'debt', name: 'No adeudar', category: 'no-adeudar', createdAt: '' })
  await old.table('versions').add({ id: 'debt-v', documentId: 'debt' })
  await old.table('tasks').bulkAdd([
    legacyTask('biblioteca-revision', 'completed', []),
    legacyTask('biblioteca-aval-inicial', 'waiting', []),
    legacyTask('no-adeudar', 'completed', ['debt-v']),
  ])
  await old.table('submissions').add({ id: 'sent', taskId: 'biblioteca-aval-inicial' })
  old.close()
  const updated = new WorkspaceDatabase(name)
  try {
    await updated.open()
    const tasks = await updated.tasks.toArray()
    expect(tasks.map((task) => task.definitionId).sort()).toEqual(['biblioteca-revision', 'no-adeudar'])
    expect(tasks.find((task) => task.definitionId === 'biblioteca-revision')?.status).toBe('waiting')
    expect(tasks.find((task) => task.definitionId === 'no-adeudar')).toMatchObject({
      status: 'completed',
      evidenceVersionIds: [],
      outputVersionIds: ['debt-v'],
    })
    expect((await updated.submissions.get('sent'))?.taskId).toBe('biblioteca-revision')
  } finally {
    updated.close()
  }
})

it('splits the thesis by stage and keeps one file per document when upgrading from v5', async () => {
  const old = new Dexie(name)
  old.version(5).stores({
    profile: 'id',
    tasks: 'id,definitionId',
    documents: 'id',
    versions: 'id,documentId,blobId',
    blobs: 'id',
    drafts: 'id,templateId,monthlyPeriod',
    draftHistory: '[id+revision],id',
    submissions: 'id,taskId',
    personalEvents: 'id',
    settings: 'id',
  })
  const task = (definitionId: string, evidenceVersionIds: string[]) => ({
    id: definitionId,
    definitionId,
    status: 'preparing',
    requirementChecks: {},
    evidenceVersionIds,
    outputVersionIds: [],
    note: '',
    history: [],
  })
  const version = (id: string, documentId: string, createdAt: string) => ({
    id,
    documentId,
    blobId: `blob-${id}`,
    createdAt,
  })
  await old.table('documents').bulkAdd([
    { id: 'thesis', name: 'Trabajo', category: 'tesis', createdAt: '' },
    { id: 'id-card', name: 'Cédula', category: 'personal', createdAt: '' },
  ])
  await old.table('versions').bulkAdd([
    version('draft', 'thesis', '2026-11-01'),
    version('signed', 'thesis', '2026-11-05'),
    version('card-sent', 'id-card', '2026-10-01'),
    version('card-old', 'id-card', '2026-10-02'),
    version('card-new', 'id-card', '2026-10-03'),
  ])
  await old.table('blobs').bulkAdd(
    ['draft', 'signed', 'card-sent', 'card-old', 'card-new'].map((id) => ({ id: `blob-${id}`, data: new Blob([id]) })),
  )
  await old.table('tasks').bulkAdd([
    task('biblioteca-revision', ['draft']),
    task('biblioteca-decanato', ['signed']),
    task('propuesta', ['card-sent']),
  ])
  await old.table('submissions').add({ id: 'sent', taskId: 'propuesta', exactVersionIds: ['card-sent'] })
  old.close()
  const updated = new WorkspaceDatabase(name)
  try {
    await updated.open()
    const documents = await updated.documents.toArray()
    const versions = await updated.versions.toArray()
    const categoryOf = (versionId: string) =>
      documents.find((document) => document.id === versions.find((item) => item.id === versionId)?.documentId)?.category
    const dean = await updated.tasks.get('biblioteca-decanato')
    expect(categoryOf((await updated.tasks.get('biblioteca-revision'))!.evidenceVersionIds[0])).toBe('tesis')
    expect(categoryOf(dean!.evidenceVersionIds[0])).toBe('tesis-decanato')
    expect(versions.filter((item) => categoryOf(item.id) === 'personal').map((item) => item.id).sort())
      .toEqual(['card-new', 'card-sent'])
    expect(await updated.blobs.get('blob-card-old')).toBeUndefined()
    expect(await updated.blobs.get('blob-signed')).toBeDefined()
    expect((await updated.submissions.get('sent'))?.exactVersionIds).toEqual(['card-sent'])
  } finally {
    updated.close()
  }
})
