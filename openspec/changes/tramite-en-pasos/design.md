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

## Verificación

- Unit: estados de los pasos; regla de completar; encadenamiento de salidas a entradas; migración de `aprobacion` y de requisitos movidos a salida.
- Integración: abrir propuesta, subir resolución en Resultado, completar; ver la resolución ya seleccionada en Calificadores.
- UI con `playwright-cli`: capturas de los tres pasos en escritorio y móvil, comprobando que la página no crece respecto a la actual.
