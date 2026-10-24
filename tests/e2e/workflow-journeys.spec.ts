import { expect, test, type Page } from '@playwright/test'
import { workflowDefinitions } from '../../src/catalog/workflows'
import type { Modality, Requirement, Workspace, WorkflowDefinition } from '../../src/domain/types'

// A real, small textual PDF, with byte offsets and an xref table.
function fixturePdf(text: string) {
  const stream = `BT /F1 12 Tf 30 100 Td (${text}) Tj ET`
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xref = pdf.length
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
    .join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return pdf
}

function evidenceCheckbox(page: Page, filename: string) {
  // Labels include the purpose of the file; role excludes the email textarea.
  const name = filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return page.getByRole('checkbox', { name: new RegExp(`^(Incluir|Registrar) ${name}`) })
}

async function records(page: Page): Promise<Workspace> {
  return page.evaluate(async () => {
    const path = '/src/storage/repository.ts'
    const { repository } = await import(path)
    return repository.loadWorkspace()
  })
}

async function expectStatus(page: Page, id: string, status: string) {
  await expect
    .poll(async () => (await records(page)).tasks.find((task) => task.definitionId === id)?.status)
    .toBe(status)
}

async function openStep(page: Page, name: 'Preparar' | 'Enviar' | 'Resultado') {
  const tab = page.getByRole('tab', { name: new RegExp(`^${name}`) })
  if (await tab.count()) await tab.click()
}

async function submit(page: Page, id: string, time: string) {
  await openStep(page, 'Enviar')
  await page.getByLabel('Destinatario (verificar)', { exact: true }).fill('secretaria@example.test')
  await page.getByLabel('Fecha y hora del envío realizado (Ecuador)', { exact: true }).fill(time)
  await page.getByRole('button', { name: 'Confirmar que ya lo envié', exact: true }).click()
  await expectStatus(page, id, 'submitted')
  await expect(page.getByRole('tab', { name: /^Resultado/ })).toHaveAttribute('aria-selected', 'true')
}

const applies = (requirement: Requirement, modality: Modality, company: boolean) =>
  (!requirement.companyOnly || company) &&
  (!requirement.modalities || requirement.modalities.includes(modality))

const sample = (id: string) => (id === 'attendance' ? '70' : id === 'similarity' ? '10' : '8')

async function fill(
  page: Page,
  requirements: Requirement[],
  versions: Record<string, { id: string; filename: string }>,
) {
  for (const requirement of requirements) {
    if (requirement.optional || requirement.category === 'personal') continue
    if (requirement.category) await evidenceCheckbox(page, versions[requirement.category].filename).check()
    else if (['grade-1', 'grade-2', 'similarity', 'attendance'].includes(requirement.id))
      await page.getByLabel(requirement.label, { exact: true }).fill(sample(requirement.id))
    else await page.getByLabel(requirement.label, { exact: true }).check()
  }
}

async function expectRejected(page: Page, requirements: Requirement[], id: string, wrong: string) {
  const requirement = requirements.find((item) => item.id === id)
  if (!requirement) return
  const field = page.getByLabel(requirement.label, { exact: true })
  await field.fill(wrong)
  await openStep(page, 'Resultado')
  await expect(page.getByRole('button', { name: 'Completar trámite', exact: true })).toBeDisabled()
  if (id === 'similarity') await openStep(page, 'Preparar')
  await field.fill(sample(id))
}

