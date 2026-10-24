## ADDED Requirements

### Requirement: Trámite en pasos

El sistema SHALL presentar cada trámite en los pasos Preparar, Enviar y Resultado como pestañas accesibles con estado, mostrando solo el contenido del paso activo y abriendo en el primer paso incompleto.

#### Scenario: Estado de los pasos

- **WHEN** la propuesta tiene 2 de 2 documentos y un envío registrado el 3 de noviembre
- **THEN** Preparar muestra listo, Enviar muestra enviado 3 nov, Resultado muestra pendiente y la pestaña activa es Resultado.

#### Scenario: Navegación libre

- **WHEN** el estudiante elige Resultado sin haber registrado un envío
- **THEN** ve el paso Resultado y puede registrar un trámite histórico.

#### Scenario: Trámite sin entradas ni correo

- **WHEN** abre "Sustentación o incorporación" o "Retirar título"
- **THEN** ve solo el contenido de Resultado, sin barra de pasos.

#### Scenario: Envío registrado

- **WHEN** confirma el envío en Enviar
- **THEN** el trámite queda `submitted` y la pestaña activa pasa a Resultado.

#### Scenario: Sin barra fija

- **WHEN** abre cualquier trámite
- **THEN** no hay una barra fija de siguiente paso y el estado se lee en los pasos.

#### Scenario: Envío con un botón

- **WHEN** Preparar está completo y pulsa "Confirmar envío" en Enviar
- **THEN** se registra el envío con la fecha y hora actuales, sin pedir destinatario ni fecha, y Enviar solo muestra asunto y cuerpo del correo.

#### Scenario: Historial y fuentes

- **WHEN** abre el menú "⋯" del trámite y elige Historial de estados o Fuentes y criterios
- **THEN** ve esa sección en un diálogo, sin que ocupe espacio al pie de la página.

#### Scenario: Modal del mapa

- **WHEN** abre en el mapa un trámite enviado sin resultado
- **THEN** el modal muestra las tarjetas de salida y permite subirlas.

### Requirement: Trámites de recepción fusionados

El sistema SHALL tratar la recepción de un resultado como el paso Resultado del trámite que lo solicita, sin trámites separados de solo recepción.

#### Scenario: Catálogo fusionado

- **WHEN** se carga el catálogo
- **THEN** no existen `aprobacion`, `notas`, `biblioteca-aval-inicial` ni `biblioteca-aval-final`. La propuesta produce la resolución de Consejo. Solicitar calificadores produce la notificación de designación, las dos notas y los dos valores de nota. La revisión de Biblioteca produce el aval inicial y la firma de Decanato el aval final.

#### Scenario: Dependencias reapuntadas

- **WHEN** se evalúan dependencias
- **THEN** desarrollo y complexivo dependen de la propuesta, aptitud legal de solicitar calificadores, la firma del estudiante de la revisión de Biblioteca y día y hora de la firma de Decanato.

#### Scenario: Resoluciones inequívocas

- **WHEN** se encadenan resoluciones
- **THEN** la resolución de Consejo usa `resolucion`, la notificación de calificadores usa `resolucion-designacion`, la de trámites excepcionales usa `resolucion-tramite`, y día y hora pide `resolucion` y `resolucion-designacion`.

### Requirement: Migración del expediente

El sistema SHALL migrar expedientes y respaldos con trámites fusionados sin perder envíos, notas, historial, valores ni archivos.

#### Scenario: Aprobación completada

- **WHEN** `aprobacion` estaba `completed`
- **THEN** la propuesta queda `completed`, sus archivos pasan a salidas de la propuesta, sus envíos, notas, valores e historial se reasignan y el registro de `aprobacion` desaparece.

#### Scenario: Propuesta completada sin aprobación

- **WHEN** la propuesta estaba `completed` y `aprobacion` no
- **THEN** la propuesta queda `waiting`.

#### Scenario: Requisitos convertidos en salidas

- **WHEN** un trámite tenía seleccionadas versiones de una categoría que ahora es salida
- **THEN** esas versiones pasan de `evidenceVersionIds` a `outputVersionIds`.

#### Scenario: Restaurar respaldo antiguo

- **WHEN** restaura un respaldo creado antes de la fusión
- **THEN** se aplica la misma migración y el respaldo pasa la validación de referencias.

### Requirement: Requisitos según el anexo del trámite

El sistema SHALL pedir como documentos los adjuntos que lista el anexo de cada trámite, en su orden, con sus condiciones de modalidad, empresa u opcionalidad.

#### Scenario: Propuesta según el Anexo 1

- **WHEN** un estudiante de Proyecto con empresa abre la propuesta
- **THEN** ve, en este orden, Anexo 1 firmado, copia de cédula, capturas de los correos de aval, carta de compromiso Anexo 3, oficio de la Unidad Operativa de Investigación (opcional), propuesta del perfil Anexo 2 y certificado de requisitos habilitantes (opcional), sin un checkbox de avales.

#### Scenario: Propuesta de complexivo

- **WHEN** un estudiante de complexivo abre la propuesta
- **THEN** no se le piden capturas de aval ni Anexo 2.

### Requirement: Informes mensuales por mes

El sistema SHALL admitir varios Anexo 5 a la vez, identificar el mes de cada uno según el formato del anexo y exigir un informe por cada mes del rango configurado con el tema aprobado.

#### Scenario: Subir varios meses

- **WHEN** sube a la vez los Anexo 5 de agosto, septiembre y octubre con rango agosto–noviembre
- **THEN** cada archivo queda asociado a su mes y figura como faltante el informe de noviembre.

