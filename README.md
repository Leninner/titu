# Mi titulación · FISEI

Organizador local del proceso de titulación: trámites por modalidad, documentos categorizados, anexos Word/PDF, agenda y respaldo ZIP. Implementa el change `openspec/changes/graduation-organizer`; sus verificaciones pendientes se conservan en `tasks.md`.

## Desarrollo

Node.js 22.12+ y pnpm. Las dependencias están fijadas y el lockfile fue generado con pnpm 12.15.0.

```sh
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install
pnpm test:e2e
openspec validate graduation-organizer --strict
```

Vite, React y TypeScript; Oxlint para lint. Código TypeScript sin punto y coma, LF y salto final (configuración en `.editorconfig` y `.oxfmtrc.json`). Las herramientas de PDF y Word se cargan al usarlas.

## Uso

1. Crea tu expediente con nombre, modalidad y período. Completa el perfil progresivamente en Ajustes.
2. Inicio muestra el siguiente trámite y las próximas fechas. Puedes escribir «el 21 de noviembre», «mañana» o «en 3 días» y confirmar la fecha reconocida.
3. Arrastra archivos a las tarjetas de Documentos. Cada versión permanece independiente; los archivos referenciados por entregas están protegidos.
4. Prepara anexos, revisa campos y descarga Word o PDF. Los borradores se guardan automáticamente; generar un documento no lo firma ni registra una entrega.
5. En Mi proceso selecciona evidencia y prepara el ZIP/correo. El envío y su resultado se registran manualmente.
6. Descarga respaldos ZIP en Ajustes. Para recuperar, importa el ZIP, revisa el resumen y confirma el reemplazo completo.

## Datos y recuperación

Un expediente por navegador, guardado en IndexedDB. No hay cuentas ni servidor de datos. Quien use el mismo perfil del navegador puede acceder al expediente. Borrar datos del sitio elimina el almacenamiento local: guarda respaldos fuera del navegador. El ZIP contiene datos personales y archivos originales.

El límite por archivo es 25 MiB. Restauración: máximo 250 MiB comprimidos, 500 MiB expandidos y 5000 entradas, además de la cuota que permita el navegador. La importación valida esquema, hashes y relaciones antes de reemplazar los datos mediante una transacción.

El calendario utiliza hora Ecuador. Fechas sin hora no se convierten en citas; las fuentes y ajustes personales permanecen diferenciados. Las firmas solo se reportan, sin verificación criptográfica o institucional. Los avisos se calculan al abrir la app; las notificaciones externas dependen del calendario donde se importe el ICS.

## Exportaciones y publicación

Las 16 variantes editables usan texto institucional saneado y layouts propios. Consulta `docs/export-format.md` y `docs/export-qa.md` para fidelidad y diferencias documentadas entre Word/PDF.

Para publicación estática, sirve únicamente `dist/` por HTTPS. Las rutas hash permiten entrar a secciones sin reglas de reescritura. Los recursos usan base relativa. Nunca publiques el workspace ni las referencias privadas de OpenSpec. El service worker precarga recursos locales y conserva cachés versionadas; su aceptación offline se registra en `docs/implementation-log.md`. No se ha desplegado.
