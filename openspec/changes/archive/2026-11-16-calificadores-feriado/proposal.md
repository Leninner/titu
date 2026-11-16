## Why

El 20 de noviembre de 2026 es feriado. La entrega del informe final y la solicitud de designación de calificadores se adelanta al 18 de noviembre y la sesión de Consejo de calificadores pasa al 19 de noviembre. La aplicación sigue mostrando el 19 y el 20.

## What Changes

- "Entrega informe final y solicitud calificadores" pasa al 18/11/2026 a las 18:00.
- "Sesión Consejo: calificadores" pasa al 19/11/2026.
- La ventana de solicitud de no adeudar (16–20/11) no cambia: está por validar.

## Capabilities

### Modified Capabilities

- `graduation-calendar`: fechas de calificadores ajustadas por el feriado del 20/11.

## Impact

- `src/catalog/calendar-2026.ts`, `tests/unit/catalog-calendar.test.ts`. Los trámites vinculados (informe final, designación de calificadores) toman la fecha del calendario.
