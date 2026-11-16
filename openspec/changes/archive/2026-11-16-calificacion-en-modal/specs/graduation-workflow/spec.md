## MODIFIED Requirements

### Requirement: Etapa informativa de calificación

Para Proyecto de Investigación y Artículo Académico, el sistema SHALL mostrar después de la designación de calificadores un paso informativo "Calificación del trabajo" que indica que los calificadores revisan el trabajo y muestra la fecha límite de entrega de calificaciones del calendario. El paso SHALL NOT pedir documentos ni ofrecer completarlo; SHALL mostrarse en revisión cuando la solicitud de designación está lista y completado cuando la designación está completada. El paso SHALL mostrar las notas de los dos calificadores, permitir registrarlas en la designación desde el propio paso cuando la solicitud está lista y, con las dos notas, mostrar el promedio sobre 10 indicando si alcanza 7. El modal del paso SHALL NOT ofrecer "Ver detalle". Fuentes: `UT-16`, `UT-17`, `CAL-01`, `CAL-02`.

#### Scenario: Calificadores revisando

- **WHEN** Preparar de la designación está listo y la designación no está completada
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

- **WHEN** Preparar de la designación no está listo
- **THEN** las notas aparecen bloqueadas y no se pueden registrar.
