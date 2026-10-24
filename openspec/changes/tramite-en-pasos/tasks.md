## 1. Modelo y catálogo

- [x] 1.1 Añadir `outputs` a `WorkflowDefinition`, `optional` al requisito y `outputVersionIds` a `TaskRecord` con valor por defecto. Verificar con `pnpm typecheck`.
- [x] 1.2 Fusionar en `src/catalog/workflows.ts` aprobación, calificaciones, aval inicial y aval final; declarar salidas según design.md; reapuntar dependencias; separar `resolucion-designacion` y `resolucion-tramite`; añadir `respuesta` y `notificacion-defensa`. Verificar en `tests/unit/catalog.test.ts` que no hay referencias rotas ni trámites eliminados.
- [x] 1.3 Reescribir títulos, etiquetas e instrucciones como hechos del trámite y nombres de categorías en `document-categories.ts` y `file-names.ts`, corrigiendo `aval-biblioteca`. Verificar que ninguna instrucción menciona la aplicación.

## 2. Dominio

- [x] 2.1 Evaluar salidas: faltantes de salida, regla de completar y estado de cada paso (Preparar, Enviar, Resultado, pasos ocultos). Probar en `tests/unit/task-steps.test.ts`.
- [x] 2.2 Generalizar `evidenceIdsForTask` al encadenamiento de salidas para trámites `pending`/`preparing`, con selección guardada. Probar autoselección, trámites enviados y desmarcado.
- [x] 2.3 Calcular "Se usa en" por categoría y modalidad. Probar con la resolución de Consejo.

## 3. Migración

- [x] 3.1 Migrar expediente y respaldos: fusión de registros, reasignación de envíos, notas, valores e historial, estados según design.md y paso de entradas a salidas. Probar en `tests/integration/storage.test.ts` cada escenario de la spec, incluida la restauración de un respaldo antiguo.

## 4. Interfaz

- [x] 4.1 Componente de barra de pasos con patrón ARIA tabs y estado por paso; abrir en el primer paso incompleto.
- [x] 4.2 Reorganizar `WorkflowPage` en Preparar, Enviar y Resultado; Resultado con tarjetas de salida, capturas, "Completar trámite", "Hay una observación" y "Reabrir trámite"; historial y fuentes en el pie; barra fija que cambia de pestaña.
- [x] 4.3 Modal del mapa con las tarjetas del paso activo.
- [x] 4.4 Eliminar textos de indicación listados en design.md.
- [x] 4.5 Actualizar tests de integración y e2e. Verificar con `playwright-cli` en escritorio y móvil: propuesta, subir resolución, completar y verla seleccionada en calificadores.

## 5. Ajustes tras revisión del usuario

- [x] 5.1 Eliminar la barra fija "Siguiente paso" y su lógica. Verificar que no queda en el DOM.
- [x] 5.2 Pasos como segmentos completos con estado por color e ícono. Verificar con `playwright-cli` en escritorio y móvil.
- [x] 5.3 Menú "⋯" con Historial de estados y Fuentes y criterios en diálogos. Probar en integración.
- [x] 5.4 Enviar con solo asunto y cuerpo, y botón "Confirmar envío" sin fecha. Probar en integración.
- [x] 5.5 Requisitos de la propuesta según el Anexo 1, sin checkbox de avales. Probar en `tests/unit/catalog.test.ts`.
- [x] 5.6 Anexo 5: subida múltiple, análisis del formato y del mes, cobertura de meses y asignación manual. Probar análisis y cobertura en unit e integración.
- [x] 5.7 Corregir el catálogo con las diferencias encontradas al revisar todos los anexos.
- [x] 5.8 Etiquetas cortas con detalle en tooltip en todos los requisitos del catálogo. Probar en integración y verificar con `playwright-cli`.
- [x] 5.9 Resumen de una frase por trámite y diálogo "Cómo se tramita" con las instrucciones en viñetas. Probar en integración y en `tests/unit/catalog.test.ts`.
- [x] 5.10 Tarjetas por mes con "Agregar mes" y completado automático de los informes mensuales, sin pasos ni correo. Probar en unit, integración y e2e, y verificar con `playwright-cli`.
- [x] 5.11 Flechas con punta en las conexiones del mapa. Verificar con `playwright-cli`.
- [x] 5.12 Editor del Anexo 11 en Preparar con actividades leídas de los Anexo 5 subidos, envío por correo y Anexo 11 firmado como resultado encadenado; migración de `final` a salida. Probar en unit, integración y e2e.
- [x] 5.13 Notas de los formatos de informe como tooltip, fuera del documento y la exportación. Probar en integración.
- [x] 5.14 Avance de la tesis en los informes mensuales: porcentaje actual en una franja compacta y porcentaje con diferencia en cada tarjeta. Probar en unit e integración y verificar con `playwright-cli`.
- [x] 5.14 Anexo 11 en solo lectura en el modal del mapa. Probar en integración y verificar con `playwright-cli`.
- [x] 5.15 Encabezado compacto: título en el breadcrumb con responsable y menú, pasos más bajos y acciones del Anexo 11 como íconos.
- [x] 5.16 "Cómo se tramita" como línea de tiempo con íconos y responsables, botón a la derecha del resumen.
- [x] 5.17 Espacio de firma del tutor en los Anexos 5 y 11: 3 cm libres sobre una línea de 9,7 cm en PDF y Word, sin la etiqueta "NOMBRE Y FIRMA". Probar en `tests/integration/annex-exports.test.ts` y revisar los archivos exportados.
- [x] 5.18 Catálogo de calificadores del Proyecto contrastado con el Anexo 10: detalle de cédula y matrícula, guía con suplentes, calendario, orden cronológico, plazos del promedio menor a 7 y contacto. Probar en `tests/unit/catalog.test.ts`.
- [x] 5.19 Cartas exportadas solo como carta, desde la fecha y con bloques espaciados, con fecha dd/mm/aaaa, 3 cm para la firma y notas del formato en el tooltip sin restos `HYPERLINK`. Probar en `tests/integration/annex-exports.test.ts`.
- [x] 5.20 Botón "Formato" en las tarjetas con plantilla (Anexo 10) con diálogo editable y descarga Word y PDF sin guardar en Documentos. Probar en integración y verificar con `playwright-cli` en escritorio y móvil.
- [x] 5.21 Datos de la empresa en el perfil (Ajustes) con migración desde los borradores, cartas de empresa fieles a UT-08 y UT-18 y botón "Formato" en el Anexo 3 y en el cumplimiento empresarial. Probar en unit e integración y verificar con `playwright-cli`.
- [x] 5.22 Quitar el pie de página y el encabezado repetido de la tabla de las actividades leídas de los Anexo 5 y al armar el Anexo 11. Probar en `tests/unit/monthly-report.test.ts`.
- [x] 5.23 Botón "Formato" del Anexo 14 por modalidad y firma con dirección y correo institucional según los formatos. Probar en unit e integración y verificar con `playwright-cli`.

## 6. Cierre

- [ ] 6.1 `pnpm typecheck`, `pnpm lint`, `pnpm test` y `pnpm test:e2e` en verde; `openspec validate tramite-en-pasos`.
