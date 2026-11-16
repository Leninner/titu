## Why

En la designación de calificadores el paso Enviar ya ofrece "Copiar mensaje" y "Descargar ZIP" juntos. Los demás trámites siguen con "Copiar correo completo" y "Solo el mensaje", y el ZIP solo se descarga desde Preparar.

## What Changes

- En el paso Enviar de todos los trámites se muestra "Copiar mensaje" y a su lado "Descargar ZIP"; se quitan "Copiar correo completo" y "Solo el mensaje".
- "Confirmar envío" se mantiene en los trámites que no tienen envío directo.

## Capabilities

### Modified Capabilities

- `graduation-workflow`: acciones del correo iguales en todos los trámites.

## Impact

- `src/features/workflow/EmailComposer.tsx`, `tests/integration/workflow-evidence.test.tsx`.