for (const modality of ['research', 'article', 'complexivo'] as const) {
  test(`recorrido completo ${modality}: preparar, enviar, resultado y encadenamiento`, async ({
    page,
  }) => {
    test.setTimeout(180_000)
    const company = modality === 'research'
    const definitions = workflowDefinitions.filter(
      (definition) =>
        definition.modalities.includes(modality) &&
        !definition.optional &&
        (!definition.companyOnly || company),
    )
    const inputsOf = (definition: WorkflowDefinition) =>
      definition.requirements.filter((requirement) => applies(requirement, modality, company))
    const outputsOf = (definition: WorkflowDefinition) =>
      definition.outputs.filter((requirement) => applies(requirement, modality, company))
    const categories = [
      ...new Set(
        definitions.flatMap((definition) =>
          [...inputsOf(definition), ...outputsOf(definition)]
            .filter((requirement) => requirement.category && !requirement.optional)
            .map((requirement) => requirement.category!),
        ),
      ),
    ]
    await page.goto('/')
    const versions = await page.evaluate(
      async ({ modality, company, categories, pdf }) => {
        const repositoryPath = '/src/storage/repository.ts'
        const typesPath = '/src/domain/types.ts'
        const { repository } = await import(repositoryPath)
        const { newProfile } = await import(typesPath)
        await repository.saveProfile({
          ...newProfile(),
          nombres: 'Estudiante de prueba',
          modalidad: modality,
          aplicaEmpresa: company,
          tema: 'Tema aprobado de prueba',
          carrera: 'Software',
          tutor: 'Tutor de prueba',
        })
        await repository.saveSetting('dayHourSubmissionDate', '2026-12-10')
        const seeded: Record<string, { id: string; filename: string }> = {}
        for (const category of categories) {
          const filename = `${category}-original.pdf`
          const version = await repository.addDocumentVersion({
            file: new Blob([pdf], { type: 'application/pdf' }),
            originalName: filename,
            category,
            signatureStatus: 'reported-signed',
            textualPdfStatus: 'text-detected',
            issuedOn: '2026-12-07',
            expiresOn: '2027-01-15',
          })
          seeded[category] = { id: version.id, filename }
        }
        return seeded
      },
      { modality, company, categories, pdf: fixturePdf('Original evidence') },
    )
    await page.reload()
    await page.getByRole('link', { name: 'Mi proceso', exact: true }).click()
    await page.getByRole('button', { name: 'Lista', exact: true }).click()
    await expect(page.locator('.workflow-row')).toHaveCount(definitions.length)
    if (modality === 'complexivo') {
      await expect(page.locator('.workflow-list')).not.toContainText('informes mensuales')
      await expect(page.locator('.workflow-list')).not.toContainText('Biblioteca')
    }

    for (const definition of definitions) {
      await page.goto(`/#/proceso/${definition.id}`)
      if (definition.id === 'dia-hora') {
        await reuseLegalVersions(page, modality)
        await page.reload()
      }
      await expect(page.getByRole('heading', { name: definition.title, exact: true })).toBeVisible()
      const inputs = inputsOf(definition)
      const outputs = outputsOf(definition)
      await expect(page.getByRole('tablist')).toHaveCount(inputs.length ? 1 : 0)
      await fill(page, inputs, versions)
      await expectRejected(page, inputs, 'similarity', '11')

      if (definition.id === 'propuesta') {
        await page.getByRole('button', { name: 'Guardar cambios', exact: true }).click()
        await expectStatus(page, definition.id, 'preparing')
        await submit(page, definition.id, '2026-10-21T09:00')
        await page.getByRole('button', { name: 'Hay una observación', exact: true }).click()
        await page.getByLabel('Observación recibida').fill('Secretaría solicita corregir el Anexo 1')
        await page.getByRole('button', { name: 'Guardar observación', exact: true }).click()
        await expectStatus(page, definition.id, 'observed')
        await expect(page.getByRole('tab', { name: /^Resultado/ })).toContainText('observado')
        await submit(page, definition.id, '2026-10-22T10:00')
        const state = await records(page)
        expect(state.submissions.filter((item) => item.taskId === definition.id)).toHaveLength(2)
        expect(
          state.tasks
            .find((task) => task.definitionId === definition.id)
            ?.history.some((entry) => entry.status === 'observed'),
        ).toBe(true)
      }
      if (definition.id.startsWith('aptitud-legal-'))
        await submit(page, definition.id, '2026-12-08T10:00')

      await openStep(page, 'Resultado')
      const complete = page.getByRole('button', { name: 'Completar trámite', exact: true })
      if (outputs.some((output) => !output.optional)) await expect(complete).toBeDisabled()
      await fill(page, outputs, versions)
      await expectRejected(page, outputs, 'grade-1', '5')
      await expectRejected(page, outputs, 'attendance', '69')
      await expect(complete).toBeEnabled()
      await complete.click()
      await expectStatus(page, definition.id, 'completed')
      await expect(page.getByRole('button', { name: 'Reabrir trámite', exact: true })).toBeVisible()
    }
    const completed = await records(page)
    expect(completed.tasks.filter((task) => task.status === 'completed')).toHaveLength(
      definitions.length,
    )
    const resolution = versions.resolucion.id
    expect(completed.tasks.find((task) => task.definitionId === 'propuesta')?.outputVersionIds)
      .toContain(resolution)
    expect(completed.tasks.find((task) => task.definitionId === 'dia-hora')?.evidenceVersionIds)
      .toContain(resolution)
    await page.reload()
    expect((await records(page)).tasks.filter((task) => task.status === 'completed')).toHaveLength(
      definitions.length,
    )
  })
}

// Day and hour must carry the exact files sent for legal aptitude, including other categories.
async function reuseLegalVersions(page: Page, modality: Modality) {
  await page.evaluate(async (modality) => {
    const repositoryPath = '/src/storage/repository.ts'
    const recordPath = '/src/domain/task-record.ts'
    const { repository } = await import(repositoryPath)
    const { taskFor } = await import(recordPath)
    const workspace = await repository.loadWorkspace()
    const legal = taskFor(`aptitud-legal-${modality}`, workspace)
    const sent = workspace.submissions.find((item: { taskId: string }) => item.taskId === legal.id)
    const dayHour = taskFor('dia-hora', workspace)
    await repository.saveTask({
      ...dayHour,
      evidenceVersionIds: [...new Set([...dayHour.evidenceVersionIds, ...sent.exactVersionIds])],
    })
  }, modality)
}
