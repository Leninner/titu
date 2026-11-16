## Decisions

- `RequestEmail.attachments` pasa a `Requirement.letterAppendices`: son documentos que se unen al PDF de la solicitud, no adjuntos del correo. `RequestEmail.attach` describe en pocas palabras qué adjuntar al correo.
- `AnnexDraftEditor` recibe `pdf: { label, appendices }`. `RequestButton` arma la etiqueta ("PDF + cédula") con los anexos disponibles y muestra en `extraActions` un enlace "Falta cédula" a Documentos.
- `Requirement.notice` queda como una línea corta con ícono de reloj, sin recuadro. Cada trámite declara su propio aviso.
- `Requirement.checklist` se muestra como `<details>` con conteo ("Páginas obligatorias · 11").
- `WorkflowGuide.rubric` (criterio y puntaje) se dibuja en `GuideTimeline` como una lista compacta con el máximo de cada criterio y el total.
