import { expect, it } from 'vitest'
import { applicableWorkflows, evaluateTask, progress } from '../../src/domain/workflow'
import { emptyWorkspace, newProfile } from '../../src/domain/types'
import type { CatalogVersion, TaskRecord, WorkflowDefinition } from '../../src/domain/types'
const definition: WorkflowDefinition = {
  id: 'legal',
  title: 'Legal',
  stage: 'legal',
  modalities: ['research', 'article'],
  sourceIds: [],
  dependsOn: [],
  requirements: [
    { id: 'grade-1', label: 'Nota 1' },
    { id: 'grade-2', label: 'Nota 2' },
  ],
  outputs: [],
  instructions: '',
  role: 'Estudiante',
}
const catalog: CatalogVersion = {
  version: '1',
  sourceIds: [],
  templates: [],
  workflowDefinitions: [definition],
  calendarEvents: [],
  conflicts: [],
}
const task = (): TaskRecord => ({
  id: 't',
  definitionId: 'legal',
  status: 'pending',
  requirementChecks: {},
  evidenceVersionIds: [],
  outputVersionIds: [],
  note: '',
  history: [],
})
const workspace = () => ({ ...emptyWorkspace(), profile: newProfile() })
it('blocks 6.5 average but permits 7 without changing state', () => {
  const t = task()
  t.requirementChecks = { 'grade-1': 6, 'grade-2': 7 }
  expect(evaluateTask(t, workspace(), catalog).ready).toBe(false)
  t.requirementChecks['grade-1'] = 7
  expect(evaluateTask(t, workspace(), catalog).ready).toBe(true)
  expect(t.status).toBe('pending')
})
it('reuses identity evidence by category across differently named requirements', () => {
  const w = workspace()
  w.documents = [
    { id: 'identity', name: 'Cédula', category: 'personal', createdAt: '' },
    { id: 'other', name: 'Informe', category: 'final', createdAt: '' },
  ]
  w.versions = [
    {
      id: 'cedula', documentId: 'identity', blobId: 'b1', originalName: 'cedula.pdf',
      mime: 'application/pdf', size: 10, sha256: '', createdAt: '2026-10-23T10:00:00Z',
      signatureStatus: 'unsigned', textualPdfStatus: 'unknown',
    },
    {
      id: 'informe', documentId: 'other', blobId: 'b2', originalName: 'informe.pdf',
      mime: 'application/pdf', size: 10, sha256: '', createdAt: '2026-10-23T11:00:00Z',
      signatureStatus: 'unsigned', textualPdfStatus: 'unknown',
    },
  ]
  const first = { ...definition, id: 'first', requirements: [
    { id: 'identity-a', label: 'Cédula y papeleta', category: 'personal', signed: false },
  ] }
  const second = { ...definition, id: 'second', requirements: [
    { id: 'identity-b', label: 'Documento de identificación actualizado', category: 'personal', signed: false },
  ] }
  const c = { ...catalog, workflowDefinitions: [first, second] }
  expect(evaluateTask({ ...task(), definitionId: 'first' }, w, c).ready).toBe(true)
  expect(evaluateTask({ ...task(), definitionId: 'second' }, w, c).ready).toBe(true)
  w.documents[0].category = 'resolution'
  expect(evaluateTask({ ...task(), definitionId: 'second' }, w, c).ready).toBe(false)
})
it('enforces declared similarity and attendance thresholds', () => {
  for (const [id, bad, good] of [
    ['similarity', 11, 10],
    ['attendance', 69, 70],
  ] as const) {
    const c = {
      ...catalog,
      workflowDefinitions: [{ ...definition, requirements: [{ id, label: id }] }],
    }
    expect(
      evaluateTask({ ...task(), requirementChecks: { [id]: bad } }, workspace(), c).ready,
    ).toBe(false)
    expect(
      evaluateTask({ ...task(), requirementChecks: { [id]: good } }, workspace(), c).ready,
    ).toBe(true)
  }
})
it('requires exact category and reported signature, not arbitrary files or checkmarks', () => {
  const c = {
    ...catalog,
    workflowDefinitions: [
      {
        ...definition,
        requirements: [
          { id: 'document', label: 'Certificado', category: 'no-adeudar', signed: true },
        ],
        outputs: [],
      },
    ],
  }
  const w = workspace()
  const t = { ...task(), requirementChecks: { document: true }, evidenceVersionIds: ['v'] }
  w.documents = [{ id: 'd', name: 'Other', category: 'tesis', createdAt: '' }]
  w.versions = [
    {
      id: 'v',
      documentId: 'd',
      blobId: 'b',
      originalName: 'a.pdf',
      mime: 'application/pdf',
      size: 2,
      sha256: '',
      createdAt: '',
      signatureStatus: 'reported-signed',
      textualPdfStatus: 'unknown',
      issuedOn: '2026-10-01',
    },
  ]
  expect(evaluateTask(t, w, c, new Date('2026-10-22T12:00Z')).ready).toBe(false)
  w.documents[0].category = 'no-adeudar'
  expect(evaluateTask(t, w, c, new Date('2026-10-22T12:00Z')).ready).toBe(true)
  w.versions[0].signatureStatus = 'unsigned'
  expect(evaluateTask(t, w, c).ready).toBe(false)
})
it('keeps non-monthly files out of the development package', () => {
  const w = workspace()
  w.documents = [
    { id: 'monthly', name: 'Anexo 5', category: 'mensual', createdAt: '' },
    { id: 'resolution', name: 'Resolución', category: 'resolucion', createdAt: '' },
  ]
  w.versions = w.documents.map((document) => ({
    id: document.id,
    documentId: document.id,
    blobId: document.id,
    originalName: `${document.id}.pdf`,
    mime: 'application/pdf',
    size: 2,
    sha256: '',
    createdAt: '',
    signatureStatus: 'reported-signed' as const,
    textualPdfStatus: 'text-detected' as const,
  }))
  const c = {
    ...catalog,
    workflowDefinitions: [
      {
        ...definition,
        id: 'desarrollo',
        requirements: [{ id: 'mensual', label: 'Anexo 5', category: 'mensual', signed: true }],
      },
    ],
  }
  const t = { ...task(), definitionId: 'desarrollo', evidenceVersionIds: ['monthly', 'resolution'] }
  expect(evaluateTask(t, w, c).missingRequirements.join(' ')).toContain('Anexo 5')
  t.evidenceVersionIds = ['monthly']
  expect(evaluateTask(t, w, c).ready).toBe(true)
})
it('filters modalities/company and excludes optional tasks from progress', () => {
  const c = {
    ...catalog,
    workflowDefinitions: [
      definition,
      { ...definition, id: 'company', companyOnly: true },
      { ...definition, id: 'optional', optional: true },
    ],
  }
  const w = workspace()
  expect(applicableWorkflows(w, c).map((d) => d.id)).toEqual(['legal', 'optional'])
  w.tasks = [{ ...task(), status: 'completed' }]
  expect(progress(w, c)).toEqual({ completed: 1, total: 1, percent: 100 })
  w.profile.modalidad = 'complexivo'
  expect(applicableWorkflows(w, c)).toEqual([])
})
it('requires preceding library stage and preserves historical status', () => {
  const c = {
    ...catalog,
    workflowDefinitions: [
      definition,
      { ...definition, id: 'signature', requirements: [], dependsOn: ['legal'] },
    ],
  }
  const w = workspace()
  const t = { ...task(), definitionId: 'signature', status: 'submitted' as const }
  expect(evaluateTask(t, w, c).ready).toBe(false)
  w.tasks = [{ ...task(), status: 'completed' }]
  expect(evaluateTask(t, w, c).ready).toBe(true)
  expect(t.status).toBe('submitted')
})
it('skips requirements outside the student modality, like proposal endorsements for complexivo', () => {
  const w = workspace()
  w.profile.modalidad = 'complexivo'
  const c = {
    ...catalog,
    workflowDefinitions: [
      {
        ...definition,
        id: 'propuesta',
        modalities: ['complexivo'] as WorkflowDefinition['modalities'],
        requirements: [
          { id: 'avales', label: 'Avales', modalities: ['research', 'article'] as WorkflowDefinition['modalities'] },
        ],
      },
    ],
  }
  expect(evaluateTask({ ...task(), definitionId: 'propuesta' }, w, c).ready).toBe(true)
})
it('requires explicit resolution when linked annex topic differs from approved topic', () => {
  const w = workspace()
  w.profile.tema = 'Tema aprobado'
  const draft = {
    id: 'a',
    name: 'Informe',
    templateId: 'anexo-5',
    templateVersion: '1',
    revision: 1,
    savedRevision: 1,
    profileSnapshot: { ...w.profile },
    fields: { tema: 'Tema distinto' },
    activities: [],
    monthlyPeriod: '2026-10',
    sourceMonthlyRevisions: [],
    updatedAt: '',
  }
  w.drafts = [draft]
  w.documents = [{ id: 'd', name: 'Informe', category: 'mensual', createdAt: '' }]
  w.versions = [
    {
      id: 'v',
      documentId: 'd',
      blobId: 'b',
      sourceDraftId: 'a',
      originalName: 'a.pdf',
      mime: 'application/pdf',
      size: 2,
      sha256: '',
      createdAt: '',
      signatureStatus: 'reported-signed',
      textualPdfStatus: 'text-detected',
    },
  ]
  const c = {
    ...catalog,
    workflowDefinitions: [
      { ...definition, requirements: [{ id: 'report', label: 'Informe', category: 'mensual' }] },
    ],
  }
  const t = { ...task(), evidenceVersionIds: ['v'] }
  expect(evaluateTask(t, w, c).ready).toBe(false)
  w.drafts[0].fields.resolucionCambioTema = 'Resolución 42'
  expect(evaluateTask(t, w, c).ready).toBe(true)
})
it('enforces actual library signature order and both day/hour gates by modality', async () => {
  const { catalog: actual } = await import('../../src/catalog')
  const w = workspace()
  const signature = { ...task(), definitionId: 'biblioteca-firma-estudiante' }
  expect(evaluateTask(signature, w, actual).missingRequirements.join(' ')).toContain(
    'Biblioteca: revisión del trabajo sin firmas',
  )
  const dayHour = { ...task(), definitionId: 'dia-hora' }
  const missing = evaluateTask(dayHour, w, actual).missingRequirements.join(' ')
  expect(missing).toContain('aptitud legal')
  expect(missing).toContain('aval final')
  w.profile.modalidad = 'complexivo'
  expect(evaluateTask(dayHour, w, actual).missingRequirements.join(' ')).not.toContain('aval final')
  expect(applicableWorkflows(w, actual).some((item) => item.id === 'desarrollo')).toBe(false)
})
it('requires exact aptitud legal submitted versions for day/hour and explains missing history', () => {
  const w = workspace()
  const c = {
    ...catalog,
    workflowDefinitions: [{ ...definition, id: 'dia-hora', requirements: [] }],
  }
  const t = {
    ...task(),
    definitionId: 'dia-hora',
    evidenceVersionIds: ['replacement'],
    outputVersionIds: [],
    requirementChecks: { 'mismas-versiones': true },
  }
  expect(evaluateTask(t, w, c).missingRequirements.join(' ')).toContain(
    'Registrar el envío histórico',
  )
  w.tasks = [
    { ...task(), id: 'legal-task', definitionId: 'aptitud-legal-research', status: 'completed' },
  ]
  w.submissions = [
    {
      id: 's',
      taskId: 'legal-task',
      exactVersionIds: ['original'],
      recipient: 'Secretaría',
      sentAt: '2026-10-20T12:00:00Z',
      note: '',
    },
  ]
  expect(evaluateTask(t, w, c).missingRequirements.join(' ')).toContain('versiones exactas')
  t.evidenceVersionIds.push('original')
  expect(evaluateTask(t, w, c).ready).toBe(true)
})
