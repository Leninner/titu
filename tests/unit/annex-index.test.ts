import { expect, it } from 'vitest'
import { catalog } from '../../src/catalog'
import { createDraft } from '../../src/domain/annex'
import { annexIndex, annexTitle, peopleSummary } from '../../src/domain/annex-index'
import { emptyWorkspace, newProfile, type DocumentVersion, type Workspace } from '../../src/domain/types'

const profile = { ...newProfile(), nombres: 'Estudiante', modalidad: 'article' as const }

function workspaceWith(changes: Partial<Workspace>): Workspace {
  return { ...emptyWorkspace(), profile, ...changes }
}

const exported = (id: string, draftId: string, signatureStatus: DocumentVersion['signatureStatus']): DocumentVersion => ({
  id,
  documentId: 'doc-15',
  blobId: `blob-${id}`,
  originalName: `${id}.pdf`,
  mime: 'application/pdf',
  size: 1,
  sha256: id,
  createdAt: '2026-10-20T10:00:00Z',
  sourceDraftId: draftId,
  signatureStatus,
  textualPdfStatus: 'text-detected',
})

const cardNames = (workspace: Workspace, stage: string) =>
  annexIndex(workspace, catalog.templates).find((section) => section.stage === stage)?.cards.map((card) => card.template.id)

it('groups the annexes of the modality by stage', () => {
  const sections = annexIndex(workspaceWith({}), catalog.templates)
  expect(sections.map((section) => section.title)).toEqual([
    'Propuesta',
    'Desarrollo',
    'Calificadores',
    'Sustentación',
    'Otros trámites',
  ])
  expect(cardNames(workspaceWith({}), 'calificadores')).toContain('anexo-10-article')
  expect(cardNames(workspaceWith({}), 'calificadores')).not.toContain('anexo-10-research')
})

it('shows one card per month of Anexo 5 and offers a new monthly report', () => {
  const october = { ...createDraft('anexo-5', profile, '2026-10'), id: 'oct' }
  const september = { ...createDraft('anexo-5', profile, '2026-09'), id: 'sep' }
  const development = annexIndex(workspaceWith({ drafts: [october, september] }), catalog.templates)
    .find((section) => section.stage === 'desarrollo')!
  expect(development.cards.filter((card) => card.template.id === 'anexo-5').map((card) => card.key)).toEqual(['sep', 'oct', 'anexo-5-new'])
  expect(development.cards.at(-1)?.newMonthly).not.toBe(true)
})

it('derives the status from the draft, its export and the signed version', () => {
  const draft = { ...createDraft('anexo-15', profile), id: 'd15' }
  const statusOf = (workspace: Workspace) =>
    annexIndex(workspace, catalog.templates)
      .flatMap((section) => section.cards)
      .find((card) => card.template.id === 'anexo-15')?.status
  const complete = {
    ...draft,
    fields: { ...draft.fields, lugar: 'Ambato', fecha: '2026-10-24', destinatario: 'Ing. Decano' },
    profileSnapshot: { ...draft.profileSnapshot, cedula: '1850994623', email: 'e@uta.edu.ec' },
  }
  const fullProfile = { ...profile, cedula: '1850994623', email: 'e@uta.edu.ec', carrera: 'Software' }
  expect(statusOf(workspaceWith({}))).toBe('empty')
  expect(statusOf(workspaceWith({ drafts: [draft] }))).toBe('incomplete')
  expect(statusOf(workspaceWith({ profile: fullProfile, drafts: [complete] }))).toBe('draft')
  expect(statusOf(workspaceWith({ drafts: [draft], versions: [exported('v1', 'd15', 'pending')] }))).toBe('exported')
  expect(statusOf(workspaceWith({
    drafts: [draft],
    versions: [exported('v1', 'd15', 'pending'), { ...exported('v2', '', 'reported-signed'), sourceDraftId: undefined }],
  }))).toBe('signed')
})

it('lists reference formats apart from the cards of each stage', () => {
  const proposal = annexIndex(workspaceWith({}), catalog.templates).find((section) => section.stage === 'propuesta')!
  expect(proposal.references.map((template) => template.id)).toEqual(['anexo-2'])
  expect(proposal.cards.every((card) => card.template.kind === 'editable')).toBe(true)
})

it('splits the annex number from its title and adds the month of a monthly report', () => {
  const template = catalog.templates.find((item) => item.id === 'anexo-5')!
  expect(annexTitle(template, { ...createDraft('anexo-5', profile, '2026-10') })).toEqual({
    code: 'Anexo 5',
    title: 'Informe mensual',
    period: 'octubre 2026',
  })
  const letter = catalog.templates.find((item) => item.id === 'solicitud-habilitantes')!
  expect(annexTitle(letter)).toEqual({ code: undefined, title: 'Solicitud de requisitos habilitantes', period: undefined })
})

it('summarises who issues and signs, by modality', () => {
  const template = (id: string) => catalog.templates.find((item) => item.id === id)!
  expect(peopleSummary(template('anexo-15'), 'article')).toBe('Estudiante lo emite y firma')
  expect(peopleSummary(template('anexo-1'), 'article')).toBe('Estudiante lo emite · firma estudiante y tutor sugerido')
  expect(peopleSummary(template('anexo-1'), 'complexivo')).toBe('Estudiante lo emite y firma')
  expect(peopleSummary(template('anexo-2'), 'article')).toBe('Estudiante lo emite')
})
