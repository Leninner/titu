## 1. Fuente y catálogo

- [x] 1.1 Registrar `BIB-01` en `src/catalog/sources.ts` con su extracto en `public/sources/BIB-01.txt`.
- [x] 1.2 Cambiar resumen, pasos y notas de `biblioteca-revision` en `src/catalog/workflows.ts` y añadir `BIB-01` a sus fuentes. Probar en `tests/unit/catalog.test.ts`.
- [x] 1.3 Añadir el evento `biblioteca-revision` en `src/catalog/calendar-2026.ts`. Probar en `tests/unit/catalog-calendar.test.ts`.

- [x] 1.4 Añadir `inPerson` a `WorkflowDefinition`, omitir el paso Enviar en `taskSteps`, ajustar la siguiente acción y marcar `biblioteca-revision`. Probar en `tests/unit`.

## 2. Verificación

- [x] 2.1 Revisar la tarjeta del trámite con `playwright-cli` en escritorio y móvil.
- [x] 2.2 Pasar `pnpm typecheck`, `pnpm lint` y `pnpm test`.
