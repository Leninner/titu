## Decisions

- `processPhases` agrupa los nodos del mapa por etapa a partir de `stage` (aptitud, sustentación y título van en "Sustentación y título"), los ordena por columna y fila, marca si cada paso depende del anterior y lista las dependencias pendientes de otras etapas. Solo devuelve las etapas que aplican a la modalidad.
- El avance de cada etapa no cuenta los pasos informativos.
- La disposición es CSS grid con `auto-fill`, sin lienzo absoluto ni SVG; en móvil pasa a una columna.
- La preferencia de mostrar u ocultar etapas completadas se guarda en `localStorage` como comodidad; sin almacenamiento se muestran todas.
