## 0. Precondición

- [ ] 0.1 `tramite-en-pasos` implementado y archivado. Verificar con `openspec list` que ya no figura como cambio activo.

## 1. Modelo y catálogo

- [ ] 1.1 Añadir `templateId` al requisito, `signers` y `delivery` a `TemplateDefinition` y `signatureKind` a `DocumentVersion`, con esquemas en `schemas.ts`. Verificar con `pnpm typecheck`.
- [ ] 1.2 Declarar firmantes y entrega de cada plantilla editable según la tabla de design.md. Probar en `tests/unit/catalog.test.ts` Anexo 1 en Complexivo, Anexos 5/11 con `tutor-quipux` y Anexo 3/cumplimiento con `company`.
- [ ] 1.3 Vincular plantillas a requisitos, crear categorías por anexo y añadir Anexo 10, Anexo 15, Anexo 2, capturas de avales y formatos excepcionales. Probar correspondencia única plantilla ↔ requisito por modalidad y que no quedan requisitos `solicitud`.
- [ ] 1.4 Derivar `templateEvidenceCategory` del catálogo y nombres de categoría en `document-categories.ts` y `file-names.ts`. Probar que exportar Anexo 15 guarda en `anexo-15`.
- [ ] 1.5 Asignar formatos de referencia a su trámite. Probar que cada referencia aparece en exactamente un trámite de su modalidad.

## 2. Dominio

- [ ] 2.1 Calcular el estado de Redactar, Firmar y Adjuntar firmado a partir de borrador, versiones y selección, incluida la revisión cambiada tras firmar. Probar en `tests/unit/annex-cycle.test.ts`.
- [ ] 2.2 Regla de versión firmada: tipo de firma, confirmación de firmas no mixtas con varios firmantes y sustitución de la exportación en la selección. Probar los escenarios de la spec.
- [ ] 2.3 Derivar el trámite de un borrador por plantilla y modalidad. Probar el caso de borrador de otra modalidad.
- [ ] 2.4 Preparar correo de petición de firma al tutor o representante con el nombre del archivo. Probar en `tests/unit/submission-email.test.ts`.

## 3. Migración

- [ ] 3.1 Reclasificar versiones `solicitud` por borrador y por trámite, duplicar el registro cuando lo seleccionan varios trámites y dejar las no resueltas. Registrar en el historial el check `avales`. Probar en `tests/integration/storage-migration.test.ts` cada escenario, incluida la restauración de un respaldo antiguo.

## 4. Interfaz

- [ ] 4.1 Tarjeta de requisito con ciclo de anexo en `RequirementsPanel`: etapas, acciones por firmante y entrega, "Ya lo tengo firmado" y diálogo de tipo de firma.
- [ ] 4.2 Lista de Anexos 5 por mes en Desarrollo con "Nuevo informe mensual"; selección de mensuales para el Anexo 11 en Informe final.
- [ ] 4.3 Ruta `#/proceso/<trámite>/anexo/<borrador>` en `AppShell`, miga de pan y regreso a la tarjeta enfocada; redirecciones de `#/anexos` y `#/anexos/<id>`; búsqueda global.
- [ ] 4.4 Quitar Anexos del menú y eliminar `AnnexLibrary`; "Borradores de otra modalidad" y "Solicitudes sin clasificar" en Documentos; formatos de referencia en el pie del trámite.
- [ ] 4.5 Tests de integración: Anexo 10 de redactar a firmado en calificadores; revisión cambiada tras firmar; Anexo 5 con entrega del tutor.
- [ ] 4.6 E2E en `tests/e2e` y verificación con `playwright-cli` a 360, 768 y 1440 px: menú sin Anexos, redirección de ruta antigua, ciclo completo en propuesta y calificadores.

## 5. Cierre

- [ ] 5.1 `pnpm typecheck`, `pnpm lint`, `pnpm test` y `pnpm test:e2e` en verde; `openspec validate anexos-en-tramite`.
