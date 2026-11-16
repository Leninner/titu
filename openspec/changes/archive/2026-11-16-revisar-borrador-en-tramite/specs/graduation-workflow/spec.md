## ADDED Requirements

### Requirement: Revisión de borradores en los formatos del trámite

El sistema SHALL mostrar, en los formatos que se abren desde un trámite, un aviso cuando el borrador quedó marcado para revisión por un cambio del perfil, con la acción "Actualizar datos y revisar campos" que copia el perfil actual al borrador y retira la marca.

#### Scenario: Borrador marcado tras cambiar el tema

- **WHEN** el estudiante cambia el tema del perfil y abre la solicitud de requisitos habilitantes
- **THEN** ve el aviso de revisión con la acción "Actualizar datos y revisar campos".

#### Scenario: Descargar tras revisar

- **WHEN** pulsa "Actualizar datos y revisar campos" y luego descarga el PDF
- **THEN** el aviso desaparece y el PDF se genera sin el error de revisión.
