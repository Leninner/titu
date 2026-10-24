import type { AnnexDraft, StudentProfile } from './types'

export const companyKeys = [
  'empresa',
  'representante',
  'cargoRepresentante',
  'cedulaRepresentante',
  'emailRepresentante',
  'telefonoRepresentante',
  'celularRepresentante',
] as const
export type CompanyKey = (typeof companyKeys)[number]

const legacyFieldFor: Record<CompanyKey, string> = {
  empresa: 'empresa',
  representante: 'representante',
  cargoRepresentante: 'cargoRepresentante',
  cedulaRepresentante: 'cedulaRepresentante',
  emailRepresentante: 'emailRepresentante',
  telefonoRepresentante: 'telefono',
  celularRepresentante: 'celular',
}

const companyTemplates = new Set(['anexo-3', 'cumplimiento-empresarial'])

function legacyCompany(draft: AnnexDraft) {
  return Object.fromEntries(
    companyKeys.map((key) => [key, draft.fields[legacyFieldFor[key]] ?? '']),
  ) as Record<CompanyKey, string>
}

const emptyCompany = Object.fromEntries(companyKeys.map((key) => [key, ''])) as Record<CompanyKey, string>

function filledFrom(target: Partial<StudentProfile>, source: Record<CompanyKey, string>) {
  return Object.fromEntries(
    companyKeys.map((key) => [key, target[key] || source[key] || '']),
  ) as Record<CompanyKey, string>
}

export function draftWithCompanySnapshot(draft: AnnexDraft): AnnexDraft {
  if (!companyTemplates.has(draft.templateId)) return draft
  return {
    ...draft,
    profileSnapshot: { ...draft.profileSnapshot, ...filledFrom(draft.profileSnapshot, legacyCompany(draft)) },
  }
}

export function profileWithCompany(profile: StudentProfile, drafts: AnnexDraft[]): StudentProfile {
  const latest = drafts
    .filter((draft) => companyTemplates.has(draft.templateId))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
  const source = latest ? legacyCompany(latest) : emptyCompany
  return { ...profile, ...filledFrom(profile, source) }
}
