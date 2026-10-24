import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { unzipSync, strFromU8 } from 'fflate'

test('exporta la revisión actual y recupera el respaldo completo', async ({ page }, info) => {
  await page.goto('/')
  await page.getByLabel('¿Cómo te llamas?').fill('María Muñoz')
  await page.getByRole('button', { name: 'Crear mi expediente' }).click()
  await page.getByRole('link', { name: 'Ajustes y respaldo' }).click()
  for (const [label, value] of [
    ['Carrera', 'Ingeniería de Software'],
    ['Tema aprobado', 'Organización del proceso de titulación'],
    ['Tutor', 'José Núñez'],
    ['Fecha de aprobación', '2026-09-01'],
  ]) {
    await page.getByLabel(label, { exact: true }).fill(value)
  }
  await page.getByRole('button', { name: 'Guardar perfil' }).click()
  await expect(page.getByText('Guardado', { exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Anexos', exact: true }).click()
  await page.getByLabel('Mes del informe').fill('2026-10')
  await page.getByRole('button', { name: 'Crear informe mensual' }).click()
  await page.getByLabel('Fecha personalizada', { exact: true }).fill('2026-10-22')
  await page.getByRole('button', { name: 'Registrar 100% de avance' }).click()
  await page.getByRole('button', { name: 'Agregar actividad' }).click()
  await page.locator('.activity-date-text').first().click()
  await page.getByLabel('Fecha de actividad 1').fill('2026-10-15')
  await page
    .getByLabel('Actividad 1', { exact: true })
    .fill('Validación de la implementación y documentación técnica')
  // No wait for autosave: exporting must flush the latest edit.
  await page.getByText('Datos del informe · estudiante y tutor', { exact: true }).click()
  await page.getByLabel('Estudiante', { exact: true }).fill('María Muñoz Revisión Actual')
  const wordPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Descargar Word' }).click()
  const word = await wordPromise
  const wordPath = info.outputPath('informe.docx')
  await word.saveAs(wordPath)
  const archive = unzipSync(new Uint8Array(await readFile(wordPath)))
  expect(strFromU8(archive['word/document.xml'])).toContain('María Muñoz Revisión Actual')
  const pdfPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Descargar PDF' }).click()
  const pdf = await pdfPromise
  const pdfPath = info.outputPath('informe.pdf')
  await pdf.saveAs(pdfPath)
  expect((await readFile(pdfPath)).subarray(0, 5).toString()).toBe('%PDF-')
  await expect(page.getByRole('region', { name: 'Registro del informe mensual' })).toBeVisible()
  await page.screenshot({ path: info.outputPath('editor.png'), fullPage: true })
  await page.getByRole('link', { name: 'Ajustes y respaldo' }).click()
  const backupPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Descargar respaldo completo' }).click()
  const backupPath = info.outputPath('respaldo.zip')
  await (await backupPromise).saveAs(backupPath)
  await page.getByLabel('Importar respaldo ZIP').setInputFiles(backupPath)
  await expect(
    page.getByRole('heading', { name: 'Reemplazar el expediente completo' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click()
  await page.getByLabel('Importar respaldo ZIP').setInputFiles(backupPath)
  await page.getByRole('button', { name: 'Confirmar reemplazo', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Reemplazar el expediente completo' }),
  ).toHaveCount(0)
  await page.getByRole('link', { name: 'Documentos', exact: true }).click()
  await page.locator('.document-expand').click()
  await expect(page.locator('.document-version')).toHaveCount(2)
})
