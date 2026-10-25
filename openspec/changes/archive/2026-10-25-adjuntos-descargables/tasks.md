## 1. Dominio y catálogo

- [x] 1.1 Añadir `RequestAttachment` y declarar la copia de cédula con la categoría `personal`. Probar en `tests/unit/catalog.test.ts`.
- [x] 1.2 Extraer `latestCategoryVersion` y reutilizarla en `evidenceIdsForTask`. Probar en `tests/unit/category-versions.test.ts`.

## 2. Interfaz

- [x] 2.1 Tarjetas de adjuntos al pie del correo con descarga o enlace a Documentos. Verificar en `tests/e2e/request-email.spec.ts` y con `playwright-cli` en escritorio y móvil.

## 3. Verificación

- [x] 3.1 Pasar `pnpm typecheck`, `pnpm lint` y `pnpm test`.
