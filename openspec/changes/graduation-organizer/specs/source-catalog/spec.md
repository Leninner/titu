## ADDED Requirements

### Requirement: Procedencia y precedencia

El sistema SHALL asociar requisitos, plantillas y fechas a fuentes/versiones consultables y aplicar la precedencia de references/source-map.md y references/calendar-2026.md.

#### Scenario: Fechas oficiales aportadas

- **WHEN** el estudiante consulta la fecha límite de calificadores de PI/AA julio–diciembre 2026
- **THEN** ve 19/11/2026 a las 18:00, America/Guayaquil, y referencias CAL-01/CAL-02, sin apertura inventada del 10/11.

#### Scenario: Referencia accesible

- **WHEN** abre la fuente de un requisito
- **THEN** ve su nombre original, versión y sección pertinente; los originales o extractos publicados han sido revisados para no incluir datos personales de ejemplos.

### Requirement: Catálogo por rol y modalidad

El sistema SHALL distinguir formularios editables, certificados externos, documentos de referencia y formatos emitidos por docentes según el catálogo de source-map.md.

#### Scenario: Solicitud no es certificado

- **WHEN** elige Anexo 15
- **THEN** puede editar la solicitud y adjuntar después el certificado emitido; no puede generar un certificado institucional.

#### Scenario: Formato del calificador

- **WHEN** abre Anexo 12
- **THEN** ve quién lo emite y puede consultar/adjuntar el documento sin presentarlo como un trámite que el estudiante debe calificar.

### Requirement: Conflictos y fuentes ausentes

El sistema SHALL conservar las discrepancias C-01 a C-08, mostrar la decisión de precedencia y marcar datos no confirmados sin inventarlos.

#### Scenario: Firmas incompatibles

- **WHEN** consulta las instrucciones de firmas
- **THEN** ve la prohibición de mixtas de los formatos específicos y puede consultar la discrepancia con la guía.

#### Scenario: Estructura no aportada

- **WHEN** busca Anexo 13B
- **THEN** ve que no se aportó ese formato y no obtiene una estructura inventada.

### Requirement: Versiones estables

El sistema SHALL preservar la versión de plantilla y datos de cada borrador/exportación ante cambios de catálogo.

#### Scenario: Nueva plantilla

- **WHEN** se distribuye una nueva versión del Anexo 5
- **THEN** los informes existentes mantienen su versión y solo se migran con revisión explícita; los PDFs entregados permanecen intactos.
