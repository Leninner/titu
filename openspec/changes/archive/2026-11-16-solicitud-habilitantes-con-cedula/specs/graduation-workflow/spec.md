## MODIFIED Requirements

### Requirement: Adjuntos del correo de solicitud

El sistema SHALL mostrar al pie del correo de solicitud los archivos que el estudiante debe adjuntar y SHALL permitir descargarlos desde ahí cuando ya están en Documentos. En requisitos habilitantes SHALL unir la copia de cédula guardada al PDF de la solicitud, después de la firma; el asunto SHALL ser "Solicitud de certificado de requisitos habilitantes – " seguido del nombre corto del estudiante, y el cuerpo SHALL NOT decir que adjunta la cédula por separado. Los correos de solicitud SHALL firmar con el nombre corto: primer nombre y primer apellido.

#### Scenario: Copia de cédula en requisitos habilitantes

- **WHEN** el estudiante "Lenin Giovanni Mazabanda Pullutaxi" abre "Solicitar" en la tarjeta "Requisitos habilitantes"
- **THEN** el asunto es "Solicitud de certificado de requisitos habilitantes – Lenin Mazabanda", el cuerpo firma "Atentamente," y "Lenin Mazabanda" sin mencionar la copia de cédula, y la sección "Adjuntos" indica que la cédula se une al PDF de la solicitud.

#### Scenario: PDF con la cédula unida

- **WHEN** ya subió su cédula en Documentos y descarga el PDF de la solicitud de requisitos habilitantes
- **THEN** el PDF contiene la solicitud seguida de las páginas de la cédula.

#### Scenario: Descargar la cédula guardada

- **WHEN** ya subió su cédula en Documentos y pulsa "Descargar" en el adjunto
- **THEN** recibe el archivo original con su nombre.

#### Scenario: Cédula sin subir

- **WHEN** no tiene la cédula en Documentos
- **THEN** el adjunto indica que aún no la sube y enlaza a Documentos, y el PDF se descarga solo con la solicitud.

#### Scenario: Correo sin adjuntos

- **WHEN** abre "Solicitar" en la tarjeta "Aval de informes"
- **THEN** el correo no muestra la sección de adjuntos.
