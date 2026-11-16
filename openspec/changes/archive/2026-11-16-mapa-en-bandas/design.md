## Decisions

- `mapLayout` es una función pura: recibe columnas y filas de cada nodo y las columnas por banda, y devuelve posiciones, alto total y la posición del carril de opcionales. Banda = `columna / columnasPorBanda`; cada banda ocupa solo las filas que usa.
- Las columnas por banda se calculan con el ancho del lienzo (ResizeObserver), con un mínimo de 2 y 4 por defecto si no hay medida.
- Una flecha dentro de la misma banda conserva la curva actual. Entre bandas sale por la derecha, baja por el hueco entre columnas hasta el espacio sobre la banda destino, cruza y entra por la izquierda del destino.
- `processMap` devuelve `total` y `completed` contando solo pasos no informativos.
- Los recuadros se estiran para ocupar el ancho medido, con un mínimo de 212 px.
- Las flechas entre bandas que no son la continuación directa del flujo principal se marcan como lejanas y se atenúan; al pasar sobre un recuadro o abrirlo se resaltan sus flechas y se atenúan las demás.
