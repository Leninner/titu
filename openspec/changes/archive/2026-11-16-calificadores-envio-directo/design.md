## Decisions

- Nueva bandera `directSend` en `WorkflowDefinition`, activada en `calificadores-research` y `calificadores-article`. Así otros trámites pueden adoptarla sin cambiar el código.
- `sendStep` marca el paso como hecho con detalle "listo" cuando el trámite tiene `directSend`; no se registra ningún envío.
- El botón de descarga del ZIP se extrae a `SubmissionZipButton`, usado por Preparar y por el correo de Enviar, con el mismo nombre de archivo y numeración.
- `EmailComposer` con `directSend` muestra "Copiar mensaje" como acción principal y "Descargar ZIP" al lado; sin `directSend` conserva "Copiar correo completo" y "Solo el mensaje".
- `SendStep` con `directSend` no muestra "Confirmar envío" ni la lista de envíos confirmados.
