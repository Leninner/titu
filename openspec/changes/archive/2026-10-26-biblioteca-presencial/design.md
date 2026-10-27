## Context

El aviso de Biblioteca FISEI (fuente `BIB-01`) reemplaza el envío por correo descrito en UT-22 y UT-23 para la revisión sin firmas. El aval final y las firmas no cambian.

## Decisions

- **Guía del trámite.** El paso del estudiante pasa de `send` a `deliver`: acercarse a Biblioteca FISEI el 10 de noviembre de 8:30 a 12:30 o de 14:30 a 16:30. El paso de Biblioteca nombra a Monica Paredes. Las notas dicen que no se envía por correo, que es la única fecha y que sin aprobar la revisión no se emite el aval.
- **Sin paso Enviar.** `WorkflowDefinition.inPerson` marca los trámites que se entregan en persona. Con esa marca, `taskSteps` devuelve solo Preparar y Resultado, y la siguiente acción pasa a ser acudir y registrar el resultado. Completar no exige un envío registrado, así que el resultado se sube directamente. Tampoco se piden capturas del correo de respuesta, porque no hay correo.
- **Qué llevar listo.** Va en las notas: índice, formato, resumen ejecutivo, abstract y palabras clave. No se añaden requisitos nuevos, porque son partes del mismo trabajo.
- **Calendario.** Evento `biblioteca-revision` de tipo `appointment` el 2026-11-10 a las 08:30, con los dos horarios en el título, para Proyecto y Artículo y con fuente `BIB-01`. El modelo solo guarda una hora, así que el título conserva el segundo horario.
- **Fuente.** `BIB-01` guarda el texto del aviso en `public/sources/BIB-01.txt`. UT-22 y UT-23 se mantienen como fuente del trámite; la discrepancia queda en las notas.
