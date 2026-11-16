## ADDED Requirements

### Requirement: Copiar mensaje y descargar ZIP en todos los envíos

En el paso Enviar de cualquier trámite, el sistema SHALL mostrar el botón "Copiar mensaje" y a su lado "Descargar ZIP" con los documentos seleccionados, y SHALL NOT mostrar "Copiar correo completo" ni "Solo el mensaje". Los trámites sin envío directo SHALL conservar "Confirmar envío".

#### Scenario: Trámite con confirmación

- **WHEN** el estudiante abre Enviar en "Propuesta y aprobación de modalidad"
- **THEN** ve "Copiar mensaje", "Descargar ZIP" y "Confirmar envío", y no ve "Copiar correo completo" ni "Solo el mensaje".
