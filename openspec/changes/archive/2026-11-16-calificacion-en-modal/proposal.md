## Why

El modal de "Calificación del trabajo" solo dice que es un paso informativo y ofrece "Ver detalle", que lleva a otra página para lo mismo. El estudiante no ve sus notas ni el promedio, que es lo que espera de esta etapa, y tiene que ir a la designación de calificadores para registrarlas.

## What Changes

- El modal y la página de la calificación muestran un tablero con las dos notas: cada calificador aparece como pendiente hasta que se registra su nota, y la nota se registra ahí mismo.
- Con las dos notas se revela el promedio sobre 10 con la marca de 7: si llega a 7 indica volver a Biblioteca; si no, avisa de la convocatoria de la Unidad de Titulación.
- Mientras la solicitud de designación no esté lista, las notas aparecen bloqueadas.
- El modal de un paso informativo deja de ofrecer "Ver detalle"; solo "Cerrar".
- Las notas se siguen guardando en la designación de calificadores.

## Capabilities

### Modified Capabilities

- `graduation-workflow`: la etapa informativa de calificación muestra y registra las notas y el promedio.

## Impact

- `src/domain/grading.ts` (nuevo), `src/domain/numeric.ts` (nuevo), `src/domain/workflow.ts`, `src/features/workflow/GradingBoard.tsx` (nuevo), `ProcessMap.tsx`, `InformationalDetail.tsx`, estilos y tests.
