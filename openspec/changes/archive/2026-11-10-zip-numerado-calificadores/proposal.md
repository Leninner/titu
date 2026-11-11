## Why

La Unidad de Titulación pide los documentos de la designación de calificadores numerados en un orden fijo y con nombres estándar. Hoy el ZIP usa el orden de selección y el nombre original de cada archivo, así que el estudiante tiene que renombrarlos a mano.

## What Changes

- Cada requisito de archivo puede declarar el nombre con el que entra al paquete.
- En "Designación de calificadores del Proyecto" el ZIP y la lista de adjuntos del correo siguen el orden de los requisitos y usan los nombres estándar: "1. Solicitud calificación del informe final.pdf" … "14. Trabajo de titulación.pdf".
- Los informes mensuales se numeran por mes: "Informe mensual 1.pdf", "Informe mensual 2.pdf"…
- Los requisitos sin nombre estándar conservan el nombre original del archivo.

## Capabilities

### Modified Capabilities

- `graduation-workflow`: paquete ZIP numerado con nombres estándar.

## Impact

- `src/domain/types.ts` (`Requirement.submissionName`), `src/catalog/workflows.ts`, nuevo `src/domain/submission-entries.ts`, `src/export/submission-zip.ts`, `src/domain/submission-email.ts`, `src/features/workflow/PrepareStep.tsx`, tests unitarios e integración.
