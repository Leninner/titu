## Why

Cada documento acumula versiones: reemplazar un archivo o marcar que tiene firmas guarda una copia nueva, y la tarjeta muestra "Historial · N versiones". Al estudiante no le sirve ese historial y le pesa. Además, el trabajo sin firmas, el firmado por el estudiante, el que tiene las firmas docentes y el firmado por Decanato comparten la categoría `tesis`, así que las etapas se mezclan en una sola tarjeta y solo el historial permite distinguirlas.

## What Changes

- Cada documento conserva un solo archivo. Al reemplazarlo o cambiar su firma, el archivo anterior se elimina, salvo que forme parte de un envío registrado: ese queda tal como se envió.
- Se quita la sección "Historial" de las tarjetas de Documentos. La tarjeta ofrece descargar y eliminar el archivo actual.
- Eliminar un archivo lo quita también de los trámites no enviados que lo usaban. Un archivo que forma parte de un envío no se puede eliminar.
- El trabajo de titulación se separa en tarjetas por etapa: sin firmas, corregido, firmado por el estudiante, con firmas docentes y firmado por Decanato. Cada trámite pide la tarjeta de su etapa.
- **BREAKING (datos locales):** una migración del expediente y de los respaldos reparte los archivos de "Trabajo de titulación" según el trámite que los usa, deja un archivo por documento conservando los enviados y libera los archivos que nadie usa.

## Capabilities

### Modified Capabilities

- `graduation-workflow`: etapas del trabajo de titulación como categorías propias y migración de los archivos existentes.
- `workspace-interface`: un archivo por documento, sin historial de versiones, con descarga y eliminación del archivo actual.

## Impact

- `src/catalog/workflows.ts`, `src/domain/workflow.ts`, `src/features/documents/document-categories.ts`, `src/domain/file-names.ts`.
- `src/storage/{repository,db,migrate-workspace}.ts` y restauración de respaldos.
- `src/features/documents/DocumentCard.tsx`.
- Tests unitarios, de integración y e2e de documentos, trámites y almacenamiento.
