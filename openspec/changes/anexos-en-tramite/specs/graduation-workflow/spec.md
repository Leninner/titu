## ADDED Requirements

### Requirement: Requisitos vinculados a plantillas

El sistema SHALL vincular cada plantilla editable a un único requisito por modalidad y SHALL derivar el trámite de un borrador de su plantilla y de la modalidad del perfil.

#### Scenario: Correspondencia única

- **WHEN** se carga el catálogo
- **THEN** cada plantilla editable aplicable a una modalidad aparece en exactamente un requisito de un trámite de esa modalidad, y cada `templateId` de requisito existe.

#### Scenario: Cumplimiento empresarial en Artículo

- **WHEN** la modalidad es Artículo y aplica empresa
- **THEN** la solicitud de calificadores no pide cumplimiento empresarial, porque UT-15 no lo exige.

### Requirement: Categoría propia por anexo

El sistema SHALL usar una categoría distinta para cada formato institucional, de modo que el encadenamiento por categoría nunca proponga un anexo en lugar de otro.

#### Scenario: Anexo 1 y Anexo 14

- **WHEN** existe un Anexo 1 adjunto en la propuesta y el estudiante abre la solicitud de día y hora
- **THEN** el Anexo 1 no aparece como candidato del requisito Anexo 14.

#### Scenario: Exportación desde el editor

- **WHEN** exporta un Anexo 15
- **THEN** la versión se guarda en la categoría `anexo-15`.

### Requirement: Anexos exigidos por las fuentes

El sistema SHALL pedir en cada trámite los formatos que su fuente exige adjuntar.

#### Scenario: Calificadores

- **WHEN** se evalúa la solicitud de calificadores de Proyecto o Artículo
- **THEN** el Anexo 10 de su variante figura como requisito firmado.

#### Scenario: Aptitud legal

- **WHEN** se evalúa la solicitud de aptitud legal en cualquier modalidad
- **THEN** el Anexo 15 figura como requisito firmado, distinto del certificado de aptitud legal.

#### Scenario: Propuesta

- **WHEN** se evalúa la propuesta en Proyecto o Artículo
- **THEN** pide Anexo 1 firmado, Anexo 2 con la propuesta del perfil y capturas de los correos de aval como archivos; en Complexivo no pide Anexo 2 ni avales.

#### Scenario: Trámites excepcionales

- **WHEN** se evalúa un trámite excepcional
- **THEN** pide su propio formato (Anexo 4, 8, 9, 21 o recalificación del Proyecto) en lugar de una solicitud genérica.

### Requirement: Migración de categorías de solicitud

El sistema SHALL reclasificar las versiones de categoría `solicitud` de expedientes y respaldos sin perder archivos ni selecciones.

#### Scenario: Versión exportada de un borrador

- **WHEN** una versión `solicitud` procede de un borrador de Anexo 14
- **THEN** pasa a `anexo-14` y sigue seleccionada en día y hora.

#### Scenario: Versión subida sin borrador

- **WHEN** una versión `solicitud` sin borrador está seleccionada en la propuesta
- **THEN** pasa a `anexo-1`.

#### Scenario: Sin trámite que la identifique

- **WHEN** una versión `solicitud` no procede de borrador ni está seleccionada en ningún trámite
- **THEN** queda en `solicitud` y Documentos la muestra como solicitud sin clasificar.

#### Scenario: Check de avales

- **WHEN** la propuesta tenía marcado el check `avales`
- **THEN** el historial de la propuesta registra que se habían declarado los avales y el requisito de capturas queda pendiente de archivo.

#### Scenario: Respaldo antiguo

- **WHEN** restaura un respaldo anterior a la reclasificación
- **THEN** se aplica la misma migración y el respaldo pasa la validación de referencias.
