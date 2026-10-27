# AUDIO GELA · 2.º ESO · 2026/27

Aula sonora bilingüe para estudiar, comprender y repasar contenidos de 2.º ESO.

> **Ikasi entzunez · Aprende escuchando.**

## Acceso

- **Web:** <https://xtronzio.github.io/audiogela-2eso-2026-27/>
- **Podcast RSS:** <https://xtronzio.github.io/audiogela-2eso-2026-27/feed.xml>

Este repositorio contiene un aula independiente de 2.º ESO. Puede enlazarse desde un portal general de AUDIO GELA sin cambiar su URL, su estructura ni el RSS del podcast.

## Estado actual

Primera unidad de Historia completa en castellano y euskera:

- 6 temas.
- 12 audios: 6 `CAST` y 6 `EUS`.
- 12 autoevaluaciones interactivas.
- 1.200 preguntas interactivas: 100 por tema e idioma.
- 12 autoevaluaciones imprimibles.
- 300 actividades escritas: 25 por tema e idioma.
- Podcast organizado como serie en dos temporadas.

## Historia · Unidad 1 · Edad Media

| Tema | Castellano | Euskara |
|---|---|---|
| T01 | Cómo comenzó la Edad Media | Nola hasi zen Erdi Aroa |
| T02 | El Imperio bizantino | Bizantziar Inperioa |
| T03 | Los reinos germánicos | Erresuma germaniarrak |
| T04 | El reino visigodo | Bisigodoen erresuma |
| T05 | El Imperio carolingio | Karolingiar Inperioa |
| T06 | Nacimiento y expansión del islam | Islamaren sorrera eta hedapena |

## Modelo de aprendizaje

Cada tema dispone de tres recursos coordinados:

1. **Audio:** explicación completa y resumen final.
2. **Autoevaluación interactiva:** cinco niveles progresivos.
3. **Autoevaluación imprimible:** 25 actividades escritas y soluciones separadas.

El castellano funciona como capa de comprensión e interiorización. El euskera permite consolidar el vocabulario y preparar la evaluación en el idioma en el que se imparte la materia.

## Lógica de las autoevaluaciones

Cada idioma y tema contiene cinco niveles:

1. Conocimiento básico.
2. Comprensión.
3. Relaciones y cronología.
4. Análisis histórico.
5. Competencial avanzado.

Cada nivel utiliza este sistema:

- Banco de 20 preguntas.
- 10 preguntas por intento.
- Segundo intento con las otras 10, sin repeticiones.
- Orden aleatorio de preguntas y respuestas.
- Mejor puntuación guardada en el navegador.
- Umbral recomendado de superación: 80 %.

Las opciones se revisan con un filtro antipatrón: la respuesta correcta no puede deducirse por su longitud, posición, estructura gramatical o nivel de detalle.

## Podcast bilingüe

El RSS está configurado como podcast de tipo `serial`, con reproducción secuencial:

- **Temporada 1:** castellano.
- **Temporada 2:** euskera.

Cada temporada contiene los episodios T01–T06. Los títulos incorporan `CAST` o `EUS`, y cada episodio conserva un identificador único para evitar duplicados al actualizar el canal.

Los futuros temas se añadirán a ambas temporadas con el mismo número de episodio. Los podcasts de otros cursos se mantendrán separados.

## Convención de archivos

### Audios

```text
NN-historia-uU-descripcion.mp3
NN-historia-eus-uU-descripcion.mp3
```

### Autoevaluaciones

```text
test-historia-uU-tNN-cast.html
test-historia-uU-tNN-eus.html
ficha-historia-uU-tNN-cast.html
ficha-historia-uU-tNN-eus.html
```

### Archivos generales

- `index.html`: portada y navegación del aula.
- `feed.xml`: canal privado del podcast.
- `portada.jpg`: carátula del podcast.
- `logo-audiogela.png`: identidad gráfica.
- `favicon.png`: icono del navegador.
- `apple-touch-icon.png`: acceso directo en iPhone y iPad.

## Cómo añadir nuevos contenidos

Para incorporar un tema nuevo:

1. Preparar y validar el guion educativo.
2. Crear los audios en castellano y euskera.
3. Crear 100 preguntas por idioma, distribuidas en cinco niveles.
4. Comprobar rotación 10+10 y filtro antipatrón.
5. Crear las fichas imprimibles y sus soluciones.
6. Añadir ambos idiomas a `index.html`.
7. Incorporar los episodios a sus temporadas en `feed.xml`.
8. Verificar enlaces, duraciones, tamaños de audio e identificadores RSS.

Para añadir una asignatura o unidad nueva se debe conservar la jerarquía:

```text
Asignatura → Idioma → Unidad → Tema
```

## Integración con el portal general

Esta aula está preparada para funcionar como destino independiente dentro de un futuro portal distribuidor:

```text
AUDIO GELA
├── 2.º ESO · 2026/27
└── 4.º ESO · 2026/27
```

El portal general solo enlazará cada aula. Los repositorios, páginas, materiales y podcasts permanecerán separados para que puedan evolucionar sin interferencias.

## Versionado

- `v1.0`: Historia U1 completa en castellano y euskera.
- `v1.x`: correcciones y nuevas unidades o asignaturas dentro de 2.º ESO.
- Los cambios estructurales importantes podrán utilizar una nueva versión principal.

