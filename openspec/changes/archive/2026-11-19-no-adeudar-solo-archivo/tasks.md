## 1. Dominio

- [x] 1.1 Quitar `expiresOn` del modelo y calcular la vigencia solo con emisión + 30 días. Probar en `tests/unit/dates.test.ts` y `tests/unit/evidence-expiry.test.ts`.
- [x] 1.2 No bloquear el trámite sin emisión; bloquear solo si está vencido. Quitar la firma reportada del no adeudar. Probar en `tests/integration/workflow-evidence.test.tsx`.

## 2. Interfaz

- [x] 2.1 Mostrar aviso, vencimiento y usos como chips con tooltip. Probar en `tests/integration/workflow-evidence.test.tsx`.
- [x] 2.2 Editar la emisión desde un chip y quitar "Vencimiento impreso" de trámite, Documentos y calendario.
- [x] 2.3 Revisar con `playwright-cli` en escritorio y móvil.

## 3. Verificación

- [x] 3.1 Pasar `pnpm typecheck`, `pnpm lint` y `pnpm test`.
