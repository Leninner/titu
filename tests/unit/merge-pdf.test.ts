import { PDFDocument } from 'pdf-lib'
import { expect, it } from 'vitest'
import { mergePdf } from '../../src/export/merge-pdf'

const onePixelPng =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

async function pdfWithPages(count: number) {
  const document = await PDFDocument.create()
  for (let index = 0; index < count; index += 1) document.addPage()
  return new Blob([new Uint8Array(await document.save())], { type: 'application/pdf' })
}

async function pageCount(blob: Blob) {
  return (await PDFDocument.load(await blob.arrayBuffer())).getPageCount()
}

it('appends the pages of each PDF and one page per image after the main document', async () => {
  const image = new Blob([Uint8Array.from(atob(onePixelPng), (char) => char.charCodeAt(0))], { type: 'image/png' })
  const merged = await mergePdf(await pdfWithPages(1), [await pdfWithPages(2), image])
  expect(merged.type).toBe('application/pdf')
  expect(await pageCount(merged)).toBe(4)
})

it('returns the main document untouched without appendices', async () => {
  const main = await pdfWithPages(1)
  expect(await mergePdf(main, [])).toBe(main)
})
