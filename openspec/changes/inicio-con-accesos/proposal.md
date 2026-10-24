## Why

El inicio muestra un solo trámite con un conteo ("1 requisitos por completar") que no dice qué falta, oculta los demás trámites que se pueden avanzar en paralelo y los que esperan respuesta, y lista las fechas sin relación con sus trámites ni distinción por tipo.

## What Changes

- La tarjeta principal nombra lo que falta del trámite siguiente como chips, con la fecha clave del trámite y su urgencia.
- Una fila "En curso" da acceso directo a cada trámite que se puede avanzar ahora o que espera respuesta, con ícono de la etapa, estado por color e ícono y avance.
- Cada fecha del horizonte lleva un ícono según su tipo (límite, ventana, sesión institucional, cita, personal) y enlaza al trámite relacionado.

## Capabilities

### Modified Capabilities

- `workspace-interface`: el inicio muestra lo que falta, los trámites en curso y fechas enlazadas a sus trámites.

## Impact

- `src/features/workflow/HomePage.tsx`, `src/features/calendar/Timeline.tsx`, `src/domain/process-map.ts` (relación fecha → trámite), íconos de etapa y de estado compartidos con el mapa.
