## Why

El trámite solo registra lo que el estudiante entrega. Lo que la institución devuelve (resoluciones, notificaciones, certificados, capturas del correo) no tiene lugar propio: vive en trámites aparte que solo sirven para recibir, o termina en "Otros documentos". Cerrar un trámite exige bajar por toda la página, y lo recibido se vuelve a seleccionar a mano en los trámites siguientes, aunque la guía de titulación lo pide de nuevo.

## What Changes

- Cada trámite se organiza en tres pasos con estado visible, Preparar, Enviar y Resultado, presentados como barra de avance que funciona como pestañas.
- Los trámites declaran salidas. El paso Resultado permite subirlas, adjuntar capturas del correo de respuesta y completar el trámite en un gesto, o registrar una observación.
- Las salidas de un trámite se autoseleccionan como entradas de los trámites posteriores que las piden, mientras estos no se hayan enviado.
- **BREAKING (datos locales):** se fusionan los trámites de solo recepción con su trámite de envío: aprobación de Consejo → propuesta; recibir calificaciones → solicitar calificadores; aval inicial → revisión de Biblioteca; aval final → firma de Decanato. Una migración del expediente y de respaldos antiguos reasigna estados, envíos, notas y archivos.
- Las resoluciones se separan en categorías inequívocas: `resolucion`, `resolucion-designacion` y `resolucion-tramite`.
- Se reescriben títulos, etiquetas e instrucciones del catálogo como hechos del trámite, y se eliminan los textos que explican cómo usar la interfaz.
- El modal del mapa muestra las tarjetas del paso activo.

## Capabilities

### New Capabilities

- `task-outcomes`: salidas de trámite, paso Resultado, cierre del trámite y encadenamiento de salidas como entradas posteriores.

### Modified Capabilities

- `graduation-workflow`: pasos del trámite, fusión de trámites de recepción, categorías de resolución, textos del catálogo y migración del expediente.

## Impact

- `src/catalog/workflows.ts`, `src/domain/{types,workflow,task-evidence,process-map}.ts`, `src/storage/repository.ts` y restauración de respaldos.
- `src/features/workflow/{WorkflowPage,ProcessMap,RequirementsPanel}.tsx`, `src/features/documents/document-categories.ts`, `src/domain/file-names.ts`.
- Tests unitarios, de integración y e2e del proceso.
