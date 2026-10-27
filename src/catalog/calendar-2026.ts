import type { CalendarEvent, Modality } from '../domain/types'

const work: Modality[] = ['research', 'article']
const rows: [
  string,
  string,
  CalendarEvent['kind'],
  string,
  string?,
  string?,
  Modality[]?,
  string[]?,
][] = [
  [
    'calificadores-limite',
    'Entrega informe final y solicitud calificadores',
    'deadline',
    '2026-11-19',
    undefined,
    '18:00',
  ],
  ['consejo-calificadores', 'Sesión Consejo: calificadores', 'administrative', '2026-11-20'],
  [
    'proceso-calificadores',
    'Proceso administrativo: calificadores',
    'administrative',
    '2026-11-23',
  ],
  [
    'notificacion-calificadores',
    'Notificación calificadores (hasta esta fecha)',
    'deadline',
    '2026-11-24',
  ],
  [
    'biblioteca-revision',
    'Revisión presencial Biblioteca (8:30–12:30 y 14:30–16:30)',
    'appointment',
    '2026-11-10',
    undefined,
    '08:30',
    work,
    ['BIB-01'],
  ],
  ['solicitud-no-adeudar', 'Solicitud no adeudar', 'window', '2026-11-16', '2026-11-20', '18:00'],
  [
    'emision-no-adeudar',
    'Emisión no adeudar con firmas (fecha institucional)',
    'deadline',
    '2026-12-07',
  ],
  ['calificaciones-limite', 'Entrega calificaciones', 'deadline', '2026-12-04'],
  ['aptitud-solicitud', 'Solicitud aptitud legal', 'deadline', '2026-12-08', undefined, '18:00'],
  [
    'aptitud-elaboracion',
    'Elaboración aptitud legal',
    'deadline',
    '2026-12-10',
    undefined,
    '16:00',
  ],
  ['dia-hora-limite', 'Solicitud día y hora', 'deadline', '2026-12-10', undefined, '18:00'],
  ['consejo-sustentacion', 'Sesión Consejo: sustentación', 'administrative', '2026-12-11'],
  [
    'notificacion-sustentacion',
    'Proceso y notificación sustentación',
    'window',
    '2026-12-14',
    '2026-12-16',
  ],
  [
    'sustentaciones-limite',
    'Sustentaciones hasta esta fecha, según cupos (no es cita personal)',
    'deadline',
    '2026-12-21',
  ],
  [
    'complexivo-examen',
    'Examen complexivo hasta esta fecha',
    'deadline',
    '2026-12-04',
    undefined,
    undefined,
    ['complexivo'],
    ['CAL-02'],
  ],
  [
    'complexivo-segunda',
    'Segunda oportunidad complexivo (condicional)',
    'deadline',
    '2026-12-11',
    undefined,
    undefined,
    ['complexivo'],
    ['CAL-02'],
  ],
]
export const calendarEvents: CalendarEvent[] = rows.map(
  ([id, title, kind, startDate, endDate, localTime, modalities = work, sourceIds]) => ({
    id,
    title,
    kind,
    startDate,
    endDate,
    localTime,
    modalities,
    sourceIds:
      sourceIds ??
      ([
        'calificadores-limite',
        'notificacion-calificadores',
        'calificaciones-limite',
        'dia-hora-limite',
        'notificacion-sustentacion',
        'sustentaciones-limite',
      ].includes(id)
        ? ['CAL-01', 'CAL-02']
        : ['CAL-01']),
    timeZone: 'America/Guayaquil',
    periodId: '2026-07-12',
    certainty:
      'Calendario aportado julio–diciembre 2026. Hora no indicada cuando no consta. No extrapolar a otros períodos.',
  }),
)
