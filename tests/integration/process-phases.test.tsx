// @vitest-environment jsdom
import { webcrypto } from 'node:crypto'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { WorkspaceProvider } from '../../src/app/WorkspaceContext'
import { AppShell } from '../../src/app/AppShell'
import { repository } from '../../src/storage/repository'
import { emptyTask } from '../../src/domain/task-record'
import { newProfile } from '../../src/domain/types'

beforeEach(async () => {
  vi.stubGlobal('crypto', webcrypto)
  window.localStorage.clear()
  await repository.db.open()
  await repository.db.transaction('rw', repository.db.tables, async () => {
    for (const table of repository.db.tables) await table.clear()
  })
  await repository.saveProfile({ ...newProfile(), modalidad: 'research', aplicaEmpresa: false })
  for (const id of ['propuesta', 'desarrollo', 'informe-final'])
    await repository.saveTask({ ...emptyTask(id), status: 'completed' })
  window.history.replaceState(null, '', '#/proceso')
  render(
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>,
  )
  await screen.findByRole('heading', { name: 'Trabajo de titulación' })
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

it('shows one row per phase with its progress and the cross-phase blockers', () => {
  expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(
    expect.arrayContaining(['Trabajo de titulación', 'Calificadores', 'Biblioteca', 'Sustentación y título']),
  )
  expect(screen.getByText('3 de 3')).toBeTruthy()
  expect(screen.getByText('Necesita: Calificación del trabajo')).toBeTruthy()
})

it('hides completed phases on demand and remembers the choice', () => {
  fireEvent.click(screen.getByRole('button', { name: 'Ocultar completadas' }))
  expect(screen.queryByRole('heading', { name: 'Trabajo de titulación' })).toBeNull()
  expect(screen.getByText(/Etapa completada oculta/).textContent).toContain('Trabajo de titulación')
  expect(window.localStorage.getItem('process-show-completed')).toBe('false')
  fireEvent.click(screen.getByRole('button', { name: 'Ver completadas' }))
  expect(screen.getByRole('heading', { name: 'Trabajo de titulación' })).toBeTruthy()
})
