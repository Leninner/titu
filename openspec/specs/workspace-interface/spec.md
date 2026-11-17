# workspace-interface Specification

## Purpose
TBD - created by archiving change anexos-indice. Update Purpose after archive.

## Requirements

### Requirement: Índice de anexos

El sistema SHALL mostrar en Anexos una tarjeta por cada formato editable que aplica a la modalidad del estudiante, agrupadas por etapa, con su número, título, quién lo emite y firma, y su estado; SHALL permitir abrirlo o crearlo y descargarlo en Word y PDF desde la tarjeta; y SHALL listar los formatos de referencia como enlaces al final de cada etapa.

#### Scenario: Tarjetas por etapa

- **WHEN** un estudiante de Artículo abre Anexos
- **THEN** ve las secciones Propuesta, Desarrollo, Calificadores, Sustentación y Otros trámites, y en Calificadores la tarjeta con la etiqueta "Anexo 10", el título "Calificadores de Artículo" y "Estudiante lo emite y firma", sin la del Proyecto.

#### Scenario: Descargar desde la tarjeta

- **WHEN** tiene un borrador completo del Anexo 15 y elige Word o PDF en el menú Descargar de su tarjeta
- **THEN** descarga el documento con su perfil actual, sin guardarlo en Documentos.

#### Scenario: Borrador incompleto

- **WHEN** el borrador tiene campos obligatorios vacíos
- **THEN** la tarjeta muestra "Faltan datos" y el menú Descargar está deshabilitado.

#### Scenario: Crear un anexo

- **WHEN** pulsa "Crear" en la tarjeta de un anexo sin borrador
- **THEN** se crea el borrador y se abre el editor.

#### Scenario: Informes mensuales

- **WHEN** tiene Anexo 5 de septiembre y octubre
- **THEN** ve una tarjeta por mes con el mes como subtítulo y una tarjeta con el mes del informe y "Crear informe mensual".

#### Scenario: Estado del anexo

- **WHEN** exportó el borrador y subió la versión firmada
- **THEN** la tarjeta muestra "Firmado".

#### Scenario: Filtro por emisor

- **WHEN** elige "Tutor" en el filtro
- **THEN** solo ve los anexos que emite el tutor.

#### Scenario: Referencias

- **WHEN** abre la etapa Propuesta
- **THEN** al final ve "Anexo 2 · Estructura de propuesta" como enlace a su fuente, sin tarjeta ni acciones.

#### Scenario: Firmantes del Anexo 1 en Complexivo

- **WHEN** un estudiante de Complexivo ve la tarjeta del Anexo 1
- **THEN** dice "Estudiante lo emite y firma".

### Requirement: Identidad visual

El sistema SHALL usar el azul institucional de la Universidad Técnica de Ambato como color de identidad, selección y acción, sin tonos morados.

#### Scenario: Menú activo y acciones

- **WHEN** se muestra la barra lateral con Anexos activo y un botón principal
- **THEN** el ítem activo tiene fondo #e8f0fa y texto #0b2e59, y el botón usa #1d5fa8.

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

### Requirement: Datos desde la resolución de aprobación

El sistema SHALL permitir subir en la ficha Titulación la resolución de Consejo Directivo que aprueba la modalidad y el tema, SHALL proponer los datos encontrados (número de resolución, fecha de aprobación, nombres, modalidad, carrera, período, tema y tutor) junto a los valores actuales, y SHALL guardar solo los datos que el estudiante confirme, junto con el PDF en "Resolución de modalidad y tema". El campo del número SHALL llamarse "Número de resolución de aprobación".

#### Scenario: Llenar desde la resolución

- **WHEN** el estudiante sube su resolución y confirma los datos marcados
- **THEN** la ficha Titulación muestra el número, la fecha, el tema y el tutor de la resolución, y el PDF queda en Documentos.

#### Scenario: PDF sin texto

- **WHEN** el PDF no tiene texto legible o no es una resolución
- **THEN** el sistema avisa que no encontró datos y no cambia el expediente.

### Requirement: Contador sin pasos informativos

El sistema SHALL contar en "X de N trámites completados" solo los trámites, sin los pasos informativos.

#### Scenario: Calificación informativa

- **WHEN** un estudiante de Proyecto abre Mi proceso
- **THEN** el contador indica 13 trámites, sin contar "Designación y calificación".

### Requirement: Mapa del proceso por etapas

El sistema SHALL mostrar el mapa del proceso con una fila por etapa que aplica a la modalidad (Trabajo de titulación, Calificadores, Biblioteca, Sustentación y título), numeradas en orden y con su avance. Dentro de cada fila SHALL mostrar los pasos en orden con una flecha cuando un paso depende del anterior, SHALL NOT dibujar flechas entre etapas y SHALL indicar en el paso "Necesita: …" las dependencias pendientes de otras etapas.

#### Scenario: Paso bloqueado por otra etapa

- **WHEN** un estudiante de Proyecto abre Mi proceso sin la calificación completada
- **THEN** "Biblioteca: firma del estudiante" aparece en la fila Biblioteca con "Necesita: Designación y calificación".

### Requirement: Ocultar etapas completadas

El sistema SHALL ofrecer "Ocultar completadas" para ocultar las etapas con todos sus trámites completados, indicando cuáles se ocultaron, y "Ver completadas" para mostrarlas de nuevo, recordando la elección en el navegador.

#### Scenario: Ocultar el trabajo terminado

- **WHEN** el estudiante completó la etapa Trabajo de titulación y pulsa "Ocultar completadas"
- **THEN** la fila desaparece y se lee "Etapa completada oculta: Trabajo de titulación".

### Requirement: Un archivo por documento

El sistema SHALL conservar un solo archivo por documento: al reemplazarlo o cambiar su firma, el archivo anterior se elimina salvo que forme parte de un envío registrado, y las tarjetas de Documentos no muestran historial de versiones.

#### Scenario: Reemplazar la cédula

- **WHEN** el estudiante reemplaza el archivo de Identificación
- **THEN** la tarjeta muestra solo el archivo nuevo, el anterior deja de existir y los trámites no enviados que lo usaban pasan al nuevo.

#### Scenario: Archivo ya enviado

- **WHEN** reemplaza un archivo que forma parte de un envío registrado
- **THEN** el envío conserva el archivo enviado y la tarjeta muestra el nuevo.

#### Scenario: Marcar firmas

- **WHEN** marca "Tiene firmas" en un archivo
- **THEN** la tarjeta sigue mostrando un solo archivo, ahora con firma reportada.

#### Scenario: Sin historial

- **WHEN** abre Documentos
- **THEN** ninguna tarjeta muestra "Historial" y la tarjeta permite descargar y eliminar el archivo actual.

#### Scenario: Eliminar un archivo enviado

- **WHEN** intenta eliminar un archivo que forma parte de un envío
- **THEN** el archivo se conserva y se informa que ya se envió.
