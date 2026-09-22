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
