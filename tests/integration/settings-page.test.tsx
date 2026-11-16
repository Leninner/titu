// @vitest-environment jsdom
import { Blob as NodeBlob, File as NodeFile } from 'node:buffer'
import { webcrypto } from 'node:crypto'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { WorkspaceProvider } from '../../src/app/WorkspaceContext'
import { AppShell } from '../../src/app/AppShell'
import { repository } from '../../src/storage/repository'
import { newProfile } from '../../src/domain/types'

vi.mock('../../src/features/documents/extract-text', () => ({
  extractText: async (file: File) =>
    (await file.text()).startsWith('resolucion')
      ? 'Resolución 0942-P-CD-FISEI-UTA-2026 en sesión ordinaria del día 21 de agosto de 2026, estudiante de la Carrera de Software. DESIGNAR COMO TUTOR/A PARA EL TRABAJO A EL/LA ING. JOSÉ NÚÑEZ MG., CONFORME'
      : 'texto sin datos',
}))

const pdf = (content: string) => new NodeFile([content], 'resolucion.pdf', { type: 'application/pdf' })

beforeEach(async () => {
  vi.stubGlobal('crypto', webcrypto)
  vi.stubGlobal('Blob', NodeBlob)
  vi.stubGlobal('File', NodeFile)
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

it('fills the confirmed data from the approval resolution and stores the PDF', async () => {
  fireEvent.change(screen.getByLabelText('Subir resolución de aprobación'), {
    target: { files: [pdf('resolucion firmada')] },
  })
  const review = within(await screen.findByRole('region', { name: 'Datos encontrados en la resolución' }))
  expect(review.getByText('0942-P-CD-FISEI-UTA-2026')).toBeTruthy()
  expect(review.getByText('Ya coincide')).toBeTruthy()
  fireEvent.click(review.getByLabelText('Tutor'))
  fireEvent.click(review.getByRole('button', { name: 'Usar datos marcados' }))
  await waitFor(async () => {
    const workspace = await repository.loadWorkspace()
    expect(workspace.profile?.aprobacionResolucion).toBe('0942-P-CD-FISEI-UTA-2026')
    expect(workspace.profile?.tutor).toBe('')
    expect(workspace.documents.map((document) => document.category)).toEqual(['resolucion'])
  })
  expect(await screen.findByText('Datos actualizados y resolución guardada en Documentos')).toBeTruthy()
  expect(card('Titulación').getByText('0942-P-CD-FISEI-UTA-2026')).toBeTruthy()
})

it('warns without changing the profile when the PDF has no resolution data', async () => {
  fireEvent.change(screen.getByLabelText('Subir resolución de aprobación'), {
    target: { files: [pdf('otro documento')] },
  })
  expect((await screen.findByRole('alert')).textContent).toContain('No encontramos datos')
  expect((await repository.loadWorkspace()).profile?.aprobacionResolucion).toBe('')
})
