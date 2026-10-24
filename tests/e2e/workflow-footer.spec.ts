import { expect, test } from '@playwright/test'

test('el siguiente paso permanece alineado sin desbordar la página', async ({ page }, info) => {
  await page.goto('/')
  await page.getByLabel('¿Cómo te llamas?').fill('María Muñoz')
  await page.getByRole('button', { name: 'Crear mi expediente' }).click()
  await page.goto('/#/proceso/propuesta')

  const footer = page.getByRole('complementary', { name: 'Siguiente paso' })
  await expect(footer).toBeVisible()
  await expect(footer.getByRole('button')).toBeVisible()

  for (const width of [360, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 })
    const geometry = await page.evaluate(() => {
      const footer = document.querySelector('.task-next')!.getBoundingClientRect()
      const heading = document.querySelector('.task-intro')!.getBoundingClientRect()
      const inner = document.querySelector('.task-next > div')!
      const innerBounds = inner.getBoundingClientRect()
      return {
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        footerRight: footer.right,
        headingLeft: heading.left,
        innerContentLeft: innerBounds.left + parseFloat(getComputedStyle(inner).paddingLeft),
      }
    })
    expect(geometry.overflow).toBeLessThanOrEqual(0)
    expect(geometry.footerRight).toBe(width)
    expect(Math.abs(geometry.innerContentLeft - geometry.headingLeft)).toBeLessThan(1)
    await page.screenshot({ path: `.impeccable/review/workflow-footer-${info.project.name}-${width}.png` })
  }
})
