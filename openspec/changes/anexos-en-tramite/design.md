# Anexos dentro del trámite

Fecha: 2026-10-23 · Estado: listo para aprobación · Depende de: `tramite-en-pasos`

## Por qué

Hoy "Anexos" y "Mi proceso" son dos secciones. El anexo se redacta en una, se exporta como versión con firma `pending` y luego hay que encontrarlo en la otra para adjuntarlo. Nada indica qué anexo pide cada trámite, quién debe firmarlo ni si la versión adjunta ya está firmada.

La pregunta de partida fue: ¿cada trámite requiere su anexo, y en cada uno hay que redactarlo, enviarlo a firmar y subirlo firmado? Las fuentes dicen que **sí en la mayoría, pero no en todos, y el "enviar a firmar" depende del formato**:

- Solo firma el estudiante: Anexos 8, 9, 10, 14, 15, 21 y la recalificación del Proyecto (UT-13, UT-14, UT-15, UT-16, UT-19, UT-21, UT-22, UT-23, UT-24, UT-06). No hay que enviarlo a nadie para firmar.
- Firman estudiante y tutor sugerido: Anexo 1 (UT-05), después de recibir los avales por correo del Coordinador de Carrera y del docente de la Unidad de Titulación. En Complexivo el Anexo 1 no requiere firmas de aval (UT-05 §6.1.1). El Anexo 4 lleva firma del tutor sugerido cuando el cambio es a trabajo de titulación (UT-09).
- Firma un tercero: Anexo 3 y cumplimiento empresarial del 100% los firma el representante de la empresa (UT-08, UT-18).
- Firma y envía el tutor: Anexos 5 y 11. El tutor los firma y los envía por Quipux a la Secretaría de la Unidad de Titulación, con copia al docente responsable, y por correo al estudiante (UT-10, UT-03). El estudiante recibe la copia firmada y luego la adjunta en calificadores y aptitud legal (UT-15, UT-16, UT-21).
- Sin formato editable: no adeudar (sistema UTA, UT-20), Biblioteca (preliminares UT-25/26 son referencia), sustentación (Anexo 16 lo usa el tribunal), retiro de título.

Regla común en todos los instructivos: firmas electrónicas o autógrafas, **no mixtas, sin imágenes de firma pegadas** (UT-05, UT-16, UT-19, UT-21). La guía rápida 2026 acepta firmas mixtas; prevalece la fuente específica (conflicto C-01 ya registrado).

## Objetivos

1. Cada trámite muestra en Preparar los anexos que pide, con su ciclo **Redactar → Firmar → Adjuntar firmado** y el estado de cada etapa.
2. La etapa Firmar refleja quién firma y quién entrega, según la fuente del formato.
3. El editor se abre en el contexto del trámite y vuelve a él.
4. La sección "Anexos" queda como índice de tarjetas (ver `anexos-indice`) que abre cada anexo en su trámite; ningún borrador queda huérfano.
5. Cada anexo tiene categoría propia, para que el encadenamiento por categoría nunca confunda un formato con otro.
6. El catálogo pide los anexos que exigen las fuentes y hoy faltan.

## No objetivos

- Firmar documentos desde la aplicación o validar firmas electrónicas. La firma sigue siendo un hecho declarado por el estudiante (`reported-signed`).
- Enviar correos o Quipux. "Pedir firma" prepara el correo; el estudiante lo envía.
- Cambiar el diseño visual del documento en el editor, la exportación Word/PDF o el editor mensual.
- Editar la tesis o los preliminares.

## Anti-objetivos

- Que el trámite se alargue: el ciclo del anexo vive dentro de su tarjeta de requisito, no en una sección nueva.
- Pedir "enviar a firmar" un documento que solo firma el estudiante.
- Dar a entender que el estudiante envía el Anexo 5 o el 11: los envía el tutor.
- Marcar como firmado un PDF exportado por la aplicación.

## Diseño

### Plantilla ↔ requisito

`Requirement` gana `templateId?: string`. Cada plantilla editable corresponde a un único requisito por modalidad, así que el trámite de un borrador se deriva de su `templateId` y la modalidad del perfil, sin guardar `taskId` en el borrador.

