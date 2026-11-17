## MODIFIED Requirements

### Requirement: Contador sin pasos informativos

El sistema SHALL contar en "X de N trámites completados" solo los trámites, sin los pasos informativos.

#### Scenario: Calificación informativa

- **WHEN** un estudiante de Proyecto abre Mi proceso
- **THEN** el contador indica 13 trámites, sin contar "Designación por Consejo Directivo" ni "Calificación del trabajo".
