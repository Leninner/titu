## Context

`RequestEmail` define destinatario, asunto, párrafos y despedida. `RequestEmailCard` muestra el correo con botones para copiar cada parte. No hay forma de indicar archivos que deben ir adjuntos.

## Decisions

- Añadir `attachments?: string[]` a `RequestEmail`: nombres legibles de los archivos que el estudiante debe adjuntar. Se declara en el catálogo, junto al resto del correo.
- La tarjeta muestra una fila "Adjuntar" con un ícono de clip y cada adjunto como chip, entre el asunto y el cuerpo. Sin adjuntos, la fila no aparece.
- El cuerpo de requisitos habilitantes añade el párrafo "Adjunto la copia de mi cédula de ciudadanía." para que el destinatario sepa qué recibe.
- No se adjunta el archivo automáticamente: el correo se copia a mano en el cliente institucional.

## Risks

- Ninguno sobre datos guardados: el catálogo no se persiste.
