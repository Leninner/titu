## Why

La vista Anexos es un selector de plantilla y una lista de borradores. No muestra todos los anexos de la modalidad, ni en qué etapa se usan, quién los emite o quién los firma, y para descargar Word o PDF hay que abrir cada borrador.

## What Changes

- Anexos pasa a ser un índice de tarjetas, agrupadas por etapa del proceso, con todos los anexos que aplican a la modalidad del estudiante.
- Cada tarjeta muestra quién lo emite, quién lo firma y su estado: sin empezar, borrador, exportado o firmado.
- Desde la tarjeta se abre el anexo o se descarga en Word o PDF. Si no hay borrador, se crea.
- El Anexo 5 tiene una tarjeta por mes y una tarjeta para crear el siguiente informe mensual.
- Los formatos de referencia aparecen como tarjetas que enlazan a su fuente.
- Un filtro por quien emite el anexo.

## Capabilities

### Modified Capabilities

- `workspace-interface`: índice de anexos por etapa con emisor, firmantes, estado y descargas.

## Impact

- `src/domain/types.ts` y `src/catalog/templates.ts` (etapa, emisor y firmantes por plantilla), nuevo `src/domain/annex-index.ts`, `src/features/annexes/AnnexLibrary.tsx` reescrito, estilos, tests unitarios, de integración y e2e que usaban la vista anterior.
- `anexos-en-tramite` deja de eliminar la sección: "Abrir" pasará a llevar al editor dentro del trámite cuando ese cambio se implemente.
