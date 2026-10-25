## Decisions

- Variables en `:root`: `--navy`, `--accent`, `--accent-hover`, `--accent-soft`, `--focus-ring`, `--surface`, `--sidebar`, `--text`, `--muted`, `--border`. El ítem activo del menú usa `--accent-soft` con texto `--navy`; botones y enlaces usan `--accent`.
- Los morados escritos a mano se convierten conservando luminosidad y saturación, con el tono del azul UTA (213°). Verde, ámbar y rojo de los estados no cambian. Los documentos exportados no cambian.
- `annexTitle(template, draft)` separa "Anexo N" del título y añade el mes al Anexo 5. `peopleSummary(template, modality)` resume emisor y firmantes en una frase.
- Sección: tarjetas solo para plantillas editables; referencias como `references` de la sección.
- Menú Descargar con el mismo patrón de cierre (clic fuera, Escape) que el menú del trámite, extraído a `useDismiss`.
