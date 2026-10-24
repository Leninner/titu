// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { AnnexDocument } from '../../src/features/annexes/AnnexDocument'
import { createDraft } from '../../src/domain/annex'
import { newProfile } from '../../src/domain/types'
import { templates } from '../../src/catalog/templates'

afterEach(cleanup)
it('renders every editable template with an incomplete profile', () => {
  for (const template of templates.filter((item) => item.kind === 'editable')) {
    const draft = createDraft(template.id, { ...newProfile(), modalidad: template.modalities[0] })
    render(<AnnexDocument draft={draft} onChange={() => {}} />)
    expect(screen.getByRole('article', { name: 'Documento editable' })).toBeTruthy()
    expect(screen.queryByText(/undefined/)).toBeNull()
    cleanup()
  }
})
it('edits a field in the letter and keeps its surrounding text', () => {
  const draft = createDraft('anexo-9', { ...newProfile(), nombres: 'Ana Pérez' })
  const onChange = vi.fn()
  render(<AnnexDocument draft={draft} onChange={onChange} />)
  const reason = screen.getByRole('textbox', { name: 'Causa del cambio' })
  reason.textContent = 'Cambio de horario'
  fireEvent.input(reason)
  expect(onChange.mock.calls[0][0].fields.motivo).toBe('Cambio de horario')
  expect(screen.getAllByText('Ana Pérez').length).toBeGreaterThan(0)
})
