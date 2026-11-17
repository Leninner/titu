## Why

Entre enviar la solicitud de calificadores y recibir las notas, el Consejo Directivo sesiona, designa a los calificadores y notifica al estudiante. Hoy el mapa salta de la solicitud a "Calificación del trabajo" y no muestra cuándo pasa cada cosa. Según la agenda oficial (`CAL-01`, `CAL-02`) la sesión de Consejo es el 19/11/2026 (movida del 20/11 por el feriado), el proceso administrativo el 23/11 y la notificación llega hasta el 24/11.

## What Changes

- Nuevo paso informativo "Designación por Consejo Directivo" entre la solicitud de calificadores y la calificación, con la fecha de la sesión de Consejo y una línea de tiempo de los cuatro hitos del calendario: solicitud (18/11), sesión (19/11), proceso administrativo (23/11) y notificación (hasta 24/11), marcando cuáles ya pasaron.
- El paso se completa cuando el estudiante registra la notificación de calificadores designados o una nota en la designación.
- "Calificación del trabajo" pasa a depender de este paso: queda en revisión cuando la designación por Consejo está completada y las notas se habilitan desde entonces.
- Cada paso informativo tiene su propio mensaje de espera.

## Capabilities

### Modified Capabilities

- `graduation-workflow`: paso informativo de designación por Consejo y nueva condición de la calificación.
- `workspace-interface`: el contador sigue sin contar los pasos informativos.

## Impact

- `src/domain/types.ts`, `src/domain/informational.ts`, `src/domain/workflow.ts`, `src/domain/process-map.ts`, `src/catalog/workflows.ts`, `src/features/workflow/*`, tests.
