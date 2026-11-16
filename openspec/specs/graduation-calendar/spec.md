# graduation-calendar Specification

## Purpose
Mostrar las fechas del calendario de titulación del período julio–diciembre 2026 en hora Ecuador, con su fuente y los ajustes oficiales conocidos.

## Requirements

### Requirement: Fechas de calificadores ajustadas por feriado

Como el 20 de noviembre de 2026 es feriado, el sistema SHALL mostrar la entrega del informe final y la solicitud de designación de calificadores hasta el 18 de noviembre de 2026 a las 18:00 y la sesión de Consejo de calificadores el 19 de noviembre de 2026. El sistema SHALL mantener la ventana de solicitud de no adeudar del 16 al 20 de noviembre hasta su validación. Fuentes: `CAL-01`, `CAL-02`, ajuste por feriado.

#### Scenario: Entrega de calificadores

- **WHEN** el estudiante de proyecto de investigación o artículo revisa el calendario o el trámite de calificadores
- **THEN** ve la entrega hasta el 18/11/2026 a las 18:00.

#### Scenario: Sesión de Consejo

- **WHEN** el estudiante revisa el calendario
- **THEN** ve la sesión de Consejo de calificadores el 19/11/2026.
