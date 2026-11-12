## ADDED Requirements

### Requirement: Trabajo en empresa por defecto

El sistema SHALL crear los perfiles nuevos con "El trabajo se realiza en una empresa" marcado, para que el requisito "Empresa al 100 %" se muestre desde el inicio, y SHALL permitir desmarcarlo en Ajustes sin cambiar los perfiles ya guardados.

#### Scenario: Perfil nuevo

- **WHEN** un estudiante de Proyecto crea su perfil sin tocar la opción de empresa
- **THEN** la designación de calificadores del Proyecto pide "Empresa al 100 %".

#### Scenario: Sin empresa

- **WHEN** el estudiante desmarca "El trabajo se realiza en una empresa" en Ajustes
- **THEN** la designación de calificadores del Proyecto ya no pide "Empresa al 100 %".
