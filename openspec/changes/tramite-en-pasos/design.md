# Trámite en pasos: Preparar → Enviar → Resultado

Fecha: 2026-10-23 · Estado: listo para aprobación

## Por qué

En la vista de un trámite (`#/proceso/<id>`) el estudiante solo puede registrar lo que **entrega**. Lo que la institución le **devuelve** (resoluciones, notificaciones, certificados, capturas del correo de respuesta) no tiene lugar propio: o vive escondido en otro trámite ("Recibir aprobación de Consejo" existe solo para subir la resolución de la propuesta) o termina en "Otros documentos". Cerrar un trámite exige bajar hasta el final y combinar un checkbox ("Recibí y confirmé…") con botones sueltos.

Además, según la guía de titulación (`Guia_titulacion_FISEI_2026.docx`), casi todo lo que se recibe se vuelve a pedir después: la resolución de Consejo va en la solicitud de calificadores y en la de sustentación; el no adeudar y el certificado de aptitud legal van en la solicitud de día y hora, etc. Hoy el estudiante tiene que volver a seleccionarlos a mano en cada trámite.

## Objetivos

1. Cada trámite muestra tres pasos con su estado: **Preparar**, **Enviar**, **Resultado**, presentados como una barra de avance que funciona como pestañas.
2. El paso Resultado permite subir lo que devolvió la institución y cerrar el trámite en un gesto.
3. Lo que se recibe en un trámite aparece ya cumplido en los trámites posteriores que lo piden.
4. Los trámites que solo existen para recibir el resultado de otro se fusionan con él:
   - "Recibir aprobación de Consejo" → en "Seleccionar modalidad y presentar propuesta".
   - "Recibir las dos calificaciones" → en "Solicitar calificadores" (Proyecto y Artículo).
   - "Biblioteca: recibir aval inicial" → en "Biblioteca: revisión sin firmas".
   - "Biblioteca: recibir aval final" → en "Biblioteca: firma de Decanato".
5. Textos del proceso más precisos y detallados, sin textos de indicación que repitan lo que la interfaz ya muestra.

## No objetivos

- Rediseñar el mapa del proceso por fases (proyecto aparte, se aborda después).
- Cambiar la vista de Documentos, el editor de anexos o la exportación ZIP más allá de lo necesario.
- Cambiar el calendario o las fechas del catálogo.

## Anti-objetivos (sería un fracaso aunque funcione)

- La vista se alarga: no se suman secciones nuevas apiladas a la página actual; cada paso reemplaza al anterior en pantalla.
- Textos que explican cómo usar la interfaz ("arrastra aquí", "se registran en el trámite completo", "los archivos también se guardan en Documentos").
- Obligar a subir capturas del correo para cerrar un trámite.

## Diseño

### Barra de pasos / pestañas

Arriba del trámite, debajo del título:

```
 ●━━━━━━━━━━━━━━●━━━━━━━━━━━━━━○
 ✓ Preparar      ✓ Enviar       3 Resultado
   2/2 docs        enviado 3 nov   pendiente
```

- Cada paso es un `tab` (patrón ARIA tabs). El conector entre pasos se pinta según el estado.
- Estado de cada paso:
  - **Preparar**: completo cuando `evaluateTask` no tiene faltantes de entrada. Subtítulo: `n/m docs` (o `listo`).
  - **Enviar**: completo cuando existe una `Submission` registrada para el trámite. Subtítulo: `enviado <fecha corta>` o `pendiente`.
  - **Resultado**: completo cuando el trámite está `completed`. Subtítulo: `pendiente`, `observado` o `completado <fecha>`.
- Al abrir un trámite la pestaña activa es el primer paso incompleto. Si todo está completo, Resultado.
- Las pestañas son navegables libremente (no se bloquea ir a Resultado sin haber enviado; un estudiante puede estar registrando un trámite histórico).
- Debajo de la barra solo se muestra el contenido de la pestaña activa.

### Pestaña Preparar

Contiene lo que hoy está en "Requisitos de esta entrega": las tarjetas de documentos (`RequirementsPanel` con `layout="cards"`), los campos numéricos, los checks, y "Revisar archivos de otras categorías". También "Observaciones y seguimiento" y "Descargar paquete ZIP".

### Pestaña Enviar

Contiene el `EmailComposer` y el registro de envío (hoy dentro del `<details>` "Ya envié el correo · registrar entrega"; aquí deja de estar plegado). Al confirmar el envío, `recordSubmission` deja el trámite en `submitted`, como hoy, y la pestaña activa pasa a Resultado. Las entregas registradas se listan en esta pestaña.

