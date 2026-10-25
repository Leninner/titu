import { useState } from 'react'
import { useWorkspace } from '../../app/WorkspaceContext'
import { catalog } from '../../catalog'
import { createDraft } from '../../domain/annex'
import { annexIndex, type AnnexSection } from '../../domain/annex-index'
import { buildFinalReport } from '../../domain/final-report'
import type { AnnexDraft, TemplateDefinition } from '../../domain/types'
import { repository } from '../../storage/repository'
import { AnnexIndexCard } from './AnnexIndexCard'
import { AnnexReferences } from './AnnexReferences'
import { NewMonthlyCard } from './NewMonthlyCard'
import './annex-index.css'

const allIssuers = 'Todos'

function issuersOf(sections: AnnexSection[]) {
  return [...new Set(sections.flatMap((section) => [
    ...section.cards.map((card) => card.template.issuer),
    ...section.references.map((template) => template.issuer),
  ]))]
}

function withIssuer(sections: AnnexSection[], issuer: string) {
  if (issuer === allIssuers) return sections
  return sections
    .map((section) => ({
      ...section,
      cards: section.cards.filter((card) => card.template.issuer === issuer),
      references: section.references.filter((template) => template.issuer === issuer),
    }))
    .filter((section) => section.cards.length > 0 || section.references.length > 0)
}

export function AnnexLibrary() {
  const { workspace, run } = useWorkspace()
  const [issuer, setIssuer] = useState(allIssuers)
  const sections = annexIndex(workspace, catalog.templates)
  const monthlyDrafts = workspace.drafts.filter((draft) => draft.templateId === 'anexo-5')

  const open = (build: () => AnnexDraft) =>
    run(async () => {
      const saved = await repository.saveDraft(build(), 0)
      window.location.hash = `/anexos/${saved.id}`
    })
  const create = (template: TemplateDefinition) =>
    open(() =>
      template.id === 'anexo-11' ? buildFinalReport(monthlyDrafts) : createDraft(template.id, workspace.profile!),
    )
  const blockedReason = (template: TemplateDefinition) =>
    template.id === 'anexo-11' && !monthlyDrafts.length ? 'Primero crea un informe mensual' : undefined

  return (
    <div className="page annex-index">
      <header className="page-heading">
        <h1>Anexos</h1>
        <p className="lead">Todos los formatos de tu modalidad, por etapa, con quién los emite y quién los firma.</p>
      </header>
      <div className="segmented" aria-label="Quién lo emite">
        {[allIssuers, ...issuersOf(sections)].map((option) => (
          <button key={option} type="button" aria-pressed={issuer === option} onClick={() => setIssuer(option)}>
            {option}
          </button>
        ))}
      </div>
      {withIssuer(sections, issuer).map((section) => (
        <section key={section.stage} className="annex-section" aria-labelledby={`annex-stage-${section.stage}`}>
          <h2 id={`annex-stage-${section.stage}`}>{section.title}</h2>
          {section.cards.length > 0 && <div className="annex-grid">
            {section.cards.map((card) =>
              card.newMonthly ? (
                <NewMonthlyCard key={card.key} onCreate={(month) => void open(() => createDraft('anexo-5', workspace.profile!, month))} />
              ) : (
                <AnnexIndexCard
                  key={card.key}
                  card={card}
                  onCreate={() => void create(card.template)}
                  createBlockedReason={blockedReason(card.template)}
                />
              ),
            )}
          </div>}
          {section.references.length > 0 && <AnnexReferences references={section.references} />}
        </section>
      ))}
    </div>
  )
}
