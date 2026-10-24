// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { MonthlyAnnexEditor } from '../../src/features/annexes/MonthlyAnnexEditor'
import type { AnnexDraft } from '../../src/domain/types'
import { annexFixture } from '../fixtures/annexes'

afterEach(() => { cleanup(); vi.useRealTimers() })
it('records progress and recognizes activity dates without a document preview', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-22T18:00:00Z'))
  function Editor() {
    const [draft, setDraft] = useState<AnnexDraft>({ ...annexFixture(), monthlyPeriod: '2026-10', activities: [] })
    return <MonthlyAnnexEditor draft={draft} onChange={setDraft} />
  }
  render(<Editor />)
  expect(screen.queryByRole('article')).toBeNull()
  fireEvent.change(screen.getByLabelText('Avance acumulado (%)'), { target: { value: '45' } })
  expect(screen.getByLabelText('Avance acumulado (%)')).toHaveValue('45')
  fireEvent.click(screen.getByRole('button', { name: 'Agregar actividad' }))
  fireEvent.change(screen.getByLabelText('Actividad 1'), { target: { value: 'Ayer estuve en el curso haciendo pruebas' } })
  expect(screen.getByLabelText('Fecha de actividad 1')).toHaveValue('2026-10-21')
  fireEvent.change(screen.getByLabelText('Fecha de actividad 1'), { target: { value: '2026-11-01' } })
  expect(screen.getByLabelText('Fecha de actividad 1')).toHaveValue('2026-10-21')
})
it('updates date presets when changing month, including February', () => {
  function Editor() {
    const [draft, setDraft] = useState<AnnexDraft>({ ...annexFixture(), monthlyPeriod: '2026-10' })
    return <MonthlyAnnexEditor draft={draft} onChange={setDraft} />
  }
  render(<Editor />)
  fireEvent.click(screen.getByRole('button', { name: 'Último día' }))
  expect(screen.getByText('31/10/2026')).toBeTruthy()
  fireEvent.change(screen.getByLabelText('Mes del informe'), { target: { value: '2028-02' } })
  expect(screen.getByText('29/02/2028')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Primer día' }))
  expect(screen.getByText('01/02/2028')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Personalizada' }))
  fireEvent.change(screen.getByLabelText('Fecha personalizada'), { target: { value: '2028-03-04' } })
  expect(screen.getByLabelText('Fecha personalizada')).toHaveValue('2028-03-04')
})
it('limits the slider and shortcuts to the previous progress', () => {
  const onChange = vi.fn()
  render(<MonthlyAnnexEditor draft={annexFixture()} minimumProgress={65} onChange={onChange} />)
  expect(screen.getByRole('slider')).toHaveAttribute('min', '65')
  expect(screen.getByRole('button', { name: 'Registrar 50% de avance' })).toBeDisabled()
  fireEvent.click(screen.getByRole('button', { name: 'Registrar 75% de avance' }))
  expect(onChange.mock.calls[0][0].fields.avance).toBe('75')
  expect(screen.getByRole('button', { name: 'Agregar actividad' })).toHaveTextContent('Agregar')
})
it.each(['', '44'])('initializes saved progress %s to the previous report value', (progress) => {
  const onChange = vi.fn()
  const draft = annexFixture()
  draft.fields.avance = progress
  render(<MonthlyAnnexEditor draft={draft} minimumProgress={65} onChange={onChange} />)
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ fields: expect.objectContaining({ avance: '65' }) }))
  expect(screen.getByRole('slider')).toHaveValue('65')
  expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '65 por ciento')
})
it('shows dates in compact table cells with a concise out-of-month status', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-22T18:00:00Z'))
  const draft = annexFixture()
  draft.monthlyPeriod = '2026-11'
  draft.activities = [{ id: 'past', date: '', description: 'ayer estuve trabajando en algo' }]
  render(<MonthlyAnnexEditor draft={draft} onChange={() => {}} />)
  const date = screen.getByText('21/10/2026')
  expect(date.closest('td')).toHaveClass('activity-register-date')
  expect(screen.getByRole('columnheader', { name: 'Actividad' })).toBeTruthy()
  expect(screen.queryByText('Añadir fecha')).toBeNull()
  expect(screen.getByText('Fuera del mes')).toBeTruthy()
  expect(screen.getByLabelText('Fecha de actividad 1')).toHaveValue('')
})
