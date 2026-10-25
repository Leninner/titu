## Why

La fila de chips "Adjuntar" sobre el cuerpo del correo se lee como una etiqueta y no ayuda a enviar el archivo: el estudiante tiene que ir a Documentos a buscar su cédula.

## What Changes

- Los adjuntos del correo de solicitud se muestran al pie, como en un cliente de correo, en una tarjeta por archivo.
- Cada adjunto se vincula a una categoría de Documentos; si el estudiante ya subió el archivo, la tarjeta muestra su nombre y permite descargarlo. Si no, indica que falta y enlaza a Documentos.

## Capabilities

### Modified Capabilities

- `graduation-workflow`: los adjuntos del correo de solicitud se descargan desde el correo.

## Impact

- `src/domain/types.ts` (`RequestAttachment`), `src/catalog/workflows.ts`, nuevo `src/domain/category-versions.ts` reutilizado por `task-evidence.ts`, nuevo `src/features/workflow/RequestAttachments.tsx`, `RequestEmailCard.tsx`, `src/styles/task-steps.css`, tests unitarios y e2e.
