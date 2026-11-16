## 1. Dominio

- [x] 1.1 Crear `shortName` y `{{nombreCorto}}`; firmar los correos de solicitud con el nombre corto. Probar en `tests/unit/request-email.test.ts`.
- [x] 1.2 Cambiar asunto y cuerpo del correo de requisitos habilitantes. Probar en `tests/unit/catalog.test.ts`.

## 2. PDF

- [x] 2.1 Agregar `pdf-lib` y crear `mergePdf` para PDFs e imágenes. Probar en `tests/unit/merge-pdf.test.ts`.
- [x] 2.2 Unir los adjuntos del correo al PDF de la solicitud desde el diálogo "Solicitar".

## 3. Interfaz

- [x] 3.1 Indicar en el adjunto que se une al PDF y actualizar `tests/e2e/request-email.spec.ts` con la descarga del PDF unido.
- [x] 3.2 Revisar en escritorio y móvil con un script de Playwright (`playwright-cli` no está instalado).

## 4. Verificación

- [x] 4.1 Pasar `pnpm typecheck`, `pnpm lint` y `pnpm test`.