| Plantilla | Trámite | Requisito (categoría) | Firmantes | Entrega |
|---|---|---|---|---|
| `anexo-1` | `propuesta` | `anexo-1` | Estudiante y tutor sugerido; Complexivo: estudiante | Estudiante, correo informacion.fisei |
| `anexo-3` | `propuesta` (si aplica empresa) | `compromiso` | Representante de la empresa | Estudiante, adjunto de la propuesta |
| `anexo-4` | `cambio-modalidad` | `anexo-4` | Estudiante; tutor sugerido si cambia a trabajo de titulación | Estudiante |
| `anexo-5` | `desarrollo` (uno por mes) | `mensual` | Tutor | Tutor por Quipux; copia al estudiante por correo |
| `anexo-8` | `notificacion-tutor` | `anexo-8` | Estudiante | Estudiante |
| `anexo-9` | `cambio-tutor` | `anexo-9` | Estudiante | Estudiante |
| `anexo-10-research` / `anexo-10-article` | `calificadores-*` | `anexo-10` | Estudiante | Estudiante |
| `anexo-11` | `informe-final` | `final` | Tutor | Tutor por Quipux; copia al estudiante por correo |
| `cumplimiento-empresarial` | `calificadores-research` (si aplica empresa) | `empresa` | Representante de la empresa | Estudiante, adjunto |
| `recalificacion-research` | `recalificacion-research` | `recalificacion` | Estudiante | Estudiante |
| `anexo-14-*` | `dia-hora` | `anexo-14` | Estudiante | Estudiante |
| `anexo-15` | `aptitud-legal-*` | `anexo-15` | Estudiante | Estudiante |
| `anexo-21` | `recalificacion-complexivo` | `anexo-21` | Estudiante | Estudiante |

UT-15 (Artículo) no pide cumplimiento empresarial; no se añade a `calificadores-article` ni se extrapola desde UT-16.

`TemplateDefinition` gana:

- `signers: { role: 'student' | 'tutor' | 'company'; when?: 'not-complexivo' | 'to-thesis' }[]`
- `delivery: 'student' | 'tutor-quipux'`

### Ciclo del anexo en la tarjeta de requisito

La tarjeta del requisito con `templateId` sustituye su zona de subida por tres etapas compactas en una fila (en móvil, apiladas):

```
 Anexo 10 · Solicitud de calificadores al Consejo Directivo
 ✓ Redactado r3      ● Firmar               ○ Adjuntar firmado
   Editar              Descargar PDF · Word
```

Estados (derivados, sin campo nuevo de estado):

- **Redactar**: pendiente sin borrador; "borrador" con borrador inválido; completo cuando `validateAnnex` es válido. Acción: "Redactar" (crea el borrador con `createDraft` y abre el editor) o "Editar".
- **Firmar**: completo cuando existe una versión exportada de la revisión actual (`sourceDraftId` + `revision`). Acción según firmantes y entrega:
  - Solo estudiante: "Descargar para firmar" (PDF/Word).
  - Con otro firmante: "Descargar" y "Pedir firma a <tutor | representante>", que prepara un correo (destinatario, asunto, cuerpo) con el nombre del archivo a adjuntar, reutilizando el patrón de `EmailComposer`. Registrar "Pedí la firma el <fecha>" es opcional.
  - Entrega del tutor (`tutor-quipux`): "Descargar para el tutor" y "Preparar correo al tutor". El texto de la etapa dice que el tutor firma y lo envía por Quipux.
- **Adjuntar firmado**: completo cuando el trámite tiene seleccionada una versión `reported-signed` del mismo documento. Acción: subir el archivo firmado. Para `tutor-quipux` la acción es "Adjuntar la copia firmada que envió el tutor".

Al subir la versión firmada:

- Se guarda como nueva versión del mismo `documentId` que la exportación, con `sourceDraftId` y `revision` de la revisión firmada, y queda seleccionada en el trámite.
- Se pide el tipo de firma: electrónica o autógrafa (`DocumentVersion.signatureKind`). Con más de un firmante se pide confirmar "Todas las firmas son del mismo tipo y ninguna es una imagen pegada". Sin esa confirmación la versión queda `pending`.
- La versión exportada sin firmar deja de estar seleccionada en el trámite. Sigue en Documentos.

Si el borrador cambia después de tener versión firmada, la etapa Firmar vuelve a pendiente y la tarjeta indica "La versión firmada corresponde a la revisión N; la revisión actual necesita nueva firma". La versión firmada anterior no se borra ni se desmarca hasta que el estudiante adjunte la nueva (regla ya vigente en `annex-authoring`).

Requisitos con firmante externo y sin necesidad de redactar desde la app (por ejemplo, si el estudiante ya tiene el Anexo 3 firmado por la empresa) admiten "Ya lo tengo firmado" que salta directo a Adjuntar firmado.

### Anexo 5 en Desarrollo

El trámite `desarrollo` lista un Anexo 5 por mes en lugar de una sola tarjeta: cada fila muestra mes, avance y sus tres etapas. Acción "Nuevo informe mensual" con el mes siguiente al último (usa `copyToNextMonth`). El requisito se cumple con al menos un mensual firmado y ningún mensual seleccionado sin firma; el tutor es quien entrega.

### Anexo 11 en Informe final

"Redactar" en el Anexo 11 abre la selección de informes mensuales (hoy en `AnnexLibrary`) dentro del trámite y crea el borrador con `buildFinalReport`.

### Editor contextual

- Ruta nueva: `#/proceso/<definitionId>/anexo/<draftId>`. La miga de pan pasa a "Mi proceso › <trámite> › <anexo>". Al cerrar o volver, regresa al trámite en Preparar con la tarjeta del anexo enfocada.
- La exportación del editor usa la categoría del requisito (`templateEvidenceCategory` se deriva del catálogo, no de un mapa fijo con `solicitud` por defecto).

