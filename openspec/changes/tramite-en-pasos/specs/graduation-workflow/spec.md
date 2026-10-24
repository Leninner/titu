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

#### Scenario: Siguiente paso

- **WHEN** lo siguiente es subir una salida y pulsa la acción de la barra fija
- **THEN** se activa Resultado y se enfoca la tarjeta de esa salida.

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

### Requirement: Textos del proceso

El sistema SHALL nombrar trámites y requisitos por el documento o acto, su emisor y destinatario cuando importan, y SHALL omitir textos que expliquen cómo usar la interfaz.

#### Scenario: Instrucciones del trámite

- **WHEN** se muestran las instrucciones de un trámite
- **THEN** contienen hechos del trámite (plazo, destinatario, formato, emisor) y ninguna indicación de uso de la aplicación.

#### Scenario: Zonas de subida

- **WHEN** se muestra una zona de subida vacía
- **THEN** muestra la acción y los formatos aceptados, sin texto que explique arrastrar.
