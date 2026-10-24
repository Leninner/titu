## ADDED Requirements

### Requirement: Plantillas estructuradas editables

El sistema SHALL ofrecer edición de las plantillas marcadas Editor en source-map.md con datos de perfil, campos específicos y texto fijo institucional versionado.

#### Scenario: Crear Anexo 10

- **WHEN** elige modalidad Artículo
- **THEN** obtiene la variante UT-15 con sus campos y requisitos, no la de Proyecto.

#### Scenario: Preparar otro anexo

- **WHEN** elige 1, 3, 4, 8, 9, 11, cumplimiento empresarial, recalificación Proyecto, 14, 15 o 21
- **THEN** dispone del esquema correspondiente, su rol firmante y descarga DOCX/PDF; datos ajenos no se precargan.

### Requirement: Editor en vivo y revisión consistente

El sistema SHALL guardar tras 500 ms sin cambios, actualizar preview paginado tras 700 ms y exportar la revisión validada actual del borrador.

#### Scenario: Escritura y recarga

- **WHEN** modifica actividades y espera Guardado
- **THEN** el PDF de vista previa se actualiza y al recargar conserva las actividades.

#### Scenario: Exportar durante render anterior

- **WHEN** cambia el nombre y pulsa descargar antes de actualizar preview
- **THEN** el archivo contiene el nombre nuevo; nunca descarga el PDF obsoleto.

#### Scenario: Error de generación

- **WHEN** un renderer falla
- **THEN** ve el error, conserva sus datos y el preview previo queda identificado como anterior; no se anuncia éxito.

### Requirement: Anexo 5 mensual

El sistema SHALL permitir informes independientes por mes con campos y geometría de UT-10, avance acumulado entre 0 y 100, actividades editables y firma/observaciones del tutor según design.md.

#### Scenario: Nuevo mes

- **WHEN** duplica septiembre para octubre
- **THEN** conserva perfil/tema/tutor, limpia fecha/actividades/porcentaje y deja septiembre intacto.

#### Scenario: Datos inválidos

- **WHEN** intenta exportar avance 101, fecha inválida, tema vacío o ninguna actividad completa
- **THEN** recibe errores junto a los campos y no exporta una versión final.

#### Scenario: Mes o avance inconsistente

- **WHEN** agrega una actividad fuera del mes o reduce el avance frente al mes previo
- **THEN** se solicita revisión explícita sin cambiar el dato automáticamente.

### Requirement: Anexo 11 trazable

El sistema SHALL consolidar revisiones seleccionadas de anexos 5 preservando fechas, descripciones y origen de cada actividad, con revisión del tutor y 100% declarado para el informe de cumplimiento.

#### Scenario: Consolidación

- **WHEN** selecciona agosto y septiembre
- **THEN** el informe incluye exactamente sus actividades/fechas en orden cronológico estable, sin resumir ni sumar porcentajes.

#### Scenario: Cambio posterior

- **WHEN** corrige un mensual ya incluido
- **THEN** el Anexo 11 avisa desactualización y muestra diferencias antes de regenerar; la versión exportada anterior permanece disponible.

#### Scenario: No hay informes

- **WHEN** solicita generar el informe final sin mensuales seleccionados
- **THEN** debe registrar/importar sus informes y actividades antes de declarar consistencia; no se inventa un historial.

### Requirement: Word editable nativo

El sistema SHALL descargar DOCX válido con texto, párrafos, tablas y campos editables, preservando encabezados, notas y espacios de firma de la plantilla.

#### Scenario: Edición externa

- **WHEN** abre un Anexo 5 exportado en Word o LibreOffice
- **THEN** puede editar nombre, porcentaje y filas de actividad como texto/celdas, no como una imagen de página.

#### Scenario: Cambios fuera de la app

- **WHEN** sube un DOCX editado externamente
- **THEN** puede archivarlo como versión externa; no se anuncia que el borrador o su PDF incorporan esos cambios automáticamente.

### Requirement: PDF textual fiel y multipágina

El sistema SHALL descargar PDF con texto Unicode seleccionable/buscable, fuentes embebidas y formato de cada plantilla, sin rasterizar páginas completas ni requerir LaTeX/servidor.

#### Scenario: Texto y acentos

- **WHEN** exporta un informe con titulación, Muñoz y actividades multilínea
- **THEN** la extracción devuelve esas palabras, las búsquedas funcionan y no aparecen glifos rotos.

#### Scenario: Informe extenso

- **WHEN** genera Anexo 5 con 40 actividades y tema largo
- **THEN** crece a las páginas necesarias sin recortes/solapamientos, repite encabezados de tabla, mantiene notas, pie y bloque de firma legibles.

#### Scenario: Tamaño correcto

- **WHEN** exporta Anexo 5
- **THEN** el PDF usa carta 612×792 pt y márgenes/estilos de UT-10, no los A4 de la tesis.

### Requirement: Revisiones y firmas preservadas

El sistema SHALL guardar exportaciones como versiones inmutables vinculadas a borrador/revisión, sin fabricar firmas ni alterar versiones firmadas recibidas.

#### Scenario: Corregir informe firmado

- **WHEN** edita el borrador de un informe cuya versión firmada ya adjuntó
- **THEN** crea una nueva revisión sin firma, conserva la firmada y señala que la corrección requiere nueva revisión/firma.

#### Scenario: Listo para envío

- **WHEN** genera un PDF aún no firmado
- **THEN** la app indica Pendiente de firma del tutor cuando aplica; no lo marca como firmado o enviado.
