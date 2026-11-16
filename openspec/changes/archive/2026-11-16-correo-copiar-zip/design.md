## Decisions

- `EmailComposer` deja de depender de `directSend`: siempre muestra "Copiar mensaje" como acción principal y `SubmissionZipButton` con la etiqueta "Descargar ZIP".
- `directSend` sigue controlando solo si Enviar se marca completo por defecto y si aparece "Confirmar envío". Los demás trámites conservan la confirmación porque "Solicitud de día y hora" reutiliza las versiones exactas del envío registrado de aptitud legal.
