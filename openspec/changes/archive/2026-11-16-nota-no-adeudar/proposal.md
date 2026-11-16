## Why

La vigencia del formulario de no adeudar solo aparece en un ícono de información y en "Ten en cuenta", así que el estudiante puede presentar un formulario caducado. El reglamento la indica como una NOTA explícita.

## What Changes

- Las tarjetas del formulario de no adeudar muestran un aviso visible con la nota oficial: vale treinta días desde su emisión por Tesorería de la UTA, después caduca y se adquiere uno nuevo, y debe estar vigente hasta el ingreso de la petición de día y hora.
- La guía del trámite "Formulario de no adeudar" usa el mismo texto.
- Los requisitos pueden declarar un aviso (`notice`) que se muestra siempre en su tarjeta.

## Capabilities

### Modified Capabilities

- `graduation-workflow`: nota de vigencia del formulario de no adeudar.

## Impact

- `src/domain/types.ts`, `src/catalog/workflows.ts`, `src/features/workflow/RequirementsPanel.tsx` y estilos de la tarjeta. Tests de catálogo e integración.
