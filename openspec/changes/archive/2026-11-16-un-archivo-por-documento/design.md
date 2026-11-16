## Context

Un `DocumentRecord` tiene categoría y varias `DocumentVersion`; cada versión apunta a un blob. Los trámites guardan ids de versión en `evidenceVersionIds` y `outputVersionIds`, y los envíos en `exactVersionIds`. `addDocumentVersion` con `documentId` agrega una versión más; `signEvidence` y el cambio de firma en Documentos copian el blob en una versión nueva. Las etapas de Biblioteca, la recalificación y la solicitud de fecha usan la categoría `tesis`.

## Decisions

### Un archivo por documento

- Tras agregar una versión a un documento existente, el repositorio elimina en la misma transacción las demás versiones de ese documento que no estén en ningún envío (`exactVersionIds`). Los trámites que apuntaban a una versión eliminada pasan a apuntar a la nueva. Un blob se borra cuando ninguna versión ni acuse lo usa.
- La regla vive en una función pura `consolidateFiles` sobre los registros, que usan la escritura normal, la migración de la base y la restauración de respaldos.
- Las versiones conservadas por un envío no se muestran como archivo actual mientras exista otra más reciente: el archivo actual sigue siendo la versión más reciente del documento.
- `removeVersion` solo rechaza versiones que forman parte de un envío; si un trámite no enviado la usa, la quita de sus listas.

### Etapas del trabajo

| Categoría | Nombre | Trámites |
| --- | --- | --- |
| `tesis` | Trabajo sin firmas | Calificadores (Proyecto y Artículo), revisión de Biblioteca |
| `tesis-corregido` | Trabajo corregido | Recalificación |
| `tesis-firma-estudiante` | Trabajo firmado por el estudiante | Biblioteca: firma del estudiante |
| `tesis-firmas-docentes` | Trabajo con firmas docentes | Biblioteca: firmas del tutor y de los calificadores |
| `tesis-decanato` | Trabajo firmado por Decanato | Biblioteca: firma de Decanato; solicitud de fecha de sustentación |

- La verificación de PDF con texto se aplica a todas las categorías del trabajo.
- Las cinco quedan en el grupo "Tu trabajo" de Documentos.

### Migración

1. Para cada trámite de la tabla con categoría nueva, cada versión `tesis` de su evidencia se copia (mismo blob, id nuevo) a un documento de la categoría nueva, uno por documento original y categoría. El trámite y sus envíos apuntan a la copia.
2. Las versiones `tesis` originales que ya no usa ningún trámite ni envío se eliminan.
3. `consolidateFiles` deja un archivo por documento conservando los enviados y libera blobs huérfanos.

Se ejecuta en la versión 6 de la base y al restaurar cualquier respaldo; es idempotente.

## Risks

- Un envío registrado conserva su archivo aunque luego se reemplace; ocupa espacio, pero es lo que el estudiante envió.
- Si un mismo archivo se usó en dos etapas, queda copiado en ambas tarjetas, compartiendo el blob.
