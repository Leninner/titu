## MODIFIED Requirements

### Requirement: Adjuntos del correo de solicitud

El sistema SHALL mostrar al pie del correo de solicitud los archivos que el estudiante debe adjuntar, SHALL permitir descargarlos desde ahí cuando ya están en Documentos, y SHALL pedir la copia de cédula en el correo de requisitos habilitantes.

#### Scenario: Copia de cédula en requisitos habilitantes

- **WHEN** abre "Solicitar" en la tarjeta "Requisitos habilitantes"
- **THEN** el cuerpo del correo dice "Adjunto la copia de mi cédula de ciudadanía." y al pie aparece la sección "Adjuntos" con la copia de cédula.

#### Scenario: Descargar la cédula guardada

- **WHEN** ya subió su cédula en Documentos y pulsa "Descargar" en el adjunto
- **THEN** recibe el archivo original con su nombre.

#### Scenario: Cédula sin subir

- **WHEN** no tiene la cédula en Documentos
- **THEN** el adjunto indica que aún no la sube y enlaza a Documentos.

#### Scenario: Correo sin adjuntos

- **WHEN** abre "Solicitar" en la tarjeta "Aval de informes"
- **THEN** el correo no muestra la sección de adjuntos.
