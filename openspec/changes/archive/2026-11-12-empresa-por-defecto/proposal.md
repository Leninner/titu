## Why

La mayoría de trabajos de titulación se hacen en una empresa, pero el perfil nuevo arranca sin empresa. Así, el requisito "Empresa al 100 %" (informe de cumplimiento empresarial firmado por el representante) no aparece y el estudiante puede olvidarlo.

## What Changes

- Un perfil nuevo arranca con "El trabajo se realiza en una empresa" marcado.
- Con eso se muestran desde el inicio la sección Empresa del perfil y el requisito "Empresa al 100 %".
- El estudiante puede desmarcarlo en Ajustes. Los perfiles ya guardados no cambian.

## Capabilities

### Modified Capabilities

- `graduation-workflow`: el trabajo en empresa viene marcado por defecto.

## Impact

- `src/domain/types.ts` (`newProfile`), tests que asumen un perfil sin empresa.
