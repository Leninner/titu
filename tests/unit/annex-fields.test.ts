import { describe, expect, it } from 'vitest'
import { templates } from '../../src/catalog'
import { templateEvidenceCategory, validateAnnex } from '../../src/domain/annex'
import { buildFinalReport } from '../../src/domain/final-report'
import { buildDocumentModel } from '../../src/export/document-model'
import { annexFixture } from '../fixtures/annexes'

function completeFixture(templateId: string) {
  if (templateId !== 'anexo-11') return annexFixture(templateId)
  const final = buildFinalReport([annexFixture()])
  final.fields = { ...final.fields, fecha: '2026-10-22', avance: '100', mensualesRevisados: 'true' }
  return final
}

function documentText(templateId: string) {
  const draft = completeFixture(templateId)
  const model = buildDocumentModel(draft)
  return {
    draft,
    text: [...model.headings, ...model.paragraphs, ...model.afterTable, ...model.signature]
      .map((item) => item.text)
      .join('\n'),
  }
}

describe('all 16 template field contracts', () => {
  for (const template of templates.filter((item) => item.kind === 'editable')) {
    it(`${template.id}: every declared field prints and required blanks block export`, () => {
      const { draft, text } = documentText(template.id)
      expect(validateAnnex(draft).valid).toBe(true)
      for (const field of template.fields) {
        const value = draft.fields[field.key]
        if (value)
          expect(text, `Missing rendered field ${template.id}.${field.key}`).toContain(value)
        if (field.required) {
          const incomplete = structuredClone(draft)
          incomplete.fields[field.key] = ''
          expect(validateAnnex(incomplete).errors[field.key]).toBeDefined()
        }
      }
      for (const key of ['nombres', 'carrera', 'facultad'] as const) {
        const incomplete = structuredClone(draft)
        incomplete.profileSnapshot[key] = ''
        expect(validateAnnex(incomplete).errors[`profile.${key}`]).toBeDefined()
      }
    })
  }
})

it('validates the person who actually signs a company letter', () => {
  const draft = annexFixture('anexo-3')
  draft.profileSnapshot.email = ''
  expect(validateAnnex(draft).valid).toBe(true)
  draft.fields.emailRepresentante = ''
  expect(validateAnnex(draft).errors.emailRepresentante).toBeDefined()
})

it('requires tutor for Anexo 8 and address/title for all Anexo 14 variants', () => {
  const draft = annexFixture('anexo-8')
  draft.profileSnapshot.tutor = ''
  expect(validateAnnex(draft).errors['profile.tutor']).toBeDefined()
  for (const modality of ['research', 'article', 'complexivo']) {
    const request = annexFixture(`anexo-14-${modality}`)
    request.profileSnapshot.direccion = ''
    request.profileSnapshot.titulo = ''
    expect(validateAnnex(request).errors['profile.direccion']).toBeDefined()
    expect(validateAnnex(request).errors['profile.titulo']).toBeDefined()
  }
})

it('keeps approved snapshot authoritative even when arbitrary fields try to override it', () => {
  const draft = annexFixture()
  draft.fields.tema = 'Tema sin aprobación'
  draft.fields.resolucionCambioTema = 'Texto arbitrario'
  draft.fields.nombres = 'Persona diferente'
  expect(validateAnnex(draft).errors.tema).toBeDefined()
  const text = buildDocumentModel(draft)
    .paragraphs.map((item) => item.text)
    .join(' ')
  expect(text).toContain(draft.profileSnapshot.tema)
  expect(text).toContain(draft.profileSnapshot.nombres)
  expect(text).not.toContain(draft.fields.tema)
  expect(text).not.toContain(draft.fields.nombres)
})

it('maps generated evidence without calling a request a received certificate', () => {
  expect(templateEvidenceCategory('anexo-5')).toBe('mensual')
  expect(templateEvidenceCategory('anexo-11')).toBe('final')
  expect(templateEvidenceCategory('anexo-3')).toBe('compromiso')
  expect(templateEvidenceCategory('cumplimiento-empresarial')).toBe('empresa')
  for (const template of templates.filter(
    (item) =>
      item.kind === 'editable' &&
      !['anexo-5', 'anexo-11', 'anexo-3', 'cumplimiento-empresarial'].includes(item.id),
  )) {
    expect(templateEvidenceCategory(template.id)).toBe('solicitud')
  }
  expect(() => templateEvidenceCategory('anexo-12')).toThrow()
})

it('preserves source modality and conditional headings despite source line breaks', () => {
  const project = buildDocumentModel(annexFixture('anexo-14-research'))
  expect(project.headings.map((item) => item.text).join(' ')).toContain(
    'MODALIDAD PROYECTO DE INVESTIGACIÓN',
  )
  const revised = buildDocumentModel(annexFixture('recalificacion-research'))
  expect(revised.headings.map((item) => item.text).join(' ')).toContain(
    'inferior a 7.00/10.00 puntos',
  )
})
