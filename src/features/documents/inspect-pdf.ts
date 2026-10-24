import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { DocumentVersion } from '../../domain/types'

export async function inspectPdf(file: Blob): Promise<DocumentVersion['textualPdfStatus']> {
  let pdf: Awaited<ReturnType<typeof import('pdfjs-dist').getDocument>['promise']> | undefined
  try {
    const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist')
    GlobalWorkerOptions.workerSrc = workerUrl
    pdf = await getDocument({
      data: new Uint8Array(await file.arrayBuffer()),
      isEvalSupported: false,
    }).promise
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber)
      const text = await page.getTextContent()
      if (text.items.some((item) => 'str' in item && item.str.trim().length > 0))
        return 'text-detected'
    }
    return 'no-text-detected'
  } catch {
    return 'unknown'
  } finally {
    await pdf?.destroy()
  }
}
