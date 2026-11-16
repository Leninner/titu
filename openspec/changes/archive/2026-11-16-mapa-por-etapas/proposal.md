## Why

El mapa en bandas mezcla etapas en una misma fila y las flechas cruzan entre filas, así que el flujo no se entiende. Además, las etapas ya terminadas ocupan espacio cuando el estudiante solo quiere ver lo pendiente.

## What Changes

- El mapa muestra una fila por etapa, en orden: Trabajo de titulación, Calificadores, Biblioteca y Sustentación y título, con su número, título y avance.
- Dentro de cada fila los pasos van en orden con una flecha cuando un paso depende del anterior. No hay flechas entre etapas: un paso bloqueado por otra etapa muestra "Necesita: …".
- Botón "Ocultar completadas" / "Ver completadas" que oculta las etapas terminadas y recuerda la elección.
- El mismo diseño se usa en móvil, con los pasos apilados y flechas hacia abajo.
- Se reemplaza el mapa en bandas.

## Capabilities

### Modified Capabilities

- `workspace-interface`: mapa del proceso por etapas.

## Impact

- `src/domain/process-phases.ts` (nuevo), `src/features/workflow/ProcessMap.tsx`, `src/styles/process-map.css`; se elimina `src/features/workflow/map-layout.ts`. Tests unitarios e integración.
