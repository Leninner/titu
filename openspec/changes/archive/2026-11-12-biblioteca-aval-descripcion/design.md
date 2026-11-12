## Decisions

- `Requirement.text` marca un requisito de texto libre. Se guarda en `task.requirementChecks[id]` como string, que el esquema ya admite.
- `RequirementFields` muestra un `textarea` para los requisitos de texto en lugar de una casilla.
- Un requisito de texto opcional nunca bloquea el cierre; uno obligatorio exige texto no vacío.
- "Biblioteca: revisión del trabajo sin firmas" reemplaza la salida `aval-inicial` por `aval-inicial-detalle` (texto, opcional). No hay trámites que consuman el archivo `aval-inicial`, así que no se rompe ninguna cadena de salidas. Los archivos ya subidos se conservan en Documentos.
