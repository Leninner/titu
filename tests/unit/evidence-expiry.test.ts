import { expect, it } from 'vitest'
import { WorkspaceRepository } from '../../src/storage/repository'
import { newProfile } from '../../src/domain/types'
import { noDebtValidity } from '../../src/domain/dates'
import { exportBackup, importBackup } from '../../src/export/backup'

it('preserves printed expiry and original category through replacement upload and backup', async () => {
  const repo = new WorkspaceRepository('evidence-expiry-regression')
  try {
    await repo.saveProfile(newProfile())
    const first = await repo.addDocumentVersion({
      file: new Blob(['issued']),
      originalName: 'no-adeudar.pdf',
      category: 'no-adeudar',
      issuedOn: '2026-12-07',
      expiresOn: '2026-12-20',
    })
    const signed = await repo.addDocumentVersion({
      file: new Blob(['signed']),
      originalName: 'no-adeudar-firmado.pdf',
      documentId: first.documentId,
      category: 'other',
      issuedOn: '2026-12-07',
      expiresOn: '2026-12-20',
      signatureStatus: 'reported-signed',
    })
    const restored = await importBackup(await exportBackup(await repo.snapshot(), '1'))
    const version = restored.snapshot.versions.find((item) => item.id === signed.id)!
    expect(version.expiresOn).toBe('2026-12-20')
    expect(restored.snapshot.documents.find((item) => item.id === first.documentId)?.category).toBe(
      'no-adeudar',
    )
    expect(noDebtValidity(version.issuedOn, '2026-12-21', version.expiresOn).status).toBe('expired')
  } finally {
    await repo.db.delete()
  }
})
