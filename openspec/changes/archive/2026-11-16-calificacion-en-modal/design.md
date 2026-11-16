## Decisions

- `gradingSummary` (dominio) lee `grade-1` y `grade-2` de la tarea de designación aplicable y devuelve las notas, cuántas hay, el promedio y si alcanza 7. `averageGap` usa el mismo cálculo.
- El análisis de números (`numeric`) pasa a `src/domain/numeric.ts` para compartirlo sin dependencias circulares.
- `GradingBoard` recibe la definición informativa, resuelve la designación con `applicableDependencies` y guarda con `persistTask`, igual que el resto de los trámites. Cada nota se confirma con Enter o al salir del campo; un valor fuera de 0–10 no se guarda.
- Las tarjetas de nota y el promedio usan una animación corta de aparición que respeta `prefers-reduced-motion`.
- El modal muestra el tablero en el panel derecho y el pie solo tiene "Cerrar" para pasos informativos. La página del paso usa el mismo tablero en lugar del enlace a la designación.
