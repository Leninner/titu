## Decisions

- `RequestEmail.attachments` pasa de `string[]` a `RequestAttachment[]` con `label` y `category`. La copia de cédula usa la categoría `personal`, la misma que la tarjeta "Cédula y papeleta de votación".
- `latestCategoryVersion(workspace, category)` devuelve la versión más reciente de una categoría; `evidenceIdsForTask` la reutiliza en lugar de repetir la búsqueda.
- `RequestAttachments` va al pie de `RequestEmailCard`, separado por una línea, con el título "Adjuntos". Cada tarjeta muestra el ícono del archivo, su nombre y la etiqueta del adjunto, con un botón "Descargar" que baja el archivo original con `repository.getBlob` y `downloadBlob`.
- Sin archivo en la categoría, la tarjeta dice "Aún no la subes" y ofrece "Ir a Documentos" (`#/documentos`).
