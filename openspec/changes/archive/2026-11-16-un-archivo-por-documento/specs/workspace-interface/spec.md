## ADDED Requirements

### Requirement: Un archivo por documento

El sistema SHALL conservar un solo archivo por documento: al reemplazarlo o cambiar su firma, el archivo anterior se elimina salvo que forme parte de un envío registrado, y las tarjetas de Documentos no muestran historial de versiones.

#### Scenario: Reemplazar la cédula

- **WHEN** el estudiante reemplaza el archivo de Identificación
- **THEN** la tarjeta muestra solo el archivo nuevo, el anterior deja de existir y los trámites no enviados que lo usaban pasan al nuevo.

#### Scenario: Archivo ya enviado

- **WHEN** reemplaza un archivo que forma parte de un envío registrado
- **THEN** el envío conserva el archivo enviado y la tarjeta muestra el nuevo.

#### Scenario: Marcar firmas

- **WHEN** marca "Tiene firmas" en un archivo
- **THEN** la tarjeta sigue mostrando un solo archivo, ahora con firma reportada.

#### Scenario: Sin historial

- **WHEN** abre Documentos
- **THEN** ninguna tarjeta muestra "Historial" y la tarjeta permite descargar y eliminar el archivo actual.

#### Scenario: Eliminar un archivo enviado

- **WHEN** intenta eliminar un archivo que forma parte de un envío
- **THEN** el archivo se conserva y se informa que ya se envió.
