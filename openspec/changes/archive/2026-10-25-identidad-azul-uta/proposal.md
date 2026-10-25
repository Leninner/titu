## Why

El morado no transmite el carácter académico de la herramienta ni la vincula con la Universidad Técnica de Ambato, cuyo sitio usa azul marino. Las tarjetas de Anexos repiten información (revisión, emisor y firmante en dos filas, aviso de campos) y las referencias ocupan tantas tarjetas como los formatos que se llenan.

## What Changes

- Identidad azul de la UTA: marino #0b2e59, acción #1d5fa8, fondos azulados. Los colores pasan a variables en `tokens.css` y los tonos morados del resto de estilos se convierten a su equivalente azul. Favicon y `theme-color` también.
- Tarjetas de anexos más limpias: número del anexo como etiqueta y título grande, mes del informe como subtítulo, una línea de personas, estado con punto de color sin número de revisión, acción principal Abrir o Crear y un menú Descargar con Word y PDF.
- Un borrador con campos obligatorios vacíos muestra el estado "Faltan datos" y Descargar deshabilitado.
- Los formatos de referencia pasan a una lista compacta de enlaces al final de cada etapa.
- Firmantes del Anexo 1 según la modalidad: en Complexivo, solo el estudiante.

## Capabilities

### Modified Capabilities

- `workspace-interface`: identidad azul y tarjetas de anexos simplificadas.

## Impact

- `src/styles/*.css`, `src/features/**/*.css`, `src/components/ui/button.tsx`, `WorkflowPage.tsx`, `tailwind.generated.css`, `index.html`, `public/favicon.svg`, `DESIGN.md`.
- `src/domain/annex-index.ts`, `src/catalog/templates.ts`, `src/features/annexes/AnnexIndexCard.tsx`, `AnnexLibrary.tsx`, nuevo hook `src/components/useDismiss.ts` compartido con `TaskMoreMenu`.
