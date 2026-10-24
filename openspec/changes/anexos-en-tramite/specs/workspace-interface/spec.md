## ADDED Requirements

### Requirement: Anexos dentro de Mi proceso

El sistema SHALL ofrecer los anexos solo desde el trámite que los pide, sin sección Anexos en el menú principal, y SHALL redirigir las rutas antiguas.

#### Scenario: Menú principal

- **WHEN** se muestra la barra lateral
- **THEN** contiene Inicio, Mi proceso, Documentos y Fechas, sin Anexos.

#### Scenario: Ruta antigua de un borrador

- **WHEN** abre `#/anexos/<id>` de un borrador de Anexo 15 en Proyecto
- **THEN** se redirige a `#/proceso/aptitud-legal-research/anexo/<id>`.

#### Scenario: Ruta antigua de la sección

- **WHEN** abre `#/anexos`
- **THEN** se redirige a `#/proceso`.

#### Scenario: Búsqueda global

- **WHEN** busca el nombre de un borrador
- **THEN** el resultado abre el editor dentro de su trámite.

#### Scenario: Borrador de otra modalidad

- **WHEN** el perfil cambió de modalidad y un borrador ya no corresponde a ningún trámite
- **THEN** Documentos lo muestra en "Borradores de otra modalidad" y se puede abrir sin perderlo.

#### Scenario: Escritorio y móvil

- **WHEN** se ve la tarjeta de un anexo a 360, 768 y 1440 px
- **THEN** las tres etapas son legibles, en fila en escritorio y apiladas en móvil, sin desplazamiento horizontal.
