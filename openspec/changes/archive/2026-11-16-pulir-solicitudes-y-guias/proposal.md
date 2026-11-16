## Why

La cédula aparece como "Adjuntos" del correo, pero en realidad va dentro del PDF de la solicitud, y eso confunde. La nota de no adeudar es demasiado larga y se repite en trámites donde no aporta. Además, la auditoría encontró que faltan el procedimiento del Sistema Integrado, las páginas preliminares obligatorias del Proyecto y la rúbrica del Anexo 12.

## What Changes

- El correo de solicitud deja de mostrar "Adjuntos". El botón PDF dice qué incluye ("PDF + cédula") y, si falta la cédula, muestra un aviso corto que enlaza a Documentos. El correo indica en una línea qué se adjunta: la solicitud firmada en PDF.
- La nota de no adeudar se reemplaza por un aviso corto y liviano: en su trámite, "Vale 30 días desde su emisión"; en día y hora y en su propio trámite, "Debe estar vigente al pedir día y hora". Aptitud legal no muestra aviso.
- La guía de no adeudar detalla la ruta del Sistema Integrado, cuándo descargar y los contactos para errores, órdenes de pago y acceso.
- La tarjeta del trabajo del Proyecto lista las páginas preliminares obligatorias en un desplegable.
- La guía de calificación muestra la rúbrica del Anexo 12 y la de sustentación muestra la del Anexo 16.

## Capabilities

### Modified Capabilities

- `graduation-workflow`: anexos del PDF de la solicitud, aviso de vigencia del no adeudar, guías y rúbricas.

## Impact

- `src/domain/types.ts`, `src/catalog/workflows.ts`, `RequestButton`, `RequestEmailCard`, `AnnexDraftEditor`, `RequirementsPanel`, `TaskMoreMenu`; se elimina `RequestAttachments`. Tests unitarios, de integración y e2e.
