## Why

Los estudiantes de FISEI deben coordinar documentos, firmas, informes mensuales y fechas repartidos entre varias instrucciones. Necesitan un espacio personal que les indique el siguiente paso y permita preparar los anexos en el formato requerido, sin instalar programas ni crear cuentas.

## What Changes

- Crear una aplicación web estática en español, React + TypeScript, disponible para varios estudiantes; cada navegador conserva un expediente independiente sin backend.
- Organizar el proceso completo: propuesta, desarrollo e informes, calificadores, aptitud legal, biblioteca, sustentación o incorporación, y retiro del título.
- Ofrecer rutas diferenciadas para Proyecto de Investigación, Artículo Académico y Examen Complexivo, con requisitos condicionales y responsables explícitos.
- Crear un espacio de anexos con edición en vivo, guardado automático, vista previa paginada, Word editable y PDF con texto seleccionable y buscable. Priorizar Anexo 5 e integrar Anexo 11 y las solicitudes especificadas en el catálogo.
- Centralizar archivos y versiones, carpetas ZIP para envío manual, seguimiento de firmas y respaldos completos exportables/importables.
- Incorporar las agendas julio–diciembre 2026 aportadas como fuente de fechas; distinguir límites, ventanas, actuaciones administrativas y citas personales.
- Diseñar una navegación sencilla inspirada en Arc y jam.dev: barra lateral, siguiente acción clara, editor con documento a la vista y pocos elementos simultáneos.
- Mantener trazabilidad a las fuentes y sus contradicciones, sin confundir preparación del expediente con aprobación institucional.

## Capabilities

### New Capabilities

- `source-catalog`: fuentes versionadas, catálogo de plantillas, modalidades y resolución explícita de discrepancias.
- `student-workspace`: expediente personal local, perfil, inicio en una etapa existente, persistencia y aislamiento entre navegadores.
- `graduation-workflow`: etapas, dependencias, responsables, estados, preparación de entregas y seguimiento de firmas.
- `document-vault`: archivos, versiones, referencias reutilizables, paquetes ZIP y respaldo/restauración local.
- `graduation-calendar`: calendario del período, vencimientos, avisos locales, vigencia de documentos y exportación ICS.
- `annex-authoring`: editor estructurado, informes mensuales/final, generación DOCX y PDF textual y control de revisiones.
- `workspace-interface`: navegación accesible y adaptable, inicio accionable, búsqueda y edición con vista previa.

### Modified Capabilities

Ninguna: repositorio nuevo, sin implementación ni especificaciones previas.

## Impact

Nuevo frontend estático y pruebas, sin APIs de negocio, cuentas, correo automático, servicios de almacenamiento ni dependencia de LaTeX en producción. IndexedDB almacena los datos y archivos; se necesitan librerías de DOCX, PDF, ZIP y validación. Los documentos aportados quedan preservados en `references/` como evidencia de diseño, fuera de los assets públicos. Este change deja la implementación planificada, no implementada.
