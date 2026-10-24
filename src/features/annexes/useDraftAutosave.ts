import { useCallback, useEffect, useRef, useState } from 'react'
import type { AnnexDraft } from '../../domain/types'
import { repository } from '../../storage/repository'
import { errorMessage } from '../../components/download'

export function useDraftAutosave(initial: AnnexDraft) {
  const [draft, setDraft] = useState(initial)
  const [status, setStatus] = useState('Guardado')
  const [error, setError] = useState('')
  const current = useRef(initial)
  const saved = useRef(initial.revision)
  const dirty = useRef(false)
  const generation = useRef(0)
  const pending = useRef<Promise<AnnexDraft> | null>(null)

  const flush = useCallback((): Promise<AnnexDraft> => {
    if (pending.current) return pending.current
    if (!dirty.current) return Promise.resolve(current.current)
    const operation = async () => {
      try {
        while (dirty.current) {
          setStatus('Guardando…')
          const snapshot = structuredClone(current.current)
          const atGeneration = generation.current
          const result = await repository.saveDraft(snapshot, saved.current)
          saved.current = result.revision
          current.current = {
            ...current.current,
            revision: result.revision,
            savedRevision: result.revision,
            updatedAt: result.updatedAt,
          }
          dirty.current = generation.current !== atGeneration
          setDraft(current.current)
          setStatus(dirty.current ? 'Cambios pendientes' : 'Guardado')
          setError('')
        }
        return current.current
      } catch (failure) {
        setStatus('No se pudo guardar')
        setError(errorMessage(failure))
        throw failure
      }
    }
    pending.current = operation().finally(() => {
      pending.current = null
    })
    return pending.current
  }, [])

  function update(next: AnnexDraft) {
    current.current = next
    generation.current += 1
    dirty.current = true
    setDraft(next)
    setStatus('Cambios pendientes')
  }

  useEffect(() => {
    if (!dirty.current) return
    const timer = setTimeout(() => {
      void flush().catch(() => {})
    }, 500)
    return () => clearTimeout(timer)
  }, [draft, flush])

  useEffect(() => {
    let editorUrl = window.location.href
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty.current) return
      event.preventDefault()
      event.returnValue = ''
    }
    const navigate = (event: MouseEvent) => {
      const target = event.target
      const link =
        target instanceof Element ? target.closest<HTMLAnchorElement>('a[href^="#/"]') : null
      if (
        !link ||
        !dirty.current ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return
      event.preventDefault()
      void flush()
        .then(() => {
          window.location.hash = link.hash
        })
        .catch(() => {})
    }
    const hashchange = (event: HashChangeEvent) => {
      if (!dirty.current) {
        editorUrl = window.location.href
        return
      }
      const destination = window.location.hash
      // Back and programmatic navigation must not unmount a recoverable draft.
      event.stopImmediatePropagation()
      window.history.replaceState(window.history.state, '', editorUrl)
      void flush()
        .then(() => {
          window.location.hash = destination
        })
        .catch(() => {})
    }
    window.addEventListener('beforeunload', beforeUnload)
    window.addEventListener('hashchange', hashchange, true)
    document.addEventListener('click', navigate, true)
    return () => {
      window.removeEventListener('beforeunload', beforeUnload)
      window.removeEventListener('hashchange', hashchange, true)
      document.removeEventListener('click', navigate, true)
    }
  }, [flush])

  return { draft, update, status, error, flush }
}
