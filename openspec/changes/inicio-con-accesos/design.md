## Contexto

El mapa del proceso (`processMap`) ya calcula por trámite el estado (`done`, `waiting`, `active`, `blocked`), el avance de documentos y la fecha clave. El inicio repetía parte de ese cálculo y mostraba solo el siguiente trámite.

## Decisiones (del usuario, 2026-10-24)

- **Foco con lo que falta.** La tarjeta principal usa el nodo siguiente del mapa: ícono de su etapa, título, "Falta 1 requisito" / "Faltan n requisitos" (con concordancia), hasta tres faltantes como chips y "+n" si hay más, y la fecha clave con su urgencia ("Entrega 19 nov · en 26 días"). Los chips llevan al trámite, que abre en el paso pendiente; no hay enlaces a una tarjeta concreta.
- **En curso.** Tarjetas para los trámites `active` y `waiting` del mapa, en el orden del mapa, sin el del foco. Cada una muestra el ícono de la etapa, el título, el estado por color e ícono (los mismos del mapa) y el avance de documentos del paso actual. Sin tarjetas si no hay más trámites en curso.
- **Fechas con íconos y enlaces.** Ícono por tipo: límite (bandera), ventana (rango de calendario), sesión o proceso institucional (edificio), cita (calendario con reloj) y personal (persona). Cada fecha institucional enlaza al trámite aplicable que la tiene como hito; si no hay uno aplicable, a la agenda.
- Íconos de etapa y de estado en un solo módulo, compartido por el mapa y el inicio; `shortDate` también queda en un solo módulo.
- La lista "Esperando respuesta" de "A mano" se elimina: los trámites en espera ya aparecen en "En curso". Una tarjeta en espera muestra solo "En trámite", sin avance.

## Verificación

- Unit: relación fecha → trámite según la modalidad; resumen del inicio (foco, en curso, faltantes).
- Integración: el inicio muestra los faltantes, las tarjetas en curso y el enlace de una fecha a su trámite.
- UI con `playwright-cli` en escritorio y móvil, sin desborde horizontal.
