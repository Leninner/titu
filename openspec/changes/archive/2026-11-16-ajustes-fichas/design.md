## Decisions

- `profile-sections.ts` describe las fichas como datos: título, campos, tipo de cada campo y visibilidad. `ProfileCard` las presenta de forma genérica, así que agregar un campo no exige cambiar componentes.
- Cada ficha edita una copia local y guarda el perfil completo con `repository.saveProfile`, fusionando solo sus campos sobre el perfil guardado. Cancelar descarta la copia.
- Los campos conservan sus etiquetas actuales ("Carrera", "Modalidad", etc.) para no romper búsquedas por etiqueta.
- Las pestañas usan `role="tablist"` con navegación por flechas, igual que los pasos del trámite.
- `BackupSettings` se divide en `BackupExport`, `BackupImport` y `ResetWorkspace`. El inicio sigue usando la importación; la pestaña Respaldo presenta las tres en fichas.
- Estilos nuevos en `src/features/settings/settings.css`, con los tokens existentes.
