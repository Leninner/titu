## Decisions

- `newProfile()` devuelve `aplicaEmpresa: true`. El onboarding y Ajustes ya parten de `newProfile`, así que no cambian.
- No se migran los perfiles guardados: respetan lo que el estudiante eligió.
- Los tests que dependen de un perfil sin empresa lo declaran de forma explícita con `aplicaEmpresa: false`.
