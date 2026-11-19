const datePattern = /FECHA:\s*(\d{2})\/(\d{2})\/(\d{4})/gi

export function noDebtIssueDate(text: string): string | undefined {
  const dates = [...text.matchAll(datePattern)].map(([, day, month, year]) => `${year}-${month}-${day}`)
  return dates.sort().at(-1)
}
