# graduation-workflow Specification

## Purpose
TBD - created by archiving change adjunto-cedula-habilitantes. Update Purpose after archive.

## Requirements

### Requirement: Adjuntos del correo de solicitud

El sistema SHALL indicar en el correo de solicitud qué se adjunta en una sola línea, y SHALL NOT presentar como adjuntos del correo los documentos que se unen al PDF de la solicitud. En requisitos habilitantes SHALL unir la cédula guardada al PDF de la solicitud después de la firma, SHALL rotular el botón como "PDF + cédula" y, sin cédula guardada, SHALL mostrar "Falta cédula" con enlace a Documentos. El asunto SHALL ser "Solicitud de certificado de requisitos habilitantes – " seguido del nombre corto del estudiante. Los correos de solicitud SHALL firmar con el nombre corto: primer nombre y primer apellido.

#### Scenario: Copia de cédula en requisitos habilitantes

- **WHEN** el estudiante "Lenin Giovanni Mazabanda Pullutaxi", con su cédula guardada, abre "Solicitar" en la tarjeta "Requisitos habilitantes"
- **THEN** el asunto termina en "– Lenin Mazabanda", el correo no muestra una sección "Adjuntos", indica que se adjunta la solicitud firmada en PDF, y el botón dice "PDF + cédula".

#### Scenario: PDF con la cédula unida

- **WHEN** descarga "PDF + cédula"
- **THEN** el PDF contiene la solicitud seguida de las páginas de la cédula.

#### Scenario: Descargar la cédula guardada

- **WHEN** necesita la cédula como archivo aparte
- **THEN** la descarga desde Documentos con su nombre original; el correo de solicitud no la ofrece como adjunto.

#### Scenario: Cédula sin subir

- **WHEN** no tiene la cédula en Documentos
- **THEN** el botón dice "PDF", aparece "Falta cédula" enlazado a Documentos y el PDF se descarga solo con la solicitud.

#### Scenario: Correo sin adjuntos

- **WHEN** abre "Solicitar" en la tarjeta "Aval de informes"
- **THEN** el correo no muestra avisos de anexos.

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

### Requirement: Trabajo en empresa por defecto

El sistema SHALL crear los perfiles nuevos con "El trabajo se realiza en una empresa" marcado, para que el requisito "Empresa al 100 %" se muestre desde el inicio, y SHALL permitir desmarcarlo en Ajustes sin cambiar los perfiles ya guardados.

#### Scenario: Perfil nuevo

- **WHEN** un estudiante de Proyecto crea su perfil sin tocar la opción de empresa
- **THEN** la designación de calificadores del Proyecto pide "Empresa al 100 %".

#### Scenario: Sin empresa

- **WHEN** el estudiante desmarca "El trabajo se realiza en una empresa" en Ajustes
- **THEN** la designación de calificadores del Proyecto ya no pide "Empresa al 100 %".

### Requirement: Envío directo en la designación de calificadores

En "Designación de calificadores del Proyecto" y "Designación de calificadores del Artículo", el sistema SHALL mostrar en el paso Enviar el botón "Copiar mensaje" y a su lado "Descargar ZIP" con los documentos seleccionados, y SHALL NOT mostrar "Copiar correo completo" ni "Confirmar envío". El paso Enviar SHALL mostrarse completo por defecto, de modo que Resultado sea el siguiente paso cuando Preparar está listo.

#### Scenario: Copiar el mensaje y descargar el ZIP

- **WHEN** el estudiante abre Enviar en la designación de calificadores
- **THEN** ve "Copiar mensaje" y "Descargar ZIP" juntos, y no ve "Copiar correo completo" ni "Confirmar envío".

#### Scenario: Enviar completo por defecto

- **WHEN** Preparar está listo en la designación de calificadores
- **THEN** la pestaña Enviar aparece como lista y el trámite se abre en Resultado sin registrar un envío.

### Requirement: Copiar mensaje y descargar ZIP en todos los envíos

