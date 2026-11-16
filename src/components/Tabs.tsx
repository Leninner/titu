import { useRef, type KeyboardEvent, type ReactNode } from 'react'

export interface TabItem<Id extends string> {
  id: Id
  label: string
  icon?: ReactNode
}

export const tabId = (scope: string, id: string) => `${scope}-tab-${id}`
export const tabPanelId = (scope: string, id: string) => `${scope}-panel-${id}`

const keyOffsets: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 }

export function Tabs<Id extends string>({
  scope,
  label,
  tabs,
  active,
  onSelect,
}: {
  scope: string
  label: string
  tabs: TabItem<Id>[]
  active: Id
  onSelect: (id: Id) => void
}) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  function move(event: KeyboardEvent<HTMLButtonElement>) {
    const current = tabs.findIndex((tab) => tab.id === active)
    const target =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? tabs.length - 1
          : keyOffsets[event.key] !== undefined
            ? (current + keyOffsets[event.key] + tabs.length) % tabs.length
            : undefined
    if (target === undefined) return
    event.preventDefault()
    onSelect(tabs[target].id)
    buttons.current[target]?.focus()
  }

  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((tab, index) => {
        const selected = tab.id === active
        return (
          <button
            key={tab.id}
            ref={(element) => {
              buttons.current[index] = element
            }}
            type="button"
            role="tab"
            id={tabId(scope, tab.id)}
            aria-selected={selected}
            aria-controls={tabPanelId(scope, tab.id)}
            tabIndex={selected ? 0 : -1}
            className="tab"
            onClick={() => onSelect(tab.id)}
            onKeyDown={move}
          >
            {tab.icon}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
