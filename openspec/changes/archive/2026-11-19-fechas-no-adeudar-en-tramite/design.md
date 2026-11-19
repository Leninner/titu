## Contexto

`fileGap` calcula la vigencia del no adeudar con `issuedOn` o `expiresOn` de la versión. Las versiones subidas desde un trámite se crean sin fechas, y `requirementState` del panel no conoce la vigencia, por eso marca "Listo".

## Decisiones

- Las fechas se guardan como una nueva versión del mismo documento, igual que el cambio de firma. `signEvidence` se generaliza en `reviseEvidence`, que recibe los campos a cambiar (`signatureStatus`, `issuedOn`, `expiresOn`).
- `FileHandlers` cambia `onSignatureChange` por `onRevise(version, changes)` para que el panel no conozca cada tipo de cambio.
- `hasValidityDate(version)` en `dates.ts` decide si una versión del no adeudar tiene fecha; el panel y `noDebtValidity` comparten ese criterio.
- `ResultStep` muestra `missingOutputs` bajo "Falta para completar" cuando no faltan requisitos de entrega.

- `noDebtIssueDate(text)` toma la mayor «FECHA: dd/mm/aaaa» del texto: la fecha de cabecera es la de Secretaría de Facultad, que valida al final, así que nunca es menor que las de cada dependencia y no depende del orden del texto que devuelve pdfjs. Se aplica al subir desde el trámite y desde Documentos si no se escribió una emisión.

## Riesgos

- Cada cambio de fecha crea una versión nueva; es el mismo costo que hoy tiene marcar la firma.
- Un PDF escaneado sin texto no tiene fecha legible; la tarjeta queda en "Falta la emisión" y se registra a mano.
