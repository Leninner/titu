// @vitest-environment node
import { expect, it } from 'vitest'
import { unzipSync, strFromU8 } from 'fflate'
import { resolve } from 'node:path'
import { writeFileSync, mkdirSync } from 'node:fs'
import { renderAnnex } from '../../src/export/render-annex'
import { configurePdfFonts } from '../../src/export/pdf'
import { annexFixture } from '../fixtures/annexes'
import { templates } from '../../src/catalog'
import { buildDocumentModel } from '../../src/export/document-model'

configurePdfFonts(resolve('public/fonts'))
it('exports real editable OOXML with canonical page geometry and repeatable table heading', async () => {
  const draft = annexFixture()
  const blob = await renderAnnex(draft, 'docx')
  const archive = unzipSync(new Uint8Array(await blob.arrayBuffer()))
  const xml = strFromU8(archive['word/document.xml'])
  expect(xml).toContain('María Muñoz Vásquez')
  expect(xml).toContain('w:tblHeader')
  expect(xml).toContain('w:w="12240"')
  expect(xml).toContain('w:h="15840"')
  expect(xml).toContain('w:left="1701"')
  expect(xml).not.toContain('QUIPUX')
  expect(xml).not.toContain('<w:drawing')
  mkdirSync('/private/tmp/graduation-export-qa', { recursive: true })
  writeFileSync(
    '/private/tmp/graduation-export-qa/anexo-5.docx',
    new Uint8Array(await blob.arrayBuffer()),
  )
})
it('produces Unicode textual PDF preserving all 40 rows', async () => {
  const draft = annexFixture('anexo-5', 40)
  const blob = await renderAnnex(draft, 'pdf')
  const data = new Uint8Array(await blob.arrayBuffer())
  writeFileSync('/private/tmp/graduation-export-qa/anexo-5-long.pdf', data)
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const pdf = await getDocument({ data, useSystemFonts: true, isEvalSupported: false }).promise
  const texts: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    expect(page.view).toEqual([0, 0, 612, 792])
    const content = await page.getTextContent()
    texts.push(content.items.map((item) => ('str' in item ? item.str : '')).join(' '))
  }
  const text = texts.join(' ')
  expect(text).toContain('María Muñoz Vásquez')
  expect(text).toContain('José Núñez')
  for (let i = 1; i <= 40; i++) expect(text).toContain(`Actividad ${i}:`)
  expect(text).not.toContain('QUIPUX')
  await pdf.destroy()
}, 30000)
it('each letter variant has its own filled text and institutional notes', async () => {
  for (const template of templates.filter(
    (item) => item.kind === 'editable' && !['anexo-5', 'anexo-11'].includes(item.id),
  )) {
    const model = buildDocumentModel(annexFixture(template.id))
    const body = model.paragraphs.map((item) => item.text).join(' ')
    expect(body).toContain('María Muñoz Vásquez')
    expect(body).not.toContain('{{')
    expect(body.length).toBeGreaterThan(300)
    const blob = await renderAnnex(annexFixture(template.id), 'docx')
    expect(blob.size).toBeGreaterThan(1000)
    writeFileSync(
      `/private/tmp/graduation-export-qa/${template.id}.docx`,
      new Uint8Array(await blob.arrayBuffer()),
    )
    const pdfBlob = await renderAnnex(annexFixture(template.id), 'pdf')
    writeFileSync(
      `/private/tmp/graduation-export-qa/${template.id}-direct.pdf`,
      new Uint8Array(await pdfBlob.arrayBuffer()),
    )
  }
})
it('exports final report only with exact monthly provenance and explicit 100%', async () => {
  const { buildFinalReport } = await import('../../src/domain/final-report')
  const final = buildFinalReport([annexFixture()])
  final.fields = { ...final.fields, fecha: '2026-10-22', avance: '100', mensualesRevisados: 'true' }
  for (const format of ['docx', 'pdf'] as const) {
    const blob = await renderAnnex(final, format)
    expect(blob.size).toBeGreaterThan(1000)
    writeFileSync(
      `/private/tmp/graduation-export-qa/anexo-11.${format}`,
      new Uint8Array(await blob.arrayBuffer()),
    )
  }
  final.activities[0].description = 'Una actividad inventada'
  await expect(renderAnnex(final, 'pdf')).rejects.toThrow('Revisa los campos')
})