### Pestaña Resultado

- Una tarjeta por cada **salida** del trámite (ver catálogo abajo), con el mismo componente de tarjeta que Preparar. Cada tarjeta indica en qué trámites posteriores se usa: "Se usa en: Calificadores · Día y hora".
- Siempre, al final, una tarjeta **Capturas del correo de respuesta**, opcional y multi‑archivo (acepta imágenes y PDF).
- Acciones:
  - **Completar trámite** (primario): habilitado cuando las salidas requeridas están subidas. Reemplaza el checkbox "Recibí y confirmé el resultado institucional" y el botón "Marcar completado". Si hay faltantes de entrada, se muestra cuáles y el botón sigue deshabilitado (la regla actual de `evaluation.ready` se mantiene).
  - **Hay una observación**: abre un campo corto (la nota del trámite) y guarda el estado `observed`.
  - **Reabrir trámite** reemplaza a Completar cuando ya está completado.
- Se elimina el botón "Esperando respuesta" (el estado lo pone el registro del envío).
- "Historial de estados" y "Fuentes y criterios" pasan a un pie discreto debajo de las pestañas, plegados, comunes a los tres pasos.

### Barra fija "Siguiente paso"

Se mantiene, pero su acción cambia de pestaña además de enfocar el requisito: si lo siguiente es subir la resolución, activa Resultado y enfoca esa tarjeta.

### Modal del mapa

Sin pestañas. Muestra las tarjetas del paso activo del trámite (Preparar o Resultado, según corresponda) y el botón "Abrir trámite completo". Así, cuando el trámite espera respuesta, desde el mapa se puede subir la resolución directamente.

### Modelo de datos

- `WorkflowDefinition` gana `outputs: Requirement[]` (mismo tipo que `requirements`, con `category`, `signed` y un nuevo `optional?: boolean`).
- Las salidas se guardan como documentos de su categoría (igual que hoy) y como evidencia del trámite en un campo separado `TaskRecord.outputVersionIds: string[]`, para que **no** entren en el ZIP de envío de ese trámite.
- Capturas: categoría `respuesta` (multi‑archivo, no firmada, nombre "Respuestas recibidas"), una por trámite vía `outputVersionIds`.
- **Encadenamiento**: cuando un trámite pide como entrada una categoría que es salida de un trámite anterior, y el trámite no tiene aún ninguna versión seleccionada de esa categoría, se autoselecciona la versión más reciente (generalizar el comportamiento actual de `evidenceIdsForTask` para `personal`). El estudiante puede desmarcarla.
- Completar requiere: `evaluation.ready` y todas las salidas no opcionales con al menos una versión en `outputVersionIds`. Las salidas con `signed: true` siguen la regla de firma actual.
- Migración del workspace (versión de esquema nueva en `repository`):
  - Trámite `aprobacion` → se fusiona en `propuesta`: si `aprobacion` estaba `completed`, `propuesta` queda `completed`; sus `evidenceVersionIds` pasan a `outputVersionIds` de `propuesta`; su historial se anexa. Luego se elimina el registro `aprobacion`.
  - Requisitos que pasan de entrada a salida (ver tabla): sus versiones seleccionadas se mueven de `evidenceVersionIds` a `outputVersionIds`.
  - `dependsOn: ['aprobacion']` pasa a `['propuesta']` (`desarrollo`, `complexivo`).
  - La misma fusión se aplica a `notas` → `calificadores-research` o `calificadores-article` (según la modalidad del perfil), `biblioteca-aval-inicial` → `biblioteca-revision` y `biblioteca-aval-final` → `biblioteca-decanato`, con las mismas reglas de estado y de reasignación. Las dependencias se reapuntan: aptitud legal depende de `calificadores-*`, firma del estudiante de `biblioteca-revision` y día y hora de `biblioteca-decanato`.

### Catálogo: salidas por trámite

