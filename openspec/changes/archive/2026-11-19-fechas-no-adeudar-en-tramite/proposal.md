## Why

Al subir el formulario de no adeudar desde el trámite, la tarjeta lo marca "Listo" pero "Completar trámite" queda deshabilitado sin explicación. La vigencia exige la fecha de emisión o el vencimiento impreso, y esas fechas solo se pueden registrar en Documentos; el trámite nunca las pide ni muestra lo que falta.

## What Changes

- Al subir el formulario de no adeudar en PDF, la fecha de emisión se lee del documento: la mayor «FECHA:» del formulario, que es la de la cabecera.
- La tarjeta del no adeudar en un trámite (resultado del propio trámite y requisito de día y hora) permite registrar "Emisión" y "Vencimiento impreso" del archivo incluido.
- Sin ninguna de las dos fechas, la tarjeta muestra "Falta la emisión" en lugar de "Listo".
- El faltante de vigencia dice "No adeudar: registra la fecha de emisión".
- El paso de resultado lista lo que falta para completar el trámite.

## Capabilities

### Modified Capabilities

- `graduation-workflow`: registro de fechas del no adeudar desde el trámite y faltantes visibles en el resultado.

## Impact

- `src/domain/dates.ts`, `src/domain/no-debt.ts`, `src/features/documents/issue-date.ts`, `src/features/documents/DocumentCard.tsx`, `src/features/workflow/RequirementsPanel.tsx`, `src/features/workflow/ResultStep.tsx`, `src/features/workflow/evidence-actions.ts`, `src/features/workflow/TaskDetail.tsx`, `src/features/workflow/PrepareStep.tsx`, tests.
