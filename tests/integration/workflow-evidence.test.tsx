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
import { zipSync } from 'fflate'

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
  await screen.findByRole('button', { name: 'Cómo se tramita' })
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
  const missingCard = screen.getByRole('article', {
    name: 'Anexo 1 · Solicitud de modalidad',
  })
  expect(within(missingCard).getByRole('button', { name: /^Subir archivo/ })).toBeTruthy()
  expect(screen.queryByText('resolucion.png')).toBeNull()
  expect(screen.queryByRole('article', { name: /Capturas de los avales/ })).toBeNull()
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
  const endorsements = await repository.addDocumentVersion({
    file: new Blob(['endorsement'], { type: 'image/png' }),
    originalName: 'aval.png',
    category: 'avales',
  })
  const profile = await repository.addDocumentVersion({
    file: new Blob(['profile'], { type: 'image/png' }),
    originalName: 'anexo-2.png',
    category: 'propuesta-perfil',
  })
  const sent = [personal.id, request.id, endorsements.id, profile.id]
  await repository.saveTask({
    ...emptyTask('propuesta'),
    status: 'preparing',
    evidenceVersionIds: sent,
  })
  await repository.recordSubmission({
    taskId: 'propuesta',
    exactVersionIds: sent,
    recipient: 'informacion.fisei',
    sentAt: '2026-11-03T15:00:00.000Z',
    note: '',
  })
  await openTask('propuesta', 'Propuesta y aprobación de modalidad')

  expect(screen.getByRole('tab', { name: /Resultado/ }).getAttribute('aria-selected')).toBe('true')
  expect(screen.getByRole('tab', { name: /Enviar/ }).textContent).toContain('enviado 3 nov')
  expect(screen.getByRole('tab', { name: /Preparar/ }).textContent).toContain('listo')
  expect(screen.queryByRole('heading', { name: 'Tu correo, preparado' })).toBeNull()
  expect(screen.queryByRole('complementary', { name: 'Siguiente paso' })).toBeNull()
  fireEvent.click(screen.getByRole('tab', { name: /Enviar/ }))
  expect(screen.getByRole('heading', { name: 'Tu correo, preparado' })).toBeTruthy()
  expect(screen.queryByLabelText('Destinatario (verificar)')).toBeNull()
  expect(screen.queryByLabelText(/Fecha y hora del envío/)).toBeNull()
  expect(screen.getByRole('button', { name: 'Confirmar envío' })).toBeTruthy()
  fireEvent.click(screen.getByRole('tab', { name: /Resultado/ }))
  const complete = screen.getByRole('button', { name: 'Completar trámite' }) as HTMLButtonElement
  expect(complete.disabled).toBe(true)
  expect(screen.getByRole('article', { name: 'Capturas del correo de respuesta' })).toBeTruthy()

  fireEvent.change(screen.getByLabelText('Subir archivo para Resolución de modalidad y tema'), {
    target: { files: [new File(['resolution'], 'resolucion.png', { type: 'image/png' })] },
  })
  const card = within(await screen.findByRole('article', {
    name: 'Resolución de modalidad y tema',
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
  expect(screen.getByRole('article', { name: 'Acta de sustentación' })).toBeTruthy()
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

it('opens the state history and sources from the task menu', async () => {
  await repository.saveProfile({ ...newProfile(), modalidad: 'research' })
  await repository.saveTask({
    ...emptyTask('propuesta'),
    status: 'preparing',
    history: [{ at: '2026-10-21T14:00:00.000Z', status: 'preparing', note: 'Avales solicitados' }],
  })
  await openTask('propuesta', 'Propuesta y aprobación de modalidad')
  expect(screen.getByText(/^Consigue el aval de tu propuesta/)).toBeTruthy()
  expect(screen.queryByText(/hasta el fin de los exámenes de recuperación/)).toBeNull()
  const avales = within(screen.getByRole('article', { name: 'Capturas de los avales' }))
  const detail = avales.getByRole('button', { name: 'Detalle de Capturas de los avales' })
  expect(document.getElementById(detail.getAttribute('aria-describedby')!)?.textContent)
    .toContain('Coordinador de Carrera')
  fireEvent.click(screen.getByRole('button', { name: 'Cómo se tramita' }))
  const guide = within(await screen.findByRole('dialog', { name: 'Cómo se tramita' }))
  expect(guide.getAllByRole('listitem').length).toBeGreaterThan(3)
  expect(guide.getByText(/exámenes de recuperación/)).toBeTruthy()
  fireEvent.click(guide.getByRole('button', { name: 'Cerrar' }))
  expect(screen.queryByText('Historial de estados')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Más opciones del trámite' }))
  fireEvent.click(screen.getByRole('menuitem', { name: 'Historial de estados' }))
  const history = within(await screen.findByRole('dialog', { name: 'Historial de estados' }))
  expect(history.getByText('Avales solicitados')).toBeTruthy()
  fireEvent.click(history.getByRole('button', { name: 'Cerrar' }))
  fireEvent.click(screen.getByRole('button', { name: 'Más opciones del trámite' }))
  fireEvent.click(screen.getByRole('menuitem', { name: 'Fuentes y criterios' }))
  expect(within(await screen.findByRole('dialog', { name: 'Fuentes y criterios' }))
    .getByRole('link', { name: /UT-05/ })).toBeTruthy()
})

function annex5Docx(dates: string[]) {
  const paragraphs = [
    'ANEXO 5',
    'INFORME MENSUAL DEL AVANCE DEL TRABAJO DE TITULACIÓN',
    'FECHA: 03/11/2026',
    'NOMBRE DEL ESTUDIANTE: María Muñoz',
    'TEMA DEL TRABAJO DE TITULACIÓN: Tema aprobado',
    'FECHA DE APROBACIÓN DE LA PROPUESTA DEL PERFIL DEL TRABAJO DE TITULACIÓN POR EL CONSEJO DIRECTIVO: 15/07/2026',
    'PORCENTAJE DE AVANCE DE ACUERDO AL CRONOGRAMA: 40 %.',
    ...dates.map((date) => `${date} Avance del capítulo`),
    'OBSERVACIONES: ninguna',
  ]
  const xml = `<w:document><w:body>${paragraphs
    .map((text) => `<w:p><w:r><w:t>${text}</w:t></w:r></w:p>`)
    .join('')}</w:body></w:document>`
  return zipSync({ 'word/document.xml': new Uint8Array(Buffer.from(xml, 'utf8')) }) as Uint8Array<ArrayBuffer>
}

it('confirms a submission with one button and moves to Resultado', async () => {
  await repository.saveProfile({ ...newProfile(), modalidad: 'complexivo' })
  const identity = await repository.addDocumentVersion({
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
    evidenceVersionIds: [request.id, identity.id],
  })
  await openTask('propuesta', 'Propuesta y aprobación de modalidad')
  fireEvent.click(screen.getByRole('tab', { name: /Enviar/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar envío' }))
  await waitFor(() =>
    expect(screen.getByRole('tab', { name: /Resultado/ }).getAttribute('aria-selected')).toBe('true'))
  const workspace = await repository.loadWorkspace()
  expect(workspace.submissions).toHaveLength(1)
  expect(new Set(workspace.submissions[0].exactVersionIds)).toEqual(new Set([request.id, identity.id]))
  expect(workspace.tasks.find((task) => task.definitionId === 'propuesta')?.status).toBe('submitted')
})
it('shows one card per month and completes the monthly reports by itself once all are signed', async () => {
  await repository.saveProfile({ ...newProfile(), modalidad: 'research', tema: 'Tema aprobado' })
  await repository.saveTask({ ...emptyTask('propuesta'), status: 'completed' })
  await repository.saveSetting('monthlyFrom', '2026-08')
  await repository.saveSetting('monthlyTo', '2026-09')
  await repository.addDocumentVersion({
    file: new Blob(['august'], { type: 'image/png' }),
    originalName: 'agosto.png',
    category: 'mensual',
    signatureStatus: 'reported-signed',
    reportAnalysis: { recognized: true, month: '2026-08', progress: 20 },
  })
  await openTask('desarrollo', 'Informes mensuales de avance')
  expect(screen.queryByRole('tablist')).toBeNull()
  expect(screen.queryByRole('heading', { name: 'Tu correo, preparado' })).toBeNull()
  expect(screen.getByRole('article', { name: 'Agregar mes' })).toBeTruthy()
  expect(screen.getByText(/0 de 2 meses listos/)).toBeTruthy()

  const august = within(screen.getByRole('article', { name: 'Anexo 5 de agosto 2026' }))
  fireEvent.click(august.getByRole('checkbox', { name: 'Incluir agosto.png en esta entrega' }))
  await screen.findByText(/1 de 2 meses listos/)
  const progress = within(screen.getByRole('region', { name: 'Avance de la tesis' }))
  expect((progress.getByRole('progressbar') as HTMLProgressElement).value).toBe(20)
  expect(progress.getByText('20 %')).toBeTruthy()
  expect(progress.getByText('Según el Anexo 5 de agosto 2026 · 1 de 2 meses listos')).toBeTruthy()
  expect(within(screen.getByRole('article', { name: 'Anexo 5 de agosto 2026' })).getByText('Avance declarado')).toBeTruthy()
  const status = async () =>
    (await repository.loadWorkspace()).tasks.find((task) => task.definitionId === 'desarrollo')?.status
  await waitFor(async () => expect(await status()).toBe('preparing'))

  const september = within(screen.getByRole('article', { name: 'Anexo 5 de septiembre 2026' }))
  fireEvent.change(september.getByLabelText('Subir Anexo 5 de septiembre 2026'), {
    target: { files: [new File([annex5Docx(['10/08/2026'])], 'septiembre.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })] },
  })
  expect(await september.findByText('El documento indica agosto 2026.')).toBeTruthy()
  fireEvent.click(await september.findByRole('checkbox', { name: /^Firmado por el tutor/ }))
  await waitFor(async () => expect(await status()).toBe('completed'))
  expect(await screen.findByText(/2 de 2 meses listos/)).toBeTruthy()

  fireEvent.click(within(screen.getByRole('article', { name: 'Anexo 5 de septiembre 2026' }))
    .getByRole('checkbox', { name: /^Firmado por el tutor/ }))
  await waitFor(async () => expect(await status()).toBe('preparing'))
})

it('lets unassigned reports get a month and adds a month card', async () => {
  await repository.saveProfile({ ...newProfile(), modalidad: 'research' })
  await repository.saveSetting('monthlyFrom', '2026-08')
  await repository.saveSetting('monthlyTo', '2026-08')
  const scanned = await repository.addDocumentVersion({
    file: new Blob(['scan'], { type: 'image/png' }),
    originalName: 'escaneo.png',
    category: 'mensual',
    reportAnalysis: { recognized: false },
  })
  await repository.saveTask({ ...emptyTask('desarrollo'), evidenceVersionIds: [scanned.id] })
  await openTask('desarrollo', 'Informes mensuales de avance')
  const unassigned = within(screen.getByRole('article', { name: 'Informes sin mes' }))
  fireEvent.change(unassigned.getByLabelText('Mes del informe escaneo.png'), { target: { value: '2026-08' } })
  await waitFor(async () =>
    expect((await repository.loadWorkspace()).settings[`monthly-month:${scanned.documentId}`]).toBe('2026-08'))
  fireEvent.click(within(screen.getByRole('article', { name: 'Agregar mes' })).getByRole('button', { name: 'Agregar mes' }))
  fireEvent.change(screen.getByLabelText('Mes a agregar'), { target: { value: '2026-09' } })
  expect(await screen.findByRole('article', { name: 'Anexo 5 de septiembre 2026' })).toBeTruthy()
  expect((await repository.loadWorkspace()).settings.monthlyTo).toBe('2026-09')
})

it('creates the Anexo 11 from the uploaded Anexo 5 and keeps the format notes in a tooltip', async () => {
  await repository.saveProfile({
    ...newProfile(),
    modalidad: 'research',
    nombres: 'María Muñoz',
    carrera: 'Software',
    tema: 'Tema aprobado',
    tutor: 'Ing. Tutor',
    aprobacionFecha: '2026-07-15',
  })
  await repository.saveTask({ ...emptyTask('propuesta'), status: 'completed' })
  const reports = []
  for (const [month, activities] of [
    ['2026-08', [{ date: '2026-08-20', description: 'Diseño' }]],
    ['2026-09', [{ date: '2026-09-03', description: 'Pruebas' }, { date: '2026-09-17', description: 'Ajustes' }]],
  ] as const)
    reports.push(await repository.addDocumentVersion({
      file: new Blob([month], { type: 'image/png' }),
      originalName: `anexo-5-${month}.png`,
      category: 'mensual',
      signatureStatus: 'reported-signed',
      reportAnalysis: { recognized: true, month, progress: 100, activities: [...activities] },
    }))
  await repository.saveSetting('monthlyFrom', '2026-08')
  await repository.saveSetting('monthlyTo', '2026-09')
  await repository.saveTask({
    ...emptyTask('desarrollo'),
    status: 'completed',
    evidenceVersionIds: reports.map((report) => report.id),
  })
  await openTask('informe-final', 'Informe final de avance del tutor')
  expect(screen.getByRole('tab', { name: /Preparar/ }).textContent).toContain('0/1 docs')
  expect(screen.getByText(/actividades de los 2 Anexo 5/)).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Crear Anexo 11' }))

  const document = within(await screen.findByRole('article', { name: 'Documento editable' }))
  expect((document.getByLabelText('Fecha de actividad 1') as HTMLInputElement).value).toBe('2026-08-20')
  expect((document.getByLabelText('Fecha de actividad 3') as HTMLInputElement).value).toBe('2026-09-17')
  expect(document.queryByText(/QUIPUX/, { selector: 'p' })).toBeNull()
  const notes = document.getByRole('button', { name: 'Detalle de Notas del formato' })
  expect(window.document.getElementById(notes.getAttribute('aria-describedby')!)?.textContent).toContain('QUIPUX')
  await waitFor(() =>
    expect(screen.getByRole('tab', { name: /Preparar/ }).textContent).toContain('listo'))
  const draft = (await repository.loadWorkspace()).drafts.find((item) => item.templateId === 'anexo-11')
  expect(draft?.fields.avance).toBe('100')

  await repository.addDocumentVersion({
    file: new Blob(['unsigned'], { type: 'application/pdf' }),
    originalName: 'anexo-11-sin-firma.pdf',
    category: 'final',
    sourceDraftId: draft!.id,
    revision: draft!.revision,
  })
  fireEvent.click(screen.getByRole('tab', { name: /Resultado/ }))
  const signed = within(await screen.findByRole('article', { name: 'Anexo 11 firmado' }))
  expect(signed.queryByText('anexo-11-sin-firma.pdf')).toBeNull()
  expect(signed.getByRole('button', { name: /^Subir archivo/ })).toBeTruthy()
})
