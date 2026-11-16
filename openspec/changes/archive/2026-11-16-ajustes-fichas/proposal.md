## Why

Ajustes y respaldo es una sola página larga con 18 campos seguidos y, debajo, el respaldo y el cambio de estudiante. Cuesta leer los datos guardados y encontrar cada acción.

## What Changes

- La página se divide en dos pestañas: "Expediente" y "Respaldo".
- Expediente muestra tres fichas (Datos personales, Titulación, Empresa) con los datos en modo lectura, un indicador de datos faltantes y un botón Editar por ficha. Al editar, la ficha muestra sus campos con Guardar y Cancelar.
- Respaldo muestra fichas para descargar el respaldo, importar uno y crear otro expediente.
- No cambian los datos guardados, las validaciones ni el flujo de importación o reemplazo. La restauración desde el inicio sigue igual.

## Capabilities

### Modified Capabilities

- `workspace-interface`: nueva presentación de Ajustes y respaldo.

## Impact

- `src/features/settings/*` (nuevo), `src/features/onboarding/BackupSettings.tsx`, `src/features/onboarding/ProfileSettings.tsx` (se elimina), `src/app/AppShell.tsx`, tests de integración y e2e que usan Ajustes.
