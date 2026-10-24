import { useState } from 'react'
import { Plus, FileText, ArrowUpRight } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { catalog } from '../../catalog'
import { createDraft } from '../../domain/annex'
import { buildFinalReport } from '../../domain/final-report'
import { repository } from '../../storage/repository'

export function AnnexLibrary() {
  const { workspace, run, busy } = useWorkspace()
  const [templateId, setTemplateId] = useState('anexo-5')
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const [selected, setSelected] = useState<string[]>([])
  const [filter, setFilter] = useState('')
  const templates = catalog.templates.filter(
    (template) =>
      template.modalities.includes(workspace.profile!.modalidad) &&
      (!template.companyOnly || workspace.profile?.aplicaEmpresa),
  )
  const editable = templates.filter((template) => template.kind === 'editable')
  const activeTemplate = editable.some((template) => template.id === templateId)
    ? templateId
    : editable[0]?.id
  return (
    <div className="page">
      <header className="page-heading">
        <h1>Anexos</h1>
        <p className="lead">Del borrador al documento listo para revisión.</p>
      </header>
      <div className="annex-create">
        <label className="field">
          <span>Elegir plantilla</span>
          <select value={activeTemplate} onChange={(event) => setTemplateId(event.target.value)}>
            {editable.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Mes del informe</span>
          <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
        </label>
        <button
          className="primary"
          disabled={busy || !activeTemplate}
          onClick={() =>
            void run(async () => {
              if (activeTemplate === 'anexo-11') {
                const monthly = workspace.drafts.filter((draft) => selected.includes(draft.id))
                const draft = buildFinalReport(monthly)
                const saved = await repository.saveDraft(draft, 0)
                window.location.hash = `/anexos/${saved.id}`
              } else {
                const draft = createDraft(activeTemplate!, workspace.profile!, month)
                const saved = await repository.saveDraft(draft, 0)
                window.location.hash = `/anexos/${saved.id}`
              }
            })
          }
        >
          <Plus size={18} />
          {activeTemplate === 'anexo-5' ? 'Crear informe mensual' : 'Crear borrador'}
        </button>
      </div>
      {activeTemplate === 'anexo-11' && (
        <div className="notice">
          <h2>Selecciona los informes mensuales</h2>
          <p>
            Se copiarán sus fechas y actividades exactas. El porcentaje final no se calcula sumando
            porcentajes mensuales.
          </p>
          {workspace.drafts
            .filter((draft) => draft.templateId === 'anexo-5')
            .map((draft) => (
              <label className="check" key={draft.id}>
                <input
                  type="checkbox"
                  checked={selected.includes(draft.id)}
                  onChange={(event) =>
                    setSelected(
                      event.target.checked
                        ? [...selected, draft.id]
                        : selected.filter((id) => id !== draft.id),
                    )
                  }
                />
                {draft.name} · revisión {draft.revision}
              </label>
            ))}
        </div>
      )}
      {workspace.drafts.length === 0 ? (
        <div className="empty">
          <FileText size={36} />
          <h2>Tu primer informe empieza aquí</h2>
          <p>
            Elige una plantilla y completa tus datos. Podrás guardar el borrador y descargar Word o
            PDF con texto.
          </p>
        </div>
      ) : (
        <>
          <label className="field filter">
            <span>Filtrar borradores por nombre o mes</span>
            <input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Octubre, Anexo 5…"
            />
          </label>
          <div className="draft-list">
            {workspace.drafts
              .filter((draft) =>
                `${draft.name} ${draft.monthlyPeriod}`
                  .toLocaleLowerCase()
                  .includes(filter.toLocaleLowerCase()),
              )
              .map((draft) => (
                <a className="draft-row" href={`#/anexos/${draft.id}`} key={draft.id}>
                  <FileText size={24} />
                  <div>
                    <h2>{draft.name}</h2>
                    <p>
                      {draft.monthlyPeriod} · Revisión {draft.revision} ·{' '}
                      {draft.updatedAt.slice(0, 10)}
                      {draft.needsReview ? ' · Revisar cambios del perfil' : ''}
                    </p>
                  </div>
                  <ArrowUpRight size={20} />
                </a>
              ))}
          </div>
        </>
      )}
      <details className="reference-library">
        <summary>Referencias y documentos emitidos por terceros</summary>
        {templates
          .filter((template) => template.kind !== 'editable')
          .map((template) => (
            <article key={template.id}>
              <h3>{template.name}</h3>
              <p>
                {template.role} ·{' '}
                {template.kind === 'missing'
                  ? 'Formato no aportado; no se inventa su estructura.'
                  : 'Consulta la referencia o adjunta el documento recibido.'}
              </p>
              {template.sourceIds.map((id) => (
                <a
                  key={id}
                  className="source-link"
                  href={`${import.meta.env.BASE_URL}sources/${id}.txt`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Consultar {id}
                </a>
              ))}
            </article>
          ))}
      </details>
    </div>
  )
}
