## Why

El mapa del proceso pone todos los pasos en una sola fila horizontal de 11 columnas y obliga a desplazarse de lado. Además, el contador de trámites completados cuenta el paso informativo de calificación como un trámite.

## What Changes

- En escritorio, el mapa reparte las columnas en bandas que bajan, con tantas columnas por banda como caben en el ancho disponible. Las flechas entre bandas bajan por el espacio entre ellas.
- "Fuera del recorrido principal" sigue debajo, también repartido en bandas.
- El contador "X de N trámites completados" excluye los pasos informativos.
- La vista móvil no cambia.

## Capabilities

### Modified Capabilities

- `workspace-interface`: mapa del proceso en bandas y contador sin pasos informativos.

## Impact

- `src/features/workflow/map-layout.ts` (nuevo), `src/features/workflow/ProcessMap.tsx`, `src/domain/process-map.ts`, tests.
