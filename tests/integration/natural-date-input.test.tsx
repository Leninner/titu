// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { NaturalDateInput } from '../../src/components/NaturalDateInput'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})
it('recognizes text without committing and confirms by pill or Enter without submitting', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-22T18:00:00Z'))
  const change = vi.fn()
  const submit = vi.fn((event) => event.preventDefault())
  render(
    <form onSubmit={submit}>
      <NaturalDateInput label="Fecha prevista" value="" onChange={change} />
    </form>,
  )
  fireEvent.change(screen.getByLabelText('Fecha prevista'), {
    target: { value: 'el 21 de noviembre' },
  })
  expect(change).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Usar 21 de noviembre de 2026' }))
  expect(change).toHaveBeenLastCalledWith('2026-11-21')
  fireEvent.change(screen.getByLabelText('Fecha prevista'), { target: { value: 'mañana' } })
  fireEvent.keyDown(screen.getByLabelText('Fecha prevista'), { key: 'Enter' })
  expect(change).toHaveBeenLastCalledWith('2026-10-23')
  expect(submit).not.toHaveBeenCalled()
})
it('keeps invalid or cleared typing local until explicit removal', () => {
  const change = vi.fn()
  render(<NaturalDateInput label="Fecha" value="2026-11-21" onChange={change} />)
  fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '31 abril' } })
  expect(screen.getByText(/Esa fecha no es válida/)).toBeTruthy()
  expect(change).not.toHaveBeenCalled()
  expect((screen.getByLabelText('Fecha') as HTMLInputElement).checkValidity()).toBe(false)
  fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '' } })
  expect(change).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Quitar fecha' }))
  expect(change).toHaveBeenCalledWith('')
})
it('offers confirmation for native calendar selections too', () => {
  const change = vi.fn()
  render(<NaturalDateInput label="Fecha" value="" onChange={change} />)
  fireEvent.change(screen.getByLabelText('Fecha en calendario'), {
    target: { value: '2027-02-03' },
  })
  expect(change).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Usar 3 de febrero de 2027' }))
  expect(change).toHaveBeenCalledWith('2027-02-03')
})
it('resets the editing buffer when an external confirmed date changes', () => {
  const change = vi.fn()
  const view = render(<NaturalDateInput label="Fecha" value="2026-11-21" onChange={change} />)
  fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: 'mañana' } })
  view.rerender(<NaturalDateInput label="Fecha" value="2027-01-15" onChange={change} />)
  expect((screen.getByLabelText('Fecha') as HTMLInputElement).value).toBe('15 de enero de 2027')
  expect(screen.queryByRole('button', { name: /Usar/ })).toBeNull()
  expect(change).not.toHaveBeenCalled()
})
