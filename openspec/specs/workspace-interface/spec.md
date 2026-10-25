# workspace-interface Specification

## Purpose
TBD - created by archiving change anexos-indice. Update Purpose after archive.
## Requirements
### Requirement: Índice de anexos

El sistema SHALL mostrar en Anexos una tarjeta por cada formato editable que aplica a la modalidad del estudiante, agrupadas por etapa, con su número, título, quién lo emite y firma, y su estado; SHALL permitir abrirlo o crearlo y descargarlo en Word y PDF desde la tarjeta; y SHALL listar los formatos de referencia como enlaces al final de cada etapa.

#### Scenario: Tarjetas por etapa

- **WHEN** un estudiante de Artículo abre Anexos
- **THEN** ve las secciones Propuesta, Desarrollo, Calificadores, Sustentación y Otros trámites, y en Calificadores la tarjeta con la etiqueta "Anexo 10", el título "Calificadores de Artículo" y "Estudiante lo emite y firma", sin la del Proyecto.

#### Scenario: Descargar desde la tarjeta

- **WHEN** tiene un borrador completo del Anexo 15 y elige Word o PDF en el menú Descargar de su tarjeta
- **THEN** descarga el documento con su perfil actual, sin guardarlo en Documentos.

#### Scenario: Borrador incompleto

- **WHEN** el borrador tiene campos obligatorios vacíos
- **THEN** la tarjeta muestra "Faltan datos" y el menú Descargar está deshabilitado.

#### Scenario: Crear un anexo

- **WHEN** pulsa "Crear" en la tarjeta de un anexo sin borrador
- **THEN** se crea el borrador y se abre el editor.

#### Scenario: Informes mensuales

- **WHEN** tiene Anexo 5 de septiembre y octubre
- **THEN** ve una tarjeta por mes con el mes como subtítulo y una tarjeta con el mes del informe y "Crear informe mensual".

#### Scenario: Estado del anexo

- **WHEN** exportó el borrador y subió la versión firmada
- **THEN** la tarjeta muestra "Firmado".

#### Scenario: Filtro por emisor

- **WHEN** elige "Tutor" en el filtro
- **THEN** solo ve los anexos que emite el tutor.

#### Scenario: Referencias

- **WHEN** abre la etapa Propuesta
- **THEN** al final ve "Anexo 2 · Estructura de propuesta" como enlace a su fuente, sin tarjeta ni acciones.

#### Scenario: Firmantes del Anexo 1 en Complexivo

- **WHEN** un estudiante de Complexivo ve la tarjeta del Anexo 1
- **THEN** dice "Estudiante lo emite y firma".

### Requirement: Identidad visual

El sistema SHALL usar el azul institucional de la Universidad Técnica de Ambato como color de identidad, selección y acción, sin tonos morados.

#### Scenario: Menú activo y acciones

- **WHEN** se muestra la barra lateral con Anexos activo y un botón principal
- **THEN** el ítem activo tiene fondo #e8f0fa y texto #0b2e59, y el botón usa #1d5fa8.

