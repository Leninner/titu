## REMOVED Requirements

### Requirement: Etapa informativa de designación por Consejo

**Reason**: Se une con la calificación en un solo paso, "Designación y calificación".
**Migration**: La línea de tiempo del Consejo se muestra en "Designación y calificación".

## MODIFIED Requirements

### Requirement: Etapa informativa de calificación

Para Proyecto de Investigación y Artículo Académico, el sistema SHALL mostrar después de la designación de calificadores un solo paso informativo "Designación y calificación" con una línea de tiempo de la solicitud (18/11/2026), la sesión de Consejo (19/11/2026, adelantada del 20/11 por el feriado), la resolución (23/11/2026), la notificación (hasta el 24/11/2026) y la entrega de notas (hasta el 4/12/2026), marcando los hitos que ya pasaron, y debajo las notas de los dos calificadores. El paso SHALL NOT pedir documentos ni ofrecer completarlo. SHALL mostrarse "Aún no empieza" mientras la solicitud no está lista; "Esperando al Consejo", con la fecha de la sesión, cuando la solicitud está lista; "Calificando", con la fecha de entrega de notas, cuando hay notificación o alguna nota registrada en la designación o ya pasó la fecha de notificación; y completado cuando la designación está completada. SHALL permitir registrar las notas en la designación cuando la solicitud está lista y, con las dos notas, mostrar el promedio sobre 10 indicando si alcanza 7. El modal del paso SHALL NOT ofrecer "Ver detalle". Fuentes: `UT-16`, `UT-17`, `CAL-01`, `CAL-02`.

#### Scenario: Calificadores revisando

- **WHEN** la notificación o una nota están registradas y la designación no está completada
- **THEN** el paso aparece "Calificando" con la fecha límite del 4/12/2026.

#### Scenario: Notas recibidas

- **WHEN** la designación de calificadores está completada con las dos notas
- **THEN** el paso aparece completado.

#### Scenario: Registrar una nota en el modal

- **WHEN** el estudiante escribe 8,5 como nota del primer calificador en el modal del paso
- **THEN** la nota queda guardada en la designación y el promedio sigue oculto hasta tener la segunda nota.

#### Scenario: Promedio aprobado

- **WHEN** las notas registradas son 8 y 9
- **THEN** el paso muestra el promedio 8,5 e indica volver a Biblioteca.

#### Scenario: Promedio menor a 7

- **WHEN** las notas registradas son 6 y 7
- **THEN** el paso muestra el promedio 6,5 y avisa que la Unidad de Titulación convoca a calificadores, tutor y estudiante.

#### Scenario: Solicitud sin preparar

- **WHEN** Preparar de la designación no está listo
- **THEN** el paso aparece "Aún no empieza" con la sesión de Consejo del 19/11/2026, muestra la línea de tiempo y las notas aparecen bloqueadas.

#### Scenario: Esperando al Consejo

- **WHEN** Preparar de la designación está listo, sin notificación ni notas, el 18/11/2026
- **THEN** el paso aparece "Esperando al Consejo" con la sesión del 19/11/2026 y la solicitud marcada como hito de hoy.

### Requirement: Regreso a Biblioteca con las notas

El sistema SHALL bloquear "Biblioteca: firma del estudiante" hasta que la designación y calificación esté completada y SHALL indicar que, con las notas de los calificadores, el estudiante vuelve a Biblioteca con el trabajo corregido. Fuentes: `UT-22`, `UT-23`.

#### Scenario: Sin notas

- **WHEN** la revisión inicial de Biblioteca está completada pero faltan las notas
- **THEN** "Biblioteca: firma del estudiante" sigue bloqueada y lista "Designación y calificación" como pendiente.

### Requirement: Rúbricas de calificación

La guía de "Designación y calificación" SHALL mostrar la rúbrica del Anexo 12 (marco teórico 2, metodología 2,5, resultados y discusión 2,5, conclusiones y recomendaciones 2, referencias y anexos 1; total 10), y la de "Sustentación o incorporación" SHALL mostrar la del Anexo 16 (sustentación 7, recursos visuales y tecnológicos 1,5, expresión oral 1,5; total 10). Fuente: `UT-17`, `UT-27`.

#### Scenario: Rúbrica del Anexo 12

- **WHEN** abre "Designación y calificación"
- **THEN** ve los cinco criterios con su puntaje máximo y el total de 10.
