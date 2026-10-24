import { lazy, Suspense, useEffect, useState } from 'react'
import {
  CalendarDays,
  ChevronRight,
  FileText,
  FolderOpen,
  Home,
  ListChecks,
  Search,
  Settings,
  SquarePen,
} from 'lucide-react'
import { useWorkspace } from './WorkspaceContext'
import { Onboarding } from '../features/onboarding/Onboarding'
const ProfileSettings = lazy(() =>
  import('../features/onboarding/ProfileSettings').then((module) => ({
    default: module.ProfileSettings,
  })),
)
import { HomePage } from '../features/workflow/HomePage'
const WorkflowPage = lazy(() =>
  import('../features/workflow/WorkflowPage').then((module) => ({ default: module.WorkflowPage })),
)
const DocumentsPage = lazy(() =>
  import('../features/documents/DocumentsPage').then((module) => ({
    default: module.DocumentsPage,
  })),
)
const AnnexLibrary = lazy(() =>
  import('../features/annexes/AnnexLibrary').then((module) => ({ default: module.AnnexLibrary })),
)
const AnnexEditor = lazy(() =>
  import('../features/annexes/AnnexEditor').then((module) => ({ default: module.AnnexEditor })),
)
const CalendarPage = lazy(() =>
  import('../features/calendar/CalendarPage').then((module) => ({ default: module.CalendarPage })),
)
import { catalog } from '../catalog'
import { modalityLabels } from '../domain/types'

const navigation = [
  { path: 'inicio', label: 'Inicio', icon: Home },
  { path: 'proceso', label: 'Mi proceso', icon: ListChecks },
  { path: 'documentos', label: 'Documentos', icon: FolderOpen },
  { path: 'anexos', label: 'Anexos', icon: SquarePen },
  { path: 'fechas', label: 'Fechas', icon: CalendarDays },
]

export function AppShell() {
  const { workspace } = useWorkspace()
  const [hash, setHash] = useState(window.location.hash)
  const [search, setSearch] = useState('')
  const [editorHeader, setEditorHeader] = useState<HTMLDivElement | null>(null)
  const [taskHeader, setTaskHeader] = useState<HTMLDivElement | null>(null)
  useEffect(() => {
    const update = () => {
      setHash(window.location.hash)
      setSearch('')
    }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  if (!workspace.profile) return <Onboarding />
  const [route = 'inicio', id] = hash.replace(/^#\//, '').split('/')
  const draft = workspace.drafts.find((draft) => draft.id === id)
  const period = workspace.profile?.periodo === '2026-07-12'
    ? 'Julio – diciembre 2026'
    : 'Período personalizado'
  const selectedWorkflow =
    route === 'proceso' ? catalog.workflowDefinitions.find((definition) => definition.id === id) : undefined
  const results = [
    ...catalog.workflowDefinitions
      .filter((definition) => definition.modalities.includes(workspace.profile!.modalidad))
      .map((definition) => ({
        title: definition.title,
        path: `proceso/${definition.id}`,
        kind: 'Trámite',
      })),
    ...workspace.documents.map((document) => ({
      title: document.name,
      path: 'documentos',
      kind: 'Documento',
    })),
    ...workspace.drafts.map((draft) => ({
      title: draft.name,
      path: `anexos/${draft.id}`,
      kind: 'Anexo',
    })),
  ].filter((item) => item.title.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Saltar al contenido
      </a>
      <aside className="sidebar">
        <a className="brand" href="#/inicio">
          <FolderOpen size={24} />
          <span>
            Mi titulación<small>FISEI</small>
          </span>
        </a>
        <nav aria-label="Principal">
          {navigation.map(({ path, label, icon: Icon }) => (
            <a
              key={path}
              href={`#/${path}`}
              className={(route || 'inicio') === path ? 'active' : ''}
              aria-current={(route || 'inicio') === path ? 'page' : undefined}
            >
              <Icon size={19} />
              {label}
            </a>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p>
            {workspace.profile.nombres || 'Mi expediente'}
            <small>{modalityLabels[workspace.profile.modalidad]}</small>
          </p>
          <a href="#/ajustes" aria-current={route === 'ajustes' ? 'page' : undefined}>
            <Settings size={18} /> Ajustes y respaldo
          </a>
          <span className="local-status">Guardado en este navegador</span>
        </div>
      </aside>
      <div className="workspace-main">
        <header className={`topbar${(route === 'anexos' && draft) || selectedWorkflow ? ' topbar-document' : ''}`}>
          {route === 'anexos' && draft ? (
            <div className="topbar-editor-slot" ref={setEditorHeader} />
          ) : selectedWorkflow ? (
            <>
              <nav className="editor-breadcrumb topbar-workflow-breadcrumb" aria-label="Ubicación del trámite">
                <a href="#/proceso">Mi proceso</a>
                <ChevronRight size={15} aria-hidden="true" />
                <h1 aria-current="page">{selectedWorkflow.title}</h1>
              </nav>
              <div className="topbar-task-slot" ref={setTaskHeader} />
            </>
          ) : route === 'proceso' ? (
            <nav className="editor-breadcrumb topbar-workflow-breadcrumb" aria-label="Ubicación">
              <span className="topbar-period">{period}</span>
              <ChevronRight size={15} aria-hidden="true" />
              <h1 aria-current="page">Mi proceso</h1>
            </nav>
          ) : (
            <span>{period}</span>
          )}
          <label className="search">
            <Search size={17} />
            <input
              aria-label="Buscar en mi expediente"
              placeholder="Buscar en mi expediente"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setSearch('')
              }}
            />
          </label>
        </header>
        <main id="main-content" tabIndex={-1}>
          <Suspense
            fallback={
              <div className="loading">
                <output>Abriendo…</output>
              </div>
            }
          >
            {search && (
              <div className="page">
                <h1>Resultados</h1>
                <p>La búsqueda se realiza solo en tu navegador.</p>
                {results.length ? (
                  results.map((result, index) => (
                    <a className="search-result" key={index} href={`#/${result.path}`}>
                      <FileText size={20} />
                      <span>
                        {result.title}
                        <small>{result.kind}</small>
                      </span>
                    </a>
                  ))
                ) : (
                  <p>No encontramos coincidencias.</p>
                )}
              </div>
            )}
            <div hidden={!!search}>
              {route === 'proceso' ? (
                <WorkflowPage selectedId={id} headerTarget={taskHeader} />
              ) : route === 'documentos' ? (
                <DocumentsPage />
              ) : route === 'anexos' ? (
                draft ? (
                  <AnnexEditor key={draft.id} initial={draft} headerTarget={editorHeader} />
                ) : (
                  <AnnexLibrary />
                )
              ) : route === 'fechas' ? (
                <CalendarPage />
              ) : route === 'ajustes' ? (
                <ProfileSettings />
              ) : (
                <HomePage />
              )}
            </div>
          </Suspense>
        </main>
      </div>
    </div>
  )
}
