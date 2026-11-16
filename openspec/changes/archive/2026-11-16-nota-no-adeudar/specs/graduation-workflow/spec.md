## ADDED Requirements

### Requirement: Nota de vigencia del no adeudar

El sistema SHALL mostrar en cada tarjeta del formulario de no adeudar, sin que el estudiante tenga que abrir un tooltip ni un menú, la nota: "El formulario de no adeudar es válido treinta días a partir de la fecha de emisión por la Tesorería de la Universidad Técnica de Ambato, tiempo después del cual caduca y se debe adquirir un nuevo formulario. Debe estar vigente hasta el ingreso de la petición de día y hora." Fuente: `UT-20`, `UT-21`.

#### Scenario: Nota en la petición de día y hora

- **WHEN** el estudiante abre el trámite de solicitud de día y hora de sustentación
- **THEN** la tarjeta "Formulario de no adeudar" muestra la nota de vigencia visible.

#### Scenario: Nota en el trámite propio

- **WHEN** abre el trámite "Formulario de no adeudar"
- **THEN** la tarjeta del formulario y la guía muestran la misma nota.
