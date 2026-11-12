## Why

El trámite "Informe final de avance del tutor" no se puede completar si el Anexo 11 generado en la aplicación no está completo. Ese borrador es solo una ayuda: lo que cuenta es el Anexo 11 firmado por el tutor. Un estudiante que preparó el informe por su cuenta queda bloqueado.

## What Changes

- El Anexo 11 editable de Preparar pasa a ser opcional y no bloquea el trámite.
- Para completar el trámite solo se exige subir el Anexo 11 firmado en Resultado y confirmar su firma.

## Capabilities

### Modified Capabilities

- `graduation-workflow`: el borrador del Anexo 11 es una ayuda opcional.

## Impact

- `src/catalog/workflows.ts`, `tests/unit/task-steps.test.ts`, `tests/integration/workflow-evidence.test.tsx`.
