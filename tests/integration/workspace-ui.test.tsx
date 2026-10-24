// @vitest-environment jsdom
import { Blob as NodeBlob, File as NodeFile } from 'node:buffer'
import { webcrypto } from 'node:crypto'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { WorkspaceProvider } from '../../src/app/WorkspaceContext'
import { AppShell } from '../../src/app/AppShell'
import { repository } from '../../src/storage/repository'
import { newProfile } from '../../src/domain/types'
import { catalog } from '../../src/catalog'
import { applicableWorkflows } from '../../src/domain/workflow'
import { buildFinalReportFromUploads } from '../../src/domain/final-report'

vi.mock('../../src/features/annexes/AnnexPreview', () => ({
  AnnexPreview: () => <aside aria-label="Vista previa de prueba" />,
}))

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
function mount() {
  return render(
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>,
  )
}
async function navigate(hash: string) {
  await act(async () => {
    window.history.replaceState(null, '', hash)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  })
}
async function createMonthly() {
  await navigate('#/anexos')
  fireEvent.change(await screen.findByLabelText('Mes del informe'), {
    target: { value: '2026-10' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Crear informe mensual' }))
  return screen.findByLabelText('Nombre del borrador')
}
async function openCategory(name: string) {
  return screen.findByRole('article', { name })
}
async function expectEveryApplicableWorkflowOnce() {
  const workspace = await repository.loadWorkspace()
  const expected = applicableWorkflows(workspace, catalog)
    .filter((definition) => !definition.optional)
    .map((definition) => `#/proceso/${definition.id}`)
    .sort()
  const visible = Array.from(document.querySelectorAll<HTMLAnchorElement>('.workflow-row'))
    .map((link) => link.getAttribute('href'))
    .sort()
  expect(visible).toEqual(expected)
}
it('onboards an advanced student without completing previous requirements and renders hash routes', async () => {
  mount()
  fireEvent.change(await screen.findByLabelText('¿Cómo te llamas?'), {
    target: { value: 'Estudiante de prueba' },
  })
  fireEvent.change(screen.getByLabelText('¿En qué etapa estás?'), {
    target: { value: 'sustentacion' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Crear mi expediente' }))
  await screen.findByRole('navigation', { name: 'Principal' })
  const workspace = await repository.loadWorkspace()
  expect(workspace.profile?.nombres).toBe('Estudiante de prueba')
  expect(workspace.profile?.initialStage).toBe('sustentacion')
  expect(workspace.tasks).toEqual([])
  await navigate('#/documentos')
  expect(await screen.findByRole('heading', { name: 'Tus documentos', level: 1 })).toBeTruthy()
  await navigate('#/fechas')
  expect(await screen.findByRole('heading', { name: 'Fechas', level: 1 })).toBeTruthy()
  await navigate('#/ajustes')
  expect(await screen.findByRole('heading', { name: 'Tu expediente', level: 1 })).toBeTruthy()
})
it('groups research workflows under the three source folders and keeps the guide separate', async () => {
  await repository.saveProfile({ ...newProfile(), modalidad: 'research' })
  mount()
  await screen.findByRole('navigation', { name: 'Principal' })
  await navigate('#/proceso')
  await screen.findByRole('heading', { name: 'Mi proceso', level: 1 })
  fireEvent.click(await screen.findByRole('button', { name: 'Lista' }))

  const guide = within(screen.getByRole('region', { name: 'Guía del informe final' }))
  expect(guide.getByRole('link', { name: /Guía de elaboración/ })).toBeTruthy()
  expect(guide.getByRole('link', { name: /Anexo A/ })).toBeTruthy()

  const work = within(screen.getByRole('region', { name: 'Proceso trabajo de titulación' }))
  expect(work.getByRole('link', { name: /Propuesta y aprobación de modalidad/ })).toBeTruthy()
  expect(work.getByRole('link', { name: /Informe final de avance del tutor/ })).toBeTruthy()

  const graders = within(screen.getByRole('region', { name: 'Designación calificadores' }))
  expect(graders.getByRole('link', { name: /Designación de calificadores del Proyecto/ })).toBeTruthy()
  expect(graders.queryByRole('link', { name: /Recibir las dos calificaciones/ })).toBeNull()

  const defense = within(screen.getByRole('region', { name: 'Sustentación' }))
  expect(defense.getByRole('link', { name: /Certificado de aptitud legal/ })).toBeTruthy()
  expect(defense.getByRole('link', { name: /Sustentación o incorporación/ })).toBeTruthy()
  await expectEveryApplicableWorkflowOnce()
})
it('keeps the complexivo exam in the process and marks graders as not applicable', async () => {
  await repository.saveProfile({ ...newProfile(), modalidad: 'complexivo' })
  mount()
  await screen.findByRole('navigation', { name: 'Principal' })
  await navigate('#/proceso')
  await screen.findByRole('heading', { name: 'Mi proceso', level: 1 })
  fireEvent.click(await screen.findByRole('button', { name: 'Lista' }))

  const work = within(screen.getByRole('region', { name: 'Proceso trabajo de titulación' }))
  expect(work.getByRole('link', { name: /Examen complexivo/ })).toBeTruthy()
  const graders = within(screen.getByRole('region', { name: 'Designación calificadores' }))
  expect(graders.getByText('No aplica a tu modalidad.')).toBeTruthy()
  expect(graders.queryByRole('link', { name: /calificadores/ })).toBeNull()
  await expectEveryApplicableWorkflowOnce()
})
it('opens the process map by default and shows a step with its documents in a dialog', async () => {
  window.localStorage.clear()
  await repository.saveProfile({ ...newProfile(), modalidad: 'research' })
  mount()
  await screen.findByRole('navigation', { name: 'Principal' })
  await navigate('#/proceso')
  await screen.findByRole('heading', { name: 'Mi proceso', level: 1 })

  expect((await screen.findByRole('button', { name: 'Mapa' })).getAttribute('aria-pressed')).toBe('true')
  const node = screen.getByRole('button', { name: /^Propuesta y aprobación de modalidad · siguiente paso/ })
  expect(screen.getByRole('button', { name: /Biblioteca: revisión del trabajo sin firmas/ })).toBeTruthy()
  fireEvent.click(node)
  const panel = within(await screen.findByRole('dialog', {
    name: 'Propuesta y aprobación de modalidad',
  }))
  expect(panel.getByRole('heading', { name: 'Anexo 1 · Solicitud de modalidad' })).toBeTruthy()
  expect(panel.getByRole('link', { name: /Abrir trámite completo/ }).getAttribute('href'))
    .toBe('#/proceso/propuesta')
  fireEvent.click(panel.getByRole('button', { name: 'Cerrar detalle' }))
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(screen.getByRole('region', { name: 'Guía del informe final' })).toBeTruthy()
  expect(screen.getByRole('button', { name: /^Cambio de modalidad · si lo necesitas/ })).toBeTruthy()
})
it('creates and autosaves a monthly draft, recovers it after remount and preserves it on modality change', async () => {
  await repository.saveProfile({ ...newProfile(), nombres: 'Persona sintética' })
  const app = mount()
  await screen.findByRole('navigation', { name: 'Principal' })
  const name = await createMonthly()
  fireEvent.change(name, { target: { value: 'Informe octubre revisado' } })
  await waitFor(
    async () => {
      const draft = (await repository.loadWorkspace()).drafts[0]
      expect(draft.name).toBe('Informe octubre revisado')
      expect(draft.revision).toBe(2)
    },
    { timeout: 2500 },
  )
  const saved = (await repository.loadWorkspace()).drafts[0]
  app.unmount()
  mount()
  expect(((await screen.findByLabelText('Nombre del borrador')) as HTMLInputElement).value).toBe(
    saved.name,
  )
  await navigate('#/ajustes')
  fireEvent.change(await screen.findByLabelText('Modalidad'), { target: { value: 'complexivo' } })
  fireEvent.click(screen.getByRole('button', { name: 'Guardar perfil' }))
  await waitFor(async () =>
    expect((await repository.loadWorkspace()).profile?.modalidad).toBe('complexivo'),
  )
  const changed = (await repository.loadWorkspace()).drafts
  expect(changed).toHaveLength(1)
  expect(changed[0].id).toBe(saved.id)
  expect(changed[0].needsReview).toBe(true)
  expect(changed[0].name).toBe(saved.name)
})
it('uploads original document bytes and appends a signed correction without mutating a submission', async () => {
  await repository.saveProfile(newProfile())
  mount()
  await screen.findByRole('navigation', { name: 'Principal' })
  await navigate('#/documentos')
  const card = within(await openCategory('Solicitud de modalidad · Anexo 1'))
  const input = card.getByLabelText('Agregar archivo a Solicitud de modalidad · Anexo 1')
  fireEvent.change(input, {
    target: {
      files: [new File(['original image bytes'], 'certificado.png', { type: 'image/png' })],
    },
  })
  await card.findByRole('heading', { name: 'Solicitud firmada.png', level: 3 })
  const first = (await repository.loadWorkspace()).versions[0]
  await repository.saveTask({
    id: 'task',
    definitionId: 'task',
    status: 'pending',
    requirementChecks: {},
    evidenceVersionIds: [first.id],
    outputVersionIds: [],
    note: '',
    history: [],
  })
  const submission = await repository.recordSubmission({
    taskId: 'task',
    exactVersionIds: [first.id],
    recipient: 'Secretaría',
    sentAt: '2026-10-22T18:00:00.000Z',
    note: '',
  })
  fireEvent.click(card.getByText('Firma y fechas'))
  fireEvent.click(card.getByLabelText('Los archivos de esta carga ya están firmados'))
  fireEvent.click(card.getByRole('button', { name: /Historial/ }))
  fireEvent.click(card.getByRole('button', { name: 'Subir nueva versión' }))
  fireEvent.change(input, {
    target: {
      files: [new File(['corrected signed bytes'], 'correccion.png', { type: 'image/png' })],
    },
  })
  await screen.findByText('Firma reportada por ti', { exact: false })
  const snapshot = await repository.snapshot()
  expect(snapshot.documents).toHaveLength(1)
  expect(snapshot.versions).toHaveLength(2)
  expect(snapshot.submissions[0]).toEqual(submission)
  expect(await snapshot.blobs.find((blob) => blob.id === first.blobId)!.data.text()).toBe(
    'original image bytes',
  )
  expect(snapshot.versions.find((version) => version.id !== first.id)?.signatureStatus).toBe(
    'reported-signed',
  )
  expect((card.getByLabelText('Los archivos de esta carga ya están firmados') as HTMLInputElement).checked)
    .toBe(false)
})
it('confirms the signature beside the saved file and keeps the unsigned version', async () => {
  await repository.saveProfile(newProfile())
  mount()
  await screen.findByRole('navigation', { name: 'Principal' })
  await navigate('#/documentos')
  const card = within(await openCategory('Solicitud de modalidad · Anexo 1'))
  fireEvent.change(card.getByLabelText('Agregar archivo a Solicitud de modalidad · Anexo 1'), {
    target: { files: [new File(['signed later'], 'anexo-1.png', { type: 'image/png' })] },
  })
  const signature = await card.findByRole('checkbox', {
    name: 'Este archivo ya tiene las firmas requeridas: Solicitud firmada.png',
  }) as HTMLInputElement
  expect(signature.checked).toBe(false)
  expect(card.getByText('Revisar firma')).toBeTruthy()
  fireEvent.click(signature)
  await waitFor(async () => {
    expect((await repository.loadWorkspace()).versions).toHaveLength(2)
    expect(signature.checked).toBe(true)
    expect(card.getByText('Listo')).toBeTruthy()
  })
  expect((await repository.loadWorkspace()).versions.map((version) => version.signatureStatus))
    .toContain('unsigned')
})
it('names uploads after their category and replaces the file of a single-file category', async () => {
  await repository.saveProfile(newProfile())
  mount()
  await screen.findByRole('navigation', { name: 'Principal' })
  await navigate('#/documentos')
  const card = within(await openCategory('Identificación'))
  fireEvent.change(card.getByLabelText('Agregar archivo a Identificación'), {
    target: { files: [new File(['first'], '1. cedula mia.png', { type: 'image/png' })] },
  })
  await card.findByRole('heading', { name: 'Copia de Cédula.png' })
  expect(card.queryByRole('button', { name: /Agregar/ })).toBeNull()
  fireEvent.click(card.getByRole('button', { name: 'Reemplazar Copia de Cédula.png' }))
  fireEvent.change(card.getByLabelText('Agregar archivo a Identificación'), {
    target: { files: [new File(['second'], 'scan.pdf', { type: 'application/pdf' })] },
  })
  await card.findByRole('heading', { name: 'Copia de Cédula.pdf' })
  const workspace = await repository.loadWorkspace()
  expect(workspace.documents).toHaveLength(1)
  expect(workspace.versions.map((version) => version.originalName).sort())
    .toEqual(['Copia de Cédula.pdf', 'Copia de Cédula.png'])
})
it('reopens the current saved revision after navigating to the annex library', async () => {
  await repository.saveProfile(newProfile())
  mount()
  await screen.findByRole('navigation', { name: 'Principal' })
  fireEvent.change(await createMonthly(), { target: { value: 'Nombre actualizado' } })
  await waitFor(async () => expect((await repository.loadWorkspace()).drafts[0].revision).toBe(2), {
    timeout: 2500,
  })
  const draft = (await repository.loadWorkspace()).drafts[0]
  await navigate('#/anexos')
  await screen.findByRole('heading', { name: 'Anexos', level: 1 })
  await navigate(`#/anexos/${draft.id}`)
  expect(((await screen.findByLabelText('Nombre del borrador')) as HTMLInputElement).value).toBe(
    'Nombre actualizado',
  )
})
it('keeps unsaved editor changes while searching the workspace', async () => {
  await repository.saveProfile(newProfile())
  mount()
  await screen.findByRole('navigation', { name: 'Principal' })
  fireEvent.change(await createMonthly(), { target: { value: 'Texto todavía pendiente' } })
  fireEvent.change(screen.getByLabelText('Buscar en mi expediente'), {
    target: { value: 'biblioteca' },
  })
  await screen.findByRole('heading', { name: 'Resultados' })
  fireEvent.change(screen.getByLabelText('Buscar en mi expediente'), { target: { value: '' } })
  expect(((await screen.findByLabelText('Nombre del borrador')) as HTMLInputElement).value).toBe(
    'Texto todavía pendiente',
  )
  await waitFor(
    async () =>
      expect((await repository.loadWorkspace()).drafts[0].name).toBe('Texto todavía pendiente'),
    { timeout: 2500 },
  )
})
it('drops multiple originals into their category without changing other cards and explains rejected files', async () => {
  await repository.saveProfile(newProfile())
  mount()
  await screen.findByRole('navigation', { name: 'Principal' })
  await navigate('#/documentos')
  const target = await openCategory('Resolución de modalidad y tema')
  fireEvent.dragOver(target)
  expect(target.classList.contains('is-dragging')).toBe(true)
  expect(within(target).getByText('Suelta para guardar en Resolución de modalidad y tema')).toBeTruthy()
  expect(within(target).getByRole('button', { name: /^Subir archivos/ })).toBeTruthy()
  fireEvent.drop(target, {
    dataTransfer: {
      files: [
        new File(['first original'], 'primero.png', { type: 'image/png' }),
        new File(['second original'], 'segundo.docx', {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }),
        new File(['unsupported'], 'programa.html', { type: 'text/html' }),
      ],
    },
  })
  await within(target).findByRole('heading', { name: 'Resolución de Consejo Directivo.png' })
  await within(target).findByRole('button', { name: 'Mostrar Resolución de Consejo Directivo 2.docx' })
  expect((await within(target).findByRole('alert')).textContent).toContain(
    'programa.html: Usa PDF, Word, JPG o PNG',
  )
  const snapshot = await repository.snapshot()
  expect(snapshot.documents).toHaveLength(2)
  expect(new Set(snapshot.documents.map((document) => document.id)).size).toBe(2)
  expect(snapshot.documents.every((document) => document.category === 'resolucion')).toBe(true)
  expect(snapshot.versions).toHaveLength(2)
  expect(within(screen.getByRole('article', { name: 'Otros documentos' })).getByText('Pendiente')).toBeTruthy()
  expect(within(target).queryByText('Pendiente')).toBeNull()
  const bytes = await Promise.all(snapshot.blobs.map((blob) => blob.data.text()))
  expect(bytes.sort()).toEqual(['first original', 'second original'])
})
it('shows the generated Anexo 11 read-only in the map dialog', async () => {
  window.localStorage.clear()
  const profile = {
    ...newProfile(),
    modalidad: 'research' as const,
    nombres: 'María Muñoz',
    carrera: 'Software',
    tema: 'Tema aprobado',
    tutor: 'Ing. Tutor',
    aprobacionFecha: '2026-07-15',
  }
  await repository.saveProfile(profile)
  await repository.saveDraft(
    buildFinalReportFromUploads(
      profile,
      [{ versionId: 'v', month: '2026-08', analysis: { recognized: true, activities: [{ date: '2026-08-20', description: 'Diseño del sistema' }] } }],
      '2026-11-18',
    ),
    0,
  )
  mount()
  await screen.findByRole('navigation', { name: 'Principal' })
  await navigate('#/proceso')
  await screen.findByRole('heading', { name: 'Mi proceso', level: 1 })
  fireEvent.click(await screen.findByRole('button', { name: /^Informe final de avance del tutor ·/ }))
  const dialog = within(await screen.findByRole('dialog', { name: 'Informe final de avance del tutor' }))
  const annex = within(dialog.getByRole('region', { name: 'Anexo 11 · Informe final' }))
  expect(annex.getByText('1 actividad')).toBeTruthy()
  const paper = within(annex.getByRole('article', { name: 'Documento' }))
  expect((paper.getByLabelText('Actividad 1') as HTMLTextAreaElement).value).toBe('Diseño del sistema')
  expect((paper.getByLabelText('Actividad 1') as HTMLTextAreaElement).readOnly).toBe(true)
  expect(paper.queryAllByRole('textbox').filter((item) => item.getAttribute('contenteditable') === 'plaintext-only')).toHaveLength(0)
  expect(dialog.queryByText('Este paso no pide documentos.')).toBeNull()
})
