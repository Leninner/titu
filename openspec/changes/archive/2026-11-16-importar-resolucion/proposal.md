## Why

La resolución de aprobación de modalidad y tema es el primer documento oficial del estudiante y contiene casi todos los datos de Titulación. Hoy se copian a mano, y el campo "Resolución de aprobación o cambio" no explica qué escribir.

## What Changes

- El campo pasa a llamarse "Número de resolución de aprobación", con un ejemplo.
- En la ficha Titulación de Ajustes, "Llenar desde la resolución" lee el PDF y propone número de resolución, fecha de aprobación, nombres, modalidad, carrera, período, tema y tutor. El estudiante elige qué datos usar antes de guardar.
- El PDF se guarda en Documentos como "Resolución de modalidad y tema".

## Capabilities

### Modified Capabilities

- `workspace-interface`: importación de datos desde la resolución de aprobación.

## Impact

- `src/domain/approval-resolution.ts` (nuevo), `src/features/settings/*`, `src/components/Field.tsx`, tests unitarios e integración.
