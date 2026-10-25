import { ArrowUpRight } from 'lucide-react'
import type { TemplateDefinition } from '../../domain/types'

export function AnnexReferences({ references }: { references: TemplateDefinition[] }) {
  return (
    <div className="annex-references">
      <span>Referencias</span>
      <ul>
        {references.map((template) => (
          <li key={template.id}>
            <a href={`${import.meta.env.BASE_URL}sources/${template.sourceIds[0]}.txt`} target="_blank" rel="noreferrer">
              {template.name} <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
