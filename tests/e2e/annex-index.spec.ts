import { expect, test, type Page } from '@playwright/test'

async function seedProfile(page: Page) {
  await page.goto('/')
  await page.evaluate(async () => {
    const repositoryPath = '/src/storage/repository.ts'
    const typesPath = '/src/domain/types.ts'
    const { repository } = await import(repositoryPath)
    const { newProfile } = await import(typesPath)
    await repository.saveProfile({ ...newProfile(), nombres: 'Estudiante de prueba', modalidad: 'article', carrera: 'Software' })
  })
  await page.goto('/#/anexos')
}

test('muestra cada anexo con quién lo emite y quién lo firma', async ({ page }) => {
  await seedProfile(page)
  const card = page.getByRole('article', { name: 'Anexo 10 · Calificadores de Artículo' })
  await expect(card).toContainText('Anexo 10')
  await expect(card).toContainText('Estudiante lo emite y firma')
  await expect(card).toContainText('Sin empezar')
  await expect(page.getByRole('link', { name: /Anexo 2 · Estructura de propuesta/ })).toBeVisible()
  await expect(page.getByRole('article', { name: 'Anexo 10 · Calificadores de Proyecto' })).toHaveCount(0)
})

test('crea un anexo desde su tarjeta y abre el editor', async ({ page }) => {
  await seedProfile(page)
  await page.getByRole('button', { name: 'Crear Anexo 15 · Solicitud de aptitud legal', exact: true }).click()
  await expect(page).toHaveURL(/#\/anexos\/.+/)
  await page.goto('/#/anexos')
  const card = page.getByRole('article', { name: 'Anexo 15 · Solicitud de aptitud legal' })
  await expect(card).toContainText('Faltan datos')
  await expect(card.getByRole('button', { name: 'Descargar Anexo 15 · Solicitud de aptitud legal' })).toBeDisabled()
})

test('descarga en Word y PDF un anexo completo desde su tarjeta', async ({ page }) => {
  await seedProfile(page)
  await page.evaluate(async () => {
    const repositoryPath = '/src/storage/repository.ts'
    const annexPath = '/src/domain/annex.ts'
    const { repository } = await import(repositoryPath)
    const { createDraft } = await import(annexPath)
    const profile = { ...(await repository.loadWorkspace()).profile, cedula: '1850994623', email: 'estudiante@uta.edu.ec' }
    await repository.saveProfile(profile)
    const draft = createDraft('anexo-15', profile)
    await repository.saveDraft(
      { ...draft, fields: { ...draft.fields, lugar: 'Ambato', fecha: '2026-10-24', destinatario: 'Ing. Decano' } },
      0,
    )
  })
  await page.reload()
  const card = page.getByRole('article', { name: 'Anexo 15 · Solicitud de aptitud legal' })
  for (const [format, extension] of [['Word', 'docx'], ['PDF', 'pdf']]) {
    const download = page.waitForEvent('download')
    await card.getByRole('button', { name: 'Descargar Anexo 15 · Solicitud de aptitud legal' }).click()
    await card.getByRole('menuitem', { name: format }).click()
    expect((await download).suggestedFilename()).toMatch(new RegExp(`\\.${extension}$`))
  }
})

test('filtra los anexos por quién los emite', async ({ page }) => {
  await seedProfile(page)
  await page.locator('.annex-index .segmented').getByRole('button', { name: 'Tutor', exact: true }).click()
  await expect(page.getByRole('article', { name: 'Anexo 11 · Informe final de avance' })).toBeVisible()
  await expect(page.getByRole('article', { name: 'Anexo 15 · Solicitud de aptitud legal' })).toHaveCount(0)
})
