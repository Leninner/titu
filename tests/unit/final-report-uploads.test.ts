import { expect, it } from 'vitest'
import { catalog } from '../../src/catalog'
import { workflowDefinitions } from '../../src/catalog/workflows'
import { validateAnnex } from '../../src/domain/annex'
import { buildFinalReportFromUploads } from '../../src/domain/final-report'
import { chainOutput } from '../../src/domain/output-chain'
import { emptyTask } from '../../src/domain/task-record'
import { emptyWorkspace, newProfile } from '../../src/domain/types'
import { moveReceivedFiles } from '../../src/storage/migrate-workspace'

const profile = {
  ...newProfile(),
  nombres: 'María Muñoz',
  carrera: 'Software',
  tema: 'Sistema de titulación',
  tutor: 'Ing. Tutor',
  aprobacionFecha: '2026-07-15',
}

const reports = [
  {
    versionId: 'septiembre',
    month: '2026-09',
    analysis: {
      recognized: true,
      progress: 100,
      activities: [{ date: '2026-09-10', description: 'Pruebas' }],
    },
  },
  {
    versionId: 'agosto',
    month: '2026-08',
    analysis: {
      recognized: true,
      progress: 50,
      activities: [
        { date: '2026-08-20', description: 'Diseño' },
        { date: '2026-08-05', description: 'Análisis' },
      ],
    },
  },
]

it('builds the Anexo 11 with every activity of the uploaded Anexo 5, sorted by date and at 100 %', () => {
  const draft = buildFinalReportFromUploads(profile, reports, '2026-11-18')
  expect(draft.templateId).toBe('anexo-11')
  expect(draft.activities.map(({ date, description }) => [date, description])).toEqual([
    ['2026-08-05', 'Análisis'],
    ['2026-08-20', 'Diseño'],
    ['2026-09-10', 'Pruebas'],
  ])
  expect(draft.fields).toMatchObject({ fecha: '2026-11-18', avance: '100', ultimoAvanceMensual: '100' })
  expect(validateAnnex(draft)).toMatchObject({ valid: true, warnings: {} })
})

it('warns when the last Anexo 5 does not reach 100 %', () => {
  const draft = buildFinalReportFromUploads(profile, reports.slice(1), '2026-11-18')
  expect(validateAnnex(draft).warnings.ultimoAvanceMensual).toContain('50%')
})

it('refuses to build the Anexo 11 without monthly reports', () => {
  expect(() => buildFinalReportFromUploads(profile, [], '2026-11-18')).toThrow(/Anexo 5/)
})

it('offers the signed Anexo 11 to the grader request and legal aptitude', () => {
  const workspace = {
    ...emptyWorkspace(),
    profile: { ...profile, modalidad: 'research' as const },
    documents: [{ id: 'final', name: 'Anexo 11', category: 'final', createdAt: '' }],
    versions: [{
      id: 'signed', documentId: 'final', blobId: 'b', originalName: 'anexo-11.pdf',
      mime: 'application/pdf', size: 1, sha256: '', createdAt: '',
      signatureStatus: 'reported-signed' as const, textualPdfStatus: 'text-detected' as const,
    }],
  }
  expect(chainOutput('signed', 'informe-final', workspace, catalog).map((task) => task.definitionId).sort())
    .toEqual(['aptitud-legal-research', 'calificadores-research'])
})

it('moves an Anexo 11 linked to the final report request into its outputs', () => {
  const [task] = moveReceivedFiles(
    {
      tasks: [{ ...emptyTask('informe-final'), evidenceVersionIds: ['signed'] }],
      submissions: [],
      documents: [{ id: 'final', name: 'Anexo 11', category: 'final', createdAt: '' }],
      versions: [{
        id: 'signed', documentId: 'final', blobId: 'b', originalName: 'anexo-11.pdf',
        mime: 'application/pdf', size: 1, sha256: '', createdAt: '',
        signatureStatus: 'reported-signed', textualPdfStatus: 'text-detected',
      }],
    },
    workflowDefinitions,
  )
  expect(task).toMatchObject({ evidenceVersionIds: [], outputVersionIds: ['signed'] })
})