#### Scenario: Tarjeta por mes

- **WHEN** abre los informes mensuales con rango agosto–noviembre
- **THEN** ve una tarjeta por mes, cada una con su archivo, su firma y su estado, y una tarjeta para agregar otro mes.

#### Scenario: Completado automático

- **WHEN** sube y marca como firmado el Anexo 5 del último mes que faltaba
- **THEN** el trámite queda completado sin pasos de envío ni correo; si luego falta una firma, vuelve a preparación.

#### Scenario: Avance declarado de la tesis

- **WHEN** los Anexo 5 incluidos de agosto y septiembre declaran 20 % y 45 % de avance
- **THEN** la vista muestra en una franja compacta 45 % como avance actual de la tesis según septiembre, y en cada tarjeta su porcentaje con la diferencia frente al mes anterior; un mes sin porcentaje legible figura sin dato y una baja de avance se resalta.

#### Scenario: Archivo que no es Anexo 5

- **WHEN** sube un archivo sin el formato del Anexo 5
- **THEN** se indica que no se reconoció como Anexo 5 y puede asignarle un mes a mano.

#### Scenario: Tema distinto

- **WHEN** un Anexo 5 tiene un tema distinto al aprobado en el perfil
- **THEN** el informe figura con el tema distinto como faltante.

### Requirement: Informe final desde los Anexo 5

El sistema SHALL preparar el Anexo 11 dentro del trámite con las fechas y actividades de todos los Anexo 5 subidos, y SHALL pedir el Anexo 11 firmado como resultado.

#### Scenario: Crear el Anexo 11

- **WHEN** hay Anexo 5 de agosto a noviembre y abre el informe final
- **THEN** el editor del Anexo 11 contiene todas sus actividades ordenadas por fecha y el avance en 100 %.

#### Scenario: Descargar el Anexo 11 sin firmar

- **WHEN** descarga el Anexo 11 desde el trámite
- **THEN** recibe el archivo, que no se guarda en Documentos ni aparece en la tarjeta del Anexo 11 firmado.

#### Scenario: Anexo 11 en el mapa

- **WHEN** abre en el mapa el informe final con el Anexo 11 creado
- **THEN** el modal muestra el documento en solo lectura y la edición queda en el trámite completo.

#### Scenario: Anexo 11 firmado

- **WHEN** sube el Anexo 11 firmado en Resultado y completa el trámite
- **THEN** queda seleccionado como informe final en la designación de calificadores.

#### Scenario: Notas del formato

- **WHEN** edita o exporta un Anexo 5 u 11
- **THEN** las notas del formato no forman parte del documento y se consultan en un tooltip.

#### Scenario: Formato del Anexo 10 en el trámite

- **WHEN** abre "Formato" en la tarjeta del Anexo 10 de la designación de calificadores
- **THEN** ve la solicitud llena con su perfil, edita lugar, fecha, destinatario y teléfonos y la descarga en Word o PDF sin que se guarde en Documentos
- **AND** la tarjeta sigue pidiendo el Anexo 10 firmado.

#### Scenario: Formato del cumplimiento empresarial

- **WHEN** el trabajo se realiza en una empresa con sus datos en Ajustes y abre "Formato" en la tarjeta del cumplimiento empresarial
- **THEN** la carta sale llena con la empresa y su representante, con los teléfonos del representante, y solo pide lugar, fecha y destinatario.

#### Scenario: Solicitud de requisitos habilitantes

- **WHEN** abre "Solicitar" en la tarjeta "Requisitos habilitantes"
- **THEN** ve el correo para la Coordinación de Carrera listo para copiar y descarga la solicitud dirigida al Coordinador de la Carrera con su nivel y ciclo académico.

#### Scenario: Carta exportada

- **WHEN** exporta una solicitud del estudiante
- **THEN** el documento contiene solo la carta, empieza en la fecha sin el encabezado del anexo, separa sus bloques con espacios, lleva la fecha en dd/mm/aaaa y 3 cm libres sobre la línea de firma, y las notas del formato se consultan en un tooltip.

#### Scenario: Espacio para la firma del tutor

- **WHEN** exporta un Anexo 5 u 11 en PDF o Word
- **THEN** sobre la línea de firma del tutor quedan al menos 3 cm libres y la línea mide al menos 9 cm, suficiente para un sello de firma electrónica o una firma manual.
- **AND** bajo la línea van solo el nombre del tutor y "TUTOR TRABAJO TITULACIÓN", sin la etiqueta "NOMBRE Y FIRMA".

### Requirement: Textos del proceso

El sistema SHALL nombrar trámites y requisitos por el documento o acto, su emisor y destinatario cuando importan, y SHALL omitir textos que expliquen cómo usar la interfaz.

#### Scenario: Instrucciones del trámite

- **WHEN** se muestran las instrucciones de un trámite
- **THEN** contienen hechos del trámite (plazo, destinatario, formato, emisor) y ninguna indicación de uso de la aplicación.

#### Scenario: Resumen del trámite

- **WHEN** abre un trámite
- **THEN** ve una sola frase con lo que debe hacer, y "Cómo se tramita" abre una línea de tiempo con cada paso, su responsable y un ícono, más las notas a tener en cuenta.

#### Scenario: Etiqueta corta con detalle

- **WHEN** se muestra la tarjeta de un requisito con detalle
- **THEN** el encabezado muestra solo la etiqueta corta y el detalle completo aparece en un tooltip accesible por teclado.

#### Scenario: Zonas de subida

- **WHEN** se muestra una zona de subida vacía
- **THEN** muestra la acción y los formatos aceptados, sin texto que explique arrastrar.
