## Context

Repositorio vacío. Se acuerda una app solo frontend para que varios estudiantes organicen sus propios procesos. No es un sistema administrativo compartido: cada estudiante usa su navegador y puede transferir su expediente con respaldo. Los últimos pedidos añaden editor de anexos en vivo, Word editable y PDF textual, con Anexo 5 como caso principal. Fuentes y discrepancias: [mapa](references/source-map.md), [calendario](references/calendar-2026.md), [manifest](references/manifest.json).

## Goals / Non-Goals

**Goals:** siguiente acción comprensible, organización desde propuesta a graduación, evidencia reutilizable, generación fiel de anexos, rutas por modalidad, prevención de omisiones y datos recuperables. Interfaz en español inspirada en Arc/jam.dev, sin copiar sus marcas.

**Non-Goals:** cuentas, sincronización automática, colaboración simultánea, backend, envío de correos o Quipux, firma electrónica o validación criptográfica, emisión de certificados universitarios, OCR de escaneos, editor completo de tesis/Word arbitrario, conversión general DOCX→PDF, cálculo jurídico automático de días término. No hay despliegue en este change.

## Decisions

### 1. Frontend estático y límites de los datos locales

Decisión técnica propuesta: React + TypeScript + Vite, IndexedDB mediante Dexie, esquemas Zod, ZIP con fflate, DOCX con docx, PDF con @react-pdf/renderer y visor PDF.js, Vitest/Testing Library y Playwright. Versiones compatibles se fijarán en lockfile al implementar, tras verificar APIs y licencias. Una SPA con rutas hash funciona en hosting estático sin rewrites. No usar Next/server, autenticación ni APIs pagadas para este alcance.

Un expediente activo por origen/navegador en v1. Un navegador diferente empieza vacío; quienes comparten navegador comparten acceso a sus datos. No aparentar una cuenta ni aislamiento mediante un simple nombre. Cambiar estudiante requiere respaldo y reemplazo explícito del expediente. No recopilar analítica ni enviar documentos a terceros. Assets y fuentes se sirven localmente con la app. Service worker cachea solo shell/assets para uso posterior sin conexión; los originales de referencias no se precachean ni publican indiscriminadamente.

### 2. Modelo persistente y contratos

`src/domain/types.ts` define:

- `StudentProfile`: id, nombres, cédula, contactos, carrera, facultad, modalidad (`research|article|complexivo`), período, título a obtener, tema aprobado, fecha/resolución de aprobación, tutor, aplicaEmpresa. Datos sensibles opcionales hasta que un anexo los necesite.
- `CatalogVersion`: version, sourceIds, templates, workflowDefinitions, calendarEvents, conflicts. Catálogo inmutable distribuido con app; configuración personal separada.
- `TaskRecord`: id, definitionId, status (`pending|preparing|waiting|submitted|observed|completed`), requirementChecks, evidenceVersionIds, submittedAt, note. Bloqueos calculados, no guardados como estado manual.
- `DocumentRecord` y `DocumentVersion`: id, documentId, blobId, originalName, mime, size, sha256, createdAt, issuedOn, sourceDraftId/revision, signatureStatus (`unsigned|pending|reported-signed`), textualPdfStatus (`unknown|text-detected|no-text-detected`). El reporte de firma del usuario no certifica validez.
- `AnnexDraft`: id, templateId, templateVersion, revision, profileSnapshot, fields, activities, monthlyPeriod, sourceMonthlyRevisions, updatedAt, savedRevision. Cada actividad tiene id estable, fecha y descripción.
- `Submission`: id, taskId, exactVersionIds, recipient, sentAt, acknowledgementBlobId; fotografía inmutable del envío manual.
- `CalendarEvent`: id, kind (`deadline|window|administrative|appointment|personal`), startDate/endDate, localTime opcional, timeZone, modalities, periodId, sourceIds, certainty, personalOverride.
- `BackupManifest`: formatVersion, catalogVersion, exportedAt, records, blob entries con hash/tamaño y referencias.

