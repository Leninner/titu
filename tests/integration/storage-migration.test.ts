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
      expect(updated.verno).toBe(4)
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
