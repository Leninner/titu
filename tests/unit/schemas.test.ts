import { expect, it } from 'vitest'
import { profileSchema, eventSchema, submissionSchema, draftSchema } from '../../src/domain/schemas'
import { emptyWorkspace, newProfile } from '../../src/domain/types'
import { validateBackup } from '../../src/storage/restore'

it('accepts incomplete profile dates and leap days but rejects invalid dates and modality', () => {
  const profile = newProfile()
  expect(profileSchema.safeParse(profile).success).toBe(true)
  expect(profileSchema.safeParse({ ...profile, aprobacionFecha: '2024-02-29' }).success).toBe(true)
  for (const aprobacionFecha of ['2026-02-29', '2026-04-31', '2026-13-01', '22/10/2026'])
    expect(profileSchema.safeParse({ ...profile, aprobacionFecha }).success).toBe(false)
  expect(profileSchema.safeParse({ ...profile, modalidad: 'other' }).success).toBe(false)
})
it('requires event dates and a real 24-hour local time', () => {
  const event = {
    id: 'event',
    title: 'Cita',
    kind: 'personal',
    startDate: '2026-10-22',
    timeZone: 'America/Guayaquil',
    modalities: ['research'],
    periodId: '2026',
    sourceIds: [],
    certainty: 'personal',
  }
  expect(eventSchema.safeParse({ ...event, localTime: '18:30' }).success).toBe(true)
  for (const localTime of ['24:00', '12:60', '6:00'])
    expect(eventSchema.safeParse({ ...event, localTime }).success).toBe(false)
  expect(eventSchema.safeParse({ ...event, startDate: '' }).success).toBe(false)
  expect(
    eventSchema.safeParse({ ...event, personalOverride: { startDate: '2026-02-30' } }).success,
  ).toBe(false)
})
it('requires UTC submission timestamps and permits blank activity dates while drafting', () => {
  const submission = {
    id: 'submission',
    taskId: 'task',
    exactVersionIds: [],
    recipient: 'Secretaría',
    sentAt: '2026-10-22T18:00:00.000Z',
    note: '',
  }
  expect(submissionSchema.safeParse(submission).success).toBe(true)
  for (const sentAt of ['', '2026-10-22', '2026-10-22T18:00:00-05:00'])
    expect(submissionSchema.safeParse({ ...submission, sentAt }).success).toBe(false)
  const draft = {
    id: 'draft',
    name: 'Informe',
    templateId: '5',
    templateVersion: '1',
    revision: 0,
    savedRevision: 0,
    profileSnapshot: newProfile(),
    fields: {},
    activities: [{ id: 'row', date: '', description: '' }],
    monthlyPeriod: '2026-10',
    sourceMonthlyRevisions: [],
    updatedAt: '2026-10-22T18:00:00.000Z',
  }
  expect(draftSchema.safeParse(draft).success).toBe(true)
  expect(draftSchema.safeParse({ ...draft, monthlyPeriod: '2026-13' }).success).toBe(false)
  expect(
    draftSchema.safeParse({
      ...draft,
      activities: [{ id: 'row', date: '2026-02-30', description: '' }],
    }).success,
  ).toBe(false)
})
it('rejects structurally valid backups whose tasks point to missing evidence', async () => {
  const records = {
    ...emptyWorkspace(),
    tasks: [
      {
        id: 'task',
        definitionId: 'task',
        status: 'pending' as const,
        requirementChecks: {},
        evidenceVersionIds: ['missing-version'],
        outputVersionIds: [],
        note: '',
        history: [],
      },
    ],
  }
  await expect(
    validateBackup({
      manifest: {
        formatVersion: 1,
        catalogVersion: '1',
        exportedAt: '2026-10-22T18:00:00.000Z',
        records,
        blobs: [],
      },
      snapshot: { ...records, blobs: [] },
    }),
  ).rejects.toThrow(/referencias/)
})
