## Decisions

- `shortName` toma el primer nombre y el primer apellido: con tres o más palabras usa la primera y la penúltima ("Lenin Giovanni Mazabanda Pullutaxi" → "Lenin Mazabanda"); con menos, el nombre tal cual. Se expone en los correos como `{{nombreCorto}}`.
- La firma de todos los correos de solicitud usa el nombre corto.
- Los `attachments` del correo de solicitud son los anexos que se unen al PDF de la solicitud. `RequestButton` resuelve sus archivos más recientes en Documentos y se los pasa al editor; el editor los agrega solo al exportar PDF.
- `mergePdf` usa `pdf-lib`: copia las páginas de los PDF y coloca cada imagen en una página A4 ajustada a los márgenes. JPEG y PNG se incrustan directamente; otros formatos de imagen se convierten a PNG con canvas.
- Si falta la cédula, el PDF se descarga sin ella; la sección Adjuntos ya avisa que aún no se sube.
