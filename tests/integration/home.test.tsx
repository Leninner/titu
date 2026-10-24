// @vitest-environment jsdom
import { webcrypto } from 'node:crypto'
import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { WorkspaceProvider } from '../../src/app/WorkspaceContext'
import { AppShell } from '../../src/app/AppShell'
import { repository } from '../../src/storage/repository'
import { emptyTask } from '../../src/domain/task-record'
import { newProfile } from '../../src/domain/types'

beforeEach(async () => {
  vi.stubGlobal('crypto', webcrypto)
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-24T15:00:00Z'))
  await repository.db.open()
  await repository.db.transaction('rw', repository.db.tables, async () => {
    for (const table of repository.db.tables) await table.clear()
  })
  window.history.replaceState(null, '', '#/inicio')
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

it('shows what is missing, the workflows in progress and dates linked to their workflow', async () => {
  await repository.saveProfile({ ...newProfile(), nombres: 'Lenin Mazabanda', modalidad: 'research' })
  await repository.saveTasks([
    { ...emptyTask('propuesta'), status: 'completed' },
    { ...emptyTask('desarrollo'), status: 'submitted' },
  ])
  render(
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>,
  )

  const focus = within(await screen.findByRole('region', { name: 'Tu próximo trámite' }))
  expect(focus.getByText(/^Faltan? \d+ requisitos?$/)).toBeTruthy()
  const missing = focus.getAllByRole('link').filter((link) => link.closest('[aria-label="Lo que falta"]'))
  expect(missing.length).toBeGreaterThan(0)
  expect(missing.length).toBeLessThanOrEqual(3)

  const current = within(screen.getByRole('region', { name: 'En curso' }))
  const monthly = current.getByRole('link', { name: /Informes mensuales de avance/ })
  expect(monthly.getAttribute('href')).toBe('#/proceso/desarrollo')
  expect(monthly.textContent).toContain('En trámite')

  const deadline = screen.getByRole('link', { name: 'Entrega informe final y solicitud calificadores' })
  expect(deadline.getAttribute('href')).toBe('#/proceso/calificadores-research')
})
