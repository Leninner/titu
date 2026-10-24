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

function printedValue(templateId: string, type: string | undefined, value = '') {
  const letterDate = type === 'date' && !['anexo-5', 'anexo-11'].includes(templateId)
  return letterDate ? value.split('-').reverse().join('/') : value
}

describe('all 17 template field contracts', () => {
  for (const template of templates.filter((item) => item.kind === 'editable')) {
    it(`${template.id}: every declared field prints and required blanks block export`, () => {
      const { draft, text } = documentText(template.id)
      expect(validateAnnex(draft).valid).toBe(true)
      for (const field of template.fields) {
        const value = printedValue(template.id, field.type, draft.fields[field.key])
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
  draft.profileSnapshot.emailRepresentante = ''
  expect(validateAnnex(draft).errors['profile.emailRepresentante']).toBeDefined()
})

it('signs company letters with the representative contact, following UT-08 and UT-18', () => {
  for (const templateId of ['anexo-3', 'cumplimiento-empresarial']) {
    const model = buildDocumentModel(annexFixture(templateId))
    const letter = [...model.paragraphs, ...model.signature].map((item) => item.text).join('\n')
    expect(letter).toContain('Carrera de Software')
    expect(letter).toContain('Empresa Sintética S.A.')
    expect(letter).toContain('No teléfono celular: 0993333333')
    expect(letter).not.toContain('De mi consideración')
    expect(letter.includes('Presente')).toBe(templateId === 'cumplimiento-empresarial')
  }
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

it('starts letters at the date, without the annex heading, and spaces their blocks', () => {
  const letter = buildDocumentModel(annexFixture('anexo-10-research'))
  expect(letter.headings).toEqual([])
  const [date, recipient, role, faculty, greeting, salutation] = letter.paragraphs
  expect(date.text).toMatch(/^.+, \d{2}\/\d{2}\/\d{4}$/)
  expect(date.spaceAfter).toBeGreaterThanOrEqual(24)
  expect(date.align).toBe('right')
  expect([recipient, role, faculty].map((item) => item.spaceAfter)).toEqual([0, 0, 0])
  expect(greeting.spaceAfter).toBeGreaterThanOrEqual(24)
  expect(salutation.text).toBe('De mi consideración:')
  expect(salutation.spaceAfter).toBeGreaterThanOrEqual(12)
  const report = buildDocumentModel(annexFixture('anexo-5'))
  expect(report.headings.map((item) => item.text).join(' ')).toContain('ANEXO 5')
})

it('signs the Anexo 14 with the address before the email, as each modality format does', () => {
  const signer = (templateId: string) =>
    buildDocumentModel(annexFixture(templateId)).signature.map((item) => item.text)
  for (const templateId of ['anexo-14-research', 'anexo-14-article']) {
    const lines = signer(templateId)
    expect(lines.at(-2)).toBe('Dirección: Dirección de prueba')
    expect(lines.at(-1)).toBe('Correo electrónico institucional: estudiante@example.test')
  }
  expect(signer('anexo-14-complexivo').slice(-2)).toEqual([
    'Dirección: Dirección de prueba',
    'Correo electrónico: estudiante@example.test',
  ])
  expect(signer('anexo-10-research').join(' ')).not.toContain('Dirección')
})

it('writes the enabling requirements request to the career coordinator with a plain signature', () => {
  const draft = annexFixture('solicitud-habilitantes')
  draft.fields = { ...draft.fields, nivel: 'noveno', ciclo: 'julio – diciembre 2026', celular: '0991234567' }
  const model = buildDocumentModel(draft)
  const letter = model.paragraphs.map((item) => item.text)
  expect(letter).toContain('COORDINADOR DE LA CARRERA DE SOFTWARE')
  expect(letter).toContain('Presente. -')
  expect(letter).not.toContain('De mi consideración:')
  expect(letter.join(' ')).toContain(
    'estudiante del noveno nivel de la carrera de Software en el ciclo académico julio – diciembre 2026',
  )
  expect(model.signature.slice(2).map((item) => item.text)).toEqual([
    'María Muñoz Vásquez',
    '0000000000',
    '0991234567',
    'estudiante@example.test',
  ])
})
