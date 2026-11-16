## ADDED Requirements

### Requirement: Etapas del trabajo de titulación

El sistema SHALL guardar el trabajo de titulación en tarjetas por etapa (sin firmas, corregido, firmado por el estudiante, con firmas docentes y firmado por Decanato), y cada trámite SHALL pedir la tarjeta de su etapa.

#### Scenario: Firma del estudiante

- **WHEN** el estudiante abre "Biblioteca: firma del estudiante"
- **THEN** el trámite pide "Trabajo firmado por el estudiante" y no acepta el trabajo sin firmas como ese documento.

#### Scenario: Solicitud de fecha de sustentación

- **WHEN** abre la solicitud de fecha de sustentación del Proyecto
- **THEN** el trabajo final firmado se toma de la tarjeta "Trabajo firmado por Decanato".

#### Scenario: Documentos

- **WHEN** abre Documentos con archivos en cada etapa
- **THEN** ve una tarjeta por etapa en "Tu trabajo", cada una con su archivo.

### Requirement: Migración de archivos a un archivo por documento

El sistema SHALL migrar el expediente y los respaldos repartiendo los archivos del trabajo según el trámite que los usa, dejando un archivo por documento, conservando los archivos de los envíos registrados y liberando los archivos sin uso.

#### Scenario: Trabajo firmado subido en la firma de Decanato

- **WHEN** un expediente tiene en "Trabajo de titulación" una versión sin firmas usada en la revisión de Biblioteca y una firmada usada en la firma de Decanato
- **THEN** tras migrar, "Trabajo sin firmas" muestra la primera, "Trabajo firmado por Decanato" la segunda y cada trámite sigue completo.

#### Scenario: Versiones antiguas

- **WHEN** un documento tiene tres versiones y solo la primera forma parte de un envío
- **THEN** tras migrar conserva la primera para el envío y la más reciente como archivo actual, y la intermedia se elimina con su blob.

#### Scenario: Restaurar un respaldo antiguo

- **WHEN** restaura un respaldo con varias versiones por documento
- **THEN** el expediente restaurado cumple las mismas reglas.
