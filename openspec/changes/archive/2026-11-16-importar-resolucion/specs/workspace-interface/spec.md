## ADDED Requirements

### Requirement: Datos desde la resolución de aprobación

El sistema SHALL permitir subir en la ficha Titulación la resolución de Consejo Directivo que aprueba la modalidad y el tema, SHALL proponer los datos encontrados (número de resolución, fecha de aprobación, nombres, modalidad, carrera, período, tema y tutor) junto a los valores actuales, y SHALL guardar solo los datos que el estudiante confirme, junto con el PDF en "Resolución de modalidad y tema". El campo del número SHALL llamarse "Número de resolución de aprobación".

#### Scenario: Llenar desde la resolución

- **WHEN** el estudiante sube su resolución y confirma los datos marcados
- **THEN** la ficha Titulación muestra el número, la fecha, el tema y el tutor de la resolución, y el PDF queda en Documentos.

#### Scenario: PDF sin texto

- **WHEN** el PDF no tiene texto legible o no es una resolución
- **THEN** el sistema avisa que no encontró datos y no cambia el expediente.
