## ADDED Requirements

### Requirement: Navegación clara y siguiente acción

El sistema SHALL ofrecer Inicio, Mi proceso, Documentos, Anexos y Fechas, con ajustes accesibles y una siguiente acción basada en requisitos aplicables.

#### Scenario: Inicio con pendientes

- **WHEN** abre un expediente con no adeudar pendiente y aptitud legal bloqueada
- **THEN** ve la acción disponible y por qué la otra espera, con enlace directo al trámite.

#### Scenario: Todo en espera

- **WHEN** no hay acción disponible porque espera respuestas
- **THEN** ve Esperando respuesta y qué gestiones están pendientes, sin un siguiente paso ficticio.

### Requirement: Edición y preview adaptables

El sistema SHALL presentar una sola hoja editable con el formato del anexo en escritorio y móvil, manteniendo borrador y estado de guardado visibles incluso cuando falten datos.

#### Scenario: Pantalla de 360 px

- **WHEN** edita Anexo 5 directamente sobre la hoja
- **THEN** los cambios se guardan sin alternar paneles y el shell no requiere scroll horizontal.

#### Scenario: Documento vacío

- **WHEN** abre Anexos sin informes
- **THEN** ve una acción clara Crear informe mensual o Elegir plantilla y no informes de ejemplo personales.

### Requirement: Accesibilidad y búsqueda

El sistema SHALL ofrecer labels, foco visible, teclado, contraste AA, estados independientes del color, preferencias de movimiento reducido y búsqueda local de trámites/documentos/anexos.

#### Scenario: Solo teclado

- **WHEN** navega al editor, agrega una fila, abre preview y descarga
- **THEN** puede completar las acciones, cerrar diálogos con Escape y recuperar el foco.

#### Scenario: Buscar sin red

- **WHEN** busca aptitud legal
- **THEN** encuentra el trámite/plantilla pertinente sin enviar consultas o datos a un servidor.

### Requirement: Mensajes honestos

El sistema SHALL distinguir guardado, generación, firma, envío y aceptación; mostrar errores junto a la acción y explicar límites del almacenamiento al iniciar y respaldar.

#### Scenario: Exportación fallida

- **WHEN** el navegador no puede generar o guardar el archivo
- **THEN** ve una acción de reintento y conserva el borrador; no aparece Archivo descargado exitosamente.

#### Scenario: Configuración inicial

- **WHEN** crea su expediente
- **THEN** entiende que se guarda en este navegador y cómo exportar un respaldo, sin lenguaje técnico innecesario.