IndexedDB contiene profile, tasks, documents, versions, blobs, drafts, submissions, personalEvents, settings. Mutaciones relacionadas son transacciones. `WorkspaceRepository` expone `loadWorkspace()`, `saveDraft(draft, expectedRevision)`, `addDocumentVersion(input)`, `recordSubmission(input)`, `restoreWorkspace(validatedBackup)`; operaciones async con errores tipados. `evaluateTask(task, workspace, catalog, now)` devuelve missingRequirements y nextActions sin efectos. `renderAnnex(draft, format: 'pdf'|'docx'): Promise<Blob>` recibe una revisión congelada y `validateAnnex(draft)` devuelve errores por campo.

La app muestra guardando/guardado/error. Guardado tras 500 ms sin cambios; exportar espera la revisión actual. Navegación interna espera guardado, salida con cambios pendientes advierte. Revision checking detecta dos pestañas editando el mismo borrador: no sobrescribe silenciosamente. Un fallo de cuota preserva el texto en memoria y ofrece descargar borrador de emergencia.

### 3. Catálogo y flujo por modalidad

Catálogo explícito, no inferido de nombres de archivo en runtime. [source-map](references/source-map.md) enumera cada documento y qué admite edición. Fases: propuesta/avales → aprobación → desarrollo e informes → calificadores → notas → aptitud legal y biblioteca (paralelas cuando sus requisitos lo permiten) → solicitud de día/hora → defensa/incorporación → título. El alumno puede empezar en cualquier etapa registrando evidencia anterior; no marcar etapas completas por elegirlas.

Certificado de aptitud legal depende de no adeudar, documentación académica y requisitos de modalidad. Biblioteca tiene estados revisión sin firmas, aval inicial, firmas sucesivas y aval final. `submitted` requiere registro manual de envío; adjuntar/generar un archivo nunca completa automáticamente un trámite. `completed` requiere confirmación del resultado/evidencia, puede reabrirse conservando historial. Documentos faltantes impiden señalar paquete listo; se permite registrar un envío histórico incompleto con observación, porque la app no reescribe lo que ocurrió.

Cambiar modalidad/período conserva archivos y envíos, recalcula aplicabilidad y solicita revisión de borradores afectados. Trámites excepcionales (cambio tutor/modalidad, recalificaciones) se muestran bajo «Otros trámites», sin inflar el avance ordinario. La métrica de avance usa solo tareas requeridas y aplicables, no archivos subidos ni opcionales.

### 4. Anexos: datos estructurados, vista previa y dos exportaciones

Editor de campos y tablas, no un procesador de Word genérico. Una definición versionada contiene texto fijo, campos, condiciones, firma/responsable y geometría. DOCX y PDF derivan del mismo modelo y snapshot, sin convertir uno a imagen. El visor muestra el PDF producido por el mismo renderer de descarga; regeneración diferida 700 ms, descarta renders obsoletos y anuncia errores sin sustituir el último preview válido. Exportar siempre genera la revisión actual validada, no descarga un preview anterior.

DOCX usa párrafos, tablas, estilos y pies reales; todo el texto variable es editable en Word/LibreOffice. PDF contiene glifos/texto con mapeo Unicode, fuentes embebidas, acentos y caracteres españoles seleccionables y extraíbles. «PDF con texto (OCR)» explica que se genera con texto; no se garantiza OCR de adjuntos escaneados ni conformidad PDF/A. Editar el DOCX fuera de la app no actualiza el borrador: puede adjuntarse como versión externa, y el PDF debe regenerarse desde los mismos datos del editor o exportarse en Word. No se promete importar cambios arbitrarios de Word.

