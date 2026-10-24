// @vitest-environment node
import { expect, it } from 'vitest'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { templates } from '../../src/catalog'
import { buildFinalReport } from '../../src/domain/final-report'
import { buildDocumentModel } from '../../src/export/document-model'
import { renderAnnex } from '../../src/export/render-annex'
import { configurePdfFonts } from '../../src/export/pdf'
import { annexFixture, longAnnexFixture } from '../fixtures/annexes'

configurePdfFonts(resolve('public/fonts'))
const output = '/private/tmp/graduation-export-qa/full'
mkdirSync(output, { recursive: true })

it('exports every short and long variant without losing text or entering the footer', async () => {
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const inventory: { id: string; length: string; pages: number }[] = []
  for (const template of templates.filter((item) => item.kind === 'editable')) {
    for (const length of ['short', 'long']) {
      const make = length === 'long' ? longAnnexFixture : annexFixture
      const draft =
        template.id === 'anexo-11' ? buildFinalReport([make('anexo-5')]) : make(template.id)
      if (template.id === 'anexo-11')
        draft.fields = {
          ...draft.fields,
          fecha: '2026-10-22',
          avance: '100',
          mensualesRevisados: 'true',
        }
      const model = buildDocumentModel(draft)
      for (const format of ['docx', 'pdf'] as const) {
        const blob = await renderAnnex(draft, format)
        const bytes = new Uint8Array(await blob.arrayBuffer())
        writeFileSync(`${output}/${template.id}-${length}.${format}`, bytes)
        if (format !== 'pdf') continue
        const document = await getDocument({
          data: bytes,
          useSystemFonts: true,
          isEvalSupported: false,
        }).promise
        const texts: string[] = []
        for (let index = 1; index <= document.numPages; index++) {
          const page = await document.getPage(index)
          const content = await page.getTextContent()
          for (const item of content.items) {
            if (!('str' in item) || !item.str.trim()) continue
            const [, , , , x, y] = item.transform
            expect(x, `${template.id}/${length} page ${index}: text left`).toBeGreaterThanOrEqual(
              model.page.marginX - 2,
            )
            expect(
              x + item.width,
              `${template.id}/${length} page ${index}: text right ${item.str}`,
            ).toBeLessThanOrEqual(model.page.width - model.page.marginRight + 3)
            expect(y, `${template.id}/${length} page ${index}: text below page`).toBeGreaterThan(15)
            const isFooter =
              item.str.startsWith('INSTRUCTIVO DEL REGLAMENTO') || item.str.startsWith('Página ')
            if (!isFooter)
              expect(
                y,
                `${template.id}/${length} page ${index}: footer collision ${item.str}`,
              ).toBeGreaterThan(48)
          }
          texts.push(
            content.items
              .filter(
                (item) =>
                  'str' in item &&
                  item.transform[5] > 48 &&
                  !['Fecha', 'Actividad'].includes(item.str),
              )
              .map((item) => ('str' in item ? item.str : ''))
              .join(' '),
          )
        }
        const normalize = (text: string) => text.replace(/\s+/g, '')
        const extracted = normalize(texts.join(' '))
        for (const item of [...model.paragraphs, ...model.signature, ...model.afterTable])
          expect(extracted, `${template.id}/${length}: missing paragraph`).toContain(
            normalize(item.text),
          )
        for (const row of model.rows)
          expect(extracted, `${template.id}/${length}: missing activity`).toContain(
            normalize(row.description),
          )
        for (const note of model.notes)
          expect(extracted, `${template.id}/${length}: missing note`).toContain(normalize(note))
        inventory.push({ id: template.id, length, pages: document.numPages })
        await document.destroy()
      }
    }
  }
  writeFileSync(`${output}/inventory.json`, JSON.stringify(inventory, null, 2))
}, 60000)
