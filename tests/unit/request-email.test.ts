import { expect, it } from 'vitest'
import { buildRequestEmail } from '../../src/domain/submission-email'
import { newProfile } from '../../src/domain/types'

it('signs a request email with the student name', () => {
  const email = buildRequestEmail(
    { to: 'informacion.fisei@uta.edu.ec', subject: 'Solicitud', paragraphs: ['Estimados señores:', 'Solicito el certificado.'] },
    { ...newProfile(), nombres: 'Lenin Mazabanda' },
  )
  expect(email).toEqual({
    to: 'informacion.fisei@uta.edu.ec',
    subject: 'Solicitud',
    body: 'Estimados señores:\n\nSolicito el certificado.\n\nAtentamente,\nLenin Mazabanda',
  })
})

it('fills profile data in the subject and body and keeps its own closing', () => {
  const email = buildRequestEmail(
    {
      to: 'titulacion_fisei@uta.edu.ec',
      subject: 'Aval de revisión de informes {{nombres}}',
      paragraphs: ['Solicito el aval bajo la tutoría del {{tutor}}.'],
      closing: 'Saludos',
    },
    { ...newProfile(), nombres: 'Lenin Mazabanda', tutor: '' },
  )
  expect(email.subject).toBe('Aval de revisión de informes Lenin Mazabanda')
  expect(email.body).toBe('Solicito el aval bajo la tutoría del [Nombre del tutor].\n\nSaludos\nLenin Mazabanda')
})

it('does not double the period after a value that already ends with one', () => {
  const email = buildRequestEmail(
    { to: 'x@uta.edu.ec', subject: 'Aval', paragraphs: ['Bajo la tutoría del {{tutor}}.'] },
    { ...newProfile(), nombres: 'Lenin', tutor: 'Ing. Leonardo Torres Valverde Mg.' },
  )
  expect(email.body.split('\n\n')[0]).toBe('Bajo la tutoría del Ing. Leonardo Torres Valverde Mg.')
})
