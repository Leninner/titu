## ADDED Requirements

### Requirement: Fechas del no adeudar en el trámite

Al subir el formulario de no adeudar en PDF, el sistema SHALL registrar como emisión la mayor fecha «FECHA: dd/mm/aaaa» de su texto. En toda tarjeta "Formulario de no adeudar" de un trámite, el sistema SHALL permitir registrar la fecha de emisión y el vencimiento impreso del archivo incluido, guardándolos en una nueva versión del mismo documento. Sin ninguna de las dos fechas, la tarjeta SHALL mostrar "Falta la emisión" y SHALL NOT mostrar "Listo", y el faltante SHALL decir "No adeudar: registra la fecha de emisión". Fuentes: `UT-20`, `UT-21`.

#### Scenario: Fecha leída del PDF

- **WHEN** el estudiante sube el formulario del Sistema Integrado con «FECHA: 19/11/2026» en la cabecera y fechas del 17 y 18/11/2026 en las dependencias
- **THEN** la emisión queda registrada el 19/11/2026.

#### Scenario: Archivo sin fecha

- **WHEN** el estudiante registra el formulario de no adeudar firmado en su trámite sin fechas
- **THEN** la tarjeta muestra "Falta la emisión" y "Completar trámite" sigue deshabilitado.

#### Scenario: Fecha registrada

- **WHEN** el estudiante registra la emisión del 19/11/2026 en la tarjeta
- **THEN** la tarjeta muestra "Listo" y "Completar trámite" se habilita.

### Requirement: Faltantes visibles en el resultado

Cuando "Completar trámite" está deshabilitado por el resultado, el paso de resultado SHALL listar bajo "Falta para completar" cada faltante del resultado.

#### Scenario: Resultado incompleto

- **WHEN** el resultado del no adeudar no tiene fecha de emisión
- **THEN** el paso de resultado lista "No adeudar: registra la fecha de emisión" bajo "Falta para completar".
