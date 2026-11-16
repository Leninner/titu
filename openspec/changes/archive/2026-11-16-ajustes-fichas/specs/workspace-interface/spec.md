## ADDED Requirements

### Requirement: Ajustes en pestañas y fichas

El sistema SHALL presentar Ajustes y respaldo en dos pestañas, "Expediente" y "Respaldo". En Expediente SHALL mostrar las fichas Datos personales, Titulación y Empresa con los datos guardados en modo lectura, indicar cuántos faltan y ofrecer en cada ficha un botón Editar con Guardar y Cancelar.

#### Scenario: Leer el expediente

- **WHEN** el estudiante abre Ajustes y respaldo
- **THEN** ve la pestaña Expediente con sus datos en fichas, sin campos de formulario, y "Sin completar" en los datos vacíos.

#### Scenario: Editar una ficha

- **WHEN** pulsa Editar en Titulación, cambia la Modalidad y pulsa Guardar
- **THEN** se guarda el perfil y la ficha vuelve a modo lectura con el nuevo valor.

#### Scenario: Cancelar la edición

- **WHEN** cambia un campo y pulsa Cancelar
- **THEN** la ficha vuelve a modo lectura sin guardar el cambio.

### Requirement: Respaldo en fichas

En la pestaña Respaldo, el sistema SHALL mostrar en fichas separadas la descarga del respaldo con la fecha del último, la importación de un respaldo ZIP y la creación de otro expediente.

#### Scenario: Respaldo

- **WHEN** abre la pestaña Respaldo
- **THEN** ve "Descargar respaldo completo", la importación de un respaldo ZIP y "Crear otro expediente" en fichas separadas.
