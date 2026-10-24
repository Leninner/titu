import { analyzeMonthlyReport } from '../../domain/monthly-report'

export async function reportAnalysis(file: File, category: string) {
  if (category !== 'mensual') return undefined
  const { extractText } = await import('./extract-text')
  return analyzeMonthlyReport(await extractText(file))
}