Anexo 5: tamaño carta 612×792 pt, márgenes 3 cm laterales/2.5 cm verticales, encabezados 12 pt, campos/tabla 10 pt según UT-10; preservar la negrita del original, pie institucional, paginación y notas. La adaptación LaTeX del usuario pone valores en redonda: no trasladar esa diferencia al canónico sin declararla. Medir estilos/anchos de UT-10 al implementar; no inferir el formato de los demás anexos por el 5. Times New Roman en Word; para PDF no redistribuir una fuente propietaria sin permiso: registrar archivo autorizado o evaluar sustitución con licencia compatible y métricas equivalentes. Si no reproduce la plantilla, documentar el impedimento antes de declarar exportación fiel.

Campos del 5: facultad/carrera, fecha de informe, estudiante, modalidad, tema aprobado, fecha de aprobación, avance acumulado 0–100, filas fecha/actividad, observaciones, tutor. El mes organiza el borrador; no se imprime como campo institucional inventado. Admite filas variables, textos largos y páginas adicionales; encabezado de tabla se repite, firma no queda huérfana, contenido no invade pie. Observaciones pueden quedar vacías con el espacio de la plantilla; no inventar observaciones del tutor. Actividades fuera del mes o avance decreciente producen revisión explícita, no corrección automática. La copia al siguiente mes conserva perfil/tema/tutor, limpia actividades/fecha/porcentaje y nunca altera el mes anterior.

Anexo 11 permite seleccionar revisiones de informes mensuales y copiar exactamente sus fechas/actividades, conservando origen por fila. Si cambian los mensuales, mostrar desactualización y comparación antes de reconstruir; preservar el historial y PDFs previos. Exportación de cumplimiento 100% requiere declarar 100 y consistencia con los informes incluidos; no asumir 100 por sumar porcentajes mensuales. El tutor revisa y firma; generar no implica haber recibido su aval.

Plantillas de v1: 1, 3, 4, 5, 8, 9, 10 (dos variantes), 11, cumplimiento empresarial, solicitud recalificación Proyecto, 14 (tres variantes), 15 y 21. 6/7/12/16 son referencia/recepción por responsabilidad docente; 2/13A/Anexo A/preliminares son referencia de tesis. Solicitud 15 y certificado recibido son objetos diferentes.

### 5. Archivos, envíos y respaldos

Guardar blobs originales con SHA-256, versiones inmutables, reutilización por referencia; no reescribir PDF firmado ni fusionar adjuntos. Aceptar PDF/DOCX/DOC/JPG/PNG hasta 25 MiB por archivo, error explícito para otros formatos o cuota insuficiente. DOC antiguo solo adjunto/descarga; no ejecutar macros ni HTML. La inspección de texto PDF indica presencia/ausencia, nunca acredita OCR completo o firmas válidas.

Paquete de trámite ZIP incluye archivos seleccionados en orden institucional, numerados, nombres saneados y sin perder extensiones. Si falta una firma declarada o requisito, mostrar el faltante; se puede descargar como borrador, sin etiqueta de listo. Crear borrador de correo copiable con destinatario/asunto/lista, sin enviar y sin afirmar que mailto adjunta ZIP. El envío registrado fija versiones, aunque luego se editen documentos.

Respaldo ZIP contiene manifest versionado, todos los registros, borradores y blobs, incluyendo versiones y evidencias de envíos. Exportación comprueba espacio/memoria y fallos; importación valida esquema, relaciones, hashes y límites antes de modificar datos. Límites v1: 250 MiB de archivo ZIP, 500 MiB descomprimidos, 5.000 entradas; rechazar rutas absolutas/`..`, archivos cifrados, versiones futuras o referencias rotas. Mostrar resumen y requerir confirmar reemplazo completo, sin merge implícito. Restaurar en una única transacción; fallo conserva expediente anterior. Respaldos contienen información personal, texto breve visible al descargarlos; no cifrado ni contraseña en v1.

### 6. Calendario y recordatorios

Semilla exacta: [calendar-2026](references/calendar-2026.md). Fechas sin hora son fechas locales, no UTC medianoche. Eventos con hora usan America/Guayaquil independientemente de la zona del dispositivo. Para un límite sin hora, mostrar «Hora no indicada», evaluar vencido al día local siguiente; no atribuir 23:59 a la fuente. No extrapolar este calendario a otros períodos ni los plazos PI/AA a EC. Sobrescrituras personales conservan el valor original y su fuente.

