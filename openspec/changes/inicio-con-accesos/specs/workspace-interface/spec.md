## ADDED Requirements

### Requirement: Inicio con accesos a lo inmediato

El sistema SHALL mostrar en el inicio lo que falta del trámite siguiente, accesos directos a los trámites en curso y las próximas fechas con su tipo y su trámite relacionado.

#### Scenario: Lo que falta del trámite siguiente

- **WHEN** el trámite siguiente tiene requisitos pendientes
- **THEN** la tarjeta principal dice cuántos faltan con concordancia de número, muestra hasta tres como chips que llevan al trámite y la fecha clave del trámite con los días restantes.

#### Scenario: Trámites en curso

- **WHEN** hay otros trámites que se pueden avanzar o que esperan respuesta
- **THEN** cada uno aparece como tarjeta con el ícono de su etapa, su estado por color e ícono y su avance, y lleva al trámite.

#### Scenario: Fecha enlazada a su trámite

- **WHEN** una fecha del horizonte es hito de un trámite aplicable a la modalidad
- **THEN** muestra el ícono de su tipo y lleva a ese trámite; si no hay trámite relacionado, lleva a la agenda.
