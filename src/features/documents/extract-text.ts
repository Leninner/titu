import { strFromU8, unzipSync } from 'fflate'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

async function pdfText(file: Blob) {
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist')
  GlobalWorkerOptions.workerSrc = workerUrl
  const pdf = await getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false }).promise
  try {
    const pages: string[] = []
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const content = await (await pdf.getPage(pageNumber)).getTextContent()
      pages.push(content.items.map((item) => ('str' in item ? item.str : '')).join(' '))
    }
    return pages.join('\n')
  } finally {
    await pdf.destroy()
  }
}

async function docxText(file: Blob) {
  const entries = unzipSync(new Uint8Array(await file.arrayBuffer()), {
    filter: (entry) => entry.name === 'word/document.xml',
  })
  const xml = entries['word/document.xml']
  if (!xml) return ''
  return strFromU8(xml)
    .replace(/<\/w:p>|<\/w:tc>/g, '\n')
    .replace(/<w:tab\/>/g, ' ')
    .replace(/<[^>]+>/g, '')
}

const readers: [RegExp, (file: Blob) => Promise<string>][] = [
  [/\.pdf$/i, pdfText],
  [/\.docx$/i, docxText],
]

export async function extractText(file: File): Promise<string> {
  const reader = readers.find(([pattern]) => pattern.test(file.name))?.[1]
  return reader ? reader(file).catch(() => '') : ''
}
