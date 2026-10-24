// @vitest-environment jsdom
import { Blob as NodeBlob, File as NodeFile } from 'node:buffer'
import { webcrypto } from 'node:crypto'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { WorkspaceProvider } from '../../src/app/WorkspaceContext'
import { AppShell } from '../../src/app/AppShell'
import { repository } from '../../src/storage/repository'
import { newProfile } from '../../src/domain/types'

const renderAnnex = vi.hoisted(() => vi.fn(async () => new Blob(['documento'])))
vi.mock('../../src/export/render-annex', () => ({ renderAnnex }))

beforeEach(async () => {
  vi.stubGlobal('crypto', webcrypto)
  vi.stubGlobal('Blob', NodeBlob)
  vi.stubGlobal('File', NodeFile)
  await repository.db.open()
  await repository.db.transaction('rw', repository.db.tables, async () => {
    for (const table of repository.db.tables) await table.clear()
  })
  window.history.replaceState(null, '', '#/proceso/calificadores-research')
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('fills the Anexo 10 from the profile and downloads it without storing it in Documents', async () => {
  await repository.saveProfile({
    ...newProfile(),
    nombres: 'María Muñoz Vásquez',
    cedula: '1804567890',
    email: 'mmunoz@uta.edu.ec',
    carrera: 'Software',
    tema: 'Accesibilidad web',
  })
  const createObjectURL = vi.fn(() => 'blob:anexo-10')
  URL.createObjectURL = createObjectURL
  URL.revokeObjectURL = vi.fn()
  render(
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>,
  )
  await screen.findByRole('button', { name: 'Cómo se tramita' })
  const card = within(screen.getByRole('article', { name: 'Anexo 10 · Solicitud' }))
  fireEvent.click(card.getByRole('button', { name: 'Formato' }))

  const dialog = within(await screen.findByRole('dialog', { name: 'Anexo 10 · Calificadores de Proyecto' }))
  const document = within(dialog.getByRole('article', { name: 'Documento editable' }))
  expect(document.getByRole('textbox', { name: 'Lugar' }).textContent).toBe('Ambato')
  expect(document.getAllByText(/María Muñoz Vásquez/).length).toBeGreaterThan(0)
  expect(document.queryByText(/ADJUNTAR/, { selector: 'p' })).toBeNull()

  const recipient = document.getByRole('textbox', { name: /destinatario/ })
  recipient.textContent = 'Ing. Presidente del Consejo'
  fireEvent.input(recipient)
  fireEvent.click(dialog.getByRole('button', { name: 'Descargar Word' }))

  await waitFor(() => expect(createObjectURL).toHaveBeenCalledOnce())
  expect(renderAnnex).toHaveBeenCalledWith(
    expect.objectContaining({ templateId: 'anexo-10-research' }),
    'docx',
  )
  const workspace = await repository.loadWorkspace()
  expect(workspace.versions).toHaveLength(0)
  expect(workspace.drafts.find((draft) => draft.templateId === 'anexo-10-research')?.fields.destinatario)
    .toBe('Ing. Presidente del Consejo')
  expect(card.getByText('Pendiente')).toBeTruthy()
})

it('fills the company compliance letter from the company data in the profile', async () => {
  await repository.saveProfile({
    ...newProfile(),
    nombres: 'María Muñoz Vásquez',
    cedula: '1804567890',
    carrera: 'Software',
    tema: 'Accesibilidad web',
    aplicaEmpresa: true,
    empresa: 'Andina Software S.A.',
    representante: 'Ana Gerente',
    cargoRepresentante: 'Gerente General',
    cedulaRepresentante: '1700000000',
    emailRepresentante: 'gerencia@andina.test',
    celularRepresentante: '0991112223',
  })
  render(
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>,
  )
  await screen.findByRole('button', { name: 'Cómo se tramita' })
  const card = within(screen.getByRole('article', { name: 'Empresa al 100 %' }))
  fireEvent.click(card.getByRole('button', { name: 'Formato' }))

  const dialog = within(await screen.findByRole('dialog', { name: /Cumplimiento empresarial/ }))
  const document = within(dialog.getByRole('article', { name: 'Documento editable' }))
  expect(document.getByRole('textbox', { name: 'Empresa' }).textContent).toBe('Andina Software S.A.')
  expect(document.getByRole('textbox', { name: 'Celular del representante' }).textContent).toBe('0991112223')
  expect(document.queryByText(/De mi consideración/)).toBeNull()
  expect(document.queryByRole('textbox', { name: 'Teléfono celular' })).toBeNull()
})

it('shows the company data saved in the profile after the format was first opened', async () => {
  const profile = {
    ...newProfile(),
    nombres: 'María Muñoz Vásquez',
    cedula: '1804567890',
    carrera: 'Software',
    tema: 'Accesibilidad web',
    aplicaEmpresa: true,
  }
  await repository.saveProfile(profile)
  render(
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>,
  )
  await screen.findByRole('button', { name: 'Cómo se tramita' })
  const card = within(screen.getByRole('article', { name: 'Empresa al 100 %' }))
  fireEvent.click(card.getByRole('button', { name: 'Formato' }))
  const first = within(await screen.findByRole('dialog', { name: /Cumplimiento empresarial/ }))
  expect(first.getAllByRole('textbox', { name: 'Representante de la empresa' }).map((item) => item.textContent))
    .toEqual(['', ''])
  fireEvent.click(first.getByRole('button', { name: 'Cerrar' }))

  await repository.saveProfile({ ...profile, representante: 'Ana Gerente', celularRepresentante: '0991112223' })
  cleanup()
  render(
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>,
  )
  await screen.findByRole('button', { name: 'Cómo se tramita' })
  fireEvent.click(
    within(screen.getByRole('article', { name: 'Empresa al 100 %' })).getByRole('button', { name: 'Formato' }),
  )
  const dialog = within(await screen.findByRole('dialog', { name: /Cumplimiento empresarial/ }))
  expect(dialog.getAllByRole('textbox', { name: 'Representante de la empresa' }).map((item) => item.textContent))
    .toEqual(['Ana Gerente', 'Ana Gerente'])
  expect(dialog.getByRole('textbox', { name: 'Celular del representante' }).textContent).toBe('0991112223')
})

it('fills the Anexo 14 of the student modality with address and institutional email', async () => {
  await repository.saveProfile({
    ...newProfile(),
    nombres: 'María Muñoz Vásquez',
    cedula: '1804567890',
    email: 'mmunoz@uta.edu.ec',
    direccion: 'Av. Los Chasquis, Ambato',
    carrera: 'Software',
    titulo: 'Ingeniera de Software',
    tema: 'Accesibilidad web',
  })
  window.history.replaceState(null, '', '#/proceso/dia-hora')
  render(
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>,
  )
  await screen.findByRole('button', { name: 'Cómo se tramita' })
  fireEvent.click(
    within(screen.getByRole('article', { name: 'Anexo 14 · Solicitud' })).getByRole('button', { name: 'Formato' }),
  )
  const dialog = within(await screen.findByRole('dialog', { name: /Anexo 14/ }))
  const document = within(dialog.getByRole('article', { name: 'Documento editable' }))
  expect(document.getByText(/MODALIDAD: PROYECTO DE INVESTIGACIÓN/)).toBeTruthy()
  expect(document.getByRole('textbox', { name: 'Dirección' }).textContent).toBe('Av. Los Chasquis, Ambato')
  expect(document.getByText(/Correo electrónico institucional/)).toBeTruthy()
})
