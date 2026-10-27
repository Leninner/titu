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

El sistema SHALL indicar que la revisión del trabajo sin firmas se hace en persona en Biblioteca FISEI con Monica Paredes, únicamente el 10 de noviembre de 2026 de 8:30 a 12:30 y de 14:30 a 16:30, y SHALL NOT pedir que el trabajo se envíe por correo.

#### Scenario: Guía de la revisión

- **WHEN** abre la tarjeta "Biblioteca: revisión del trabajo sin firmas"
- **THEN** la guía pide acercarse a Biblioteca FISEI el 10 de noviembre en esos horarios, nombra a Monica Paredes, pide tener listos índice, formato, resumen ejecutivo, abstract y palabras clave, avisa que sin pasar la revisión no se emite el aval y no menciona edissonhtoaza@uta.edu.ec.

#### Scenario: Cita en el calendario

- **WHEN** un estudiante de Proyecto o Artículo revisa el calendario
- **THEN** ve la cita "Revisión presencial Biblioteca" el 2026-11-10 a las 08:30, con fuente `BIB-01`.

#### Scenario: Sin paso Enviar

- **WHEN** abre el trámite "Biblioteca: revisión del trabajo sin firmas"
- **THEN** ve solo las pestañas "Preparar" y "Resultado", sin borrador de correo ni botón "Confirmar envío", y Resultado pide solo el aval inicial, sin capturas del correo de respuesta.
