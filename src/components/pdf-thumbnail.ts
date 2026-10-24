import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import openjpegUrl from 'pdfjs-dist/wasm/openjpeg.wasm?url'
import qcmsUrl from 'pdfjs-dist/wasm/qcms_bg.wasm?url'

// Scanned PDFs often embed JPEG 2000 images and ICC profiles, decoded by pdf.js wasm modules.
const wasmFiles: Record<string, string> = { 'openjpeg.wasm': openjpegUrl, 'qcms_bg.wasm': qcmsUrl }
class WasmFactory {
  async fetch({ filename }: { filename: string }) {
    const url = wasmFiles[filename]
    if (!url) throw new Error(`Módulo de PDF no disponible: ${filename}`)
    return new Uint8Array(await (await fetch(url)).arrayBuffer())
  }
}

export async function renderPdfThumbnail(file: Blob, width = 360): Promise<string> {
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist')
  GlobalWorkerOptions.workerSrc = workerUrl
  const pdf = await getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    isEvalSupported: false,
    WasmFactory,
  }).promise
  try {
    const page = await pdf.getPage(1)
    const base = page.getViewport({ scale: 1 })
    const viewport = page.getViewport({ scale: width / base.width })
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas no disponible')
    await page.render({ canvas, canvasContext: context, viewport }).promise
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) throw new Error('No se pudo generar la miniatura')
    return URL.createObjectURL(blob)
  } finally {
    await pdf.destroy()
  }
}
