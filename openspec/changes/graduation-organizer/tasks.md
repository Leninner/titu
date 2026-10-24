## 1. Base de aplicación y contratos

- [x] 1.1 Leer proposal.md, design.md, las siete specs y references/source-map.md; usar este documento como plan de implementación. Ejecutar las tareas en orden de dependencias, manteniendo cada casilla pendiente hasta verificar su resultado.
- [x] 1.2 Crear Vite + React + TypeScript con pnpm, rutas hash y estructura `src/app`, `src/domain`, `src/catalog`, `src/storage`, `src/features/{onboarding,workflow,documents,annexes,calendar}`, `src/export`, `src/components`, `src/styles`, `tests/{unit,integration,e2e,fixtures}`. Fijar versiones compatibles y scripts dev/build/typecheck/test/test:e2e; `pnpm build` y `pnpm typecheck` deben pasar.
- [x] 1.3 Definir los tipos y contratos de design.md en `src/domain/types.ts`, esquemas en `src/domain/schemas.ts` e interfaces de repositorio en `src/storage/repository.ts`. Verificar fixtures válidas y rechazo de modalidades, referencias y fechas inválidas en `tests/unit/schemas.test.ts`.
- [x] 1.4 Configurar Vitest/Testing Library, fake-indexeddb y Playwright con Chromium/Firefox/WebKit; crear fixtures sintéticas sin datos del usuario y un reloj inyectable. Verificar una prueba real de lectura/escritura y apertura de app.

## 2. Catálogo de fuentes y rutas

- [x] 2.1 Implementar `src/catalog/sources.ts`, `templates.ts`, `workflows.ts`, `calendar-2026.ts` y `conflicts.ts` desde manifest/source-map/calendar. Incluir todas las plantillas con clasificación editable/referencia/externa, rol y modalidades. Verificar IDs únicos y ausencia de referencias rotas en `tests/unit/catalog.test.ts`.
- [x] 2.2 Extraer del original de cada plantilla editable campos, texto fijo, tablas, medidas, notas, adjuntos y firmantes; guardarlos como definiciones versionadas en `src/catalog/templates/`. El Anexo 5 canónico es UT-10; comparar su geometría con el LaTeX solo como apoyo. Verificar que no quedaron datos personales/actividades de ejemplo ni destinatarios presentados como actuales sin revisión.
- [x] 2.3 Preparar fuentes descargables/extractos saneados en `public/sources/`, con metadatos de procedencia. No copiar todo references al bundle. Comprobar cada enlace de fuente y comprobar que los ejemplos personales no se publican.
- [x] 2.4 Implementar precedencia y avisos C-01 a C-08 en `src/features/workflow/SourceDetails.tsx`; comprobar firmas, contacto biblioteca, Anexo 11 y aperturas no confirmadas contra source-map.
- [x] 2.5 Sembrar calendario con todas las filas de calendar-2026.md y probar en `tests/unit/catalog-calendar.test.ts`: PI/AA 19/11 18:00, EC 4/12 y 11/12, emisión 7/12, certificado 10/12 16:00, solicitud 10/12 18:00; ningún inicio de defensa inventado.

## 3. Expediente persistente y onboarding

- [x] 3.1 Implementar `src/storage/db.ts` y el repositorio con transacciones, blobs, revisiones y errores tipados. En `tests/integration/storage.test.ts` comprobar recarga, fallos de cuota, escritura concurrente y rollback sin pérdida de datos.
- [x] 3.2 Implementar `src/features/onboarding/Onboarding.tsx` y `ProfileSettings.tsx` para modalidad/período, etapa actual, perfil progresivo y aviso de almacenamiento local. Probar que iniciar en sustentación no completa requisitos previos y cambiar modalidad conserva evidencia.
- [x] 3.3 Implementar guardado diferido 500 ms, estado visible, flush al navegar/exportar, conflicto entre pestañas y descarga de borrador de emergencia. En `tests/integration/draft-persistence.test.ts` usar reloj simulado para probar error de cuota y que Guardado solo aparece después del commit.
- [x] 3.4 Implementar un expediente por navegador con reemplazo explícito y respaldo previo ofrecido; probar dos contextos independientes de Playwright y aviso de acceso compartido en un mismo navegador.

