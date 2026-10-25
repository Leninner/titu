import { validateAnnex, withCurrentProfile } from './annex'
import { monthLabel } from './monthly-report'
import type { AnnexDraft, AnnexStage, Modality, TemplateDefinition, Workspace } from './types'

export type AnnexStatus = 'empty' | 'incomplete' | 'draft' | 'exported' | 'signed'

export interface AnnexCard {
  key: string
  template: TemplateDefinition
  draft?: AnnexDraft
  status: AnnexStatus
  downloadable: boolean
  newMonthly?: boolean
}

export interface AnnexSection {
  stage: AnnexStage
  title: string
  cards: AnnexCard[]
  references: TemplateDefinition[]
}

export const stageTitles: Record<AnnexStage, string> = {
  propuesta: 'Propuesta',
  desarrollo: 'Desarrollo',
  calificadores: 'Calificadores',
  sustentacion: 'Sustentación',
  otros: 'Otros trámites',
}

export function annexTitle(template: TemplateDefinition, draft?: AnnexDraft) {
  const [code, ...rest] = template.name.split(' · ')
  const numbered = rest.length > 0 && code.startsWith('Anexo')
  return {
    code: numbered ? code : undefined,
    title: numbered ? rest.join(' · ') : template.name,
    period: template.id === 'anexo-5' && draft?.monthlyPeriod ? monthLabel(draft.monthlyPeriod) : undefined,
  }
}

export function peopleSummary(template: TemplateDefinition, modality?: Modality) {
  const signers = (modality && template.signersByModality?.[modality]) ?? template.signers
  if (!signers) return `${template.issuer} lo emite`
  return signers === template.issuer
    ? `${template.issuer} lo emite y firma`
    : `${template.issuer} lo emite · firma ${signers.charAt(0).toLowerCase()}${signers.slice(1)}`
}

export function currentDraft(draft: AnnexDraft, workspace: Workspace) {
  return workspace.profile ? withCurrentProfile(draft, workspace.profile) : draft
}

function isComplete(draft: AnnexDraft, workspace: Workspace) {
  return validateAnnex(currentDraft(draft, workspace)).valid
}

export function annexStatus(draft: AnnexDraft | undefined, workspace: Workspace): AnnexStatus {
  if (!draft) return 'empty'
  const exported = workspace.versions.filter((version) => version.sourceDraftId === draft.id)
  if (!exported.length) return isComplete(draft, workspace) ? 'draft' : 'incomplete'
  const documentIds = new Set(exported.map((version) => version.documentId))
  const signed = workspace.versions.some(
    (version) => documentIds.has(version.documentId) && version.signatureStatus === 'reported-signed',
  )
  return signed ? 'signed' : 'exported'
}

function draftsOf(templateId: string, workspace: Workspace) {
  return workspace.drafts
    .filter((draft) => draft.templateId === templateId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

function monthlyDrafts(workspace: Workspace) {
  const latestByMonth = new Map<string, AnnexDraft>()
  for (const draft of draftsOf('anexo-5', workspace))
    if (!latestByMonth.has(draft.monthlyPeriod)) latestByMonth.set(draft.monthlyPeriod, draft)
  return [...latestByMonth.values()].sort((a, b) => a.monthlyPeriod.localeCompare(b.monthlyPeriod))
}

function cardsFor(template: TemplateDefinition, workspace: Workspace): AnnexCard[] {
  const card = (draft?: AnnexDraft): AnnexCard => ({
    key: draft?.id ?? template.id,
    template,
    draft,
    status: annexStatus(draft, workspace),
    downloadable: !!draft && isComplete(draft, workspace),
  })
  if (template.id === 'anexo-5')
    return [...monthlyDrafts(workspace).map(card), { ...card(), key: 'anexo-5-new', newMonthly: true }]
  return [card(draftsOf(template.id, workspace)[0])]
}

export function annexIndex(workspace: Workspace, templates: TemplateDefinition[]): AnnexSection[] {
  const profile = workspace.profile
  const applicable = templates.filter(
    (template) =>
      (!profile || template.modalities.includes(profile.modalidad)) &&
      (!template.companyOnly || profile?.aplicaEmpresa),
  )
  return (Object.keys(stageTitles) as AnnexStage[])
    .map((stage) => ({
      stage,
      title: stageTitles[stage],
      cards: applicable
        .filter((template) => template.stage === stage && template.kind === 'editable')
        .flatMap((template) => cardsFor(template, workspace)),
      references: applicable.filter((template) => template.stage === stage && template.kind !== 'editable'),
    }))
    .filter((section) => section.cards.length > 0 || section.references.length > 0)
}
