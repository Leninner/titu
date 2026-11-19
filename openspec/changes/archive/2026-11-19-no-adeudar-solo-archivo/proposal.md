## Why

La tarjeta del no adeudar tiene demasiado texto (aviso largo, "Se usa en: …", dos campos de fecha con ayudas) y exige marcar firmas y registrar la emisión antes de completar el trámite. El formulario del Sistema Integrado ya viene firmado electrónicamente, su fecha se lee del PDF y no trae un vencimiento impreso.

## What Changes

- El no adeudar deja de pedir la confirmación "Tiene firmas": subir el archivo basta para dejarlo "Listo".
- La fecha de emisión ya no bloquea: sin ella, la tarjeta sigue "Listo" y muestra un chip para agregarla. Solo un no adeudar vencido bloquea el trámite.
- **BREAKING** Se elimina el "Vencimiento impreso" del modelo, de Documentos, del trámite y del calendario. La vigencia se calcula siempre con emisión + 30 días.
- Los avisos y usos se muestran como chips con ícono: "Vale 30 días", "Vence 19 dic", "2 trámites" (con el detalle en un tooltip).

## Capabilities

### Modified Capabilities

- `graduation-workflow`: nota de vigencia en chip, fechas del no adeudar solo con emisión opcional y faltantes del resultado.

## Impact

- `src/catalog/workflows.ts`, `src/domain/dates.ts`, `src/domain/workflow.ts`, `src/domain/types.ts`, `src/domain/schemas.ts`, `src/storage/repository.ts`, `src/features/workflow/RequirementsPanel.tsx`, `src/features/workflow/ValidityDateFields.tsx`, `src/features/workflow/ResultStep.tsx`, `src/features/workflow/evidence-actions.ts`, `src/features/documents/DocumentCard.tsx`, `src/features/calendar/CalendarPage.tsx`, tests.
