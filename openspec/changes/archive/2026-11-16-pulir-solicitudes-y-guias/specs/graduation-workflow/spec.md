## MODIFIED Requirements

### Requirement: Adjuntos del correo de solicitud

El sistema SHALL indicar en el correo de solicitud qué se adjunta en una sola línea, y SHALL NOT presentar como adjuntos del correo los documentos que se unen al PDF de la solicitud. En requisitos habilitantes SHALL unir la cédula guardada al PDF de la solicitud después de la firma, SHALL rotular el botón como "PDF + cédula" y, sin cédula guardada, SHALL mostrar "Falta cédula" con enlace a Documentos. El asunto SHALL ser "Solicitud de certificado de requisitos habilitantes – " seguido del nombre corto del estudiante. Los correos de solicitud SHALL firmar con el nombre corto: primer nombre y primer apellido.

#### Scenario: Copia de cédula en requisitos habilitantes

- **WHEN** el estudiante "Lenin Giovanni Mazabanda Pullutaxi", con su cédula guardada, abre "Solicitar" en la tarjeta "Requisitos habilitantes"
- **THEN** el asunto termina en "– Lenin Mazabanda", el correo no muestra una sección "Adjuntos", indica que se adjunta la solicitud firmada en PDF, y el botón dice "PDF + cédula".

#### Scenario: PDF con la cédula unida

- **WHEN** descarga "PDF + cédula"
- **THEN** el PDF contiene la solicitud seguida de las páginas de la cédula.

#### Scenario: Descargar la cédula guardada

- **WHEN** necesita la cédula como archivo aparte
- **THEN** la descarga desde Documentos con su nombre original; el correo de solicitud no la ofrece como adjunto.

#### Scenario: Cédula sin subir

- **WHEN** no tiene la cédula en Documentos
- **THEN** el botón dice "PDF", aparece "Falta cédula" enlazado a Documentos y el PDF se descarga solo con la solicitud.

#### Scenario: Correo sin adjuntos

- **WHEN** abre "Solicitar" en la tarjeta "Aval de informes"
- **THEN** el correo no muestra avisos de anexos.

### Requirement: Nota de vigencia del no adeudar

El sistema SHALL mostrar el aviso de vigencia del no adeudar como una línea corta y solo donde aplica: en el trámite "Formulario de no adeudar", "Vale 30 días desde su emisión · debe estar vigente al pedir día y hora"; en la solicitud de día y hora, "Debe estar vigente al enviar esta solicitud". SHALL NOT mostrar el aviso en aptitud legal. Fuente: `UT-20`, `UT-21`.

#### Scenario: Nota en la petición de día y hora

- **WHEN** el estudiante abre el trámite de solicitud de día y hora de sustentación
- **THEN** la tarjeta "Formulario de no adeudar" muestra "Debe estar vigente al enviar esta solicitud".

#### Scenario: Nota en el trámite propio

- **WHEN** abre el trámite "Formulario de no adeudar"
- **THEN** la tarjeta muestra "Vale 30 días desde su emisión · debe estar vigente al pedir día y hora".

## ADDED Requirements

### Requirement: Guía del Sistema Integrado para no adeudar

La guía del trámite "Formulario de no adeudar" SHALL indicar el acceso a servicios.uta.edu.ec/SistemaIntegrado con el correo institucional sin @uta.edu.ec, la ruta Gestión › Formularios de No Adeudar › Gestión solicitud › Registrar solicitud, el seguimiento en Avance y que se descarga en estado Finalizado con las cuatro columnas en SI. SHALL incluir los contactos: Secretaría de Facultad (ddlm.montenegro@uta.edu.ec) para solicitudes por error, Financiero (3730260 / 3730261) para órdenes de pago y DITIC para el acceso. Fuente: `UT-20`.

#### Scenario: Ruta del sistema

- **WHEN** abre "Cómo se tramita" en "Formulario de no adeudar"
- **THEN** ve la ruta de menús, la condición de descarga y los tres contactos.

### Requirement: Páginas preliminares del Proyecto

Las tarjetas del trabajo del Proyecto de Investigación en la revisión de Biblioteca y en la solicitud de día y hora SHALL ofrecer un desplegable "Páginas obligatorias" con: portada, aprobación del tutor, autoría, derechos de autor, aprobación del tribunal, dedicatoria (opcional), agradecimiento (opcional), índice general, índice de tablas y figuras, y resumen/abstract de máximo una página. Fuente: `UT-23`.

#### Scenario: Lista desplegable

- **WHEN** un estudiante de Proyecto abre la revisión de Biblioteca
- **THEN** la tarjeta "Trabajo sin firmas" ofrece "Páginas obligatorias" con las diez páginas.

### Requirement: Rúbricas de calificación

La guía de "Calificación del trabajo" SHALL mostrar la rúbrica del Anexo 12 (marco teórico 2, metodología 2,5, resultados y discusión 2,5, conclusiones y recomendaciones 2, referencias y anexos 1; total 10), y la de "Sustentación o incorporación" SHALL mostrar la del Anexo 16 (sustentación 7, recursos visuales y tecnológicos 1,5, expresión oral 1,5; total 10). Fuente: `UT-17`, `UT-27`.

#### Scenario: Rúbrica del Anexo 12

- **WHEN** abre "Calificación del trabajo"
- **THEN** ve los cinco criterios con su puntaje máximo y el total de 10.
