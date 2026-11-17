## Decisions

- `WorkflowDefinition.informational` pasa de booleano a `{ waiting, outcome? }`: `waiting` es el mensaje en revisión y `outcome` el id del resultado de la designación que completa el paso.
- `informationalSources` resuelve las dependencias de un paso informativo hasta los trámites reales; la calificación encuentra así la designación donde se guardan las notas aunque dependa de otro paso informativo.
- Estado de "Designación por Consejo": completado si en algún trámite de origen está registrada la notificación (`resolucion-designacion`), hay alguna nota o el trámite está completado; en revisión si Preparar de la solicitud está listo; bloqueado en otro caso.
- Estado de "Calificación del trabajo": completado cuando la designación de calificadores está completada; en revisión cuando la designación por Consejo está completada; bloqueado en otro caso. Las notas se registran desde que deja de estar bloqueada.
- Cada paso informativo elige su tablero por id (`informationalBoards`): calificación muestra las notas y designación la línea de tiempo del calendario. La fecha clave de la designación es `consejo-calificadores`.
- La línea de tiempo usa los eventos `calificadores-limite`, `consejo-calificadores`, `proceso-calificadores` y `notificacion-calificadores` del calendario del perfil, con su fecha efectiva, y marca cada hito como pasado, hoy o próximo según la fecha de Ecuador.
