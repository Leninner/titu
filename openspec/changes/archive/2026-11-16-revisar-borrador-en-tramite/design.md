## Context

`saveProfile` marca `needsReview` en todos los borradores cuando cambian modalidad, período, tema o resolución de aprobación. `validateAnnex` rechaza borradores marcados. `AnnexEditor` ofrece un aviso con "Actualizar datos y revisar campos"; `AnnexDraftEditor`, usado por `RequestButton` y `FinalReportEditor`, no lo ofrece.

## Decisions

- Reutilizar en `AnnexDraftEditor` el mismo aviso y la misma acción de `AnnexEditor`: copiar `workspace.profile` a `profileSnapshot` y poner `needsReview: false`. Se prefiere una confirmación explícita a retirar la marca en silencio, porque el perfil cambió y el estudiante debe mirar el documento.
- El aviso aparece siempre que el borrador esté marcado, no solo tras intentar descargar, para que la causa del bloqueo sea visible antes.

## Risks

- Ninguno sobre datos: la acción solo actualiza el borrador abierto mediante el autosave existente.
