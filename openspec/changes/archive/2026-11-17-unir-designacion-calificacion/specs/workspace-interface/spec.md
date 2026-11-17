## MODIFIED Requirements

### Requirement: Contador sin pasos informativos

El sistema SHALL contar en "X de N trámites completados" solo los trámites, sin los pasos informativos.

#### Scenario: Calificación informativa

- **WHEN** un estudiante de Proyecto abre Mi proceso
- **THEN** el contador indica 13 trámites, sin contar "Designación y calificación".

### Requirement: Mapa del proceso por etapas

El sistema SHALL mostrar el mapa del proceso con una fila por etapa que aplica a la modalidad (Trabajo de titulación, Calificadores, Biblioteca, Sustentación y título), numeradas en orden y con su avance. Dentro de cada fila SHALL mostrar los pasos en orden con una flecha cuando un paso depende del anterior, SHALL NOT dibujar flechas entre etapas y SHALL indicar en el paso "Necesita: …" las dependencias pendientes de otras etapas.

#### Scenario: Paso bloqueado por otra etapa

- **WHEN** un estudiante de Proyecto abre Mi proceso sin la calificación completada
- **THEN** "Biblioteca: firma del estudiante" aparece en la fila Biblioteca con "Necesita: Designación y calificación".
