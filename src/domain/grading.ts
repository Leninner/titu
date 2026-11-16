import type { TaskRecord } from './types'
import { numeric } from './numeric'

export const gradeIds = ['grade-1', 'grade-2'] as const
export const maximumGrade = 10
export const passingAverage = 7

export interface GradingSummary {
  grades: (number | undefined)[]
  received: number
  average?: number
  passed?: boolean
}

const validGrade = (value: unknown) => {
  const grade = numeric(value)
  return grade !== undefined && grade >= 0 && grade <= maximumGrade ? grade : undefined
}

export function gradingSummary(checks: TaskRecord['requirementChecks']): GradingSummary {
  const grades = gradeIds.map((id) => validGrade(checks[id]))
  const received = grades.filter((grade) => grade !== undefined).length
  if (received < grades.length) return { grades, received }
  const average = Math.round(((grades as number[]).reduce((sum, grade) => sum + grade, 0) / grades.length) * 100) / 100
  return { grades, received, average, passed: average >= passingAverage }
}
