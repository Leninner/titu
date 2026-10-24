import { afterEach, beforeEach, expect, it } from 'vitest'
import { WorkspaceRepository } from '../../src/storage/repository'
import { newProfile } from '../../src/domain/types'
import { exportBackup, importBackup, preflightZip } from '../../src/export/backup'
import { submissionZip } from '../../src/export/submission-zip'
import { strToU8, unzipSync, zipSync } from 'fflate'

let repo: WorkspaceRepository
beforeEach(() => {
  repo = new WorkspaceRepository('storage-test')
})
afterEach(async () => {
  await repo.db.delete()
})
it('preserves original bytes, rejects deletion of used evidence and roundtrips a complete backup', async () => {
  await repo.saveProfile(newProfile())
  const version = await repo.addDocumentVersion({
    file: new Blob(['signed bytes']),
    originalName: 'signed.pdf',
  })
  await repo.saveTask({
    id: 'task',
    definitionId: 'task',
    status: 'pending',
    requirementChecks: {},
    evidenceVersionIds: [version.id],
    outputVersionIds: [],
    note: '',
    history: [],
  })
  await repo.recordSubmission({
    taskId: 'task',
    exactVersionIds: [version.id],
    recipient: 'secretaria',
    sentAt: '2026-10-22T18:00:00.000Z',
    note: '',
  })
  await expect(repo.removeVersion(version.id)).rejects.toThrow()
  const snapshot = await repo.snapshot()
  const zip = await submissionZip(snapshot, [version.id])
  expect(
    new TextDecoder().decode(Object.values(unzipSync(new Uint8Array(await zip.arrayBuffer())))[0]),
  ).toBe('signed bytes')
  const backup = await importBackup(await exportBackup(snapshot, '1'))
  await repo.restoreWorkspace(backup)
  expect(await repo.loadWorkspace()).toEqual(backup.manifest.records)
  expect(await (await repo.getBlob(version.blobId))!.text()).toBe('signed bytes')
})
it('rejects stale edits without overwriting a committed revision', async () => {
  const draft = {
    id: 'draft',
    name: 'Monthly',
    templateId: '5',
    templateVersion: '1',
    revision: 0,
    savedRevision: 0,
    profileSnapshot: newProfile(),
    fields: {},
    activities: [],
    monthlyPeriod: '2026-10',
    sourceMonthlyRevisions: [],
    updatedAt: '2026-10-22T18:00:00.000Z',
  }
  const saved = await repo.saveDraft(draft, 0)
  expect(saved.revision).toBe(1)
  await expect(repo.saveDraft({ ...draft, name: 'stale' }, 0)).rejects.toThrow(/revisión/)
  expect((await repo.loadWorkspace()).drafts[0].name).toBe('Monthly')
})
it('preflights unsafe paths and expanded size before decompression', () => {
  expect(() => preflightZip(zipSync({ '../escape': strToU8('bad') }))).toThrow()
  const zip = zipSync({ safe: strToU8('ok') })
  const view = new DataView(zip.buffer)
  for (let n = 0; n < zip.length - 4; n++)
    if (view.getUint32(n, true) === 0x02014b50) view.setUint32(n + 24, 501 * 1024 * 1024, true)
  expect(() => preflightZip(zip)).toThrow(/límite/)
})
it('rolls back every table if restoring fails after clearing', async () => {
  const profile = newProfile()
  await repo.saveProfile(profile)
  const backup = await importBackup(await exportBackup(await repo.snapshot(), '1'))
  const original = repo.db.documents.bulkAdd
  repo.db.documents.bulkAdd = (() => {
    throw new DOMException('Quota exceeded', 'QuotaExceededError')
  }) as typeof original
  await expect(repo.restoreWorkspace(backup)).rejects.toThrow('Quota exceeded')
  repo.db.documents.bulkAdd = original
  expect((await repo.loadWorkspace()).profile).toEqual(profile)
})
it('rejects corrupted hashes and future schemas without replacing existing records', async () => {
  await repo.saveProfile(newProfile())
  await repo.addDocumentVersion({ file: new Blob(['original']), originalName: 'original.pdf' })
  const before = await repo.loadWorkspace()
  const zip = await exportBackup(await repo.snapshot(), '1')
  const entries = unzipSync(new Uint8Array(await zip.arrayBuffer()))
  const manifest = JSON.parse(new TextDecoder().decode(entries['manifest.json']))
  entries[manifest.blobs[0].path] = strToU8('tampered')
  await expect(
    importBackup(new Blob([zipSync(entries) as Uint8Array<ArrayBuffer>])),
  ).rejects.toThrow()
  manifest.formatVersion = 3
  entries['manifest.json'] = strToU8(JSON.stringify(manifest))
  await expect(
    importBackup(new Blob([zipSync(entries) as Uint8Array<ArrayBuffer>])),
  ).rejects.toThrow()
  expect(await repo.loadWorkspace()).toEqual(before)
})
it('preserves historical draft revisions in portable backups', async () => {
  const draft = {
    id: 'draft',
    name: 'Monthly',
    templateId: '5',
    templateVersion: '1',
    revision: 0,
    savedRevision: 0,
    profileSnapshot: newProfile(),
    fields: {},
    activities: [],
    monthlyPeriod: '2026-10',
    sourceMonthlyRevisions: [],
    updatedAt: '2026-10-22T18:00:00.000Z',
  }
  const first = await repo.saveDraft(draft, 0)
  await repo.saveDraft({ ...first, name: 'Updated' }, 1)
  const backup = await importBackup(await exportBackup(await repo.snapshot(), '1'))
  await repo.restoreWorkspace(backup)
  expect((await repo.getDraftRevision('draft', 1))?.name).toBe('Monthly')
  expect((await repo.getDraftRevision('draft', 2))?.name).toBe('Updated')
})
it('rejects unsupported and oversized files', async () => {
  await expect(
    repo.addDocumentVersion({ file: new Blob(['x']), originalName: 'macro.html' }),
  ).rejects.toThrow(/Admite/)
  await expect(
    repo.addDocumentVersion({
      file: new Blob([new Uint8Array(25 * 1024 * 1024 + 1)]),
      originalName: 'big.pdf',
    }),
  ).rejects.toThrow(/25 MiB/)
  expect((await repo.snapshot()).blobs).toHaveLength(0)
})
it('rejects excessive entries, encryption, malformed local paths and oversized compressed uploads', async () => {
  const entries: Record<string, Uint8Array> = {}
  for (let i = 0; i < 5001; i++) entries[`file${i}`] = new Uint8Array()
  expect(() => preflightZip(zipSync(entries))).toThrow()
  const zip = zipSync({ safe: strToU8('hello') })
  const view = new DataView(zip.buffer)
  for (let n = 0; n < zip.length - 4; n++)
    if (view.getUint32(n, true) === 0x02014b50) view.setUint16(n + 8, 1, true)
  expect(() => preflightZip(zip)).toThrow()
  const huge = {
    size: 251 * 1024 * 1024,
    arrayBuffer: () => {
      throw new Error('must not read')
    },
  } as unknown as Blob
  await expect(importBackup(huge)).rejects.toThrow(/250 MiB/)
})
it('serializes competing tab writes so exactly one revision commits', async () => {
  const second = new WorkspaceRepository('storage-test')
  const draft = {
    id: 'draft',
    name: 'Monthly',
    templateId: '5',
    templateVersion: '1',
    revision: 0,
    savedRevision: 0,
    profileSnapshot: newProfile(),
    fields: {},
    activities: [],
    monthlyPeriod: '2026-10',
    sourceMonthlyRevisions: [],
    updatedAt: '2026-10-22T18:00:00.000Z',
  }
  const results = await Promise.allSettled([
    repo.saveDraft(draft, 0),
    second.saveDraft({ ...draft, name: 'Other tab' }, 0),
  ])
  expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
  expect(results.filter((r) => r.status === 'rejected')).toHaveLength(1)
  expect((await repo.loadWorkspace()).drafts[0].revision).toBe(1)
  second.db.close()
})
it('reloads profile and preserves evidence while flagging drafts on modality changes', async () => {
  const profile = newProfile()
  await repo.saveProfile(profile)
  await repo.saveDraft(
    {
      id: 'draft',
      name: 'Monthly',
      templateId: '5',
      templateVersion: '1',
      revision: 0,
      savedRevision: 0,
      profileSnapshot: profile,
      fields: {},
      activities: [],
      monthlyPeriod: '2026-10',
      sourceMonthlyRevisions: [],
      updatedAt: '2026-10-22T18:00:00.000Z',
    },
    0,
  )
  const v = await repo.addDocumentVersion({ file: new Blob(['pdf']), originalName: 'evidence.pdf' })
  await repo.saveProfile({ ...profile, modalidad: 'complexivo' })
  repo.db.close()
  await repo.db.open()
  const restored = await repo.loadWorkspace()
  expect(restored.profile?.modalidad).toBe('complexivo')
  expect(restored.drafts[0].needsReview).toBe(true)
  expect(restored.versions[0].id).toBe(v.id)
  expect(restored.tasks).toEqual([])
})
it('rejects missing current history revisions and historical references beyond the latest revision', async () => {
  const draft = {
    id: 'draft',
    name: 'Monthly',
    templateId: '5',
    templateVersion: '1',
    revision: 0,
    savedRevision: 0,
    profileSnapshot: newProfile(),
    fields: {},
    activities: [],
    monthlyPeriod: '2026-10',
    sourceMonthlyRevisions: [],
    updatedAt: '2026-10-22T18:00:00.000Z',
  }
  await repo.saveDraft(draft, 0)
  const backup = await importBackup(await exportBackup(await repo.snapshot(), '1'))
  backup.manifest.draftHistory = []
  await expect(repo.restoreWorkspace(backup)).rejects.toThrow()
  backup.manifest.draftHistory = [
    backup.manifest.records.drafts[0],
    { ...backup.manifest.records.drafts[0], revision: 99, savedRevision: 99 },
  ]
  await expect(repo.restoreWorkspace(backup)).rejects.toThrow()
  expect((await repo.loadWorkspace()).drafts[0].revision).toBe(1)
})
it('flags saved drafts for review when the approved topic or resolution changes', async () => {
  const profile = { ...newProfile(), tema: 'Tema original', aprobacionResolucion: 'RES-1' }
  await repo.saveProfile(profile)
  const first = await repo.saveDraft(
    {
      id: 'draft',
      name: 'Monthly',
      templateId: '5',
      templateVersion: '1',
      revision: 0,
      savedRevision: 0,
      profileSnapshot: profile,
      fields: {},
      activities: [],
      monthlyPeriod: '2026-10',
      sourceMonthlyRevisions: [],
      updatedAt: '2026-10-22T18:00:00.000Z',
    },
    0,
  )
  await repo.saveProfile({ ...profile, tema: 'Nuevo tema' })
  expect((await repo.loadWorkspace()).drafts[0].needsReview).toBe(true)
  await repo.saveDraft({ ...first, needsReview: false }, 1)
  await repo.saveProfile({ ...profile, tema: 'Nuevo tema', aprobacionResolucion: 'RES-2' })
  expect((await repo.loadWorkspace()).drafts[0].needsReview).toBe(true)
  expect((await repo.getDraftRevision('draft', 1))?.profileSnapshot.tema).toBe('Tema original')
})
it('writes binary buffers instead of Blob/File to support WebKit and keeps Blob API across restore', async () => {
  const rejectNativeBlob = (_key: unknown, record: { data: unknown }) => {
    if (record.data instanceof Blob)
      throw new DOMException(
        'Error preparing Blob/File data to be stored in object store',
        'UnknownError',
      )
  }
  repo.db.blobs.hook('creating', rejectNativeBlob)
  try {
    const bytes = new Uint8Array([0, 1, 2, 128, 255])
    const version = await repo.addDocumentVersion({
      file: new Blob([bytes], { type: 'image/png' }),
      originalName: 'evidence.png',
    })
    const stored = await repo.db.blobs.get(version.blobId)
    expect(stored?.data).toBeInstanceOf(ArrayBuffer)
    const blob = await repo.getBlob(version.blobId)
    expect(blob).toBeInstanceOf(Blob)
    expect(blob?.type).toBe('image/png')
    expect(new Uint8Array(await blob!.arrayBuffer())).toEqual(bytes)
    const snapshot = await repo.snapshot()
    expect(snapshot.blobs[0].data).toBeInstanceOf(Blob)
    const backup = await importBackup(await exportBackup(snapshot, '1'))
    await repo.restoreWorkspace(backup)
    expect((await repo.db.blobs.get(version.blobId))?.data).toBeInstanceOf(ArrayBuffer)
    expect(new Uint8Array(await (await repo.getBlob(version.blobId))!.arrayBuffer())).toEqual(bytes)
  } finally {
    repo.db.blobs.hook('creating').unsubscribe(rejectNativeBlob)
  }
})
it('reads legacy Blob records and typed-array byte records without rewriting them', async () => {
  await repo.db.blobs.add({
    id: 'legacy',
    data: new Blob(['old bytes'], { type: 'application/pdf' }),
  })
  await repo.db.blobs.add({ id: 'typed', data: new Uint8Array([65, 66]), mime: 'text/plain' })
  expect(await (await repo.getBlob('legacy'))!.text()).toBe('old bytes')
  expect((await repo.getBlob('legacy'))?.type).toBe('application/pdf')
  expect(await (await repo.getBlob('typed'))!.text()).toBe('AB')
  expect((await repo.db.blobs.get('legacy'))?.data).toBeInstanceOf(Blob)
  expect((await repo.snapshot()).blobs.every((blob) => blob.data instanceof Blob)).toBe(true)
})
it('migrates a backup created before reception workflows were merged', async () => {
  await repo.saveProfile(newProfile())
  const resolution = await repo.addDocumentVersion({
    file: new Blob(['resolution']),
    originalName: 'resolucion.pdf',
    category: 'resolucion',
  })
  const zip = await exportBackup(await repo.snapshot(), '1')
  const entries = unzipSync(new Uint8Array(await zip.arrayBuffer()))
  const manifest = JSON.parse(new TextDecoder().decode(entries['manifest.json']))
  const legacyTask = (definitionId: string, status: string, evidenceVersionIds: string[]) => ({
    id: definitionId,
    definitionId,
    status,
    requirementChecks: {},
    evidenceVersionIds,
    note: '',
    history: [],
  })
  manifest.formatVersion = 1
  manifest.records.tasks = [
    legacyTask('propuesta', 'submitted', []),
    legacyTask('aprobacion', 'completed', [resolution.id]),
  ]
  manifest.records.submissions = [{
    id: 'approval-sent',
    taskId: 'aprobacion',
    exactVersionIds: [resolution.id],
    recipient: 'informacion.fisei',
    sentAt: '2026-10-22T18:00:00.000Z',
    note: '',
  }]
  entries['manifest.json'] = strToU8(JSON.stringify(manifest))
  await repo.restoreWorkspace(await importBackup(new Blob([zipSync(entries) as Uint8Array<ArrayBuffer>])))
  const restored = await repo.loadWorkspace()
  expect(restored.tasks).toHaveLength(1)
  expect(restored.tasks[0]).toMatchObject({
    definitionId: 'propuesta',
    status: 'completed',
    evidenceVersionIds: [],
    outputVersionIds: [resolution.id],
  })
  expect(restored.submissions[0].taskId).toBe('propuesta')
})
