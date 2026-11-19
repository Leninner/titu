## MODIFIED Requirements

### Requirement: Nota de vigencia del no adeudar

El sistema SHALL mostrar el aviso de vigencia del no adeudar como un chip con ícono y texto corto, solo donde aplica: en el trámite "Formulario de no adeudar", "Vale 30 días"; en la solicitud de día y hora, "Vigente al enviar". El detalle SHALL quedar en un tooltip. SHALL NOT mostrar el aviso en aptitud legal. Fuente: `UT-20`, `UT-21`.

#### Scenario: Nota en la petición de día y hora

- **WHEN** el estudiante abre el trámite de solicitud de día y hora de sustentación
- **THEN** la tarjeta "Formulario de no adeudar" muestra el chip "Vigente al enviar".

#### Scenario: Nota en el trámite propio

- **WHEN** abre el trámite "Formulario de no adeudar"
- **THEN** la tarjeta muestra el chip "Vale 30 días".

### Requirement: Fechas del no adeudar en el trámite

Al subir el formulario de no adeudar en PDF, el sistema SHALL registrar como emisión la mayor fecha «FECHA: dd/mm/aaaa» de su texto. Subir el archivo SHALL bastar para que la tarjeta muestre "Listo", sin confirmar firmas ni registrar fechas. La tarjeta SHALL mostrar la emisión y el vencimiento (emisión + 30 días) como chips y SHALL permitir agregar o cambiar la emisión, guardándola en una nueva versión del mismo documento. El sistema SHALL NOT pedir ni guardar un vencimiento impreso. Si el vencimiento es anterior a la fecha de ingreso de la solicitud de día y hora, la tarjeta SHALL mostrar "Vencido". Fuentes: `UT-20`, `UT-21`.

#### Scenario: Fecha leída del PDF

- **WHEN** el estudiante sube el formulario del Sistema Integrado con «FECHA: 19/11/2026» en la cabecera y fechas del 17 y 18/11/2026 en las dependencias
- **THEN** la emisión queda registrada el 19/11/2026 y la tarjeta muestra "Vence 19 dic".

#### Scenario: Archivo sin fecha

- **WHEN** el estudiante sube el formulario de no adeudar en su trámite sin que se lea una fecha
- **THEN** la tarjeta muestra "Listo" con el chip "Agregar emisión" y "Completar trámite" se habilita.

#### Scenario: Fecha registrada

- **WHEN** el estudiante registra la emisión desde el chip de la tarjeta
- **THEN** la tarjeta muestra la emisión y su vencimiento.

### Requirement: Faltantes visibles en el resultado

Cuando "Completar trámite" está deshabilitado por el resultado, el paso de resultado SHALL listar bajo "Falta para completar" cada faltante del resultado.

#### Scenario: Resultado incompleto

- **WHEN** el resultado del trámite no tiene su archivo
- **THEN** el paso de resultado lista "Adjuntar: <documento>" bajo "Falta para completar".
