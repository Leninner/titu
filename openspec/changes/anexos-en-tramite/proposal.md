## Why

Los anexos viven en una sección aparte ("Anexos") desconectada de "Mi proceso". El estudiante redacta un Anexo 1 en un lado y lo busca en otro para adjuntarlo a la propuesta; el único puente es un enlace "Crear Anexo 5". Al exportar, todo anexo que no sea 5, 11, 3 o cumplimiento empresarial cae en la categoría genérica `solicitud`, así que el Anexo 1, el Anexo 14 y las solicitudes excepcionales comparten categoría y el encadenamiento por categoría de `tramite-en-pasos` podría proponer el Anexo 1 como Anexo 14.

Además, la revisión de la guía de titulación y de los formatos (UT-03 a UT-24) muestra huecos en el catálogo: la solicitud de calificadores no pide el Anexo 10, la de aptitud legal no pide el Anexo 15, y la propuesta no pide el Anexo 2 ni las capturas de los avales que UT-05 exige adjuntar. Quién firma cada anexo y quién lo envía tampoco está modelado: el Anexo 5 y el 11 los firma y envía el tutor por Quipux, el Anexo 3 y el cumplimiento empresarial los firma el representante de la empresa, el Anexo 1 lo firman estudiante y tutor sugerido (sin aval en Complexivo), y el resto solo el estudiante.

## What Changes

- Cada requisito que corresponde a un formato institucional declara su plantilla. En el paso Preparar del trámite, esa tarjeta lleva el ciclo completo del anexo: **Redactar → Firmar → Adjuntar firmado**, con el estado de cada etapa.
- Cada plantilla declara firmantes y quién la entrega, según su fuente. La etapa Firmar se adapta: "Firmar" cuando solo firma el estudiante, "Pedir firma a…" con correo preparado cuando firma otra persona, y "Entregar al tutor" cuando el tutor firma y envía por Quipux.
- Al adjuntar la versión firmada se registra el tipo de firma (electrónica o autógrafa) y la confirmación de que todas las firmas son del mismo tipo, sin imágenes pegadas.
- El editor de anexos se abre dentro del trámite (`#/proceso/<trámite>/anexo/<borrador>`). Los formatos de referencia (Anexo 2, 13A, preliminares, Anexo 12, Anexo 16, no adeudar) se muestran en el trámite que los usa.
- **BREAKING (navegación):** se elimina "Anexos" del menú principal. `#/anexos` y `#/anexos/<id>` redirigen al trámite del borrador.
- **BREAKING (datos locales):** cada anexo tiene categoría propia (`anexo-1`, `anexo-4`, `anexo-8`, `anexo-9`, `anexo-10`, `anexo-14`, `anexo-15`, `anexo-21`, `recalificacion`). Una migración reclasifica las versiones `solicitud` existentes.
- Catálogo: calificadores pide Anexo 10; aptitud legal pide Anexo 15; la propuesta pide Anexo 2 y capturas de avales como archivos; los trámites excepcionales piden su propio formato.

## Dependencias

Se construye sobre `tramite-en-pasos` (pasos Preparar, Enviar y Resultado, salidas y encadenamiento). Ese cambio se implementa primero.

## Capabilities

### New Capabilities

- `annex-in-task`: ciclo del anexo dentro del trámite, firmantes y entrega por plantilla, registro de la versión firmada y editor contextual.

### Modified Capabilities

- `graduation-workflow`: requisitos vinculados a plantillas, categorías por anexo, requisitos faltantes según las fuentes y migración de categorías.
- `workspace-interface`: navegación sin sección Anexos y redirecciones.

## Impact

- `src/catalog/{templates,workflows}.ts`, `src/domain/{types,annex,workflow,task-evidence}.ts`, `src/storage/{repository,restore}.ts`.
- `src/features/annexes/*` (se elimina `AnnexLibrary`; `AnnexEditor` recibe el trámite), `src/features/workflow/{RequirementsPanel,WorkflowPage}.tsx`, `src/app/AppShell.tsx`, `src/features/documents/document-categories.ts`, `src/domain/file-names.ts`.
- Tests unitarios, de integración y e2e de anexos y proceso.
