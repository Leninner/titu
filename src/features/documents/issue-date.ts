import { recordsValidity } from '../../domain/dates'
import { noDebtIssueDate } from '../../domain/no-debt'

export async function issueDate(file: File, category: string) {
  if (!recordsValidity(category)) return undefined
  const { extractText } = await import('./extract-text')
  return noDebtIssueDate(await extractText(file))
}
