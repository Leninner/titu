import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

export function Dialog({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (typeof element.showModal === 'function' && !element.open) element.showModal()
    else element.setAttribute('open', '')
    return () => {
      if (typeof element.close === 'function' && element.open) element.close()
    }
  }, [])
  return (
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialog}
      className={`app-dialog${wide ? ' is-wide' : ''}`}
      aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <div className="app-dialog-head">
        <h2 id={titleId}>{title}</h2>
        <button type="button" className="icon-button" aria-label="Cerrar" onClick={onClose}>
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="app-dialog-body">{children}</div>
    </dialog>
  )
}
