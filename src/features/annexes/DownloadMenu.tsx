import { useRef, useState } from 'react'
import { ChevronDown, Download, FileText, FileType2 } from 'lucide-react'
import { useDismiss } from '../../components/useDismiss'

type Format = 'docx' | 'pdf'
const formats: { format: Format; label: string; Icon: typeof FileText }[] = [
  { format: 'docx', label: 'Word', Icon: FileType2 },
  { format: 'pdf', label: 'PDF', Icon: FileText },
]

export function DownloadMenu({ name, disabled, onDownload }: { name: string; disabled: boolean; onDownload: (format: Format) => void }) {
  const [open, setOpen] = useState(false)
  const menu = useRef<HTMLDivElement>(null)
  useDismiss(open, menu, () => setOpen(false))
  return (
    <div className="download-menu" ref={menu}>
      <button
        type="button"
        disabled={disabled}
        aria-label={`Descargar ${name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Download size={15} aria-hidden="true" /> Descargar <ChevronDown size={14} aria-hidden="true" />
      </button>
      {open && (
        <div className="download-menu-list" role="menu" aria-label={`Formatos de ${name}`}>
          {formats.map(({ format, label, Icon }) => (
            <button
              key={format}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onDownload(format)
              }}
            >
              <Icon size={16} aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
