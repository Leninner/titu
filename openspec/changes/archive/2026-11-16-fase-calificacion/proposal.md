## Why

Después de la revisión inicial en Biblioteca, el estudiante solicita la designación de calificadores y espera sus notas. Recién con las notas vuelve a Biblioteca para recoger las firmas. Hoy el mapa no muestra la etapa de calificación ni avisa que hay que volver a Biblioteca, y "Biblioteca: firma del estudiante" aparece disponible antes de tener las notas.

## What Changes

- Nuevo recuadro informativo "Calificación del trabajo" después de la designación de calificadores. Indica que los docentes están revisando y muestra la fecha límite de entrega de calificaciones (4/12/2026). No pide documentos ni se completa a mano: su estado sale de la designación.
- "Biblioteca: firma del estudiante" depende de la calificación y avisa que se vuelve a Biblioteca con el trabajo corregido cuando lleguen las notas.
- Las notas se siguen registrando en la designación de calificadores; no se mueven datos.

## Capabilities

### Modified Capabilities

- `graduation-workflow`: etapa informativa de calificación y regreso a Biblioteca tras las notas.

## Impact

- `src/domain/types.ts`, `src/catalog/workflows.ts`, `src/domain/workflow.ts`, `src/domain/informational.ts` (nuevo), `src/domain/process-map.ts`, `src/features/workflow/*`, tests.
