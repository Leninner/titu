import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { liveQuery } from 'dexie'
import { emptyWorkspace, type Workspace } from '../domain/types'
import { repository } from '../storage/repository'
import { errorMessage } from '../components/download'

type WorkspaceContextValue = {
  workspace: Workspace
  refresh: () => Promise<void>
  run: (action: () => Promise<unknown>) => Promise<boolean>
  busy: boolean
}

const Context = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<Workspace>(emptyWorkspace)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const refresh = useCallback(async () => setWorkspace(await repository.loadWorkspace()), [])

  useEffect(() => {
    const subscription = liveQuery(() => repository.loadWorkspace()).subscribe({
      next: (value) => {
        setWorkspace(value)
        setLoading(false)
      },
      error: (failure) => {
        setError(errorMessage(failure))
        setLoading(false)
      },
    })
    return () => subscription.unsubscribe()
  }, [])

  async function run(action: () => Promise<unknown>) {
    setBusy(true)
    setError('')
    try {
      await action()
      await refresh()
      return true
    } catch (error) {
      setError(errorMessage(error))
      return false
    } finally {
      setBusy(false)
    }
  }

  if (loading)
    return (
      <main className="loading">
        <output>Abriendo tu expediente…</output>
      </main>
    )
  return (
    <Context.Provider value={{ workspace, refresh, run, busy }}>
      {error && (
        <div className="global-error" role="alert">
          <strong>No se pudo completar la acción.</strong> {error}{' '}
          <button onClick={() => setError('')}>Cerrar aviso</button>
        </div>
      )}
      {children}
    </Context.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(Context)
  if (!context) throw new Error('Falta el contexto del expediente')
  return context
}
