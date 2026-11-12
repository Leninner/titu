# graduation-workflow Specification

## Purpose
TBD - created by archiving change adjunto-cedula-habilitantes. Update Purpose after archive.

## Requirements

### Requirement: Adjuntos del correo de solicitud

El sistema SHALL mostrar al pie del correo de solicitud los archivos que el estudiante debe adjuntar, SHALL permitir descargarlos desde ahí cuando ya están en Documentos, y SHALL pedir la copia de cédula en el correo de requisitos habilitantes.

#### Scenario: Copia de cédula en requisitos habilitantes

- **WHEN** abre "Solicitar" en la tarjeta "Requisitos habilitantes"
- **THEN** el cuerpo del correo dice "Adjunto la copia de mi cédula de ciudadanía." y al pie aparece la sección "Adjuntos" con la copia de cédula.

#### Scenario: Descargar la cédula guardada

- **WHEN** ya subió su cédula en Documentos y pulsa "Descargar" en el adjunto
- **THEN** recibe el archivo original con su nombre.

#### Scenario: Cédula sin subir

- **WHEN** no tiene la cédula en Documentos
- **THEN** el adjunto indica que aún no la sube y enlaza a Documentos.

#### Scenario: Correo sin adjuntos

- **WHEN** abre "Solicitar" en la tarjeta "Aval de informes"
- **THEN** el correo no muestra la sección de adjuntos.

### Requirement: Revisión presencial de Biblioteca

El sistema SHALL indicar que la revisión del trabajo sin firmas se hace en persona en Biblioteca FISEI con Monica Paredes, únicamente el 10 de noviembre de 2026 de 8:30 a 12:30 y de 14:30 a 16:30, y SHALL NOT pedir que el trabajo se envíe por correo. Como Biblioteca no entrega un documento de aval inicial, el sistema SHALL NOT pedir un archivo de aval y SHALL ofrecer un campo de texto opcional para anotar los detalles del aval. Fuente: `BIB-01`.

#### Scenario: Guía de la revisión

- **WHEN** abre la tarjeta "Biblioteca: revisión del trabajo sin firmas"
- **THEN** la guía pide acercarse a Biblioteca FISEI el 10 de noviembre en esos horarios, nombra a Monica Paredes, pide tener listos índice, formato, resumen ejecutivo, abstract y palabras clave, avisa que sin pasar la revisión no se emite el aval y no menciona edissonhtoaza@uta.edu.ec.

#### Scenario: Cita en el calendario

- **WHEN** un estudiante de Proyecto o Artículo revisa el calendario
- **THEN** ve la cita "Revisión presencial Biblioteca" el 2026-11-10 a las 08:30, con fuente `BIB-01`.

#### Scenario: Sin paso Enviar

- **WHEN** abre el trámite "Biblioteca: revisión del trabajo sin firmas"
- **THEN** ve solo las pestañas "Preparar" y "Resultado", sin borrador de correo ni botón "Confirmar envío", y Resultado no pide capturas del correo de respuesta.

#### Scenario: Detalles del aval sin archivo

- **WHEN** abre la pestaña "Resultado" de "Biblioteca: revisión del trabajo sin firmas"
- **THEN** ve el campo de texto "Detalles del aval de Biblioteca", no ve un espacio para subir el aval inicial y puede completar el trámite con el trabajo preparado aunque el campo esté vacío.

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

### Requirement: Anexo 11 editable opcional

El sistema SHALL ofrecer el Anexo 11 editable de "Informe final de avance del tutor" solo como ayuda y SHALL NOT exigirlo para completar el trámite. El sistema SHALL exigir el Anexo 11 firmado por el tutor, subido en Resultado y con la firma confirmada. Fuente: `UT-03`.

#### Scenario: Completar sin el borrador

- **WHEN** el estudiante no creó el Anexo 11 en la aplicación y sube en Resultado el Anexo 11 firmado con la firma confirmada
- **THEN** puede completar el trámite.

#### Scenario: Firma sin confirmar

- **WHEN** el Anexo 11 subido en Resultado no tiene la firma confirmada
- **THEN** el botón "Completar trámite" sigue deshabilitado.
