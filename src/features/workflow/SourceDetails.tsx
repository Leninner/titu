import { catalog } from '../../catalog'
import { sources } from '../../catalog/sources'

export function SourceDetails({ sourceIds }: { sourceIds: string[] }) {
  return (
    <details className="source-details">
      <summary>Fuentes y criterios</summary>
      <ul>
        {sourceIds.map((id) => {
          const source = sources.find((source) => source.id === id)
          return (
            <li key={id}>
              {source ? (
                <a
                  href={`${import.meta.env.BASE_URL}${source.excerptUrl.replace(/^\//, '')}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {id} · {source.name}
                </a>
              ) : (
                id
              )}
            </li>
          )
        })}
      </ul>
      <p className="hint">
        Fuentes aportadas, revisadas el 22 de octubre de 2026. Verifica los destinatarios antes de
        enviar.
      </p>
      {catalog.conflicts.map((conflict) => (
        <p key={conflict.id}>
          <strong>{conflict.id}</strong> · {conflict.evidence}
          <br />
          {conflict.decision}
        </p>
      ))}
    </details>
  )
}
