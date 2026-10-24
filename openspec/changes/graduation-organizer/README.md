# Organizador de titulación FISEI

Change: `graduation-organizer` · Esquema: `spec-driven` · Preparado: 2026-10-22.

## Lectura

1. [Propuesta](proposal.md): alcance y capacidades.
2. [Diseño](design.md): arquitectura frontend, editor, exportaciones y datos locales.
3. [Tareas](tasks.md): 54 tareas de implementación, todas pendientes.
4. [Fuentes y reglas](references/source-map.md): mapa de plantillas, responsables y discrepancias.
5. [Calendario 2026](references/calendar-2026.md): fechas contrastadas con ambas agendas.
6. [Manifiesto de fuentes](references/manifest.json): 30 originales preservados con SHA-256 y extracción/transcripción.

## Especificaciones

- [Fuentes y catálogo](specs/source-catalog/spec.md)
- [Expediente del estudiante](specs/student-workspace/spec.md)
- [Trámites](specs/graduation-workflow/spec.md)
- [Documentos y respaldos](specs/document-vault/spec.md)
- [Fechas](specs/graduation-calendar/spec.md)
- [Editor y exportación de anexos](specs/annex-authoring/spec.md)
- [Interfaz](specs/workspace-interface/spec.md)

## Estado de preparación

34 requisitos y 80 escenarios de aceptación. Validación estricta de OpenSpec aprobada; cuatro artefactos completos. `openspec instructions apply --change graduation-organizer --json` reconoce estado `ready`, con 0/54 tareas implementadas. Revisión independiente de consistencia sin bloqueos importantes; hashes de las 30 fuentes y enlaces internos comprobados.

La app todavía no está implementada. No se ha publicado ningún sitio ni enviado documentos. Los originales de references son evidencia de diseño; solo se incorporarán a assets públicos las fuentes revisadas/saneadas que indique el plan.

## Comandos

```sh
openspec status --change graduation-organizer
openspec validate graduation-organizer --strict
openspec instructions apply --change graduation-organizer
```
