export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
}

export function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'No se pudo completar la acción. Inténtalo de nuevo.'
}
