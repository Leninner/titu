// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useDraftAutosave } from '../../src/features/annexes/useDraftAutosave'
import { repository, StorageError } from '../../src/storage/repository'
import { newProfile, type AnnexDraft } from '../../src/domain/types'

function fixture(): AnnexDraft {
  return {
    id: 'draft',
    name: 'Original',
    templateId: '5',
    templateVersion: '1',
    revision: 1,
    savedRevision: 1,
    profileSnapshot: newProfile(),
    fields: {},
    activities: [],
    monthlyPeriod: '2026-10',
    sourceMonthlyRevisions: [],
    updatedAt: '2026-10-22',
  }
}
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}
beforeEach(() => {
  vi.useFakeTimers()
  window.history.replaceState(null, '', '#/anexos/draft')
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.useRealTimers()
})
it('debounces 500ms and only announces Guardado after commit', async () => {
  const request = deferred<AnnexDraft>()
  const save = vi.spyOn(repository, 'saveDraft').mockReturnValue(request.promise)
  const { result } = renderHook(() => useDraftAutosave(fixture()))
  act(() => result.current.update({ ...result.current.draft, name: 'Changed' }))
  await act(async () => {
    await vi.advanceTimersByTimeAsync(499)
  })
  expect(save).not.toHaveBeenCalled()
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1)
  })
  expect(result.current.status).toBe('Guardando…')
  await act(async () => {
    request.resolve({ ...save.mock.calls[0][0], revision: 2, savedRevision: 2 })
  })
  expect(result.current.status).toBe('Guardado')
})
it('coalesces concurrent flushes and exports the latest edits made during saving', async () => {
  const first = deferred<AnnexDraft>()
  const save = vi
    .spyOn(repository, 'saveDraft')
    .mockImplementation(async (draft, revision) => ({
      ...draft,
      revision: revision + 1,
      savedRevision: revision + 1,
    }))
    .mockImplementationOnce(() => first.promise)
  const { result } = renderHook(() => useDraftAutosave(fixture()))
  act(() => result.current.update({ ...result.current.draft, name: 'First' }))
  let a!: Promise<AnnexDraft>
  let b!: Promise<AnnexDraft>
  let c!: Promise<AnnexDraft>
  act(() => {
    a = result.current.flush()
  })
  act(() => result.current.update({ ...result.current.draft, name: 'Latest' }))
  act(() => {
    b = result.current.flush()
    c = result.current.flush()
  })
  await act(async () => {
    first.resolve({ ...save.mock.calls[0][0], revision: 2, savedRevision: 2 })
    await Promise.all([a, b, c])
  })
  expect(save).toHaveBeenCalledTimes(2)
  expect(save.mock.calls[1][1]).toBe(2)
  expect((await b).name).toBe('Latest')
  expect(result.current.status).toBe('Guardado')
})
it('keeps local edits and blocks link navigation on quota errors, then recovers', async () => {
  const save = vi
    .spyOn(repository, 'saveDraft')
    .mockRejectedValue(new DOMException('Quota exceeded', 'QuotaExceededError'))
  const { result } = renderHook(() => useDraftAutosave(fixture()))
  act(() => result.current.update({ ...result.current.draft, name: 'Recover me' }))
  const anchor = document.createElement('a')
  anchor.href = '#/anexos'
  document.body.append(anchor)
  await act(async () => {
    anchor.click()
  })
  expect(window.location.hash).toBe('#/anexos/draft')
  expect(result.current.draft.name).toBe('Recover me')
  expect(result.current.status).toBe('No se pudo guardar')
  save.mockImplementation(async (draft, revision) => ({
    ...draft,
    revision: revision + 1,
    savedRevision: revision + 1,
  }))
  await act(async () => {
    await result.current.flush()
  })
  expect(result.current.status).toBe('Guardado')
  anchor.remove()
})
it('preserves edits on conflict and rejects flush for export', async () => {
  vi.spyOn(repository, 'saveDraft').mockRejectedValue(new StorageError('conflict', 'Otra revisión'))
  const { result } = renderHook(() => useDraftAutosave(fixture()))
  act(() => result.current.update({ ...result.current.draft, name: 'My local copy' }))
  await act(async () => {
    await expect(result.current.flush()).rejects.toThrow('Otra revisión')
  })
  expect(result.current.draft.name).toBe('My local copy')
  expect(result.current.draft.revision).toBe(1)
  expect(result.current.status).toBe('No se pudo guardar')
})
it('blocks browser Back routing until save succeeds and retains editor on failure', async () => {
  vi.spyOn(repository, 'saveDraft').mockRejectedValue(new Error('Quota'))
  const { result } = renderHook(() => useDraftAutosave(fixture()))
  const router = vi.fn()
  window.addEventListener('hashchange', router)
  act(() => result.current.update({ ...result.current.draft, name: 'Unsaved' }))
  window.history.replaceState(null, '', '#/anexos')
  await act(async () => {
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  })
  expect(router).not.toHaveBeenCalled()
  expect(window.location.hash).toBe('#/anexos/draft')
  expect(result.current.draft.name).toBe('Unsaved')
  window.removeEventListener('hashchange', router)
})
it('holds Back navigation during commit then releases the requested route', async () => {
  const request = deferred<AnnexDraft>()
  const save = vi.spyOn(repository, 'saveDraft').mockReturnValue(request.promise)
  const { result } = renderHook(() => useDraftAutosave(fixture()))
  const router = vi.fn()
  window.addEventListener('hashchange', router)
  act(() => result.current.update({ ...result.current.draft, name: 'Saved before leaving' }))
  window.history.replaceState(null, '', '#/anexos')
  await act(async () => {
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  })
  expect(window.location.hash).toBe('#/anexos/draft')
  expect(router).not.toHaveBeenCalled()
  await act(async () => {
    request.resolve({ ...save.mock.calls[0][0], revision: 2, savedRevision: 2 })
    await vi.advanceTimersByTimeAsync(1)
  })
  expect(window.location.hash).toBe('#/anexos')
  expect(router).toHaveBeenCalledTimes(1)
  window.removeEventListener('hashchange', router)
})
it('warns before closing while edits are dirty, including a failed save', async () => {
  vi.spyOn(repository, 'saveDraft').mockRejectedValue(new Error('Quota'))
  const { result } = renderHook(() => useDraftAutosave(fixture()))
  act(() => result.current.update({ ...result.current.draft, name: 'Unsaved' }))
  await act(async () => {
    await expect(result.current.flush()).rejects.toThrow()
  })
  const event = new Event('beforeunload', { cancelable: true })
  window.dispatchEvent(event)
  expect(event.defaultPrevented).toBe(true)
})
