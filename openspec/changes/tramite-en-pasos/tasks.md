## 1. Modelo y catálogo

- [ ] 1.1 Añadir `outputs` a `WorkflowDefinition`, `optional` al requisito y `outputVersionIds` a `TaskRecord` con valor por defecto. Verificar con `pnpm typecheck`.
- [ ] 1.2 Fusionar en `src/catalog/workflows.ts` aprobación, calificaciones, aval inicial y aval final; declarar salidas según design.md; reapuntar dependencias; separar `resolucion-designacion` y `resolucion-tramite`; añadir `respuesta` y `notificacion-defensa`. Verificar en `tests/unit/catalog.test.ts` que no hay referencias rotas ni trámites eliminados.
- [ ] 1.3 Reescribir títulos, etiquetas e instrucciones como hechos del trámite y nombres de categorías en `document-categories.ts` y `file-names.ts`, corrigiendo `aval-biblioteca`. Verificar que ninguna instrucción menciona la aplicación.

## 2. Dominio

- [ ] 2.1 Evaluar salidas: faltantes de salida, regla de completar y estado de cada paso (Preparar, Enviar, Resultado, pasos ocultos). Probar en `tests/unit/task-steps.test.ts`.
- [ ] 2.2 Generalizar `evidenceIdsForTask` al encadenamiento de salidas para trámites `pending`/`preparing`, con selección guardada. Probar autoselección, trámites enviados y desmarcado.
- [ ] 2.3 Calcular "Se usa en" por categoría y modalidad. Probar con la resolución de Consejo.

## 3. Migración

- [ ] 3.1 Migrar expediente y respaldos: fusión de registros, reasignación de envíos, notas, valores e historial, estados según design.md y paso de entradas a salidas. Probar en `tests/integration/storage.test.ts` cada escenario de la spec, incluida la restauración de un respaldo antiguo.

## 4. Interfaz

- [ ] 4.1 Componente de barra de pasos con patrón ARIA tabs y estado por paso; abrir en el primer paso incompleto.
- [ ] 4.2 Reorganizar `WorkflowPage` en Preparar, Enviar y Resultado; Resultado con tarjetas de salida, capturas, "Completar trámite", "Hay una observación" y "Reabrir trámite"; historial y fuentes en el pie; barra fija que cambia de pestaña.
- [ ] 4.3 Modal del mapa con las tarjetas del paso activo.
- [ ] 4.4 Eliminar textos de indicación listados en design.md.
- [ ] 4.5 Actualizar tests de integración y e2e. Verificar con `playwright-cli` en escritorio y móvil: propuesta, subir resolución, completar y verla seleccionada en calificadores.

## 5. Cierre

- [ ] 5.1 `pnpm typecheck`, `pnpm lint`, `pnpm test` y `pnpm test:e2e` en verde; `openspec validate tramite-en-pasos`.