Avisos dentro de la app a 7/3/1 días y vencido, recalculados al abrir y al cambiar fecha; no prometer notificaciones con la app cerrada. ICS con UID estable y fechas all-day donde no hay hora, UTC equivalente para horas conocidas, ventanas con fin exclusivo y citas personales independientes. Un recordatorio personal no modifica un plazo oficial.

No adeudar: capturar fecha real de emisión, calcular fecha de referencia emisión +30 días calendario y mostrarla como estimación. Si se conoce vencimiento impreso usarlo. Sin hora de emisión y en el día frontera, marcar «Verificar vigencia»; nunca afirmar vigencia exacta no disponible. Contrastar contra la fecha prevista/real de ingreso de día/hora, no contra la defensa.

### 7. Experiencia de uso

Barra lateral suave con «Inicio», «Mi proceso», «Documentos», «Anexos», «Fechas» y ajustes al pie. Inicio muestra siguiente acción, bloqueos, fechas cercanas y elementos esperando respuesta; sin tablero de métricas vacío. Trámite muestra instrucciones, requisitos y evidencia; detalle lateral en desktop y pantalla completa móvil. Anexos tiene lista por mes/plantilla y una hoja editable con el formato institucional; en móvil conserva una sola columna sin alternar «Editar»/«Vista previa». Los datos del perfil se precargan, también cuando proceden de un respaldo restaurado. Al abrir borradores existentes se completan únicamente los datos vacíos, sin sobrescribir correcciones. Estado de guardado siempre visible.

Tipografía de interfaz legible, contraste WCAG AA, foco visible, labels, navegación por teclado, estados con texto e icono además de color, animación reducida si el sistema la solicita. Layout usable a 360 px, 768 px y 1440 px sin scroll horizontal del shell. Búsqueda local por trámite/documento/anexo sin subir contenido. Nada de credenciales institucionales, firmas pegadas o falsas certificaciones en los flujos.

## Risks / Trade-offs

- Datos locales se pierden al borrar almacenamiento → explicación inicial, fecha del último respaldo, exportar/importar completo; no prometer respaldo automático remoto.
- PDF y Word pueden paginar diferente según fuentes/motor → pruebas de contenido y QA visual separadas, sin prometer igualdad binaria o paginación idéntica entre apps.
- Plantillas antiguas/cargos desactualizados → fuente/versionado y campos de destinatario revisables, conflictos visibles.
- Archivos grandes/generación móvil → límites claros, carga diferida de renderers, procesamiento ZIP fuera del hilo UI donde sea viable, prueba con límites.
- Actualización del catálogo invalida borradores → snapshots/versiones y migración explícita, nunca mutación de entregados.
- Documento textual no garantiza aceptación institucional → checklist de firmas/adjuntos, evidencia de recepción independiente.

## Migration Plan

Implementar por las tareas del change. Preparar assets públicos saneados desde fuentes; no publicar datos del ejemplo personal ni referencias de diseño completas. Generar build estático, verificar rutas, importación/exportación y descargas en Chromium/Firefox/WebKit. Documentar despliegue HTTPS y caché versionada. Publicar solo cuando se solicite. Al actualizar, migraciones IndexedDB versionadas no destructivas, prueba de restauración y compatibilidad de versión del respaldo; rollback de shell no debe borrar datos ni abrir una versión de DB incompatible silenciosamente.

## Open Questions

No bloquean el change: destinatarios institucionales actuales, contacto de biblioteca, fuente Times New Roman redistribuible, agenda para otros períodos, día exacto mensual y formato ausente 13B. La app trata esos datos como pendientes/revisables. La fidelidad del PDF requiere resolver fuente y QA antes de cerrar la tarea de exportación. No se necesita una cuenta/servidor para el alcance acordado.
