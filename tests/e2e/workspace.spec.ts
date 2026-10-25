import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function onboard(page: Page, modality = 'research') {
  await page.goto('/')
  await page.getByLabel('¿Cómo te llamas?').fill('María Muñoz')
  await page.getByLabel('Modalidad de titulación').selectOption(modality)
  await page.getByRole('button', { name: 'Crear mi expediente' }).click()
  await expect(page.getByRole('heading', { name: 'Hola, María' })).toBeVisible()
}

test('expediente local, rutas, búsqueda y navegación adaptable', async ({ page }) => {
  await onboard(page)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Hola, María' })).toBeVisible()
  await page.getByRole('link', { name: 'Mi proceso', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Mi proceso', exact: true })).toBeVisible()
  await page.getByLabel('Buscar en mi expediente').fill('aptitud')
  await expect(page.getByRole('heading', { name: 'Resultados' })).toBeVisible()
  await expect(page.getByRole('link', { name: /aptitud legal/i }).first()).toBeVisible()
  await page.getByLabel('Buscar en mi expediente').press('Escape')
  await page.getByRole('link', { name: 'Anexos', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Propuesta', level: 2 })).toBeVisible()
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 950 })
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
    await page.screenshot({
      path: `test-results/anexos-${test.info().project.name}-${width}.png`,
      fullPage: true,
    })
  }
  if (test.info().project.name !== 'webkit') {
    const accessibility = await new AxeBuilder({ page }).analyze()
    expect(accessibility.violations).toEqual([])
  }
})

test('mensual guarda cambios y crea el siguiente mes sin actividades', async ({ page }) => {
  await onboard(page)
  await page.getByRole('link', { name: 'Anexos', exact: true }).click()
  await page.getByRole('button', { name: 'Crear informe mensual' }).click()
  await expect(page.getByRole('button', { name: 'Descargar PDF' })).toBeVisible()
  await page.getByLabel('Nombre del borrador').fill('Informe de prueba')
  await page.getByRole('button', { name: 'Agregar actividad' }).click()
  await page.locator('.activity-date-text').first().click()
  await page.getByLabel('Fecha de actividad 1').fill('2026-10-15')
  await page
    .getByLabel('Actividad 1', { exact: true })
    .fill('Revisión del diseño y documentación técnica')
  await expect(page.locator('.save-status')).toHaveText('Guardado')
  await page.reload()
  await expect(page.getByLabel('Actividad 1', { exact: true })).toHaveValue(
    'Revisión del diseño y documentación técnica',
  )
  await page.setViewportSize({ width: 360, height: 850 })
  await expect(page.getByRole('region', { name: 'Registro del informe mensual' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: `test-results/document-mobile-${test.info().project.name}.png`, fullPage: true })
  await expect(page.getByLabel('Actividad 1', { exact: true })).toHaveValue(
    'Revisión del diseño y documentación técnica',
  )
  await page.getByRole('button', { name: 'Crear el siguiente mes' }).click()
  await expect(page.getByLabel('Nombre del borrador')).toHaveValue(/Anexo 5/)
  await expect(page.getByLabel('Actividad 1', { exact: true })).toHaveCount(0)
  await expect(page.getByLabel('Nombre del borrador')).not.toHaveValue('Informe de prueba')
})

for (const modality of ['article', 'complexivo']) {
  test(`ruta aplicable ${modality}`, async ({ page }) => {
    await onboard(page, modality)
    await page.getByRole('link', { name: 'Mi proceso', exact: true }).click()
    await page.getByRole('button', { name: 'Lista', exact: true }).click()
    if (modality === 'complexivo') {
      await expect(page.locator('.workflow-list')).not.toContainText('Informes mensuales')
      await expect(page.locator('.workflow-list')).toContainText(/examen/i)
    }
    await page.getByRole('link', { name: 'Fechas', exact: true }).click()
    await expect(
      page.getByRole('heading', {
        name:
          modality === 'complexivo' ? 'Examen complexivo hasta esta fecha' : 'Solicitud día y hora',
        exact: true,
      }),
    ).toBeVisible()
  })
}

test('dos contextos conservan expedientes independientes', async ({ page, browser }) => {
  await onboard(page)
  const other = await browser.newContext()
  const otherPage = await other.newPage()
  await otherPage.goto('/')
  await expect(otherPage.getByRole('button', { name: 'Crear mi expediente' })).toBeVisible()
  await other.close()
})
