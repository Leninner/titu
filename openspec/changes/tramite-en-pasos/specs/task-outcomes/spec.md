## ADDED Requirements

### Requirement: Salidas declaradas por trámite

El sistema SHALL permitir que cada trámite declare salidas con categoría, firma y obligatoriedad, guardadas como documentos de su categoría y como `outputVersionIds` del trámite, separadas de la evidencia de envío.

#### Scenario: Subir la resolución de la propuesta

- **WHEN** el estudiante sube la resolución de Consejo en el paso Resultado de la propuesta
- **THEN** el archivo queda en la categoría `resolucion` y en las salidas de la propuesta, y no forma parte del ZIP de envío de la propuesta.

#### Scenario: Capturas del correo de respuesta

- **WHEN** sube capturas en "Capturas del correo de respuesta"
- **THEN** se guardan como salida opcional en la categoría `respuesta`, admiten varios archivos de imagen o PDF y no se exigen para completar.

### Requirement: Cierre del trámite desde Resultado

El sistema SHALL habilitar "Completar trámite" solo cuando no falten entradas y cada salida obligatoria tenga al menos una versión, respetando la regla de firma de la salida.

#### Scenario: Falta la salida obligatoria

- **WHEN** la propuesta tiene sus entradas listas y no tiene resolución
- **THEN** "Completar trámite" está deshabilitado y la resolución figura como faltante.

#### Scenario: Completar en un gesto

- **WHEN** sube la resolución y pulsa "Completar trámite"
- **THEN** el trámite queda `completed` con una entrada de historial, sin pasos de confirmación adicionales.

#### Scenario: Registrar observación

- **WHEN** pulsa "Hay una observación" y escribe la nota
- **THEN** el trámite queda `observed` con esa nota en el historial.

### Requirement: Encadenamiento de salidas

El sistema SHALL autoseleccionar la versión más reciente de una categoría producida como salida por otro trámite cuando un trámite `pending` o `preparing` la pide como entrada y no tiene ninguna versión seleccionada de esa categoría, y SHALL guardar la selección para que desmarcarla sea definitivo.

#### Scenario: Resolución reutilizada

- **WHEN** la propuesta tiene la resolución como salida y el estudiante abre la solicitud de calificadores sin enviar
- **THEN** la resolución aparece seleccionada como entrada.

#### Scenario: Trámite ya enviado

- **WHEN** un trámite está `submitted` o `completed` y se sube una versión nueva de una categoría que pide
- **THEN** sus archivos seleccionados no cambian.

#### Scenario: Desmarcar

- **WHEN** desmarca una salida autoseleccionada
- **THEN** no vuelve a seleccionarse al reabrir el trámite.

#### Scenario: Uso posterior visible

- **WHEN** ve una tarjeta de salida
- **THEN** la tarjeta indica los trámites aplicables a su modalidad que piden esa categoría.
