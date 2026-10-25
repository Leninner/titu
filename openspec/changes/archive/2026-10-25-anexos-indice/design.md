## Decisions

- `TemplateDefinition` gana `stage` (`propuesta`, `desarrollo`, `calificadores`, `sustentacion`, `otros`), `issuer` (quién lo emite) y `signers` opcional (quién lo firma; las referencias no lo tienen). Se declaran en el catálogo junto a cada plantilla, según la tabla de firmantes de `anexos-en-tramite`.
- `annexIndex(workspace, templates)` en el dominio devuelve las secciones por etapa con sus tarjetas: plantilla, borrador más reciente (o uno por mes para el Anexo 5) y estado. El estado se deriva sin campos nuevos: `signed` si hay una versión `reported-signed` del documento exportado del borrador, `exported` si hay una versión con `sourceDraftId` del borrador, `draft` si hay borrador, `empty` si no.
- La descarga Word/PDF de la tarjeta usa `downloadAnnex` con el perfil actual y no guarda en Documentos, igual que el formato descargado desde el trámite.
- "Crear" crea el borrador y abre el editor actual (`#/anexos/<id>`). El Anexo 11 se crea con todos los Anexo 5 y queda deshabilitado sin ellos. El Anexo 5 nuevo pide el mes en su tarjeta.
- Filtro por emisor con botones: Todos y cada emisor presente.
- Mientras `anexos-en-tramite` no exista, "Abrir" usa el editor actual.
