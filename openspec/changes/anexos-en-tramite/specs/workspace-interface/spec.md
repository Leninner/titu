## ADDED Requirements

### Requirement: Anexos dentro de Mi proceso

El sistema SHALL editar los anexos desde el trámite que los pide, SHALL conservar la sección Anexos como índice que abre cada anexo en su trámite, y SHALL redirigir las rutas antiguas del editor.

#### Scenario: Índice de anexos

- **WHEN** pulsa "Abrir" en una tarjeta de la sección Anexos
- **THEN** se abre el editor del anexo dentro de su trámite.

#### Scenario: Ruta antigua de un borrador

- **WHEN** abre `#/anexos/<id>` de un borrador de Anexo 15 en Proyecto
- **THEN** se redirige a `#/proceso/aptitud-legal-research/anexo/<id>`.

#### Scenario: Búsqueda global

- **WHEN** busca el nombre de un borrador
- **THEN** el resultado abre el editor dentro de su trámite.

#### Scenario: Borrador de otra modalidad

- **WHEN** el perfil cambió de modalidad y un borrador ya no corresponde a ningún trámite
- **THEN** Documentos lo muestra en "Borradores de otra modalidad" y se puede abrir sin perderlo.

#### Scenario: Escritorio y móvil

- **WHEN** se ve la tarjeta de un anexo a 360, 768 y 1440 px
- **THEN** las tres etapas son legibles, en fila en escritorio y apiladas en móvil, sin desplazamiento horizontal.
