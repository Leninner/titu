## ADDED Requirements

### Requirement: Adjuntos del correo de solicitud

El sistema SHALL mostrar en el correo de solicitud los archivos que el estudiante debe adjuntar, y SHALL pedir la copia de cédula en el correo de requisitos habilitantes.

#### Scenario: Copia de cédula en requisitos habilitantes

- **WHEN** abre "Solicitar" en la tarjeta "Requisitos habilitantes"
- **THEN** el correo muestra "Adjuntar: Copia de cédula" y su cuerpo dice "Adjunto la copia de mi cédula de ciudadanía."

#### Scenario: Correo sin adjuntos

- **WHEN** abre "Solicitar" en la tarjeta "Aval de informes"
- **THEN** el correo no muestra la fila de adjuntos.