## 4. Trámites y documentos

- [x] 4.1 Implementar `evaluateTask(task, workspace, catalog, now)` en `src/domain/workflow.ts`, requisitos aplicables y progreso sin opcionales. Probar en `tests/unit/workflow.test.ts` empresa/no empresa, tres modalidades, promedio 6.5 frente a 7, asistencia 69 frente a 70, similitud 11 frente a 10 y cambios de tema/resolución.
- [ ] 4.2 Implementar estados y detalle de trámite en `src/features/workflow/`, con observaciones, evidencia y registro manual de envío/resultado. Probar que generar/adjuntar no marca enviado, que puede registrar envío histórico incompleto y que reabrir conserva historial.
- [ ] 4.3 Implementar biblioteca: revisión sin firma, aval inicial, firmas sucesivas, aval final, reglas de archivo único Proyecto/dos archivos Artículo. Verificar flujo completo con roles y bloqueo visible si falta aval.
- [x] 4.4 Implementar importación local PDF/DOCX/DOC/JPG/PNG, límite 25 MiB, hashes, versiones, descarga y eliminación segura en `src/features/documents/` y `src/storage/`. Probar tipos rechazados, cuota insuficiente y que no se elimina evidencia referenciada silenciosamente.
- [ ] 4.5 Implementar inspección local de texto PDF y estado de firma reportada en `src/features/documents/inspect-pdf.ts`. Probar un PDF textual y uno escaneado; ninguno obtiene validación institucional/criptográfica automática.
- [ ] 4.6 Implementar `src/export/submission-zip.ts` con orden/numeración por trámite, saneamiento de nombres y selección de versiones, sin fusionar/reprocesar bytes. Probar hash de PDF firmado sin cambios, faltantes, Artículo/Proyecto y reutilización exacta de anexos de aptitud legal.
- [x] 4.7 Implementar texto de correo copiable y registro de entrega con fotografía de versiones. Comprobar que cambiar archivos después no altera el ZIP/registro previo y que no se envían mensajes automáticamente.

## 5. Editor común y Anexo 5

- [ ] 5.1 Implementar `validateAnnex(draft)` y esquema de borrador versionado en `src/domain/annex.ts`. Probar campos obligatorios, avance 0/100/101, fechas inválidas, tema diferente al aprobado, actividades vacías, advertencia por mes/avance decreciente y esquema específico por variante.
- [ ] 5.2 Implementar biblioteca de plantillas y borradores en `src/features/annexes/AnnexLibrary.tsx`; crear/renombrar/duplicar/eliminar con referencias seguras, filtrando por modalidad y mes. Verificar ausencia de informes personales precargados.
- [ ] 5.3 Implementar `AnnexEditor.tsx`, `ActivityTable.tsx` y `useDraftAutosave.ts` con edición de campos/filas, orden de actividades y mensajes junto al campo. Probar teclado, reapertura y duplicación al siguiente mes sin arrastrar actividades/porcentaje.
- [x] 5.4 Implementar registro de layouts en `src/export/template-registry.ts` y modelo común `src/export/document-model.ts` que alimenta DOCX y PDF desde una revisión congelada. Verificar que ambos reciben exactamente los mismos valores y que las notas institucionales no se pierden.
- [x] 5.5 Resolver fuentes PDF con licencia de distribución y fidelidad visual; registrar decisión/licencia en `docs/export-format.md`. Comparar tipografía/medidas con UT-10 antes de aceptar una sustitución; no declarar fidelidad si sigue bloqueada.
- [x] 5.6 Implementar `renderAnnex(draft, 'docx')` en `src/export/docx.ts` y layout del Anexo 5 con texto/tablas/estilos reales, carta, márgenes, encabezados y notas. En `tests/integration/docx-export.test.ts` inspeccionar OOXML para confirmar valores editables, tablas y dimensiones.
- [x] 5.7 Implementar `renderAnnex(draft, 'pdf')` en `src/export/pdf.tsx` con texto Unicode, fuente embebida y layout UT-10, tablas multipágina, firma/observaciones y pie. En `tests/integration/pdf-export.test.ts` verificar 612×792 pt, extracción de acentos/nombres y presencia íntegra de 40 actividades.
- [ ] 5.8 Implementar `AnnexPreview.tsx` sobre el mismo renderer PDF, debounce 700 ms, cancelación lógica de renders viejos, loader y errores. Probar edición rápida seguida de exportación y demostrar que contiene la revisión más reciente.
- [ ] 5.9 Implementar descargas de Word/PDF con nombres legibles, registro de revisión y estado de firma pendiente. Probar que modificar el borrador no altera una versión firmada ni registra el envío.

