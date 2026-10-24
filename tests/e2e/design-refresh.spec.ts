import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jfl0AAAAASUVORK5CYII=',
  'base64',
)

test('tarjetas de documentos, fecha natural y línea de tiempo', async ({ page }, info) => {
  await page.goto('/')
  await page.getByLabel('¿Cómo te llamas?').fill('María Muñoz')
  await page.getByRole('button', { name: 'Crear mi expediente' }).click()
  await page.getByRole('button', { name: /Agregar una fecha/ }).click()
  await page.getByLabel('¿Qué tienes pendiente?').fill('Reunión con mi tutor')
  await page.getByLabel('¿Cuándo?').fill('el 21 de noviembre')
  await expect(page.getByRole('button', { name: /^Usar / })).toBeVisible()
  await page.getByRole('button', { name: /^Usar / }).click()
  await page.getByRole('button', { name: 'Agregar a mi agenda' }).click()
  await expect(page.getByLabel('¿Qué tienes pendiente?')).toHaveCount(0)
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.screenshot({
    path: `.impeccable/review/home-${info.project.name}.png`,
    fullPage: true,
  })
  await page.getByRole('link', { name: 'Documentos', exact: true }).click()
  const card = page.getByRole('article', { name: 'Identificación', exact: true })
  await card
    .getByLabel('Agregar archivo a Identificación')
    .setInputFiles({ name: 'identificacion.png', mimeType: 'image/png', buffer: png })
  await expect(card.getByText('Archivo agregado', { exact: true })).toBeVisible()
  await expect(card.getByRole('heading', { name: 'Copia de Cédula.png', exact: true })).toBeVisible()
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
    await page.screenshot({
      path: `.impeccable/review/documents-${info.project.name}-${width}.png`,
      fullPage: true,
    })
  }
  if (info.project.name !== 'webkit') {
    const audit = await new AxeBuilder({ page }).analyze()
    expect(audit.violations).toEqual([])
  }
  await page.getByRole('button', { name: 'Por agregar', exact: true }).click()
  await expect(page.getByRole('article', { name: 'Identificación', exact: true })).toHaveCount(0)
})
