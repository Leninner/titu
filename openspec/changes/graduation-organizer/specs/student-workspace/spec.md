## ADDED Requirements

### Requirement: Expediente local sin cuenta

El sistema SHALL permitir crear un expediente en el navegador sin cuenta, backend ni transmisión de documentos personales, explicando almacenamiento local y respaldo.

#### Scenario: Dos estudiantes

- **WHEN** dos estudiantes abren la misma URL en navegadores independientes
- **THEN** cada uno comienza con un expediente vacío y no puede consultar el del otro.

#### Scenario: Navegador compartido

- **WHEN** otra persona usa el mismo perfil de navegador
- **THEN** la app no presenta el nombre del perfil como protección de acceso y ofrece respaldar/reemplazar antes de cambiar estudiante.

### Requirement: Perfil y punto de inicio

El sistema SHALL recoger modalidad, período y datos del perfil de design.md progresivamente, permitir iniciar en cualquier etapa y exigir campos personales solo cuando el documento los requiera.

#### Scenario: Estudiante avanzado

- **WHEN** empieza directamente en sustentación
- **THEN** ve requisitos previos por registrar y puede adjuntar evidencia, sin autocompletar trámites.

#### Scenario: Cambio de modalidad

- **WHEN** cambia Proyecto a Complexivo
- **THEN** se recalcula la ruta sin borrar documentos o envíos y se marcan para revisión borradores incompatibles.

### Requirement: Persistencia y errores visibles

El sistema SHALL guardar cambios en IndexedDB, confirmar guardado solo tras commit y preservar cambios recuperables ante fallos o conflictos.

#### Scenario: Recarga normal

- **WHEN** edita un dato, ve Guardado y recarga
- **THEN** recupera ese dato y su revisión.

#### Scenario: Cuota agotada

- **WHEN** falla una escritura por falta de espacio
- **THEN** ve No se pudo guardar, conserva lo editado en memoria y puede descargar un borrador de emergencia.

#### Scenario: Edición concurrente

- **WHEN** dos pestañas intentan guardar revisiones derivadas de la misma versión
- **THEN** la segunda recibe un conflicto y puede conservar su copia; no hay sobrescritura silenciosa.

### Requirement: Uso sin conexión posterior

El sistema SHALL permitir consultar y editar datos locales y generar anexos sin conexión después de cargar/cachar los recursos de la app.

#### Scenario: Trabajo sin red

- **WHEN** recarga sin conexión tras completar la carga inicial
- **THEN** abre el expediente y puede editar/exportar con assets locales; los enlaces institucionales indican que requieren conexión.
