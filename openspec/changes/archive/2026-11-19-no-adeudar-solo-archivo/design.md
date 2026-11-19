## Context

El no adeudar se descarga del Sistema Integrado ya firmado y con «FECHA:» en la cabecera, que se lee al subir el PDF. No existe un vencimiento impreso.

## Decisions

- `noDebt` deja de ser un documento con firma reportada (`signed = false`).
- `noDebtValidity(issuedOn, submissionDate)` sin vencimiento impreso. Sin emisión devuelve `missing`, que no bloquea; `expired` sí bloquea y la tarjeta muestra "Vencido".
- `expiresOn` sale del tipo, del esquema y del repositorio; zod descarta el campo en expedientes y respaldos antiguos.
- La tarjeta reemplaza el párrafo del aviso y el de "Se usa en" por una fila de chips (`req-viewer-chips`). Los textos largos pasan a tooltips (`InfoTip`).
- La emisión se edita desde un chip "Emitido 19 nov" que abre un `input type="date"`; sin fecha, el chip dice "Agregar emisión".

## Risks

- Expedientes con vencimiento impreso guardado pierden ese dato; la referencia pasa a emisión + 30 días, que es la regla institucional.
