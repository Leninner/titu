## ADDED Requirements

### Requirement: Etapa informativa de designación por Consejo

Para Proyecto de Investigación y Artículo Académico, el sistema SHALL mostrar entre la designación de calificadores y "Calificación del trabajo" un paso informativo "Designación por Consejo Directivo" con la fecha de la sesión de Consejo y una línea de tiempo de la entrega de la solicitud (18/11/2026, 18:00), la sesión de Consejo (19/11/2026), el proceso administrativo (23/11/2026) y la notificación de calificadores (hasta el 24/11/2026), indicando qué hitos ya pasaron. El paso SHALL NOT pedir documentos ni ofrecer completarlo; SHALL mostrarse en revisión cuando la solicitud de designación está lista y completado cuando la notificación de calificadores designados o alguna nota están registradas en la designación, o la designación está completada. La sesión del 20/11 de `CAL-01` se adelanta al 19/11 por el feriado. Fuentes: `CAL-01`, `CAL-02`, `UT-16`, `UT-17`.

#### Scenario: Esperando al Consejo

- **WHEN** Preparar de la designación está listo, no hay notificación registrada y la fecha es 18/11/2026
- **THEN** el paso aparece "En revisión" con la sesión de Consejo del jueves 19 de noviembre de 2026, la solicitud como hito pasado y la sesión como hito próximo.

#### Scenario: Notificación recibida

- **WHEN** la notificación de calificadores designados está registrada en la designación
- **THEN** el paso aparece completado.

#### Scenario: Solicitud sin preparar

- **WHEN** Preparar de la designación no está listo
- **THEN** el paso aparece "Aún no empieza" y muestra igual la línea de tiempo.

## MODIFIED Requirements

### Requirement: Etapa informativa de calificación

Para Proyecto de Investigación y Artículo Académico, el sistema SHALL mostrar después de la designación por Consejo Directivo un paso informativo "Calificación del trabajo" que indica que los calificadores revisan el trabajo y muestra la fecha límite de entrega de calificaciones del calendario. El paso SHALL NOT pedir documentos ni ofrecer completarlo; SHALL mostrarse en revisión cuando la designación por Consejo está completada y completado cuando la designación de calificadores está completada. El paso SHALL mostrar las notas de los dos calificadores, permitir registrarlas en la designación desde el propio paso cuando la designación por Consejo está completada y, con las dos notas, mostrar el promedio sobre 10 indicando si alcanza 7. El modal del paso SHALL NOT ofrecer "Ver detalle". Fuentes: `UT-16`, `UT-17`, `CAL-01`, `CAL-02`.

#### Scenario: Calificadores revisando

- **WHEN** la notificación de calificadores está registrada y la designación no está completada
- **THEN** el paso de calificación aparece "En revisión" con la fecha límite del 4/12/2026.

#### Scenario: Notas recibidas

- **WHEN** la designación de calificadores está completada con las dos notas
- **THEN** el paso de calificación aparece completado.

#### Scenario: Registrar una nota en el modal

- **WHEN** el estudiante escribe 8,5 como nota del primer calificador en el modal de la calificación
- **THEN** la nota queda guardada en la designación y el promedio sigue oculto hasta tener la segunda nota.

#### Scenario: Promedio aprobado

- **WHEN** las notas registradas son 8 y 9
- **THEN** el paso muestra el promedio 8,5 e indica volver a Biblioteca con el trabajo corregido.

#### Scenario: Promedio menor a 7

- **WHEN** las notas registradas son 6 y 7
- **THEN** el paso muestra el promedio 6,5 y avisa que la Unidad de Titulación convoca a calificadores, tutor y estudiante.

#### Scenario: Solicitud sin preparar

- **WHEN** Preparar de la designación no está listo o la designación por Consejo no está completada
- **THEN** las notas aparecen bloqueadas y no se pueden registrar.
