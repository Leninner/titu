## ADDED Requirements

### Requirement: Archivos locales versionados

El sistema SHALL almacenar originales PDF/DOCX/DOC/JPG/PNG hasta 25 MiB por archivo con metadatos, hash y versiones inmutables, permitiendo descarga y eliminación controlada.

#### Scenario: Nueva versión

- **WHEN** adjunta una corrección de un archivo ya enviado
- **THEN** crea otra versión y conserva la anterior en el envío.

#### Scenario: Archivo demasiado grande

- **WHEN** selecciona un archivo mayor a 25 MiB
- **THEN** rechaza ese archivo con explicación sin perder otros registros.

#### Scenario: Eliminar evidencia usada

- **WHEN** intenta borrar una versión ligada a un envío
- **THEN** explica la referencia y bloquea su eliminación hasta resolverla explícitamente; no deja referencias rotas.

### Requirement: Reutilización exacta de evidencia

El sistema SHALL reutilizar documentos por referencia y fijar las versiones del expediente de aptitud legal para la posterior solicitud de día/hora.

#### Scenario: Documentos ya enviados

- **WHEN** prepara Anexo 14 después de aptitud legal
- **THEN** recupera las mismas versiones usadas para el certificado y muestra cualquier propuesta de sustitución para revisión.

#### Scenario: No adeudar vencido

- **WHEN** el formulario del expediente previo ya no estará vigente
- **THEN** señala el conflicto y la necesidad de confirmar actualización con Secretaría, conservando el envío anterior.

### Requirement: Paquete de envío

El sistema SHALL generar ZIP con adjuntos separados, ordenados, numerados y nombres seguros por trámite, además de texto de correo copiable sin efectuar el envío.

#### Scenario: Paquete completo

- **WHEN** selecciona las versiones requeridas y confirma preparación de un trámite
- **THEN** descarga ZIP con archivos sin fusionar y texto con destinatario/asunto; registrar Enviado sigue siendo una acción separada.

#### Scenario: Paquete incompleto

- **WHEN** faltan documentos o firmas declaradas
- **THEN** ve la lista de faltantes y solo puede descargarlo marcado como borrador en la interfaz.

### Requirement: Respaldo íntegro portable

El sistema SHALL exportar un ZIP versionado de perfil, borradores, estados, archivos, versiones, citas, configuración y evidencia de envíos con hashes, sin excluir blobs.

#### Scenario: Transferir navegador

- **WHEN** exporta un expediente con informes y adjuntos y lo importa en un navegador vacío
- **THEN** recupera datos y bytes de todos los archivos con los mismos hashes y relaciones.

### Requirement: Restauración validada y atómica

El sistema SHALL validar versiones, hashes, referencias, rutas y límites de design.md antes de reemplazar el expediente con confirmación, conservándolo ante fallos.

#### Scenario: Respaldo corrupto

- **WHEN** importa un ZIP con hash inválido o un blob faltante
- **THEN** se rechaza antes de modificar datos existentes.

#### Scenario: Archivo peligroso o enorme

- **WHEN** importa rutas con .., más de 5000 entradas o más de 500 MiB descomprimidos
- **THEN** se rechaza sin extracción arbitraria ni sustitución del expediente.

#### Scenario: Fallo de almacenamiento

- **WHEN** falla la transacción de restauración después de confirmar
- **THEN** el expediente anterior sigue disponible y se informa el error.

### Requirement: Texto y firmas no equivalen a validación

El sistema SHALL distinguir PDF con texto detectado, sin texto detectado y no inspeccionado; las firmas se registran como reportadas por el usuario.

#### Scenario: PDF escaneado

- **WHEN** adjunta un PDF sin texto detectable
- **THEN** se indica que requiere revisión/OCR externo para cumplir el requisito y no se anuncia conversión automática.

#### Scenario: Firma declarada

- **WHEN** marca un documento como firmado
- **THEN** la app conserva sus bytes originales y no afirma haber validado criptográficamente la firma.
