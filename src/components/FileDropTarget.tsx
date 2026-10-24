import { LoaderCircle, Plus, Upload } from 'lucide-react'

export function FileDropTarget({
  hasFile,
  multiple = false,
  uploading,
  onSelect,
}: {
  hasFile: boolean
  multiple?: boolean
  uploading: boolean
  onSelect: () => void
}) {
  const label = uploading
    ? 'Guardando…'
    : hasFile
      ? multiple ? 'Agregar archivos' : 'Agregar otro archivo'
      : multiple ? 'Subir archivos' : 'Subir archivo'
  return (
    <button
      type="button"
      className="file-row-button"
      disabled={uploading}
      aria-busy={uploading}
      onClick={onSelect}
    >
      {uploading
        ? <LoaderCircle size={15} className="spin" aria-hidden="true" />
        : hasFile ? <Plus size={15} aria-hidden="true" /> : <Upload size={15} aria-hidden="true" />}
      {label}
    </button>
  )
}
