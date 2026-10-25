## 1. Catálogo y dominio

- [x] 1.1 Declarar etapa, emisor y firmantes en cada plantilla. Probar en `tests/unit/catalog.test.ts` que toda plantilla tiene etapa y emisor y toda editable tiene firmantes.
- [x] 1.2 `annexIndex` con secciones por etapa, una tarjeta por mes del Anexo 5 y estados derivados. Probar en `tests/unit/annex-index.test.ts`.

## 2. Interfaz

- [x] 2.1 Reescribir `AnnexLibrary` con tarjetas, filtro por emisor, crear, abrir y descargar Word/PDF. Actualizar tests de integración y e2e de la vista anterior y añadir un e2e de descarga. Verificar con `playwright-cli` en escritorio y móvil.

## 3. Verificación

- [x] 3.1 Pasar `pnpm typecheck`, `pnpm lint` y `pnpm test`.