| Trámite | Salida requerida (categoría) | Se usa en |
|---|---|---|
| Propuesta (fusionado con aprobación) | Resolución de Consejo Directivo de modalidad y tema (`resolucion`) | Calificadores, Día y hora |
| Desarrollo e informes mensuales | — | — |
| Informe final de avance | — | — |
| Solicitar calificadores (Proyecto/Artículo), fusionado con "Recibir las dos calificaciones" | Notificación de calificadores designados (`resolucion-designacion`); notas de ambos calificadores (`notas`) con `grade-1` y `grade-2` | Día y hora; Aptitud legal |
| Examen complexivo | Resoluciones del examen (`resolucion-examen`), pasa de entrada a salida | Aptitud legal |
| Obtener no adeudar | Formulario de no adeudar emitido por Tesorería (`no-adeudar`), pasa de entrada a salida | Aptitud legal, Día y hora |
| Aptitud legal | Certificado de aptitud legal (`aptitud-legal`), pasa de entrada a salida | Día y hora |
| Biblioteca: revisión sin firmas, fusionado con "recibir aval inicial" | Aval inicial (`aval-inicial`) | — |
| Biblioteca: firma del estudiante / firmas de docentes | — (las versiones firmadas siguen siendo entradas en `tesis`) | — |
| Biblioteca: firma de Decanato, fusionado con "recibir aval final" | Aval final de Biblioteca (`biblioteca`) | Día y hora |
| Solicitar día y hora | Notificación de fecha y hora de sustentación (`notificacion-defensa`, nueva) | — |
| Sustentación o incorporación | Acta o resultado (`resultado`), pasa de entrada a salida | — |
| Retirar título | `convocatoria` y `retiro` (checks) | — |
| Trámites excepcionales | Resolución del trámite (`resolucion-tramite`) | — |

`Día y hora` hoy no pide el certificado de no adeudar de forma independiente del de aptitud; se mantienen sus requisitos actuales. La categoría `aval-biblioteca` de `document-categories.ts` no corresponde a ningún requisito (el requisito usa `biblioteca`); corregir el nombre igual que se hizo con `record`.

### Textos

Regla: los títulos y etiquetas describen **qué documento o acto es**, con su emisor y su destinatario cuando importa; nunca **cómo usar la interfaz**.

- Títulos de trámite: sustantivos concretos del trámite real. Ej.: "Seleccionar modalidad y presentar propuesta" → "Propuesta y aprobación de modalidad"; "Solicitar día y hora / incorporación" → "Solicitud de fecha de sustentación o incorporación". La lista final la propone el builder con esa regla y la revisa el usuario.
- Etiquetas de requisitos: nombre del documento + emisor/firmante. Ej.: "Anexo 1 firmado" → "Anexo 1 · Solicitud de modalidad, firmada por estudiante y tutor".
- `instructions`: se reescriben como hechos del trámite (plazo, destinatario, formato exigido, quién emite), sin instrucciones de uso de la app. Ej. a eliminar: "Registrar la resolución real, no marcar completado al presentar la propuesta".
- Se eliminan: el tooltip "Los archivos que subas también se guardan en Documentos…", "Se registran en el trámite completo.", "Notas, correo y registro de envío están en el trámite completo.", "Cada archivo, en su lugar. Arrastra y listo." y el texto "o arrástralo aquí" en las zonas de subida (el ícono y el borde punteado ya lo dicen).
- Se mantiene: el aviso de envío histórico incompleto, porque describe una posibilidad que la interfaz no muestra por sí sola, reescrito en una línea.

## Decidido por el usuario

- Organización del trámite en pestañas que funcionan como barra de avance (Preparar → Enviar → Resultado).
- Lo que se recibe alimenta los trámites siguientes, según la guía de titulación.
- Las capturas del correo son opcionales; la resolución es la prueba del cierre.
- Propuesta y aprobación de Consejo se unen en un solo trámite, y lo mismo para calificaciones, aval inicial y aval final de Biblioteca.
- Textos detallados, sin indicaciones obvias.

## Decisiones del implementador (marcadas como tales)

- Pestañas navegables libremente, sin bloqueo por orden.
- Salidas en `outputVersionIds`, fuera del ZIP de envío.
- Autoselección de salidas previas como entradas, desmarcables.
- "Esperando respuesta" deja de ser botón.
- Modal del mapa sin pestañas, muestra el paso activo.

## Decisiones tras la revisión (del implementador)

