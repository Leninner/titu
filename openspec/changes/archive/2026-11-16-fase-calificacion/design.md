## Decisions

- `WorkflowDefinition.informational` marca pasos sin requisitos ni resultado propio. El catálogo no les agrega la captura de respuesta.
- `informationalStatus` deriva el estado de sus dependencias: completado cuando todas están completadas, "En revisión" cuando alguna tiene Preparar listo y bloqueado en otro caso.
- `workflowCompleted` considera completado un paso informativo cuando sus dependencias aplicables lo están; lo usan las dependencias de los trámites y el mapa.
- La página de un paso informativo muestra el resumen, la fecha límite, sus pasos de la guía y un enlace al trámite donde se registran las notas, sin botones de completar.
- La fecha clave de la calificación es `calificaciones-limite` del calendario.
- Las páginas de trámite muestran "Antes necesitas" con enlaces a los pasos previos sin completar, para que el regreso a Biblioteca se vea en el propio trámite.
