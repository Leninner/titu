// @vitest-environment jsdom
import { webcrypto } from 'node:crypto'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { WorkspaceProvider } from '../../src/app/WorkspaceContext'
import { AppShell } from '../../src/app/AppShell'
import { repository } from '../../src/storage/repository'
import { newProfile } from '../../src/domain/types'

beforeEach(async () => {
  vi.stubGlobal('crypto', webcrypto)
  await repository.db.open()
  await repository.db.transaction('rw', repository.db.tables, async () => {
    for (const table of repository.db.tables) await table.clear()
  })
  await repository.saveProfile({ ...newProfile(), modalidad: 'research' })
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

it('explains the grading phase with its deadline and links to where the grades are recorded', async () => {
  window.history.replaceState(null, '', '#/proceso/calificacion')
  render(
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>,
  )
  expect(await screen.findByText('Aún no empieza')).toBeTruthy()
  expect(screen.getByText('Entrega calificaciones')).toBeTruthy()
  expect(screen.getByText('viernes, 4 de diciembre de 2026')).toBeTruthy()
  expect(
    screen.getByRole('link', { name: /Registrar las notas en Designación de calificadores del Proyecto/ })
      .getAttribute('href'),
  ).toBe('#/proceso/calificadores-research')
  expect(screen.queryByRole('button', { name: 'Completar trámite' })).toBeNull()
})

it('tells the student to wait for the grades before going back to the library', async () => {
  window.history.replaceState(null, '', '#/proceso/biblioteca-firma-estudiante')
  render(
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>,
  )
  const notice = await screen.findByRole('complementary', { name: 'Antes de este trámite' })
  expect(notice.textContent).toContain('Calificación del trabajo')
  expect(screen.getByText(/vuelve a Biblioteca con el trabajo corregido/)).toBeTruthy()
})
