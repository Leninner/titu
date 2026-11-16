## ADDED Requirements

### Requirement: Etapa informativa de calificación

Para Proyecto de Investigación y Artículo Académico, el sistema SHALL mostrar después de la designación de calificadores un paso informativo "Calificación del trabajo" que indica que los calificadores revisan el trabajo y muestra la fecha límite de entrega de calificaciones del calendario. El paso SHALL NOT pedir documentos ni ofrecer completarlo; SHALL mostrarse en revisión cuando la solicitud de designación está lista y completado cuando la designación está completada. Fuentes: `UT-16`, `UT-17`, `CAL-01`, `CAL-02`.

#### Scenario: Calificadores revisando

- **WHEN** Preparar de la designación está listo y la designación no está completada
- **THEN** el paso de calificación aparece "En revisión" con la fecha límite del 4/12/2026.

#### Scenario: Notas recibidas

- **WHEN** la designación de calificadores está completada con las dos notas
- **THEN** el paso de calificación aparece completado.

### Requirement: Regreso a Biblioteca con las notas

El sistema SHALL bloquear "Biblioteca: firma del estudiante" hasta que la calificación esté completada y SHALL indicar que, con las notas de los calificadores, el estudiante vuelve a Biblioteca con el trabajo corregido. Fuentes: `UT-22`, `UT-23`.

#### Scenario: Sin notas

- **WHEN** la revisión inicial de Biblioteca está completada pero faltan las notas
- **THEN** "Biblioteca: firma del estudiante" sigue bloqueada y lista "Calificación del trabajo" como pendiente.
