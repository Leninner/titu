## 1. Dominio y catálogo

- [x] 1.1 Agregar `directSend` a `WorkflowDefinition`, activarlo en ambos trámites de calificadores y marcar Enviar como completo en `taskSteps`. Probar en `tests/unit/task-steps.test.ts`.

## 2. Interfaz

- [x] 2.1 Extraer `SubmissionZipButton` y usarlo en Preparar y en el correo de Enviar.
- [x] 2.2 En `EmailComposer` y `SendStep`, con `directSend`: "Copiar mensaje" + "Descargar ZIP", sin "Copiar correo completo" ni "Confirmar envío". Probar en `tests/integration/workflow-evidence.test.tsx`.
- [x] 2.3 Revisar con `playwright-cli` en escritorio y móvil.

## 3. Verificación

- [x] 3.1 Pasar `pnpm typecheck`, `pnpm lint` y `pnpm test`.
