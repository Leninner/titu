## Decisions

- `Requirement.submissionName` guarda el nombre estándar sin número ni extensión.
- `submissionEntries(definition, workspace, versionIds)` ordena los archivos seleccionados según los requisitos del trámite y devuelve `{ versionId, name }`. El número es la posición en el paquete, así que se recorre si no aplica el informe empresarial.
- Un requisito con varios archivos agrega un sufijo correlativo: "Informe mensual 1", "Informe mensual 2"… Los mensuales se ordenan por mes del informe.
- Sin `submissionName` se usa el nombre original saneado. Los archivos que no corresponden a ningún requisito van al final.
- La extensión se toma del archivo original.
- `submissionZip` recibe las entradas ya nombradas; el correo usa las mismas entradas para listar los adjuntos.