### Formatos de referencia

Las plantillas `reference`, `external` y `missing` se muestran en el pie del trámite que las usa, junto a "Fuentes y criterios", con enlace a la fuente:

| Referencia | Trámite |
|---|---|
| Anexo 2 · Estructura de propuesta (UT-07); Anexo 13B no aportado (Artículo) | `propuesta` |
| Anexo A, Guía del informe final, Anexo 13A (UT-01, UT-02, UT-04); Anexos 6 y 7 (tutor) | `desarrollo` |
| Anexo 12 · Consignación de notas (calificador) | `calificadores-*` |
| No adeudar (UT-20) | `no-adeudar` |
| Preliminares de Proyecto o Artículo (UT-25, UT-26) | `biblioteca-revision` |
| Anexo 16 · Ficha de sustentación (UT-27) | `defensa` |

### Navegación

- Se quita "Anexos" del menú principal.
- `#/anexos` redirige a `#/proceso`. `#/anexos/<draftId>` redirige a `#/proceso/<trámite>/anexo/<draftId>`.
- La búsqueda global sigue encontrando borradores y los abre en su trámite.
- Un borrador cuya plantilla no aplica a la modalidad actual (cambio de modalidad) aparece en Documentos › "Borradores de otra modalidad", sin perderse.

### Catálogo: requisitos que faltan según las fuentes

| Trámite | Cambio | Fuente |
|---|---|---|
| `propuesta` | `solicitud` → `anexo-1` con `templateId`. Añadir "Anexo 2 · Propuesta del perfil" (`propuesta-perfil`, sin firma) y convertir el check `avales` en "Capturas de los correos de aval del Coordinador de Carrera y del docente de la Unidad de Titulación" (`avales`, sin firma, multi-archivo), ambos no aplicables a Complexivo. | UT-05 |
| `calificadores-research` / `calificadores-article` | Añadir Anexo 10 de su variante (`anexo-10`) como primer requisito. | UT-16, UT-15 |
| `aptitud-legal-*` | Añadir Anexo 15 (`anexo-15`) como primer requisito. | UT-21 |
| `dia-hora` | `solicitud` → `anexo-14` con la plantilla de la modalidad. | UT-22, UT-23, UT-24 |
| Trámites excepcionales | `solicitud` → su formato (`anexo-4`, `anexo-8`, `anexo-9`, `recalificacion`, `anexo-21`). | UT-09, UT-13, UT-14, UT-19, UT-06 |

Los textos de estos requisitos siguen la regla de `tramite-en-pasos`: documento, emisor y destinatario.

### Migración

Versión de esquema nueva en `repository`, aplicada también al restaurar respaldos:

1. Versiones `solicitud` con `sourceDraftId`: categoría según la plantilla del borrador.
2. Versiones `solicitud` sin borrador: categoría según el trámite que las tiene seleccionadas (`propuesta` → `anexo-1`, `dia-hora` → `anexo-14`, excepcionales → su formato). Si las selecciona más de un trámite, se duplica el `DocumentRecord` por categoría manteniendo la misma versión y blob.
3. Las que no se puedan resolver quedan en `solicitud`, que se muestra en Documentos como "Solicitudes sin clasificar" para que el estudiante las mueva.
4. Requisitos renombrados en tareas (`solicitud` → `anexo-1`, etc.): se reasignan `requirementChecks` del check `avales` como nota en el historial, porque pasa de check a archivo.
5. `signatureKind` queda vacío en versiones antiguas; no se infiere.

## Decisiones del implementador (para revisión)

- Se elimina "Anexos" del menú en vez de dejarla como índice: todo borrador tiene trámite derivable por plantilla.
- "Pedir firma" prepara el correo y no registra envío obligatorio; la etapa Firmar se cumple con la exportación de la revisión vigente, porque la app no puede saber cuándo firmó el tercero.
- El estado del ciclo es derivado de borrador, versiones y selección del trámite; no se añade un campo de estado nuevo.
- Se exige declarar el tipo de firma solo al adjuntar la versión firmada.
- El check "Avales de la propuesta" pasa a archivo de capturas, como pide UT-05.

## Verificación

- Unit: estados de las tres etapas por combinación de firmantes y entrega; derivación trámite ↔ plantilla por modalidad; firmantes de Anexo 1 en Complexivo; regla de firma no mixta; migración de categorías.
- Integración: redactar Anexo 10 desde calificadores, exportar, adjuntar firmado y ver el requisito cumplido; editar después y ver que la etapa Firmar vuelve a pendiente; Anexo 5 mensual con entrega del tutor.
- E2E y `playwright-cli` en escritorio y móvil: menú sin Anexos, redirección de `#/anexos/<id>`, ciclo completo en propuesta y en calificadores.