- **Categorías propias por salida.** La notificación de calificadores pasa a `resolucion-designacion` y la resolución de trámites excepcionales a `resolucion-tramite`. `resolucion` queda solo para la resolución de Consejo de modalidad y tema. "Día y hora" gana el requisito "Notificación de calificadores designados" (`resolucion-designacion`), porque la guía pide "Copia de las resoluciones". "Se usa en" se calcula por categoría, que ahora es inequívoca.
- **Calificaciones y asistencia en Resultado.** `grade-1`, `grade-2` y `attendance` son datos recibidos: se muestran en Resultado y cuentan para la regla de completar, no para Preparar. `similarity` sigue en Preparar.
- **Autoselección acotada.** Solo se aplica a trámites `pending` o `preparing` y se guarda en `evidenceVersionIds` al seleccionarse, así que desmarcar es definitivo. Los trámites enviados o completados nunca cambian sus archivos. `personal` sigue igual.
- **Migración.** Si `propuesta` estaba `completed` y `aprobacion` no, la propuesta pasa a `waiting`. Las `Submission`, la nota, los `requirementChecks` y el historial de `aprobacion` se reasignan a `propuesta` antes de borrar el registro. La migración también corre al restaurar un respaldo antiguo.
- **Pasos sin contenido se ocultan.** Un trámite sin entradas ni correo (p. ej. "Sustentación o incorporación", "Retirar título") muestra solo Resultado; la barra de pasos se omite si queda un solo paso.
- **Registro de envío.** Se mantiene el estado `submitted` que pone `recordSubmission`. La pestaña Enviar cuenta como completa con una `Submission` registrada.

## Ajustes tras revisar la interfaz (decididos por el usuario, 2026-10-23)

- **Sin barra fija "Siguiente paso".** Se elimina; la barra de pasos ya indica dónde está el trámite. Reemplaza lo dicho en "Barra fija «Siguiente paso»".
- **Pasos como segmentos completos.** Cada paso ocupa todo su segmento y su estado (completo, activo, pendiente) se lee por color, ícono y texto, no por una línea fina.
- **Historial y fuentes en un menú "⋯"** junto al título, que abre cada sección en un diálogo. Se quitan del pie de la página.
- **Enviar solo muestra asunto y cuerpo** del correo. El registro del envío es un único botón "Confirmar envío", con la fecha y hora actuales; se elimina el campo "Para", la fecha manual y el registro de envíos históricos incompletos (el botón requiere Preparar completo).
- **Propuesta según el Anexo 1.** Los requisitos son documentos, en el orden del anexo: Anexo 1 firmado (sin firmas de aval en complexivo), copia de cédula, capturas de los correos de aval del Coordinador de Carrera y del docente de la Unidad de Titulación (Proyecto/Artículo), carta de compromiso Anexo 3 (con empresa), oficio de la Unidad Operativa de Investigación (opcional: solo si se vincula a un proyecto de investigación), propuesta del perfil Anexo 2 (Proyecto/Artículo) y certificado de requisitos habilitantes (opcional: solo si se presenta después de la verificación del récord). Se elimina el checkbox de avales. Las instrucciones describen el procedimiento del anexo.
- **Informes mensuales (Anexo 5) por mes.** El requisito admite varios archivos a la vez. Cada archivo se analiza contra el formato del Anexo 5 (título del anexo, fecha, tema, porcentaje y fechas de actividades) para identificar su mes. Se exige un informe por cada mes del rango configurado (por defecto, del mes siguiente a la aprobación de la propuesta al mes del límite de calificadores; editable, p. ej. agosto–noviembre), y que el tema coincida con el aprobado. Un archivo sin mes reconocible se asigna a mano.
- **Resumen en una frase.** Bajo el título solo se muestra un resumen de una frase con lo que hace el estudiante. Las instrucciones completas (plazos, formato, firmas, quién aprueba) se abren en el diálogo "Cómo se tramita", como viñetas, desde un enlace junto al resumen y desde el menú "⋯".
- **Etiqueta corta y detalle.** Cada requisito tiene una etiqueta corta (nombre del documento, una línea) y un detalle opcional con emisor, firmante y condiciones, que se muestra en un tooltip junto a la etiqueta. Los faltantes usan la etiqueta corta.
- **Informes mensuales como tarjetas por mes.** Cada mes del rango es una tarjeta con su Anexo 5 (subir, reemplazar, firma del tutor y estado). Una tarjeta "Agregar mes" extiende el rango con el mes elegido; un mes vacío de los extremos se puede quitar. Al subir en una tarjeta, el archivo queda asignado a ese mes; si el documento indica otro mes, se avisa. Reemplaza la lista "Informes por mes".
- **Trámite de completado automático.** "Informes mensuales de avance" no tiene pasos, correo ni envío (el tutor los envía por Quipux): muestra solo las tarjetas por mes y queda `completed` en cuanto todos los meses del rango tienen su Anexo 5 firmado con el tema aprobado; vuelve a `preparing` si deja de cumplirse.
- **Informe final con editor del Anexo 11.** Preparar muestra el editor del Anexo 11 dentro del trámite. Se crea con las actividades (fecha y descripción) leídas de los Anexo 5 subidos en los informes mensuales, ordenadas por fecha, con 100 % de avance; las filas se pueden corregir y volver a importar. Descargar el PDF o Word solo entrega el archivo: el Anexo 11 sin firmar no se guarda en Documentos ni se vincula al trámite. Las tarjetas de Resultado nunca ofrecen versiones generadas desde un borrador, porque una salida siempre es un documento recibido. Enviar es el correo al tutor; Resultado pide el Anexo 11 firmado (`final`), que se encadena a la designación de calificadores y a aptitud legal. Desaparece el checkbox de coincidencia: la importación garantiza que las actividades vienen de los mensuales. Migración: las versiones `final` ya vinculadas a ese trámite pasan a salidas.
- **"Cómo se tramita" como línea de tiempo.** Las instrucciones del catálogo pasan a una guía estructurada: pasos en orden, cada uno con ícono y responsable, y notas "Ten en cuenta". El botón va a la derecha del resumen.
- **Encabezado compacto del trámite.** El título vive solo en el header de breadcrumbs (como en "Mi proceso"), junto con el responsable y el menú "⋯". La página empieza con el resumen y los pasos, más bajos. En el editor del Anexo 11, volver a importar, Word y PDF son botones de ícono con nombre accesible en una barra fina sobre el documento, y el aviso de avance es una etiqueta pequeña; no van al header porque solo aplican a Preparar.
- **Anexo 11 en el modal del mapa.** El modal muestra el Anexo 11 generado en solo lectura; se edita en el trámite completo. Si aún no existe, lo indica.
- **Notas de los formatos de informe como tooltip.** En los Anexos 5 y 11, el bloque "NOTA" del formato no se muestra en el documento ni se exporta; se consulta en un tooltip "Notas del formato" del editor.
- **Flechas en el mapa.** Cada conexión del mapa termina en una punta de flecha hacia el trámite siguiente, con el color de su estado.
- **Revisión de anexos.** Los requisitos de cada trámite se contrastan con los anexos de `UNIDAD DE TITULACIÓN (Malla actual)`; las diferencias encontradas se corrigen en el catálogo dentro de este cambio.

