## Why

La fila Calificadores muestra tres tarjetas y solo una pide algo al estudiante: "Designación por Consejo Directivo" y "Calificación del trabajo" son esperas seguidas. Juntas cuentan mejor qué pasa y cuándo, con menos ruido.

## What Changes

- "Designación por Consejo Directivo" y "Calificación del trabajo" se unen en un solo paso informativo, "Designación y calificación".
- El paso avanza por etapas: "Aún no empieza", "Esperando al Consejo" (fecha clave 19/11), "Calificando" (fecha clave 4/12) y "Completado".
- Pasa a "Calificando" cuando se registra la notificación o una nota, o cuando ya pasó la fecha de notificación (24/11).
- Su tarjeta muestra una sola línea de tiempo de cinco hitos (solicitud, Consejo, resolución, notificación y notas) y debajo las dos notas con el promedio. Se quitan los textos de explicación sobrantes.
- Las notas se registran desde que la solicitud está lista, como antes de la designación por Consejo.

## Capabilities

### Modified Capabilities

- `graduation-workflow`: un solo paso informativo de designación y calificación por etapas.
- `workspace-interface`: el mapa y el contador nombran el paso unido.

## Impact

- `src/domain/types.ts`, `src/domain/informational.ts`, `src/domain/workflow.ts`, `src/domain/process-map.ts`, `src/domain/designation-timeline.ts`, `src/catalog/workflows.ts`, `src/features/workflow/*`, tests.
