import { ExternalLink } from 'lucide-react'
import { sources } from '../../catalog/sources'

export function ReportGuideLinks() {
  return (
    <>
      {[
        { id: 'UT-02', label: 'Guía de elaboración (texto)' },
        { id: 'UT-01', label: 'Anexo A · portada (texto)' },
      ].map(({ id, label }) => {
        const source = sources.find((item) => item.id === id)
        return source ? (
          <a
            key={id}
            href={`${import.meta.env.BASE_URL}${source.excerptUrl.replace(/^\//, '')}`}
            target="_blank"
            rel="noreferrer"
          >
            {label}<ExternalLink size={14} aria-hidden="true" />
          </a>
        ) : null
      })}
    </>
  )
}
