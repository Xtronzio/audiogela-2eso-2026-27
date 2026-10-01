# FIKI · Unidad 1 · 2.º ESO

Materia y medida / Materia eta neurketa, adaptada del temario aportado para Irati.

- Cuatro bloques de teoría con texto y audio en castellano y euskera.
- Banco de 100 preguntas por idioma: cinco niveles de 20, rondas de 10 sin repetir la mitad anterior.
- Ejercicios del temario y práctica con valores nuevos: conversiones, ordenación, materia, cambios, propiedades y densidad.
- Soluciones y razonamiento visibles tras enviar una respuesta completa. Una entrada numérica inválida o sin unidad no revela la solución.
- Fichas imprimibles en blanco o con las correcciones de los ejercicios ya respondidos.
- Podcast independiente `feed-fiki.xml`: temporada 1 CAST, temporada 2 EUS; cuatro episodios en cada una.

El corrector funciona en el navegador, sin cuentas ni envío de respuestas a un servidor. Solo se guarda en el dispositivo qué preguntas de teoría se han usado. Acepta coma/punto decimal, agrupación con espacios, fracciones y notación científica; comprueba la unidad solicitada. La clasificación de propiedades admite las tres etiquetas en distinto orden y sin tildes.

## Verificación y generación

`node scripts/test-fiki.mjs` verifica el corrector y los bancos.

`python scripts/fiki-audio.py` genera los ocho MP3 (requiere edge-tts y ffmpeg). Voces: es-ES-ElviraNeural para castellano y en-US-EmmaMultilingualNeural para euskera. Audios de una sola voz; revisar la pronunciación con Irati durante la validación educativa.

`node scripts/build-fiki.mjs` actualiza las páginas, el catálogo y el RSS con las duraciones y tamaños reales. Requiere ffprobe. Conserva los contenidos y feeds anteriores.

En el temario, color y suavidad se clasifican como generales, y dureza como cuantitativa mediante escalas. Se mantiene ese criterio. La teoría aclara que la reversibilidad no es una regla absoluta para distinguir cambios y que algunas propiedades características dependen de las condiciones. Las unidades y equivalencias siguen el [BIPM](https://www.bipm.org/en/publications/si-brochure/).

Estado: publicación para validación por Irati. No implica validación educativa ni comprobación en un iPhone físico.
