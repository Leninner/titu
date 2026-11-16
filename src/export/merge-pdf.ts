import { PDFDocument, type PDFImage } from 'pdf-lib'

const a4 = { width: 595.28, height: 841.89 }
const margin = 56

function isPdf(file: Blob) {
  return file.type === 'application/pdf'
}

async function toPng(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('No se pudo preparar la imagen para el PDF')
  context.drawImage(bitmap, 0, 0)
  const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!png) throw new Error('No se pudo convertir la imagen para el PDF')
  return png
}

async function embedImage(document: PDFDocument, file: Blob): Promise<PDFImage> {
  if (file.type === 'image/jpeg') return document.embedJpg(await file.arrayBuffer())
  const png = file.type === 'image/png' ? file : await toPng(file)
  return document.embedPng(await png.arrayBuffer())
}

async function appendImage(document: PDFDocument, file: Blob) {
  const image = await embedImage(document, file)
  const scale = Math.min(1, (a4.width - 2 * margin) / image.width, (a4.height - 2 * margin) / image.height)
  const width = image.width * scale
  const height = image.height * scale
  const page = document.addPage([a4.width, a4.height])
  page.drawImage(image, { x: (a4.width - width) / 2, y: a4.height - margin - height, width, height })
}

async function appendPdf(document: PDFDocument, file: Blob) {
  const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true })
  const pages = await document.copyPages(source, source.getPageIndices())
  pages.forEach((page) => document.addPage(page))
}

export async function mergePdf(main: Blob, appendices: Blob[]): Promise<Blob> {
  if (!appendices.length) return main
  const document = await PDFDocument.load(await main.arrayBuffer())
  for (const file of appendices) {
    if (isPdf(file)) await appendPdf(document, file)
    else await appendImage(document, file)
  }
  return new Blob([new Uint8Array(await document.save())], { type: 'application/pdf' })
}
