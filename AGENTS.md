# Instrucciones del proyecto

## Cambios con OpenSpec

Todo cambio de comportamiento, interfaz o datos pasa por OpenSpec antes de tocar código:

1. Crea el cambio en `openspec/changes/<id>/` con `proposal.md`, `design.md`, `tasks.md` y los deltas de `specs/`, siguiendo las reglas de `openspec/config.yaml`.
2. Valida con `openspec validate <id>` antes de implementar.
3. Implementa siguiendo `tasks.md` y marca cada tarea al completarla.
4. Al terminar y verificar, archiva el cambio con `openspec archive <id>`.

## Revisión de UI

Usa `playwright-cli` para revisar la interfaz: navegar, interactuar, tomar capturas y verificar el comportamiento visual. Todo cambio de interfaz se verifica así en escritorio y móvil antes de darlo por terminado, además de los tests de Playwright en `tests/e2e`.

## Código

- Código limpio: nombres que expliquen la intención, funciones pequeñas con una sola tarea y sin duplicación.
- Principios SOLID: cada módulo con una responsabilidad, extensible sin modificar lo existente, dependencias hacia abstracciones e interfaces pequeñas.
- Sin comentarios en el código: si algo necesita explicación, renombra o extrae una función.
- Antes de terminar, pasa `pnpm typecheck`, `pnpm lint` y `pnpm test`.
