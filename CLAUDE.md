# Signo Consultorio — instrucciones para Claude

Programa de una sola página (HTML autocontenido) del Dr. Yassir Dumani (Signo · Medicina Integral, Guayaquil). Publicado con GitHub Pages en la raíz de este repo.

- **No editar `index.html` a mano.** Se genera: `python3 fuente/app/build.py` → crea `fuente/app/Signo Consultorio.html`; copiarlo a `index.html` en la raíz.
- Después de cada cambio: actualizar la versión en `sw.js` (const CACHE) para que los equipos reciban la nueva versión, y probar con Playwright (Chromium en /opt/pw-browsers/chromium).
- Fuentes: `fuente/app/` (template.html, atencion.js, growth.js, sive.js, xlsx.js, lab.js, send.js, build.py), `fuente/msp/` (msp.js motor de formularios, gen.py genera forms.json desde las plantillas oficiales `src/*.xlsx`), `fuente/who/growth.json` (LMS OMS).
- Los datos de pacientes viven solo en localStorage (clave `signo_consultorio_v1`) del navegador; nunca subir datos de pacientes al repo. Mantener compatibilidad hacia atrás del formato de datos.
- Usuario hispanohablante, médico, no programador: explicar en español sencillo.
