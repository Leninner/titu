## ADDED Requirements

### Requirement: Envío directo en la designación de calificadores

En "Designación de calificadores del Proyecto" y "Designación de calificadores del Artículo", el sistema SHALL mostrar en el paso Enviar el botón "Copiar mensaje" y a su lado "Descargar ZIP" con los documentos seleccionados, y SHALL NOT mostrar "Copiar correo completo" ni "Confirmar envío". El paso Enviar SHALL mostrarse completo por defecto, de modo que Resultado sea el siguiente paso cuando Preparar está listo.

#### Scenario: Copiar el mensaje y descargar el ZIP

- **WHEN** el estudiante abre Enviar en la designación de calificadores
- **THEN** ve "Copiar mensaje" y "Descargar ZIP" juntos, y no ve "Copiar correo completo" ni "Confirmar envío".

#### Scenario: Enviar completo por defecto

- **WHEN** Preparar está listo en la designación de calificadores
- **THEN** la pestaña Enviar aparece como lista y el trámite se abre en Resultado sin registrar un envío.
