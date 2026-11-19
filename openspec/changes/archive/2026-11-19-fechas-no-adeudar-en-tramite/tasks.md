## 1. Dominio

- [x] 1.1 Agregar `hasValidityDate` y el texto "registra la fecha de emisión" al faltante de vigencia. Probar en `tests/unit/evidence-expiry.test.ts`.
- [x] 1.2 Generalizar `signEvidence` en `reviseEvidence` con firma y fechas. Probar en `tests/unit`.
- [x] 1.3 Leer la emisión del PDF del no adeudar al subirlo. Probar en `tests/unit/no-debt.test.ts`.

## 2. Interfaz

- [x] 2.1 Mostrar "Emisión" y "Vencimiento impreso" en la tarjeta del no adeudar incluida y el estado "Falta la emisión" sin fechas. Probar en `tests/integration/workflow-evidence.test.tsx`.
- [x] 2.2 Listar en el resultado lo que falta para completar. Probar en `tests/integration/workflow-evidence.test.tsx`.
- [x] 2.3 Revisar con `playwright-cli` en escritorio y móvil.

## 3. Verificación

- [x] 3.1 Pasar `pnpm typecheck`, `pnpm lint` y `pnpm test`.
