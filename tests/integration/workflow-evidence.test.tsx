// @vitest-environment jsdom
import { Blob as NodeBlob, File as NodeFile } from 'node:buffer'
import { webcrypto } from 'node:crypto'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { WorkspaceProvider } from '../../src/app/WorkspaceContext'
import { AppShell } from '../../src/app/AppShell'
import { repository } from '../../src/storage/repository'
import { newProfile } from '../../src/domain/types'
import { emptyTask } from '../../src/domain/task-record'

beforeEach(async () => {
  vi.stubGlobal('crypto', webcrypto)
  vi.stubGlobal('Blob', NodeBlob)
  vi.stubGlobal('File', NodeFile)
  await repository.db.open()
  await repository.db.transaction('rw', repository.db.tables, async () => {
    for (const table of repository.db.tables) await table.clear()
  })
  window.history.replaceState(null, '', '#/inicio')
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

async function openTask(id: string, title: string) {
  window.history.replaceState(null, '', `#/proceso/${id}`)
  render(
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>,
  )
  await screen.findByRole('heading', { name: title, level: 1 })
}

it('shows only relevant versions inside each requirement and places the return link in the header', async () => {
  await repository.saveProfile({ ...newProfile(), modalidad: 'complexivo' })
  const personal = await repository.addDocumentVersion({
    file: new Blob(['personal'], { type: 'image/png' }),
    originalName: 'cedula.png',
    category: 'personal',
  })
  await repository.addDocumentVersion({
    file: new Blob(['resolution'], { type: 'image/png' }),
    originalName: 'resolucion.png',
    category: 'resolucion',
  })
  await openTask('propuesta', 'Propuesta y aprobación de modalidad')

  const location = within(screen.getByRole('banner')).getByRole('navigation', {
    name: 'Ubicación del trámite',
  })
  expect(within(location).getByRole('link', { name: 'Mi proceso' }).getAttribute('href')).toBe(
    '#/proceso',
  )
  expect(screen.queryByRole('heading', { name: 'Archivos de esta entrega' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Cómo se guardan los archivos' })).toBeNull()
  // Every requirement is its own card, so done and missing ones show side by side.
  const doneCard = within(screen.getByRole('article', {
    name: 'Cédula y papeleta de votación',
  }))
  expect(doneCard.getByText('Listo')).toBeTruthy()
  expect(doneCard.getByText('cedula.png')).toBeTruthy()
  const missingCard = screen.getByRole('article', { name: 'Anexo 1 · Solicitud de modalidad, firmada por estudiante y tutor' })
  expect(within(missingCard).getByRole('button', { name: /^Subir archivo/ })).toBeTruthy()
  expect(screen.queryByText('resolucion.png')).toBeNull()
  const scrollToMissing = vi.fn()
  Object.defineProperty(missingCard, 'scrollIntoView', { value: scrollToMissing })
  const nextStep = within(screen.getByRole('complementary', { name: 'Siguiente paso' }))
  fireEvent.click(nextStep.getByRole('button', { name: 'Ver requisito' }))
  expect(scrollToMissing).toHaveBeenCalledOnce()
  expect(personal.id).toBeTruthy()
})

it('uploads from a requirement card into Documents and links the new version to the task', async () => {
  await repository.saveProfile({ ...newProfile(), modalidad: 'complexivo' })
  await openTask('propuesta', 'Propuesta y aprobación de modalidad')

  const card = screen.getByRole('article', {
    name: 'Cédula y papeleta de votación',
  })
  expect(within(card).getByRole('button', { name: /^Subir archivo/ })).toBeTruthy()
  fireEvent.drop(card, {
    dataTransfer: { files: [new File(['identity'], 'cedula.png', { type: 'image/png' })] },
  })

  await waitFor(async () => {
    const workspace = await repository.loadWorkspace()
    expect(workspace.documents).toHaveLength(1)
    expect(workspace.documents[0].category).toBe('personal')
    expect(workspace.versions).toHaveLength(1)
    expect(workspace.tasks[0].evidenceVersionIds).toContain(workspace.versions[0].id)
  })
  expect(within(card).getByText('Copia de Cédula.png')).toBeTruthy()
  expect(within(card).getByRole('button', { name: /Vista previa/ })).toBeTruthy()
  expect(within(card).queryByRole('button', { name: /Agregar otro archivo/ })).toBeNull()
  expect(within(card).getByRole('button', { name: 'Reemplazar Copia de Cédula.png' })).toBeTruthy()

  await act(async () => {
    window.history.replaceState(null, '', '#/documentos')
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  })
  const documents = within(await screen.findByRole('article', { name: 'Identificación' }))
  expect(documents.getByRole('heading', { name: 'Copia de Cédula.png', level: 3 })).toBeTruthy()
  fireEvent.click(documents.getByRole('button', { name: /Historial/ }))
  expect(await documents.findByRole('heading', { name: 'Copia de Cédula.png', level: 4 })).toBeTruthy()
})

it('limits development evidence to monthly Annex 5 files', async () => {
  await repository.saveProfile({ ...newProfile(), modalidad: 'research' })
  await repository.addDocumentVersion({
    file: new Blob(['monthly'], { type: 'application/pdf' }),
    originalName: 'anexo-5-octubre.pdf',
    category: 'mensual',
  })
  await repository.addDocumentVersion({
    file: new Blob(['other'], { type: 'application/pdf' }),
    originalName: 'informe-final.pdf',
    category: 'final',
  })
  await openTask('desarrollo', 'Informes mensuales de avance')

  expect(screen.getByRole('heading', { name: /Anexo 5/ })).toBeTruthy()
  expect(screen.getByRole('checkbox', { name: /anexo-5-octubre.pdf/ })).toBeTruthy()
  expect(screen.queryByText('informe-final.pdf')).toBeNull()
  expect(screen.getByRole('link', { name: 'Crear Anexo 5' }).getAttribute('href')).toBe(
    '#/anexos',
  )

  fireEvent.change(screen.getByLabelText('Subir archivo para Anexo 5 · Informes mensuales firmados por el tutor'), {
    target: {
      files: [
        new File(['monthly report'], 'anexo-5-noviembre.docx', {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }),
      ],
    },
  })
  await waitFor(async () => {
    const workspace = await repository.loadWorkspace()
    expect(workspace.versions).toHaveLength(3)
    expect(workspace.documents.find((document) => document.name === 'Informe mensual Anexo 5.docx')?.category).toBe('mensual')
    expect(workspace.tasks[0].evidenceVersionIds).toContain(
      workspace.versions.find((version) => version.originalName === 'Informe mensual Anexo 5.docx')?.id,
    )
  })
  const card = screen.getByRole('article', {
    name: 'Anexo 5 · Informes mensuales firmados por el tutor',
  })
  fireEvent.click(within(card).getByRole('checkbox', {
    name: /Este archivo ya tiene las firmas requeridas: Informe mensual Anexo 5.docx/,
  }))
  await waitFor(async () => {
    const workspace = await repository.loadWorkspace()
    const selected = workspace.versions.find((version) =>
      workspace.tasks[0].evidenceVersionIds.includes(version.id) &&
      version.originalName === 'Informe mensual Anexo 5.docx',
    )
    expect(selected?.signatureStatus).toBe('reported-signed')
  })
})

it('previews an uploaded image without leaving the workflow', async () => {
  await repository.saveProfile({ ...newProfile(), modalidad: 'complexivo' })
  await repository.addDocumentVersion({
    file: new Blob(['image'], { type: 'image/png' }),
    originalName: 'cedula.png',
    category: 'personal',
  })
  class PreviewURL extends URL { }
  const createObjectURL = vi.fn(() => 'blob:preview')
  const revokeObjectURL = vi.fn()
  PreviewURL.createObjectURL = createObjectURL
  PreviewURL.revokeObjectURL = revokeObjectURL
  vi.stubGlobal('URL', PreviewURL)
  await openTask('propuesta', 'Propuesta y aprobación de modalidad')
  const card = screen.getByRole('article', {
    name: 'Cédula y papeleta de votación',
  })
  fireEvent.click(within(card).getByRole('button', { name: /Vista previa/ }))
  const preview = await screen.findByRole('dialog', { name: /Vista previa de cedula.png/ })
  expect((await within(preview).findByRole('img', { name: 'Vista previa de cedula.png' })).getAttribute('src')).toBe('blob:preview')
  fireEvent.click(within(preview).getByRole('button', { name: 'Cerrar vista previa' }))
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(createObjectURL).toHaveBeenCalledOnce()
  expect(revokeObjectURL).toHaveBeenCalledWith('blob:preview')
})

it('registers the Council resolution in Resultado, completes the proposal and reuses it for graders', async () => {
  await repository.saveProfile({ ...newProfile(), modalidad: 'research' })
  const personal = await repository.addDocumentVersion({
    file: new Blob(['identity'], { type: 'image/png' }),
    originalName: 'cedula.png',
    category: 'personal',
  })
  const request = await repository.addDocumentVersion({
    file: new Blob(['request'], { type: 'image/png' }),
    originalName: 'anexo-1.png',
    category: 'solicitud',
    signatureStatus: 'reported-signed',
  })
  await repository.saveTask({
    ...emptyTask('propuesta'),
    status: 'preparing',
    requirementChecks: { avales: true },
    evidenceVersionIds: [personal.id, request.id],
  })
  await repository.recordSubmission({
    taskId: 'propuesta',
    exactVersionIds: [personal.id, request.id],
    recipient: 'informacion.fisei',
    sentAt: '2026-11-03T15:00:00.000Z',
    note: '',
  })
  await openTask('propuesta', 'Propuesta y aprobación de modalidad')

  expect(screen.getByRole('tab', { name: /Resultado/ }).getAttribute('aria-selected')).toBe('true')
  expect(screen.getByRole('tab', { name: /Enviar/ }).textContent).toContain('enviado 3 nov')
  expect(screen.getByRole('tab', { name: /Preparar/ }).textContent).toContain('listo')
  expect(screen.queryByRole('heading', { name: 'Tu correo, preparado' })).toBeNull()
  fireEvent.click(screen.getByRole('tab', { name: /Enviar/ }))
  expect(screen.getByRole('heading', { name: 'Tu correo, preparado' })).toBeTruthy()
  const scrollToOutput = vi.fn()
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { value: scrollToOutput, configurable: true })
  const nextStep = within(screen.getByRole('complementary', { name: 'Siguiente paso' }))
  fireEvent.click(nextStep.getByRole('button', { name: 'Ver resultado' }))
  expect(screen.getByRole('tab', { name: /Resultado/ }).getAttribute('aria-selected')).toBe('true')
  expect(scrollToOutput.mock.contexts[0]).toBe(document.getElementById('task-output-resolucion'))
  delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView
  const complete = screen.getByRole('button', { name: 'Completar trámite' }) as HTMLButtonElement
  expect(complete.disabled).toBe(true)
  expect(screen.getByRole('article', { name: 'Capturas del correo de respuesta' })).toBeTruthy()

  fireEvent.change(screen.getByLabelText('Subir archivo para Resolución de Consejo Directivo de modalidad y tema'), {
    target: { files: [new File(['resolution'], 'resolucion.png', { type: 'image/png' })] },
  })
  const card = within(await screen.findByRole('article', {
    name: 'Resolución de Consejo Directivo de modalidad y tema',
  }))
  expect(await card.findByText(
    'Se usa en: Designación de calificadores del Proyecto · Solicitud de fecha de sustentación o incorporación',
  )).toBeTruthy()
  fireEvent.click(await card.findByRole('checkbox', {
    name: 'Este archivo ya tiene las firmas requeridas: Resolución de Consejo Directivo.png',
  }))
  await waitFor(() => expect(complete.disabled).toBe(false))
  fireEvent.click(complete)
  await waitFor(async () => {
    const workspace = await repository.loadWorkspace()
    const proposal = workspace.tasks.find((task) => task.definitionId === 'propuesta')!
    expect(proposal.status).toBe('completed')
    expect(proposal.outputVersionIds).toHaveLength(1)
    expect(workspace.tasks.find((task) => task.definitionId === 'calificadores-research')
      ?.evidenceVersionIds).toEqual(proposal.outputVersionIds)
  })
  expect(screen.getByRole('button', { name: 'Reabrir trámite' })).toBeTruthy()

  await act(async () => {
    window.history.replaceState(null, '', '#/proceso/calificadores-research')
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  })
  await screen.findByRole('heading', { name: 'Designación de calificadores del Proyecto', level: 1 })
  expect(screen.getByRole('tab', { name: /Preparar/ }).getAttribute('aria-selected')).toBe('true')
  const resolution = screen.getByRole('checkbox', {
    name: 'Incluir Resolución de Consejo Directivo.png en esta entrega',
  }) as HTMLInputElement
  expect(resolution.checked).toBe(true)
})

it('shows only Resultado for a workflow without inputs and records an observation', async () => {
  await repository.saveProfile({ ...newProfile(), modalidad: 'research' })
  await openTask('defensa', 'Sustentación o incorporación')
  expect(screen.queryByRole('tablist')).toBeNull()
  expect(screen.getByRole('article', { name: 'Acta de sustentación o resultado de la incorporación' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Hay una observación' }))
  fireEvent.change(screen.getByLabelText('Observación recibida'), {
    target: { value: 'El tribunal pidió corregir el acta' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Guardar observación' }))
  await waitFor(async () => {
    const task = (await repository.loadWorkspace()).tasks.find((item) => item.definitionId === 'defensa')
    expect(task?.status).toBe('observed')
    expect(task?.history.at(-1)?.note).toBe('El tribunal pidió corregir el acta')
  })
})
