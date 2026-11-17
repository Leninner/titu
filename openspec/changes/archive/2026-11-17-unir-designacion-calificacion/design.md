## Decisions

- `InformationalStep` pasa a `{ stages }`: cada etapa tiene etiqueta, fecha clave y, salvo la primera, cuándo se alcanza (`reachedWith`: resultados de la designación; `reachedAfter`: evento del calendario ya pasado). La etapa actual es la última alcanzada.
- El paso se completa cuando la designación de calificadores está completada; las etapas solo cambian la etiqueta y la fecha clave del paso en el mapa, la lista y la página.
- Se elimina el paso `designacion`; `calificacion` conserva su id para no romper enlaces y vuelve a depender de la designación de calificadores.
- Un solo tablero, `GraderBoard`: línea de tiempo compacta (fecha y una palabra por hito) y las notas. Sin bloque de "siguiente acción" ni notas al pie.
- La página informativa muestra estado, fecha clave, tablero y la guía con la rúbrica; sin el párrafo de espera.
