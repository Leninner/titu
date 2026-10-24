## ADDED Requirements

### Requirement: Rutas diferenciadas y excepciones

El sistema SHALL ofrecer las fases de design.md con condiciones por modalidad/empresa y trámites excepcionales separados del progreso obligatorio.

#### Scenario: Artículo académico

- **WHEN** prepara designación de calificadores
- **THEN** se requiere aceptación/publicación conforme a UT-15, sin copiar indiscriminadamente requisitos exclusivos de Proyecto.

#### Scenario: Complexivo

- **WHEN** consulta su ruta
- **THEN** ve examen/incorporación y requisitos de asistencia/resoluciones; no informes mensuales y calificadores como requisitos universales.

#### Scenario: Empresa no aplica

- **WHEN** declara que su trabajo no se hizo en una empresa
- **THEN** el compromiso y cumplimiento empresarial no bloquean su ruta ni aumentan tareas obligatorias.

### Requirement: Estado y dependencias verificables

El sistema SHALL calcular qué falta, permitir registrar los estados de design.md y separar archivo preparado, envío manual y resultado confirmado.

#### Scenario: PDF generado

- **WHEN** exporta Anexo 10
- **THEN** el trámite no se marca Enviado ni Completado.

#### Scenario: Solicitud incompleta

- **WHEN** faltan las notas requeridas para aptitud legal
- **THEN** ve el faltante y el paquete no se etiqueta Listo; un envío histórico puede registrarse como incompleto con observación.

#### Scenario: Trámite observado

- **WHEN** registra una devolución y luego una corrección
- **THEN** conserva el envío anterior y la observación junto con las nuevas versiones.

### Requirement: Reglas de habilitación

El sistema SHALL aplicar los requisitos de UT-15/16/20/21/22/23/24 y las condiciones descritas en source-map.md sin equiparar carga de archivo con validación institucional.

#### Scenario: Promedio insuficiente

- **WHEN** registra notas 6 y 7 para Proyecto
- **THEN** el promedio 6.5 no habilita aptitud legal y se muestra el trámite de revisión/recalificación correspondiente.

#### Scenario: Similitud declarada

- **WHEN** registra 11% para el informe de similitud de Proyecto
- **THEN** la app señala que excede el 10% indicado en UT-16, sin afirmar haber ejecutado antiplagio.

#### Scenario: Asistencia complexivo

- **WHEN** registra 69% de asistencia
- **THEN** no se señala completo el requisito mínimo de 70% de UT-21.

### Requirement: Biblioteca y secuencia de firmas

El sistema SHALL representar revisión sin firmas, aval inicial, firmas una a una y aval final, preservando las diferencias entre Artículo y Proyecto.

#### Scenario: Proyecto

- **WHEN** prepara el trabajo para biblioteca
- **THEN** se indica un único PDF de preliminares y tesis; la revisión inicial antecede a las firmas.

#### Scenario: Artículo

- **WHEN** prepara el trabajo para biblioteca
- **THEN** se indican dos archivos separados, preliminares y artículo.

#### Scenario: Firma pendiente

- **WHEN** falta una firma o el aval final
- **THEN** se muestra quién falta y no se presenta el trabajo como avalado para entregar.

### Requirement: Responsabilidad de informes

El sistema SHALL identificar al tutor como responsable de revisar, firmar y enviar los anexos 5/11 por Quipux, con copias descritas en UT-10/03.

#### Scenario: Entrega mensual

- **WHEN** termina un Anexo 5
- **THEN** puede descargarlo para revisión del tutor y registrar evidencia de firma/envío después, sin simular Quipux.

#### Scenario: Tema distinto

- **WHEN** un borrador tiene un tema diferente al aprobado registrado
- **THEN** la exportación final requiere corregirlo o registrar explícitamente la resolución de cambio, sin alterar documentos anteriores.
