## REMOVED Requirements

### Requirement: Mapa del proceso en bandas

**Reason**: Las bandas mezclaban etapas y las flechas cruzaban entre filas; el flujo no se entendía.
**Migration**: Se reemplaza por "Mapa del proceso por etapas".

## ADDED Requirements

### Requirement: Mapa del proceso por etapas

El sistema SHALL mostrar el mapa del proceso con una fila por etapa que aplica a la modalidad (Trabajo de titulación, Calificadores, Biblioteca, Sustentación y título), numeradas en orden y con su avance. Dentro de cada fila SHALL mostrar los pasos en orden con una flecha cuando un paso depende del anterior, SHALL NOT dibujar flechas entre etapas y SHALL indicar en el paso "Necesita: …" las dependencias pendientes de otras etapas.

#### Scenario: Paso bloqueado por otra etapa

- **WHEN** un estudiante de Proyecto abre Mi proceso sin la calificación completada
- **THEN** "Biblioteca: firma del estudiante" aparece en la fila Biblioteca con "Necesita: Calificación del trabajo".

### Requirement: Ocultar etapas completadas

El sistema SHALL ofrecer "Ocultar completadas" para ocultar las etapas con todos sus trámites completados, indicando cuáles se ocultaron, y "Ver completadas" para mostrarlas de nuevo, recordando la elección en el navegador.

#### Scenario: Ocultar el trabajo terminado

- **WHEN** el estudiante completó la etapa Trabajo de titulación y pulsa "Ocultar completadas"
- **THEN** la fila desaparece y se lee "Etapa completada oculta: Trabajo de titulación".
