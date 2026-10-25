import { expect, test, type Page } from '@playwright/test'

async function seedProfile(page: Page, withIdCard = false) {
  await page.goto('/')
  await page.evaluate(async (withIdCard) => {
    const repositoryPath = '/src/storage/repository.ts'
    const typesPath = '/src/domain/types.ts'
    const { repository } = await import(repositoryPath)
    const { newProfile } = await import(typesPath)
    await repository.saveProfile({
      ...newProfile(),
      nombres: 'Estudiante de prueba',
      modalidad: 'article',
      carrera: 'Software',
      tutor: 'Tutor de prueba',
    })
    if (withIdCard)
      await repository.addDocumentVersion({
        file: new Blob(['cedula'], { type: 'image/png' }),
        originalName: 'cedula-papeleta.png',
        category: 'personal',
        signatureStatus: 'unsigned',
        textualPdfStatus: 'unknown',
      })
  }, withIdCard)
}

async function openRequest(page: Page, workflowId: string, label: string) {
  await page.goto(`/#/proceso/${workflowId}`)
  await page.getByRole('article', { name: label, exact: true }).getByRole('button', { name: 'Solicitar', exact: true }).click()
  return page.getByRole('region', { name: 'Correo de la solicitud' })
}

test('descarga desde el correo la cédula guardada en Documentos', async ({ page }) => {
  await seedProfile(page, true)
  const email = await openRequest(page, 'aptitud-legal-article', 'Requisitos habilitantes')
  await expect(email.locator('.request-email-body')).toContainText('Adjunto la copia de mi cédula de ciudadanía.')
  const attachments = email.getByRole('region', { name: 'Adjuntos' })
  await expect(attachments).toContainText('cedula-papeleta.png')
  const download = page.waitForEvent('download')
  await attachments.getByRole('button', { name: 'Descargar Copia de cédula', exact: true }).click()
  expect((await download).suggestedFilename()).toBe('cedula-papeleta.png')
})

test('sin cédula en Documentos el adjunto enlaza a Documentos', async ({ page }) => {
  await seedProfile(page)
  const email = await openRequest(page, 'aptitud-legal-article', 'Requisitos habilitantes')
  const attachments = email.getByRole('region', { name: 'Adjuntos' })
  await expect(attachments).toContainText('Aún no la subes')
  await expect(attachments.getByRole('link', { name: 'Ir a Documentos' })).toHaveAttribute('href', '#/documentos')
})

test('un correo sin adjuntos no muestra la sección de adjuntos', async ({ page }) => {
  await seedProfile(page)
  const email = await openRequest(page, 'calificadores-article', 'Aval de informes')
  await expect(email).toBeVisible()
  await expect(email.getByRole('region', { name: 'Adjuntos' })).toHaveCount(0)
})
