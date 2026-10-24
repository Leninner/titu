import type { CatalogVersion } from '../domain/types'
import { sources } from './sources'
import { templates } from './templates'
import { workflowDefinitions } from './workflows'
import { calendarEvents } from './calendar-2026'
import { conflicts } from './conflicts'

export { sources, templates, workflowDefinitions, calendarEvents, conflicts }
export const catalog: CatalogVersion = {
  version: '2026-10-23.1',
  sourceIds: sources.map((source) => source.id),
  templates,
  workflowDefinitions,
  calendarEvents,
  conflicts,
}
