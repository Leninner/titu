## ADDED Requirements

### Requirement: Anexo 11 editable opcional

El sistema SHALL ofrecer el Anexo 11 editable de "Informe final de avance del tutor" solo como ayuda y SHALL NOT exigirlo para completar el trámite. El sistema SHALL exigir el Anexo 11 firmado por el tutor, subido en Resultado y con la firma confirmada. Fuente: `UT-03`.

#### Scenario: Completar sin el borrador

- **WHEN** el estudiante no creó el Anexo 11 en la aplicación y sube en Resultado el Anexo 11 firmado con la firma confirmada
- **THEN** puede completar el trámite.

#### Scenario: Firma sin confirmar

- **WHEN** el Anexo 11 subido en Resultado no tiene la firma confirmada
- **THEN** el botón "Completar trámite" sigue deshabilitado.
