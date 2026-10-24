## ADDED Requirements

### Requirement: Ciclo del anexo en el trámite

El sistema SHALL mostrar, en el paso Preparar de cada trámite, cada requisito vinculado a una plantilla con las etapas Redactar, Firmar y Adjuntar firmado y su estado derivado del borrador, las versiones exportadas y la selección del trámite.

#### Scenario: Sin borrador

- **WHEN** el estudiante abre la solicitud de calificadores del Proyecto sin borrador de Anexo 10
- **THEN** la tarjeta del Anexo 10 muestra Redactar pendiente y la acción "Redactar" crea el borrador y abre el editor en `#/proceso/calificadores-research/anexo/<id>`.

#### Scenario: Borrador válido sin exportar

- **WHEN** el borrador del Anexo 10 es válido y no tiene exportación de su revisión actual
- **THEN** Redactar está completo y Firmar está pendiente con las acciones de descarga en PDF y Word.

#### Scenario: Revisión cambiada tras firmar

- **WHEN** el estudiante edita un anexo cuya revisión 3 ya tiene versión firmada adjunta
- **THEN** Firmar vuelve a pendiente, la tarjeta indica que la versión firmada corresponde a la revisión 3 y la versión firmada sigue seleccionada hasta adjuntar una nueva.

#### Scenario: Volver al trámite

- **WHEN** cierra el editor abierto desde un trámite
- **THEN** vuelve al paso Preparar de ese trámite con la tarjeta del anexo enfocada.

### Requirement: Firmantes y entrega por plantilla

El sistema SHALL declarar en cada plantilla editable sus firmantes y quién la entrega, según su fuente, y SHALL adaptar la etapa Firmar a esos datos.

#### Scenario: Firma solo el estudiante

- **WHEN** el anexo es 8, 9, 10, 14, 15, 21 o la recalificación del Proyecto
- **THEN** la etapa Firmar ofrece descargar para firmar y no ofrece pedir firma a otra persona.

#### Scenario: Anexo 1 en Proyecto o Artículo

- **WHEN** la modalidad es Proyecto o Artículo
- **THEN** el Anexo 1 lista como firmantes al estudiante y al tutor sugerido, y ofrece preparar el correo para pedir la firma del tutor.

#### Scenario: Anexo 1 en Complexivo

- **WHEN** la modalidad es Complexivo
- **THEN** el Anexo 1 lista solo al estudiante como firmante, según UT-05 §6.1.1.

#### Scenario: Firma de la empresa

- **WHEN** el anexo es el 3 o el cumplimiento empresarial del 100%
- **THEN** el firmante es el representante de la empresa y la etapa Firmar ofrece preparar el correo a ese representante.

#### Scenario: Entrega del tutor

- **WHEN** el anexo es el 5 o el 11
- **THEN** la etapa Firmar indica que el tutor firma y envía por Quipux a la Secretaría de la Unidad de Titulación con copia al docente responsable, ofrece preparar el correo al tutor, y la etapa Adjuntar firmado pide la copia firmada que el tutor envió al estudiante.

### Requirement: Versión firmada adjunta

El sistema SHALL guardar el archivo firmado como nueva versión del documento exportado, vinculada a la revisión firmada, con tipo de firma declarado, y SHALL seleccionarla en el trámite en lugar de la exportación sin firma.

#### Scenario: Adjuntar firmado

- **WHEN** sube el Anexo 10 firmado electrónicamente
- **THEN** queda como versión `reported-signed` con `signatureKind` electrónica y la revisión del borrador, seleccionada en el trámite, y la exportación sin firma deja de estar seleccionada sin borrarse.

#### Scenario: Varios firmantes

- **WHEN** sube el Anexo 1 firmado por estudiante y tutor sin confirmar que todas las firmas son del mismo tipo y ninguna es una imagen pegada
- **THEN** la versión queda `pending` y el requisito no se cumple.

#### Scenario: Exportación de la aplicación

- **WHEN** el estudiante exporta un anexo desde el editor
- **THEN** la versión queda `pending` y nunca se marca como firmada automáticamente.

#### Scenario: Ya firmado fuera de la aplicación

- **WHEN** el estudiante ya tiene el Anexo 3 firmado por la empresa sin haberlo redactado en la aplicación
- **THEN** puede adjuntarlo directamente y la tarjeta muestra Adjuntar firmado completo sin exigir borrador.

### Requirement: Informes mensuales en Desarrollo

El sistema SHALL listar en el trámite de desarrollo un Anexo 5 por mes con sus etapas y SHALL permitir crear el informe del mes siguiente desde el trámite.

#### Scenario: Nuevo informe mensual

- **WHEN** existe el Anexo 5 de octubre y el estudiante pulsa "Nuevo informe mensual"
- **THEN** se crea el borrador de noviembre con los datos fijos copiados y fecha, avance y observaciones vacíos.

#### Scenario: Mensual sin firma

- **WHEN** un Anexo 5 seleccionado no tiene versión firmada
- **THEN** el requisito de informes mensuales no se cumple y la fila de ese mes muestra Adjuntar firmado pendiente.

### Requirement: Informe final desde los mensuales

El sistema SHALL ofrecer, al redactar el Anexo 11 en el trámite del informe final, la selección de revisiones de Anexo 5 y SHALL crear el borrador con sus fechas y actividades exactas.

#### Scenario: Redactar Anexo 11

- **WHEN** selecciona los Anexos 5 de agosto a noviembre y pulsa "Redactar"
- **THEN** el borrador del Anexo 11 contiene exactamente las fechas y actividades de esas revisiones, con su origen.

### Requirement: Formatos de referencia en su trámite

El sistema SHALL mostrar cada formato de referencia, externo o no aportado en el trámite que lo usa, con enlace a su fuente y sin generar documentos emitidos por terceros.

#### Scenario: Preliminares

- **WHEN** abre la revisión de Biblioteca en Proyecto
- **THEN** ve la referencia de preliminares de Proyecto (UT-26) en el pie del trámite.

#### Scenario: Anexo 13B

- **WHEN** abre la propuesta en Artículo
- **THEN** ve el Anexo 13B como formato no aportado, sin estructura inventada.