## 6. Anexo 11 y demás plantillas

- [ ] 6.1 Implementar consolidación `buildFinalReport(monthlyRevisions)` en `src/domain/final-report.ts` y su UI: fechas/texto exactos, orden cronológico estable, origen por fila, 100% declarado y revisión del tutor. Probar que no se suman porcentajes y no se genera historial cuando faltan mensuales.
- [ ] 6.2 Implementar detección de informe mensual modificado y comparación antes de regenerar Anexo 11; verificar que revisiones anteriores y sus exportaciones sobreviven sin cambios.
- [ ] 6.3 Añadir layouts DOCX/PDF para anexos 1, 3 y 4 con campos específicos, adjuntos y roles del original. Verificar cada variante con extracción de texto, apertura de DOCX y comparación visual contra su fuente.
- [x] 6.4 Añadir layouts DOCX/PDF para anexos 8, 9 y 21, cumplimiento empresarial y recalificación Proyecto; mantener trámites opcionales y condiciones explícitas. Verificar que recalificación Complexivo y Proyecto no comparten texto incorrectamente.
- [x] 6.5 Añadir layouts DOCX/PDF para Anexo 10 Proyecto/Artículo y Anexo 11; comprobar textos, informes y requisito de publicación exclusivo de Artículo, además de notas del tutor.
- [x] 6.6 Añadir layouts DOCX/PDF para Anexo 14 Proyecto/Artículo/Complexivo y Anexo 15; comprobar destinatarios revisables, dirección/correo donde obligatorios y que solicitud no se llama certificado emitido.
- [x] 6.7 Crear fixtures sintéticas cortas/largas para cada plantilla en `tests/fixtures/annexes/` y QA en `tests/e2e/annex-exports.spec.ts`: generar Word/PDF, abrir DOCX en Word o LibreOffice, renderizar ambas salidas e inspeccionar saltos, tabla, firma, pie, notas y acentos. Registrar resultados en `docs/export-qa.md`; no basta con que el archivo exista.
- [ ] 6.8 Añadir referencia de plantillas no editables (2/6/7/12/13A/16, guía y preliminares), explicación de rol y advertencia de 13B ausente. Verificar que no se muestra un editor vacío ni un generador de certificados/firma.

## 7. Calendario y vigencia

- [ ] 7.1 Implementar `src/domain/dates.ts` con fecha local, hora opcional, zona Ecuador, avisos 7/3/1/vencido y ventana/fecha administrativa/cita. Probar límites desde UTC y Europa, cambio de día, fechas sin hora y períodos sin calendario.
- [x] 7.2 Implementar `src/features/calendar/CalendarPage.tsx` con agenda/lista, filtro por modalidad, fuente, citas personales y sobrescrituras explícitas conservando original. Probar que fecha máxima de defensa no se convierte en cita y la hora desconocida se muestra como tal.
- [x] 7.3 Implementar cálculo de no adeudar desde emisión real +30 días, vencimiento impreso prioritario y Verificar vigencia en día frontera; contrastar con solicitud de día/hora. Probar emisión desconocida, solicitud/emisión diferentes y certificado ya vencido.
- [x] 7.4 Implementar `src/export/ics.ts` con UID estable, escape de texto, all-day, fin exclusivo e instantes UTC. Probar 19/11 18:00 Ecuador = 20261119T230000Z y ventana 16–20/11 inclusive con cierre según fuente; no cambiar hora oficial por recordatorio personal.

