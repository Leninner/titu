## Why

La Coordinación de Carrera pide la copia de cédula junto al correo de solicitud del certificado de requisitos habilitantes. El correo que prepara el sistema no lo menciona, y el estudiante lo envía sin el adjunto.

## What Changes

- Los correos de solicitud pueden declarar adjuntos, que se muestran en la tarjeta del correo.
- El correo de requisitos habilitantes indica en el cuerpo que se adjunta la copia de cédula y la lista como adjunto.

## Capabilities

### Modified Capabilities

- `graduation-workflow`: el correo de solicitud muestra sus adjuntos; el de requisitos habilitantes pide la copia de cédula.

## Impact

- `src/domain/types.ts` (`RequestEmail.attachments`), `src/domain/schemas.ts` si valida el catálogo, `src/catalog/workflows.ts`, `src/features/workflow/RequestEmailCard.tsx`, `src/styles/task-steps.css`, tests unitarios y e2e.
