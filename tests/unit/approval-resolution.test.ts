import { expect, it } from 'vitest'
import { parseApprovalResolution } from '../../src/domain/approval-resolution'

const resolution = `Ambato, 21 de agosto de 2026  Resolución 0942-P-CD-FISEI-UTA-2026  Ingeniero, Mg.
Consejo Directivo de la Facultad, en sesión ordinaria presencial del día 21 de agosto de 2026, conoce el ACUERDO FISEI UTSW-0047-2026, de 18 de agosto de 2026,
quien sugiere se apruebe la modalidad del trabajo de Titulación:   Proyecto de Investigación , y la Propuesta del perfil del Trabajo de Titulación de el/la señor/ita   María José Pérez Muñoz , estudiante de la Carrera de Software. Al respecto se RESUELVE:
APROBAR   LA   MODALIDAD   DE   TITULACIÓN:   PROYECTO   DE   INVESTIGACIÓN  PRESENTADA POR EL/LA SEÑOR/ITA   MARÍA JOSÉ PÉREZ MUÑOZ,  ESTUDIANTE   DE   NOVENO   NIVEL   EN   EL   PERIODO   ACADÉMICO   JULIO   - DICIEMBRE 2026   DE LA CARRERA DE   SOFTWARE   APROBADO CON RESOLUCIÓN: 0385-CU-P-2023.
APROBAR   LA   PROPUESTA   DEL   TRABAJO   DE   TITULACIÓN:   “SISTEMA   DE GESTIÓN   DE   TITULACIÓN”   DE EL/LA SEÑOR/ITA   MARÍA JOSÉ PÉREZ MUÑOZ
DESIGNAR   COMO   TUTOR/A   PARA EL DESARROLLO DEL TRABAJO DE TITULACIÓN A EL/LA   ING.   JOSÉ ANTONIO   NÚÑEZ   MG. ,   CONFORME   A   LO SOLICITADO`

it('reads the approval data from a Consejo Directivo resolution', () => {
  expect(parseApprovalResolution(resolution)).toEqual({
    aprobacionResolucion: '0942-P-CD-FISEI-UTA-2026',
    aprobacionFecha: '2026-08-21',
    nombres: 'María José Pérez Muñoz',
    modalidad: 'research',
    carrera: 'Software',
    periodo: '2026-07-12',
    tema: 'SISTEMA DE GESTIÓN DE TITULACIÓN',
    tutor: 'Ing. José Antonio Núñez Mg.',
  })
})

it('marks unknown periods as other and ignores unrelated text', () => {
  expect(parseApprovalResolution(resolution.replace('JULIO   - DICIEMBRE 2026', 'ABRIL - AGOSTO 2027')).periodo).toBe('other')
  expect(parseApprovalResolution('Informe mensual de avance sin datos de resolución')).toEqual({})
})