En el paso Enviar de cualquier trámite, el sistema SHALL mostrar el botón "Copiar mensaje" y a su lado "Descargar ZIP" con los documentos seleccionados, y SHALL NOT mostrar "Copiar correo completo" ni "Solo el mensaje". Los trámites sin envío directo SHALL conservar "Confirmar envío".

#### Scenario: Trámite con confirmación

- **WHEN** el estudiante abre Enviar en "Propuesta y aprobación de modalidad"
- **THEN** ve "Copiar mensaje", "Descargar ZIP" y "Confirmar envío", y no ve "Copiar correo completo" ni "Solo el mensaje".

### Requirement: Etapa informativa de calificación

Para Proyecto de Investigación y Artículo Académico, el sistema SHALL mostrar después de la designación de calificadores un solo paso informativo "Designación y calificación" con una línea de tiempo de la solicitud (18/11/2026), la sesión de Consejo (19/11/2026, adelantada del 20/11 por el feriado), la resolución (23/11/2026), la notificación (hasta el 24/11/2026) y la entrega de notas (hasta el 4/12/2026), marcando los hitos que ya pasaron, y debajo las notas de los dos calificadores. El paso SHALL NOT pedir documentos ni ofrecer completarlo. SHALL mostrarse "Aún no empieza" mientras la solicitud no está lista; "Esperando al Consejo", con la fecha de la sesión, cuando la solicitud está lista; "Calificando", con la fecha de entrega de notas, cuando hay notificación o alguna nota registrada en la designación o ya pasó la fecha de notificación; y completado cuando la designación está completada. SHALL permitir registrar las notas en la designación cuando la solicitud está lista y, con las dos notas, mostrar el promedio sobre 10 indicando si alcanza 7. El modal del paso SHALL NOT ofrecer "Ver detalle". Fuentes: `UT-16`, `UT-17`, `CAL-01`, `CAL-02`.

#### Scenario: Calificadores revisando

- **WHEN** la notificación o una nota están registradas y la designación no está completada
- **THEN** el paso aparece "Calificando" con la fecha límite del 4/12/2026.

#### Scenario: Notas recibidas

- **WHEN** la designación de calificadores está completada con las dos notas
- **THEN** el paso aparece completado.

#### Scenario: Registrar una nota en el modal

- **WHEN** el estudiante escribe 8,5 como nota del primer calificador en el modal del paso
- **THEN** la nota queda guardada en la designación y el promedio sigue oculto hasta tener la segunda nota.

#### Scenario: Promedio aprobado

- **WHEN** las notas registradas son 8 y 9
- **THEN** el paso muestra el promedio 8,5 e indica volver a Biblioteca.

#### Scenario: Promedio menor a 7

- **WHEN** las notas registradas son 6 y 7
- **THEN** el paso muestra el promedio 6,5 y avisa que la Unidad de Titulación convoca a calificadores, tutor y estudiante.

#### Scenario: Solicitud sin preparar

- **WHEN** Preparar de la designación no está listo
- **THEN** el paso aparece "Aún no empieza" con la sesión de Consejo del 19/11/2026, muestra la línea de tiempo y las notas aparecen bloqueadas.

#### Scenario: Esperando al Consejo

- **WHEN** Preparar de la designación está listo, sin notificación ni notas, el 18/11/2026
- **THEN** el paso aparece "Esperando al Consejo" con la sesión del 19/11/2026 y la solicitud marcada como hito de hoy.

### Requirement: Regreso a Biblioteca con las notas

El sistema SHALL bloquear "Biblioteca: firma del estudiante" hasta que la designación y calificación esté completada y SHALL indicar que, con las notas de los calificadores, el estudiante vuelve a Biblioteca con el trabajo corregido. Fuentes: `UT-22`, `UT-23`.

#### Scenario: Sin notas

- **WHEN** la revisión inicial de Biblioteca está completada pero faltan las notas
- **THEN** "Biblioteca: firma del estudiante" sigue bloqueada y lista "Designación y calificación" como pendiente.

