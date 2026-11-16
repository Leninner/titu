## Decisions

- `parseApprovalResolution(text)` es una función pura que devuelve solo los datos encontrados, con expresiones basadas en la redacción de las resoluciones FISEI ("Resolución XXXX-P-CD-FISEI-UTA-AAAA", "en sesión ... del día D de M de AAAA", "DESIGNAR COMO TUTOR/A ... A EL/LA ...").
- La fecha de aprobación es la de la sesión de Consejo Directivo. El tema se conserva tal como figura en la resolución.
- La lectura usa `extractText`, el mismo lector de PDF de los Anexo 5. Si no hay texto, se avisa y no se cambia nada.
- La revisión muestra cada dato encontrado junto al valor actual; vienen marcados los que difieren. Al confirmar se guarda el perfil con `repository.saveProfile` y el PDF con `repository.addDocumentVersion` en la categoría `resolucion`.
- `ProfileField` admite `placeholder` para el ejemplo del número de resolución.
