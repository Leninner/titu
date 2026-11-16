// @vitest-environment jsdom
import { webcrypto } from 'node:crypto'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
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
  await repository.saveProfile({
    ...newProfile(),
    nombres: 'María Muñoz',
    carrera: 'Software',
    aprobacionFecha: '2026-09-01',
    aplicaEmpresa: false,
  })
  window.history.replaceState(null, '', '#/ajustes')
  render(
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>,
  )
  await screen.findByRole('heading', { name: 'Tu expediente', level: 1 })
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const card = (name: string) => within(screen.getByRole('region', { name }))

it('shows the saved profile as read-only cards with the missing data counted', () => {
  expect(screen.getByRole('tab', { name: 'Expediente' }).getAttribute('aria-selected')).toBe('true')
  expect(within(screen.getByRole('tabpanel')).queryByRole('textbox')).toBeNull()
  const personal = card('Datos personales')
  expect(personal.getByText('María Muñoz')).toBeTruthy()
  expect(personal.getByText('Faltan 3 datos')).toBeTruthy()
  expect(personal.getAllByText('Sin completar')).toHaveLength(3)
  const titulation = card('Titulación')
  expect(titulation.getByText('Proyecto de Investigación')).toBeTruthy()
  expect(titulation.getByText('1 de septiembre de 2026')).toBeTruthy()
  const company = card('Empresa')
  expect(company.getByText('No')).toBeTruthy()
  expect(company.queryByText('Representante')).toBeNull()
  expect(company.getByText('Completo')).toBeTruthy()
})

it('saves only after Guardar and discards changes on Cancelar', async () => {
  fireEvent.click(screen.getByRole('button', { name: 'Editar Datos personales' }))
  fireEvent.change(screen.getByLabelText('Cédula'), { target: { value: '1800000000' } })
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
  expect(screen.queryByLabelText('Cédula')).toBeNull()
  expect((await repository.loadWorkspace()).profile?.cedula).toBe('')

  fireEvent.click(screen.getByRole('button', { name: 'Editar Titulación' }))
  fireEvent.change(screen.getByLabelText('Tutor'), { target: { value: 'José Núñez' } })
  fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))
  await waitFor(async () => expect((await repository.loadWorkspace()).profile?.tutor).toBe('José Núñez'))
  expect(await card('Titulación').findByText('José Núñez')).toBeTruthy()
  expect(card('Titulación').getByText('Guardado')).toBeTruthy()
  expect((await repository.loadWorkspace()).profile?.nombres).toBe('María Muñoz')
})

it('shows company fields while editing once the company option is checked', () => {
  fireEvent.click(screen.getByRole('button', { name: 'Editar Empresa' }))
  expect(screen.queryByLabelText('Representante')).toBeNull()
  fireEvent.click(screen.getByLabelText('El trabajo se realiza en una empresa'))
  expect(screen.getByLabelText('Representante')).toBeTruthy()
})

it('groups backup actions in their own tab', () => {
  fireEvent.click(screen.getByRole('tab', { name: 'Respaldo' }))
  expect(card('Respaldo y recuperación').getByRole('button', { name: 'Descargar respaldo completo' })).toBeTruthy()
  expect(card('Recuperar un respaldo').getByLabelText('Importar respaldo ZIP')).toBeTruthy()
  expect(card('Cambiar de estudiante').getByRole('button', { name: 'Crear otro expediente' })).toBeTruthy()
  expect(screen.getByText('Todavía no has descargado uno')).toBeTruthy()
})