### Correcciones tras contrastar el catálogo con los anexos

- Cada solicitud es un documento propio con su categoría: Anexo 10 (`solicitud-calificadores`), Anexo 15 (`solicitud-aptitud`), Anexo 14 (`solicitud-sustentacion`), Anexo 4, 8 y 9 y la solicitud de recalificación. `solicitud` queda para el Anexo 1.
- Calificadores: orden de adjuntos de la fuente, solicitud dirigida al Presidente del Consejo Directivo, informe de similitud sin firma, notas consignadas en el Anexo 12. En Artículo la nota mínima es 7 por la carta de aceptación (se corrige la mención a recalificación).
- Aptitud legal: se agrega la solicitud Anexo 15 dirigida al Decano; las notas se piden como documento, sin los campos numéricos.
- Día y hora: solicitud Anexo 14 al Presidente del Consejo Directivo; trabajo firmado (Proyecto) u hojas preliminares y artículo (Artículo), carta de cumplimiento empresarial al 100 %. Se elimina el checkbox de mismas versiones: la regla de versiones exactas ya lo exige.
- Biblioteca: el Artículo solo envía las hojas preliminares a revisión; canal, asunto, orden de firmas y firma del Decano tomados de la fuente.
- No adeudar: lo tramita la Secretaría de Facultad y las dependencias; la vigencia de 30 días es firme.
- Trámites excepcionales con requisitos propios según los Anexos 4, 8, 9, 21 y la solicitud de recalificación; los Anexos 6 y 7 los presenta el tutor y no se modelan como trámites del estudiante.
- Desarrollo e informe final: el tutor envía por Quipux a la secretaría de la Unidad de Titulación, con copia al docente responsable.

## Verificación

- Unit: estados de los pasos; regla de completar; encadenamiento de salidas a entradas; migración de `aprobacion` y de requisitos movidos a salida.
- Integración: abrir propuesta, subir resolución en Resultado, completar; ver la resolución ya seleccionada en Calificadores.
- UI con `playwright-cli`: capturas de los tres pasos en escritorio y móvil, comprobando que la página no crece respecto a la actual.
