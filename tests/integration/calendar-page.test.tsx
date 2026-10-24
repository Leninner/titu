// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { WorkspaceProvider } from '../../src/app/WorkspaceContext'
import { CalendarPage } from '../../src/features/calendar/CalendarPage'
import { newProfile } from '../../src/domain/types'
import { repository } from '../../src/storage/repository'

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-22T17:00:00Z'))
  await repository.db.open()
  await repository.db.transaction('rw', repository.db.tables, async () => {
    for (const table of repository.db.tables) await table.clear()
  })
  await repository.saveProfile(newProfile())
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

it('shows one calendar view at a time and starts with the agenda in date order', async () => {
  render(
    <WorkspaceProvider>
      <CalendarPage />
    </WorkspaceProvider>,
  )

  const agenda = await screen.findByRole('button', { name: /^Agenda$/ })
  expect(agenda.getAttribute('aria-pressed')).toBe('true')
  expect(screen.queryByRole('region', { name: 'Calendario semanal de titulación' })).toBeNull()
  expect(document.querySelector('.agenda-row')?.textContent).toContain('Solicitud no adeudar')

  fireEvent.click(screen.getByRole('button', { name: /^Calendario$/ }))
  expect(screen.getByRole('region', { name: 'Calendario semanal de titulación' })).toBeTruthy()
  expect(screen.getAllByText('Solicitud no adeudar').length).toBeGreaterThan(0)
  expect(document.querySelector('.agenda-row')).toBeNull()

  fireEvent.click(agenda)
  expect(document.querySelector('.agenda-row')?.textContent).toContain('Solicitud no adeudar')
})
