## Why

En la designación de calificadores el estudiante envía el correo por su cuenta: solo necesita copiar el mensaje y adjuntar el ZIP. Hoy tiene que volver a Preparar para descargar el ZIP, elegir entre "Copiar correo completo" y "Solo el mensaje", y además confirmar el envío para pasar a Resultado.

## What Changes

- En el paso Enviar de "Designación de calificadores del Proyecto" y "del Artículo" se quita "Copiar correo completo"; queda "Copiar mensaje" y al lado "Descargar ZIP".
- Se quita "Confirmar envío" en esos trámites: el paso Enviar se muestra completo por defecto y Resultado queda disponible cuando Preparar está listo.
- El resto de trámites no cambia.

## Capabilities

### Modified Capabilities

- `graduation-workflow`: envío directo en la designación de calificadores.

## Impact

- `src/domain/types.ts`, `src/catalog/workflows.ts`, `src/domain/task-steps.ts`, `src/features/workflow/SendStep.tsx`, `src/features/workflow/EmailComposer.tsx`, `src/features/workflow/PrepareStep.tsx`, `src/features/workflow/TaskDetail.tsx`, tests unitarios e integración.
