## Why

Biblioteca FISEI cambió la revisión del trabajo sin firmas: ya no se envía por correo a edissonhtoaza@uta.edu.ec. La nueva encargada, Monica Paredes, revisa los trabajos solo de forma presencial el 10 de noviembre de 2026, de 8:30 a 12:30 y de 14:30 a 16:30. Quien no pase la revisión ese día no recibe el aval.

## What Changes

- El trámite "Biblioteca: revisión del trabajo sin firmas" pide acercarse en persona a Biblioteca FISEI el 10 de noviembre, en los dos horarios, y deja de pedir el envío por correo.
- La guía nombra a Monica Paredes como encargada y lista lo que debe estar listo: índice, formato, resumen ejecutivo, abstract y palabras clave.
- Los trámites presenciales no tienen el paso "Enviar": solo "Preparar" y "Resultado". La revisión de Biblioteca es presencial.
- El calendario incluye la cita de revisión de Biblioteca del 10 de noviembre.
- Se registra el aviso de Biblioteca como fuente `BIB-01`.

## Capabilities

### Modified Capabilities

- `graduation-workflow`: la revisión de Biblioteca es presencial, en fecha única y con nueva encargada.

## Impact

- `src/domain/types.ts` (`WorkflowDefinition.inPerson`), `src/domain/task-steps.ts`, `src/domain/workflow.ts`, `src/catalog/workflows.ts`, `src/catalog/calendar-2026.ts`, `src/catalog/sources.ts`, `public/sources/BIB-01.txt`, tests unitarios.
