import { expect, test, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { PDFDocument } from 'pdf-lib'

const onePixelPng =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

async function seedProfile(page: Page, withIdCard = false) {
  await page.goto('/')
  await page.evaluate(async ({ withIdCard, png }) => {
    const repositoryPath = '/src/storage/repository.ts'
    const typesPath = '/src/domain/types.ts'
    const { repository } = await import(repositoryPath)
    const { newProfile } = await import(typesPath)
    await repository.saveProfile({
      ...newProfile(),
      nombres: 'Lenin Giovanni Mazabanda Pullutaxi',
      cedula: '1850994623',
      email: 'estudiante@uta.edu.ec',
      facultad: 'FISEI',
      tema: 'Organizador de titulación',
      modalidad: 'article',
      carrera: 'Software',
      tutor: 'Tutor de prueba',
    })
    if (withIdCard)
      await repository.addDocumentVersion({
        file: new Blob([Uint8Array.from(atob(png), (char) => char.charCodeAt(0))], { type: 'image/png' }),
        originalName: 'cedula-papeleta.png',
        category: 'personal',
        signatureStatus: 'unsigned',
        textualPdfStatus: 'unknown',
      })
  }, { withIdCard, png: onePixelPng })
}

async function openRequest(page: Page, workflowId: string, label: string) {
  await page.goto(`/#/proceso/${workflowId}`)
  await page.getByRole('article', { name: label, exact: true }).getByRole('button', { name: 'Solicitar', exact: true }).click()
  return page.getByRole('region', { name: 'Correo de la solicitud' })
}

test('el correo de habilitantes no presenta la cédula como adjunto', async ({ page }) => {
  await seedProfile(page, true)
  const email = await openRequest(page, 'aptitud-legal-article', 'Requisitos habilitantes')
  await expect(email.getByText('Solicitud de certificado de requisitos habilitantes – Lenin Mazabanda')).toBeVisible()
  await expect(email.locator('.request-email-body')).toContainText('Atentamente,\nLenin Mazabanda')
  await expect(email).toContainText('Adjunta: Solicitud firmada en PDF')
  await expect(email.getByRole('region', { name: 'Adjuntos' })).toHaveCount(0)
})

test('sin cédula en Documentos el PDF avisa que falta y enlaza a Documentos', async ({ page }) => {
  await seedProfile(page)
  await openRequest(page, 'aptitud-legal-article', 'Requisitos habilitantes')
  await expect(page.getByRole('link', { name: 'Falta cédula' })).toHaveAttribute('href', '#/documentos')
  await expect(page.getByRole('button', { name: 'Descargar PDF', exact: true })).toBeVisible()
})

test('un correo sin anexos no muestra avisos de anexos', async ({ page }) => {
  await seedProfile(page)
  const email = await openRequest(page, 'calificadores-article', 'Aval de informes')
  await expect(email).toBeVisible()
  await expect(page.getByRole('link', { name: /^Falta/ })).toHaveCount(0)
})

test('el PDF de la solicitud de habilitantes une la cédula después de la firma', async ({ page }, info) => {
  await seedProfile(page, true)
  await openRequest(page, 'aptitud-legal-article', 'Requisitos habilitantes')
  await page.getByRole('textbox', { name: 'Tratamiento y nombre del Coordinador de Carrera' }).fill('Ing. Coordinador')
  await page.getByRole('textbox', { name: 'Nivel que cursas' }).fill('noveno')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Descargar PDF + cédula' }).click()
  const path = info.outputPath('solicitud.pdf')
  await (await download).saveAs(path)
  const merged = await PDFDocument.load(await readFile(path))
  expect(merged.getPageCount()).toBe(2)
})
