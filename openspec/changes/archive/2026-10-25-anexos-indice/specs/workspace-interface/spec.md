## ADDED Requirements

### Requirement: Índice de anexos

El sistema SHALL mostrar en Anexos una tarjeta por cada anexo que aplica a la modalidad del estudiante, agrupadas por etapa, con quién lo emite, quién lo firma y su estado, y SHALL permitir abrirlo, crearlo o descargarlo en Word y PDF desde la tarjeta.

#### Scenario: Tarjetas por etapa

- **WHEN** un estudiante de Artículo abre Anexos
- **THEN** ve las secciones Propuesta, Desarrollo, Calificadores, Sustentación y Otros trámites, y en Calificadores la tarjeta "Anexo 10 · Calificadores de Artículo" con "Emite: Estudiante" y "Firma: Estudiante", sin la del Proyecto.

#### Scenario: Descargar desde la tarjeta

- **WHEN** tiene un borrador del Anexo 15 y pulsa "Word" o "PDF" en su tarjeta
- **THEN** descarga el documento con su perfil actual, sin guardarlo en Documentos.

#### Scenario: Crear un anexo

- **WHEN** pulsa "Crear" en la tarjeta de un anexo sin borrador
- **THEN** se crea el borrador y se abre el editor.

#### Scenario: Informes mensuales

- **WHEN** tiene Anexo 5 de septiembre y octubre
- **THEN** ve una tarjeta por mes y una tarjeta con el mes del informe y "Crear informe mensual".

#### Scenario: Estado del anexo

- **WHEN** exportó el borrador y subió la versión firmada
- **THEN** la tarjeta muestra "Firmado".

#### Scenario: Filtro por emisor

- **WHEN** elige "Tutor" en el filtro
- **THEN** solo ve los anexos que emite el tutor.

#### Scenario: Referencias

- **WHEN** ve la tarjeta de un formato de referencia
- **THEN** enlaza a su fuente y no ofrece Word, PDF ni Crear.