### Requirement: Nota de vigencia del no adeudar

El sistema SHALL mostrar el aviso de vigencia del no adeudar como un chip con ícono y texto corto, solo donde aplica: en el trámite "Formulario de no adeudar", "Vale 30 días"; en la solicitud de día y hora, "Vigente al enviar". El detalle SHALL quedar en un tooltip. SHALL NOT mostrar el aviso en aptitud legal. Fuente: `UT-20`, `UT-21`.

#### Scenario: Nota en la petición de día y hora

- **WHEN** el estudiante abre el trámite de solicitud de día y hora de sustentación
- **THEN** la tarjeta "Formulario de no adeudar" muestra el chip "Vigente al enviar".

#### Scenario: Nota en el trámite propio

- **WHEN** abre el trámite "Formulario de no adeudar"
- **THEN** la tarjeta muestra el chip "Vale 30 días".

### Requirement: Guía del Sistema Integrado para no adeudar

La guía del trámite "Formulario de no adeudar" SHALL indicar el acceso a servicios.uta.edu.ec/SistemaIntegrado con el correo institucional sin @uta.edu.ec, la ruta Gestión › Formularios de No Adeudar › Gestión solicitud › Registrar solicitud, el seguimiento en Avance y que se descarga en estado Finalizado con las cuatro columnas en SI. SHALL incluir los contactos: Secretaría de Facultad (ddlm.montenegro@uta.edu.ec) para solicitudes por error, Financiero (3730260 / 3730261) para órdenes de pago y DITIC para el acceso. Fuente: `UT-20`.

#### Scenario: Ruta del sistema

- **WHEN** abre "Cómo se tramita" en "Formulario de no adeudar"
- **THEN** ve la ruta de menús, la condición de descarga y los tres contactos.

### Requirement: Páginas preliminares del Proyecto

Las tarjetas del trabajo del Proyecto de Investigación en la revisión de Biblioteca y en la solicitud de día y hora SHALL ofrecer un desplegable "Páginas obligatorias" con: portada, aprobación del tutor, autoría, derechos de autor, aprobación del tribunal, dedicatoria (opcional), agradecimiento (opcional), índice general, índice de tablas y figuras, y resumen/abstract de máximo una página. Fuente: `UT-23`.

#### Scenario: Lista desplegable

- **WHEN** un estudiante de Proyecto abre la revisión de Biblioteca
- **THEN** la tarjeta "Trabajo sin firmas" ofrece "Páginas obligatorias" con las diez páginas.

### Requirement: Rúbricas de calificación

La guía de "Designación y calificación" SHALL mostrar la rúbrica del Anexo 12 (marco teórico 2, metodología 2,5, resultados y discusión 2,5, conclusiones y recomendaciones 2, referencias y anexos 1; total 10), y la de "Sustentación o incorporación" SHALL mostrar la del Anexo 16 (sustentación 7, recursos visuales y tecnológicos 1,5, expresión oral 1,5; total 10). Fuente: `UT-17`, `UT-27`.

#### Scenario: Rúbrica del Anexo 12

- **WHEN** abre "Designación y calificación"
- **THEN** ve los cinco criterios con su puntaje máximo y el total de 10.

### Requirement: Revisión de borradores en los formatos del trámite

El sistema SHALL mostrar, en los formatos que se abren desde un trámite, un aviso cuando el borrador quedó marcado para revisión por un cambio del perfil, con la acción "Actualizar datos y revisar campos" que copia el perfil actual al borrador y retira la marca.

#### Scenario: Borrador marcado tras cambiar el tema

- **WHEN** el estudiante cambia el tema del perfil y abre la solicitud de requisitos habilitantes
- **THEN** ve el aviso de revisión con la acción "Actualizar datos y revisar campos".

#### Scenario: Descargar tras revisar

- **WHEN** pulsa "Actualizar datos y revisar campos" y luego descarga el PDF
- **THEN** el aviso desaparece y el PDF se genera sin el error de revisión.

### Requirement: Etapas del trabajo de titulación

