## Why

Al cambiar modalidad, período, tema o resolución de aprobación en el perfil, todos los borradores quedan marcados para revisión. El editor de anexos permite confirmar esa revisión, pero los formatos que se abren desde un trámite (solicitudes, Anexo 11) no: el estudiante ve "Revisar el borrador tras el cambio de perfil o modalidad" al descargar y no tiene forma de resolverlo.

## What Changes

- El editor de borradores de los trámites muestra un aviso cuando el borrador quedó marcado para revisión, con la acción "Actualizar datos y revisar campos", que copia el perfil actual al borrador y retira la marca.
- Tras confirmar la revisión, Word y PDF se descargan con normalidad.

## Capabilities

### Modified Capabilities

- `graduation-workflow`: revisión de borradores marcados dentro de los formatos de un trámite.

## Impact

- `src/features/annexes/AnnexDraftEditor.tsx`.
- `tests/integration/annex-format.test.tsx`.
