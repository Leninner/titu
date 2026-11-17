// @vitest-environment jsdom
import { webcrypto } from 'node:crypto'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { WorkspaceProvider } from '../../src/app/WorkspaceContext'
import { AppShell } from '../../src/app/AppShell'
import { repository } from '../../src/storage/repository'
import { newProfile } from '../../src/domain/types'
import { emptyTask, taskFor } from '../../src/domain/task-record'

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

it('shows the council session date and the milestones until the grades', async () => {
  window.history.replaceState(null, '', '#/proceso/calificacion')
  render(
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>,
  )
  expect(await screen.findByText('Aún no empieza')).toBeTruthy()
  expect(screen.getByText('Sesión Consejo: calificadores')).toBeTruthy()
  expect(screen.getByText('jueves, 19 de noviembre de 2026')).toBeTruthy()
  const timeline = screen.getByRole('list', { name: 'Fechas de la designación y calificación' })
  expect([...timeline.querySelectorAll('.grader-milestone-label')].map((label) => label.textContent))
    .toEqual(['Solicitud', 'Consejo', 'Resolución', 'Notificación', 'Notas'])
  expect(screen.getByRole('heading', { name: 'Tus calificaciones' })).toBeTruthy()
  expect(screen.queryByRole('textbox', { name: /Nota del primer calificador/ })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Completar trámite' })).toBeNull()
})

it('records each grade in the designation and reveals the average with the next step', async () => {
  await repository.saveTasks([
    { ...emptyTask('calificadores-research'), status: 'completed', requirementChecks: { 'grade-1': 8 } },
  ])
  window.history.replaceState(null, '', '#/proceso/calificacion')
  render(
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>,
  )
  expect(await screen.findByText('Falta una nota')).toBeTruthy()
  const second = screen.getByRole('textbox', { name: 'Nota del segundo calificador' })
  fireEvent.change(second, { target: { value: '9' } })
  fireEvent.keyDown(second, { key: 'Enter' })
  expect(await screen.findByText('¡Aprobaste la calificación!')).toBeTruthy()
  expect(screen.getByText('8,5')).toBeTruthy()
  expect(screen.getByRole('link', { name: /Ir a Biblioteca: firma del estudiante/ }).getAttribute('href'))
    .toBe('#/proceso/biblioteca-firma-estudiante')
  const workspace = await repository.loadWorkspace()
  expect(taskFor('calificadores-research', workspace).requirementChecks['grade-2']).toBe(9)
})

it('tells the student to wait for the grades before going back to the library', async () => {
  window.history.replaceState(null, '', '#/proceso/biblioteca-firma-estudiante')
  render(
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>,
  )
  const notice = await screen.findByRole('complementary', { name: 'Antes de este trámite' })
  expect(notice.textContent).toContain('Designación y calificación')
  expect(screen.getByText(/vuelve a Biblioteca con el trabajo corregido/)).toBeTruthy()
})
