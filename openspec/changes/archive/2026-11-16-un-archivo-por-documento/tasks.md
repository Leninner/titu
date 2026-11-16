## 1. Consolidación de archivos

- [x] 1.1 Crear `consolidateFiles` puro: un archivo por documento, conservar versiones enviadas, reapuntar trámites y listar blobs liberados. Probar en `tests/unit/consolidate-files.test.ts` los escenarios de reemplazo, envío y blobs compartidos.
- [x] 1.2 Aplicar la consolidación en `addDocumentVersion` y relajar `removeVersion` (solo envíos bloquean; se quita de trámites). Probar en `tests/integration/storage.test.ts`.

## 2. Etapas del trabajo

- [x] 2.1 Añadir las categorías `tesis-corregido`, `tesis-firma-estudiante`, `tesis-firmas-docentes` y `tesis-decanato` al catálogo, nombres, grupo "Tu trabajo", nombres de archivo y verificación de PDF con texto. Probar en `tests/unit/catalog.test.ts` y `tests/unit/workflow.test.ts`.

## 3. Migración

- [x] 3.1 Migrar el trabajo por etapa y consolidar en la versión 6 de la base y al restaurar respaldos. Probar en `tests/integration/storage-migration.test.ts` los escenarios de la spec, incluido el respaldo antiguo.

## 4. Interfaz

- [x] 4.1 Quitar el historial de `DocumentCard` y añadir descargar y eliminar el archivo actual. Actualizar los tests de integración que usaban el historial.

## 5. Verificación

- [x] 5.1 Pasar `pnpm typecheck`, `pnpm lint`, `pnpm test` y los e2e afectados; revisar Documentos y un trámite de Biblioteca con Playwright en escritorio y móvil.