Antes de cada versión estable se conservará una copia completa del repositorio.

## Historia · GIZA · U1 · T07 — Al-Ándalus

Añadido en castellano y euskera después del tema 6. Incluye las seis etapas
políticas, agricultura/comercio/artesanía y los grupos sociales del resumen
aportado por el usuario (apartados 8, 9 y 10). Conserva las fechas del esquema
para estudiar; distingue el inicio nazarí de 1232 y la capital en Granada en 1238.

Cada idioma tiene audio con resumen y repaso oral, texto del audio, cinco
niveles de 20 preguntas con rotación 10+10 y una ficha de 25 actividades con
soluciones separadas. Los episodios usan el RSS de Historia existente, temporada
1 (CAST) y 2 (EUS), número 7. Las narraciones se generan por párrafos y el
manifiesto registra voz, duración, tamaño y huella del texto.

```sh
python scripts/alandalus-audio.py  # edge-tts, gTTS y ffmpeg
node scripts/build-alandalus.mjs # integración inicial; evita duplicados
# Validación antes de publicar; requiere linkedom instalado en el entorno:
node scripts/validate-alandalus.mjs
```

Los guiones enlazan las comprobaciones de cronología del Ministerio de Cultura
y del Patronato de la Alhambra. El material anterior y los RSS de FIKI y Euskara
se conservan.

## Voz de Historia en euskera y textos de todos los audios

Historia en euskera utiliza Google TTS con idioma `eu`, el sistema validado
para los temas 1–6. Al-Ándalus se ha corregido con esa misma voz. No generar
los audios de Historia en euskera con una voz configurada para castellano.

Los 22 apartados actuales (14 de GIZA y 8 de FIKI) enlazan el texto completo
de su narración, con lectura, reproductor e impresión. Los guiones originales
se conservan en `scripts/narrations/`; T07 usa `scripts/alandalus-content.json`.
Todo nuevo apartado debe incluir también el texto exacto de su audio.

Al corregir un audio ya publicado, usar un nombre de MP3 nuevo para evitar
la caché y mantener el GUID, temporada y número del episodio en el RSS.

```sh
python scripts/alandalus-google-audio.py
python scripts/finalize-audio-repair.py
python scripts/build-audio-texts.py
python scripts/validate-audio-texts.py
```


## GIZA · Unidad 2 · Siete subtemas independientes

Rehecha siguiendo la estructura del material de clase y el modelo de U1.
La versión agrupada en cinco bloques fue retirada del catálogo, del RSS y del
repositorio. Sus archivos de audio y recursos ya no forman parte de la web.

El contenido autorizado abarca los apartados 1–7 de `TEMA 2(1).pdf`. No se
incorporan los apartados 8–10. Cada subtema conserva su numeración y contiene
únicamente la explicación y la práctica de su apartado:

| Subtema | Contenido | Páginas del PDF |
|---|---|---|
| T01 | Por qué se implantó el feudalismo | 3–4 |
| T02 | A quién beneficiaba la sociedad estamental | 5–6 |
| T03 | Cómo se organizaba un feudo | 7–8 |
| T04 | Cómo vivían los nobles | 9–10 |
| T05 | El castillo y sus funciones defensivas y cotidianas | 11–12 |
| T06 | Cómo vivían los campesinos | 13–14 |
| T07 | El lugar de la Iglesia en la sociedad feudal | 15–16 |

Cada idioma dispone de siete explicaciones desarrolladas, con introducción,
explicación clara de conceptos y relaciones, ejemplos y resumen final. Se
conservan las voces de Historia: `es-ES-ElviraNeural` a `-3%` y Google TTS `eu`.
Los archivos `r2.mp3` son nuevos y evitan reutilizar en caché los cinco bloques
retirados. Las transcripciones enlazadas contienen exactamente lo narrado.

Por subtema e idioma hay cinco niveles de 20 preguntas, con rondas de 10+10
sin repetición, corrección razonada y mejor puntuación guardada. La ficha
imprimible tiene 25 actividades y soluciones en sección separada; las primeras
20 actividades distribuyen los conceptos del apartado, sin repetir siempre
los mismos cinco. Total: 14 audios, 1.400 preguntas y 350 actividades escritas.

El podcast conserva las temporadas por idioma: 1 CAST, 2 EUS. U2 ocupa los
episodios 8–14 de cada temporada, con nuevos GUID `u2-t01` a `u2-t07`. Los diez
GUID de los bloques rechazados `u2-b01` a `u2-b05` están ausentes del RSS.

Fuentes editables y construcción:

```sh
python scripts/giza-u2-audio.py --lang cast
python scripts/giza-u2-audio.py --lang eus
python scripts/build-giza-u2.py
AUDIOGELA_QA_MODULES=/ruta/a/linkedom node scripts/validate-giza-u2.mjs
```

El manifiesto registra el PDF y su huella, la correspondencia de apartados y
las voces. Los manifiestos de audio guardan las huellas de texto, duraciones y
tamaños. La generación castellana verifica todos los límites de palabra;
ambos idiomas verifican párrafos y decodificación. Los archivos completos se
publican después de validar la concatenación. La página 16 del PDF repite la
15; la referencia no supone dos apartados diferentes.
