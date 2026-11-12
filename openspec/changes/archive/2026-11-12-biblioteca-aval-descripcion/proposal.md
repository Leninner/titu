## Why

En la revisión presencial Biblioteca FISEI no entrega ningún documento de aval inicial. El paso Resultado de "Biblioteca: revisión del trabajo sin firmas" pide subir un archivo que no existe, así que el estudiante no puede completar el trámite de forma honesta.

## What Changes

- El Resultado de la revisión de Biblioteca deja de pedir el archivo "Aval inicial de Biblioteca".
- En su lugar muestra un campo de texto "Detalles del aval de Biblioteca" para anotar lo que indicó Biblioteca (fecha, observaciones, quién revisó).
- El campo es opcional: el trámite se completa sin archivo.
- Los requisitos pueden declararse como texto libre.

## Capabilities

### Modified Capabilities

- `graduation-workflow`: revisión presencial de Biblioteca sin archivo de aval.

## Impact

- `src/domain/types.ts` (`Requirement.text`), `src/catalog/workflows.ts`, `src/domain/workflow.ts`, `src/features/workflow/RequirementFields.tsx`, tests unitarios e integración.