## 8. Respaldo, recuperación y funcionamiento local

- [ ] 8.1 Implementar `src/export/backup.ts` para ZIP con manifest, registros y todos los blobs/versiones; usar snapshot consistente y límites de design.md. Probar round-trip de expediente con mensual, final, documentos firmados y evidencia de envío, comparando hashes y relaciones.
- [ ] 8.2 Implementar `src/storage/restore.ts` con validación previa y restauración atómica tras resumen/confirmación. Probar ZIP corrupto, esquema futuro, hash incorrecto, ruta ../, relación faltante, 5001 entradas, >250 MiB comprimido y >500 MiB expandido sin modificar el expediente existente.
- [x] 8.3 Implementar UI de respaldo/restauración, fecha del último respaldo y exportación de emergencia ante fallo de guardado. Verificar cancelación sin cambios y aviso breve de datos personales en el respaldo.
- [ ] 8.4 Añadir shell offline/caché versionada con assets de generación local; probar recarga, edición, DOCX/PDF sin red tras carga inicial. Verificar que no se cachean referencias privadas como recursos públicos ni se transmiten datos a terceros.
- [x] 8.5 Implementar migración IndexedDB no destructiva y prueba de actualización/rollback de shell incompatible; comprobar que nunca se borra el expediente para recuperar una apertura fallida.

## 9. Interfaz completa y aceptación

- [x] 9.1 Implementar shell inspirado en Arc/jam.dev en `src/app/AppShell.tsx` y `src/styles/tokens.css`: sidebar suave, superficies limpias, navegación clara, acciones contextuales y fuentes locales; revisar a 360/768/1440 px.
- [ ] 9.2 Implementar Inicio en `src/features/workflow/HomePage.tsx` con siguiente acción basada en evaluateTask, bloqueos y espera de respuesta; probar expediente vacío, con pendientes y con todo en espera.
- [ ] 9.3 Implementar búsqueda local por trámites/documentos/anexos y vista editor/preview adaptable. Probar teclado, regreso desde preview sin pérdida y scroll horizontal solo dentro del documento cuando corresponda, no del shell.
- [ ] 9.4 Revisar accesibilidad: labels, foco y retorno de foco en diálogos, Escape, contraste AA, estados no solo por color y movimiento reducido. Ejecutar auditoría automática y recorrido manual de crear informe/exportar/restaurar por teclado.
- [x] 9.5 Ejecutar E2E por modalidad: Proyecto con informes→calificadores→aptitud→biblioteca→solicitud; Artículo con publicación y dos archivos; Complexivo con asistencia/resoluciones/incorporación. Incluir estado observado y corrección conservando versiones.
- [x] 9.6 Ejecutar `pnpm typecheck`, `pnpm test`, `pnpm build` y `pnpm test:e2e` con Chromium/Firefox/WebKit, además de QA visual de exportaciones; registrar resultados y corregir fallos antes de cerrar las tareas.
- [ ] 9.7 Documentar en README uso/desarrollo, límites de almacenamiento, recuperación, exportaciones y publicación estática HTTPS. Verificar build en servidor estático con rutas hash, recursos PDF/fuentes y política de caché; no desplegar sin solicitud.
- [ ] 9.8 Revisar cobertura de cada Requirement/Scenario de las siete specs y validar OpenSpec en modo estricto antes de dar por implementado el change; mantener pendientes las tareas no verificadas.

## Evidencia y pendientes de aceptación — 22 de octubre de 2026

