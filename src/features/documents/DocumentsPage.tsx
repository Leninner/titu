import { useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { catalog } from '../../catalog'
import { documentCategories, matchesCategory } from './document-categories'
import { DocumentCard } from './DocumentCard'

export function DocumentsPage() {
  const { workspace } = useWorkspace()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const categories = documentCategories(workspace, catalog)
  const received = categories.filter((category) =>
    workspace.documents.some((document) => document.category === category.id),
  ).length
  const filtered = categories.filter((category) => {
    const hasFile = workspace.documents.some((document) => document.category === category.id)
    return (
      (filter === 'all' || (filter === 'missing' ? !hasFile : hasFile)) &&
      matchesCategory(category, search, workspace)
    )
  })
  return (
    <div className="page documents-page">
      <header className="page-heading with-action">
        <div>
          <h1>Tus documentos</h1>
        </div>
        <span className="completion-pill">
          <span>{received}</span> de {categories.length} categorías con archivos
        </span>
      </header>
      <div className="documents-toolbar">
        <div className="segmented" aria-label="Filtrar documentos">
          {[
            ['all', 'Todos'],
            ['missing', 'Por agregar'],
            ['received', 'Con archivos'],
          ].map(([value, label]) => (
            <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>
              {label}
            </button>
          ))}
        </div>
        <label className="inline-search">
          <Search size={16} />
          <input
            aria-label="Buscar categoría de documento"
            placeholder="Buscar documento…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>
      {!filtered.length && (
        <p className="empty-inline">No hay categorías que coincidan con este filtro.</p>
      )}
      {['Tu expediente', 'Tu trabajo', 'El cierre', 'Otros'].map((group) => {
        const items = filtered.filter((category) => category.group === group)
        return items.length > 0 && (
          <section key={group} className="documents-group" aria-labelledby={`documents-group-${group}`}>
            <h2 id={`documents-group-${group}`}>{group} <span>{items.length}</span></h2>
            <div className="req-cards">
              {items.map((category) => <DocumentCard key={category.id} category={category} />)}
            </div>
          </section>
        )
      })}
      <footer className="document-guidance">
        <SlidersHorizontal size={15} />
        <span>
          PDF, Word, JPG o PNG · máximo 25 MiB · originales y versiones se conservan por separado.
        </span>
      </footer>
    </div>
  )
}
