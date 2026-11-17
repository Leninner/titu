## 1. Dominio y catálogo

- [x] 1.1 Cambiar `informational` a `{ waiting, outcome? }`, agregar `informationalSources` y los estados de designación y calificación. Probar en `tests/unit/informational.test.ts` y `tests/unit/process-map.test.ts`.
- [x] 1.2 Agregar el paso "Designación por Consejo Directivo" con su fecha clave y hacer depender la calificación de él. Probar en `tests/unit/catalog.test.ts` y `tests/unit/process-phases.test.ts`.

## 2. Interfaz

- [x] 2.1 Mostrar la línea de tiempo de la designación en la página y el modal del paso, y el mensaje de espera de cada paso. Probar en `tests/integration/designation-phase.test.tsx` y `tests/integration/grading-phase.test.tsx`.
- [x] 2.2 Revisar con `playwright-cli` en escritorio y móvil.

## 3. Verificación

- [x] 3.1 Pasar `pnpm typecheck`, `pnpm lint` y `pnpm test`.
