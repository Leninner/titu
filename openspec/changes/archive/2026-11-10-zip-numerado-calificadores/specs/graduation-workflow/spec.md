## ADDED Requirements

### Requirement: Paquete ZIP numerado

El sistema SHALL numerar los archivos del paquete ZIP según el orden de los requisitos del trámite y SHALL nombrarlos con el nombre estándar del requisito cuando existe, sin tomar en cuenta el nombre original. Fuente: instrucciones de envío de la Unidad de Titulación (documentos numerados en el orden establecido).

#### Scenario: Designación de calificadores del Proyecto

- **WHEN** descarga el ZIP de "Designación de calificadores del Proyecto" con todos los requisitos y cinco informes mensuales
- **THEN** el ZIP contiene "1. Solicitud calificación del informe final.pdf", "2. Copia de cédula y papeleta de votación.pdf", "3. Informe de cumplimiento del 100% coordinador empresarial.pdf", "4. Informe de cumplimiento del 100 % docente tutor.pdf", "5. Informe mensual 1.pdf" a "9. Informe mensual 5.pdf", "10. Aval de informes mensuales e informe final.pdf", "11. Informe de un sistema de similitud autorizado por la universidad.pdf", "12. Copia de la resolución de aprobación de modalidad y tema.pdf", "13. Certificado de folio y matrícula.pdf" y "14. Trabajo de titulación.pdf".

#### Scenario: Sin informe empresarial

- **WHEN** el estudiante no tiene empresa
- **THEN** la numeración continúa sin hueco: el informe del tutor es el número 3.

#### Scenario: Requisito sin nombre estándar

- **WHEN** el trámite no declara un nombre estándar para un requisito
- **THEN** el archivo conserva su nombre original con su número.

#### Scenario: Correo con los mismos nombres

- **WHEN** revisa el correo preparado
- **THEN** la lista de adjuntos coincide con los nombres del ZIP.
