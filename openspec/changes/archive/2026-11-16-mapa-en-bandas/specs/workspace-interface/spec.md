## ADDED Requirements

### Requirement: Mapa del proceso en bandas

En escritorio, el sistema SHALL repartir los pasos del mapa del proceso en bandas sucesivas hacia abajo, con tantas columnas por banda como quepan y recuadros estirados hasta ocupar todo el ancho disponible, SHALL NOT exigir desplazamiento horizontal cuando caben al menos dos columnas, y SHALL atenuar las flechas que saltan entre bandas fuera del flujo principal, resaltándolas al pasar sobre uno de sus recuadros o al abrirlo.

#### Scenario: Pantalla de escritorio

- **WHEN** el estudiante abre Mi proceso en una pantalla donde caben cuatro columnas
- **THEN** ve los pasos en bandas de cuatro columnas, una debajo de otra, sin barra de desplazamiento horizontal.

### Requirement: Contador sin pasos informativos

El sistema SHALL contar en "X de N trámites completados" solo los trámites, sin los pasos informativos.

#### Scenario: Calificación informativa

- **WHEN** un estudiante de Proyecto abre Mi proceso
- **THEN** el contador indica 13 trámites, sin contar "Calificación del trabajo".