Las casillas pendientes pueden tener implementación parcial o completa: no se cierran mientras falte alguna comprobación que pide su texto. Esta revisión contrastó las siete specs, implementación, pruebas y `docs/export-qa.md`; no certifica cobertura exhaustiva de todos sus escenarios.

- Base y persistencia: typecheck, lint y build pasaron según `docs/implementation-log.md`. Vitest confirmó esquemas, catálogo, workflow, guardado diferido, concurrencia, rollback, recuperación, onboarding y cambios de modalidad. La última ejecución conjunta tuvo **101 pruebas aprobadas en 20 archivos (4.51 s)**, incluida migración desde IndexedDB v1/v2 a v3 y la suite `inline-annex` de la sesión paralela confirmada por el usuario. Typecheck, Oxlint y build pasaron (Vite 2.96 s).
- Fuentes y exportaciones: pruebas de catálogo y campos cubren las 16 variantes y fuentes saneadas. Las verificaciones OOXML/PDF previstas en 5.6–5.7 están implementadas en `annex-exports.test.ts` y `annex-long-exports.test.ts`, con nombres distintos de los sugeridos. `docs/export-qa.md` registra 64 archivos cortos/largos, apertura de 32 DOCX en LibreOffice y revisión de 138 páginas, contenido íntegro y pies protegidos. UT-10 se comparó directamente; no se compararon visualmente todas las páginas de todos los originales (6.3). Hay adaptaciones gráficas explícitas; no se afirma identidad con las fuentes. El recorrido de descarga desde la interfaz también pasó en los tres navegadores; la matriz de todas las variantes se ejecuta en integración y QA visual, complementando ese E2E.
- Documentos y fechas: `storage.test.ts`, `workspace-ui.test.tsx`, `submission-email.test.ts`, `workflow.test.ts`, `dates.test.ts`, `evidence-expiry.test.ts`, `calendar-board.test.ts` e `ics.test.ts` respaldan las casillas correspondientes. La revisión visual de agenda y capturas a 360/768/1440 px constan en el registro de implementación. Los E2E recorrieron todos los trámites obligatorios de las tres modalidades, observación/corrección y selección exacta de versiones de aptitud legal; también verificaron independencia entre contextos. Quedan pendientes la inspección de PDF escaneado/textual y la matriz completa de ZIP por ruta. Las evidencias del recorrido se preparan mediante el repositorio: esto no acredita cada interacción de carga ni todas las variantes de firma de biblioteca.
- Informes: campos obligatorios, porcentajes, fechas, tema aprobado, copia al siguiente mes y consolidación exacta con origen están probados. Faltan pruebas explícitas de las advertencias por mes/avance decreciente (5.1), recorrido completo de edición por teclado (5.3), preview con renders concurrentes (5.8), y comparación/regeneración de Anexo 11 desde la UI conservando exportaciones previas (6.1–6.2). La presencia de lógica de dominio no cierra por sí sola estos recorridos.
- Respaldo: existen round-trip de blobs/historial/envíos, límites y rechazo de hashes/referencias/esquemas/rutas inválidos, además de rollback. Faltan el expediente combinado mensual + final + firmado del escenario 8.1 y completar todos los casos de archivo ZIP corrupto de 8.2. La cancelación/confirmación y recuperación desde UI sí pasaron en los tres navegadores (8.3).
- Aceptación: la ejecución final de Playwright pasó **30 casos en 24 s**, con Chromium/Firefox/WebKit, y la validación OpenSpec estricta pasó (resultados confirmados por el agente principal). 9.6 se cierra con estas verificaciones; 9.8 sigue pendiente por cobertura exhaustiva. Siguen pendientes offline tras carga inicial (8.4), servidor estático y caché (9.7), recorrido manual completo por teclado y auditoría accesible restante (9.4), estados exhaustivos de Inicio/búsqueda, y trazabilidad completa Requirement/Scenario (9.8). No se realizó despliegue.