El sistema SHALL guardar el trabajo de titulación en tarjetas por etapa (sin firmas, corregido, firmado por el estudiante, con firmas docentes y firmado por Decanato), y cada trámite SHALL pedir la tarjeta de su etapa.

#### Scenario: Firma del estudiante

- **WHEN** el estudiante abre "Biblioteca: firma del estudiante"
- **THEN** el trámite pide "Trabajo firmado por el estudiante" y no acepta el trabajo sin firmas como ese documento.

#### Scenario: Solicitud de fecha de sustentación

- **WHEN** abre la solicitud de fecha de sustentación del Proyecto
- **THEN** el trabajo final firmado se toma de la tarjeta "Trabajo firmado por Decanato".

#### Scenario: Documentos

- **WHEN** abre Documentos con archivos en cada etapa
- **THEN** ve una tarjeta por etapa en "Tu trabajo", cada una con su archivo.

### Requirement: Migración de archivos a un archivo por documento

El sistema SHALL migrar el expediente y los respaldos repartiendo los archivos del trabajo según el trámite que los usa, dejando un archivo por documento, conservando los archivos de los envíos registrados y liberando los archivos sin uso.

#### Scenario: Trabajo firmado subido en la firma de Decanato

- **WHEN** un expediente tiene en "Trabajo de titulación" una versión sin firmas usada en la revisión de Biblioteca y una firmada usada en la firma de Decanato
- **THEN** tras migrar, "Trabajo sin firmas" muestra la primera, "Trabajo firmado por Decanato" la segunda y cada trámite sigue completo.

#### Scenario: Versiones antiguas

- **WHEN** un documento tiene tres versiones y solo la primera forma parte de un envío
- **THEN** tras migrar conserva la primera para el envío y la más reciente como archivo actual, y la intermedia se elimina con su blob.

#### Scenario: Restaurar un respaldo antiguo

- **WHEN** restaura un respaldo con varias versiones por documento
- **THEN** el expediente restaurado cumple las mismas reglas.

### Requirement: Fechas del no adeudar en el trámite

Al subir el formulario de no adeudar en PDF, el sistema SHALL registrar como emisión la mayor fecha «FECHA: dd/mm/aaaa» de su texto. Subir el archivo SHALL bastar para que la tarjeta muestre "Listo", sin confirmar firmas ni registrar fechas. La tarjeta SHALL mostrar la emisión y el vencimiento (emisión + 30 días) como chips y SHALL permitir agregar o cambiar la emisión, guardándola en una nueva versión del mismo documento. El sistema SHALL NOT pedir ni guardar un vencimiento impreso. Si el vencimiento es anterior a la fecha de ingreso de la solicitud de día y hora, la tarjeta SHALL mostrar "Vencido". Fuentes: `UT-20`, `UT-21`.

#### Scenario: Fecha leída del PDF

- **WHEN** el estudiante sube el formulario del Sistema Integrado con «FECHA: 19/11/2026» en la cabecera y fechas del 17 y 18/11/2026 en las dependencias
- **THEN** la emisión queda registrada el 19/11/2026 y la tarjeta muestra "Vence 19 dic".

#### Scenario: Archivo sin fecha

- **WHEN** el estudiante sube el formulario de no adeudar en su trámite sin que se lea una fecha
- **THEN** la tarjeta muestra "Listo" con el chip "Agregar emisión" y "Completar trámite" se habilita.

#### Scenario: Fecha registrada

- **WHEN** el estudiante registra la emisión desde el chip de la tarjeta
- **THEN** la tarjeta muestra la emisión y su vencimiento.

### Requirement: Faltantes visibles en el resultado

Cuando "Completar trámite" está deshabilitado por el resultado, el paso de resultado SHALL listar bajo "Falta para completar" cada faltante del resultado.

#### Scenario: Resultado incompleto

- **WHEN** el resultado del trámite no tiene su archivo
- **THEN** el paso de resultado lista "Adjuntar: <documento>" bajo "Falta para completar".
