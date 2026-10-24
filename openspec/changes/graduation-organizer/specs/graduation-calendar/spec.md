## ADDED Requirements

### Requirement: Calendario del período por modalidad

El sistema SHALL cargar exactamente los eventos, modalidades y fuentes de references/calendar-2026.md para julio–diciembre 2026 sin extrapolarlos a otros períodos.

#### Scenario: Proyecto 2026

- **WHEN** abre calendario del período
- **THEN** ve solicitud de no adeudar 16–20/11 con cierre a las 18:00 y emisión hasta 7/12 como actuación institucional separada.

#### Scenario: Complexivo 2026

- **WHEN** elige esa modalidad
- **THEN** ve examen hasta 4/12 y segunda oportunidad hasta 11/12; no hereda plazos PI/AA exclusivos.

#### Scenario: Otro período

- **WHEN** selecciona un período sin agenda
- **THEN** ve Sin calendario confirmado y puede agregar fechas personales sin recibir automáticamente fechas de 2026.

### Requirement: Precisión temporal y citas

El sistema SHALL diferenciar fechas sin hora, límites horarios, ventanas y citas individuales, usando America/Guayaquil y conservando fuentes al personalizar.

#### Scenario: Dispositivo en otra zona

- **WHEN** consulta límite de calificadores desde Europa
- **THEN** sigue viendo 19/11/2026 a las 18:00 hora Ecuador.

#### Scenario: Hora ausente

- **WHEN** consulta entrega de notas 4/12
- **THEN** ve Hora no indicada; no aparece una hora oficial inventada.

#### Scenario: Defensa no asignada

- **WHEN** todavía no recibió notificación individual
- **THEN** ve hasta 21/12 según cupos, sin cita ficticia del 16/12; puede registrar luego su fecha/hora reales.

### Requirement: Avisos locales e ICS

El sistema SHALL mostrar avisos a 7/3/1 días y vencido al abrir la app y permitir exportar ICS con UID estable, sin prometer notificaciones con la app cerrada.

#### Scenario: Exportación de límite con hora

- **WHEN** exporta el evento del 19/11 a las 18:00 Ecuador
- **THEN** el ICS expresa el instante equivalente 20261119T230000Z y una descripción con fuente.

#### Scenario: Evento sin hora

- **WHEN** exporta la entrega de notas
- **THEN** el ICS usa fecha all-day y el fin exclusivo correcto, no un instante ficticio.

#### Scenario: Aplicación cerrada

- **WHEN** el usuario configura recordatorios
- **THEN** la interfaz explica que los avisos internos aparecen al abrir; el calendario importado gestiona sus propias notificaciones.

### Requirement: Vigencia de no adeudar

El sistema SHALL calcular referencia de 30 días desde emisión real, usar vencimiento explícito cuando exista y contrastar con ingreso de solicitud, señalando incertidumbre del día frontera.

#### Scenario: Fechas diferentes

- **WHEN** solicitó el formulario el 20/11 pero fue emitido el 7/12
- **THEN** se calcula la referencia desde 7/12 y nunca desde la solicitud ni desde la fecha máxima de emisión del cronograma.

#### Scenario: Día frontera

- **WHEN** la entrega prevista coincide con emisión más 30 días y no hay hora ni vencimiento impreso
- **THEN** ve Verificar vigencia, no una afirmación de válido.

#### Scenario: Emisión desconocida

- **WHEN** no registró fecha de emisión
- **THEN** ve Pendiente de registrar y no un vencimiento supuesto.
