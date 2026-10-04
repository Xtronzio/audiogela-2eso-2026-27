# FIKI · Unidad 1 · 2.º ESO

Materia y medida / Materia eta neurketa, adaptada del PDF de 38 páginas aportado para Irati.

## Organización por bloques

1. Materia, ciencia y cambios físicos y químicos (PDF 2–10).
2. Propiedades de la materia (PDF 11–18).
3. Magnitudes, Sistema Internacional y conversiones (PDF 19–30).
4. Densidad, flotación y principio de Arquímedes (PDF 31–37).

Cada bloque e idioma tiene teoría y audio, una autoevaluación independiente de cinco niveles (20 preguntas por nivel; rondas de 10+10), una autoevaluación imprimible de 25 actividades con soluciones separadas y sus ejercicios propios. La autoevaluación utiliza la misma presentación y corrección inmediata que Historia. Los ejercicios se corrigen tras enviar todos los apartados completos, mostrando el resultado y razonamiento de cada uno. La selección de ejercicios del temario muestra todas las actividades, no una muestra aleatoria limitada a diez.

Cobertura por idioma: 74 apartados de ejercicios distribuidos 28/22/14/10 entre los cuatro bloques. Incluye los diez ejemplos de materia, diez cuerpos/sistemas, ocho cambios, las ocho propiedades originales, el texto íntegro del aceite con seis propiedades, la tabla original de seis columnas, todos los apartados de los ejercicios 68–72 y comparaciones/práctica de densidad y flotación. Los cálculos de densidad complementan las preguntas conceptuales de las diapositivas. La opción «otros datos» solo utiliza ejercicios del bloque seleccionado.

La teoría incluye las seis definiciones explícitas, ejemplos y tabla. Se conserva el criterio de las soluciones del colegio: color y suavidad son generales; dureza medida mediante escalas es cuantitativa. El bloque de densidad incluye Arquímedes. Al final de cada audio hay resumen y examen oral.

## Voz y podcast

Los ocho audios de la revisión r2 se regeneraron con `es-ES-ElviraNeural` (español de España), velocidad -5 %. La voz española lee el texto en euskera para evitar el acento inglés/francés; no se presenta como una voz nativa de euskera. La voz nativa `eu-ES-AinhoaNeural` no estaba disponible en el servicio utilizado; la petición de prueba no produjo audio. La pronunciación educativa queda pendiente de escucha por Irati/Jorge.

Cada párrafo se genera y comprueba por separado antes de unirlo. `audio-manifest.json` registra voz, huella del texto, segmentos, duración y bytes. Nuevos nombres `*-r2.mp3` evitan reutilizar las descargas anteriores en navegador/podcast. Se mantienen el RSS `feed-fiki.xml` y los GUID de los ocho episodios, con enclosures actualizados. Los MP3 anteriores se conservan para enlaces antiguos; el aula y el RSS solo apuntan a r2.

## Generación y comprobación

- `PYTHONPATH=<dependencias edge-tts> python scripts/fiki-audio.py`: genera los ocho audios y omite únicamente los que coinciden con la huella actual.
- `node scripts/build-fiki-evaluations.mjs`: genera ocho tests y ocho fichas de teoría.
- `node scripts/build-fiki.mjs`: actualiza las dos páginas de teoría/ejercicios, el catálogo y el RSS usando duración y bytes reales.
- `node scripts/test-fiki.mjs`: corrector, unidades, bancos, cobertura del PDF, respuestas completas/parciales y soluciones.
- `node scripts/validate-fiki.mjs`: páginas, referencias, bancos publicados, RSS, audios completos y conservación de Historia.

Las respuestas permanecen en el navegador; no hay cuentas ni envío a servidor. Solo se guardan resultados y rotación de tests en el dispositivo, con claves separadas por bloque e idioma. Se aceptan coma/punto decimal, espacios para miles, fracciones y notación científica. Las tres etiquetas de propiedades admiten cualquier orden. Las unidades siguen el [BIPM](https://www.bipm.org/en/publications/si-brochure/).
