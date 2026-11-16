## Why

Para pedir el certificado de requisitos habilitantes el estudiante envía la solicitud firmada junto con su cédula. Hoy descarga la solicitud y la cédula por separado y tiene que unirlas a mano. Además, el asunto no identifica al estudiante y el correo firma con el nombre completo.

## What Changes

- El PDF de la solicitud de requisitos habilitantes incluye, después de la firma, las páginas de la cédula guardada en Documentos (PDF o imagen). Sin cédula guardada se descarga solo la solicitud. Word no cambia.
- El asunto pasa a "Solicitud de certificado de requisitos habilitantes – {nombre corto}", por ejemplo "– Lenin Mazabanda".
- El cuerpo ya no dice "Adjunto la copia de mi cédula de ciudadanía." y todos los correos de solicitud firman con el nombre corto (primer nombre y primer apellido).
- El adjunto de cédula del correo indica que se une al PDF de la solicitud.

## Capabilities

### Modified Capabilities

- `graduation-workflow`: adjuntos y texto del correo de solicitud de requisitos habilitantes.

## Impact

- `src/catalog/workflows.ts`, `src/domain/submission-email.ts`, `src/domain/student-name.ts` (nuevo), `src/export/merge-pdf.ts` (nuevo), `src/features/annexes/export-annex.ts`, `src/features/annexes/AnnexDraftEditor.tsx`, `src/features/workflow/RequestButton.tsx`, `src/features/workflow/RequestAttachments.tsx`.
- Nueva dependencia `pdf-lib` para unir PDFs e imágenes.
