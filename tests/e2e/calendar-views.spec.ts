import { expect, test } from '@playwright/test'

test('fechas muestra una sola vista a la vez y ordena la agenda', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('¿Cómo te llamas?').fill('María Muñoz')
  await page.getByRole('button', { name: 'Crear mi expediente' }).click()
  await page.getByRole('link', { name: 'Fechas', exact: true }).click()

  await expect(page.getByRole('button', { name: 'Agenda', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(page.getByRole('region', { name: 'Calendario semanal de titulación' })).toHaveCount(0)
  await expect(page.locator('.agenda-row').first()).toContainText('Revisión presencial Biblioteca')

  await page.getByRole('button', { name: 'Calendario', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Calendario semanal de titulación' })).toBeVisible()
  await expect(page.locator('.agenda-row')).toHaveCount(0)

  await page.getByRole('button', { name: 'Agenda', exact: true }).click()
  await expect(page.locator('.agenda-row').first()).toContainText('Revisión presencial Biblioteca')
})
