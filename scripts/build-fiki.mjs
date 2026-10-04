import {readFileSync,writeFileSync,statSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {unit,audioFile} from '../fiki/u1-data.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const base='https://xtronzio.github.io/audiogela-2eso-2026-27/';
const xml=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const icons=`<link rel="icon" href="/audiogela-2eso-2026-27/favicon.ico?v=20261001" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/audiogela-2eso-2026-27/favicon-32x32.png?v=20261001">
<link rel="apple-touch-icon" sizes="180x180" href="/audiogela-2eso-2026-27/apple-touch-icon.png?v=20261001">
<link rel="manifest" href="/audiogela-2eso-2026-27/site.webmanifest?v=20261001">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="AUDIO GELA 2.º"><meta name="apple-mobile-web-app-status-bar-style" content="default">`;
const durations={};
for(const lang of ['cast','eus'])for(let i=0;i<4;i++){
  const file=audioFile(lang,i);
  const seconds=Math.round(Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',root+file],{encoding:'utf8'})));
  durations[file]={seconds,label:`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`,bytes:statSync(root+file).size};
}
for(const lang of ['cast','eus']){
  const cast=lang==='cast', data=unit[lang],t=(es,eu)=>cast?es:eu;
  writeFileSync(root+`fiki-u1-${lang}.html`,`<!doctype html>
<html lang="${cast?'es':'eu'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${icons}
<meta name="theme-color" content="#0b438f"><title>FIKI · ${data.title} · AUDIO GELA 2.º ESO</title>
<meta name="description" content="${t('Unidad 1 de Física y Química: teoría, audio, autoevaluación y ejercicios con corrección razonada.','Fisika eta Kimikako 1. unitatea: teoria, audioa, autoebaluazioa eta arrazoitutako zuzenketa duten ariketak.')}">
<link rel="alternate" type="application/rss+xml" title="AUDIO GELA · FIKI" href="feed-fiki.xml"><link rel="stylesheet" href="fiki/style.css?v=20261004-r2">
</head><body><main><a class="back" href="index.html#asignatura-fiki">← ${t('Asignaturas · 2.º ESO','Irakasgaiak · DBH 2')}</a>
<header><img class="logo" src="icon-192.png" alt="AUDIO GELA"><div><div class="eyebrow">FIKI · ${t('2.º ESO · Unidad 1','DBH 2 · 1. unitatea')}</div><h1>${data.title}</h1><div class="header-bottom"><span class="muted">${data.subject} · 2026/27</span><a id="language-link" class="lang-link" href="fiki-u1-${cast?'eus':'cast'}.html">${cast?'Euskara →':'Castellano →'}</a></div></div></header>
<nav class="tabs" id="tabs" aria-label="${t('Secciones de estudio','Ikasteko atalak')}"></nav><nav class="topic-buttons" id="blocks" aria-label="${t('Elegir bloque','Blokea aukeratu')}"></nav><div id="content"></div><noscript><p>${t('Activa JavaScript para utilizar la autoevaluación y los ejercicios.','Aktibatu JavaScript autoebaluazioa eta ariketak erabiltzeko.')}</p>${data.topics.map((v,i)=>`<h2>${v.title}</h2><audio controls src="${audioFile(lang,i)}"></audio>${v.paragraphs.map(p=>`<p>${p}</p>`).join('')}`).join('')}</noscript>
<footer>IKASI ENTZUNEZ · APRENDE ESCUCHANDO</footer></main><script type="module" src="fiki/app.mjs?v=20261004-r2"></script></body></html>\n`);
}
let html=readFileSync(root+'index.html','utf8');
// Idempotent managed section; history content and history feeds are preserved.
html=html.replace(/\n?<!-- FIKI BEGIN -->[\s\S]*?<!-- FIKI END -->\n?/,'\n');
const fiki=`<!-- FIKI BEGIN -->
<details class="subject remember" id="asignatura-fiki" style="margin-top:18px">
<summary class="subject-summary"><span class="subject-icon" aria-hidden="true">FQ</span><span class="summary-copy"><strong>Física y Química · FIKI</strong><span>Unidad 1 · Materia y medida · 2 idiomas</span></span><span class="summary-count">8 audios disponibles</span><span class="chevron" aria-hidden="true"></span></summary>
<div class="subject-body">${['cast','eus'].map(lang=>{
  const cast=lang==='cast',data=unit[lang],t=(es,eu)=>cast?es:eu;
  return `<details class="language remember" id="fiki-${lang}" ${cast?'open':''}><summary class="language-summary"><span class="language-badge">${cast?'CAST':'EUS'}</span><span class="summary-copy"><strong>${cast?'Castellano':'Euskara'}</strong><span>${t('4 bloques · teoría, ejercicios y ficha','4 bloke · teoria, ariketak eta fitxa')}</span></span><span class="chevron" aria-hidden="true"></span></summary><div class="language-body"><details class="unit remember" id="fiki-${lang}-u1" open><summary class="unit-summary"><span class="summary-copy"><strong>${t('Unidad 1','1. unitatea')} · ${data.title}</strong><span>${t('100 preguntas de teoría por bloque · ejercicios completos por bloque','100 teoria galdera bloke bakoitzeko · ariketa osoak blokeka')}</span></span><span class="chevron" aria-hidden="true"></span></summary><div class="episodes">${data.topics.map((v,i)=>{
    const file=audioFile(lang,i);
    return `<details class="episode" id="fiki-${lang}-u1-t${i+1}"><summary class="episode-summary"><span class="episode-number">T0${i+1}</span><span class="summary-copy"><strong>${v.title}</strong><span>${v.summary}</span></span><span class="duration">${durations[file].label}</span><span class="chevron" aria-hidden="true"></span></summary><div class="episode-body"><p>${v.summary}</p><audio controls preload="none" aria-label="${v.title}" src="${file}"></audio><div class="resources"><a class="resource primary" href="fiki-u1-${lang}.html?section=theory&topic=${i}">${t('Teoría y audio','Teoria eta audioa')}</a><a class="resource" href="test-fiki-u1-b${i+1}-${lang}.html">${t('Autoevaluación interactiva','Autoebaluazio interaktiboa')}</a><a class="resource" href="fiki-u1-${lang}.html?section=practice&topic=${i}">${t('Ejercicios de este bloque','Bloke honetako ariketak')}</a><a class="resource" href="ficha-fiki-u1-b${i+1}-${lang}.html">${t('Autoevaluación imprimible','Autoebaluazio inprimagarria')}</a><span class="resource-note">${t('Cinco niveles por bloque · ficha de 25 preguntas · ejercicios completos con resultado y razonamiento.','Bost maila bloke bakoitzeko · 25 galderako fitxa · ariketa osoak emaitzarekin eta arrazoibidearekin.')}</span></div></div></details>`;
  }).join('')}</div></details></div></details>`;
}).join('')}
</div></details>
<!-- FIKI END -->`;
html=html.replace('  </section>',fiki+'\n  </section>');
const picker='<nav class="resources" id="subject-picker" aria-label="Elegir asignatura" style="margin:0 0 18px"><a class="resource" href="#asignatura-historia">Historia · GIZA</a><a class="resource" href="#asignatura-fiki">Física y Química · FIKI</a></nav>';
if(html.includes('id="subject-picker"'))html=html.replace(/<nav[^>]*id="subject-picker"[^>]*>[\s\S]*?<\/nav>/,picker);
else html=html.replace('  <section aria-label="Catálogo de asignaturas">',picker+'\n  <section aria-label="Catálogo de asignaturas">');
html=html.replace('<strong>Historia</strong>','<strong>Historia · GIZA</strong>');
html=html.replace('7 audios disponibles','12 audios disponibles');
if(!html.includes('title="AUDIO GELA · FIKI"'))html=html.replace('<style>','<link rel="alternate" type="application/rss+xml" title="AUDIO GELA · FIKI" href="feed-fiki.xml">\n  <style>');
writeFileSync(root+'index.html',html);
const rss=`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel><title>AUDIO GELA · FIKI · 2.º ESO · 2026/27</title><link>${base}index.html#asignatura-fiki</link><description>Física y Química para Irati. Unidad 1: Materia y medida. Temporada 1 en castellano; temporada 2 en euskera. Teoría, autoevaluaciones y ejercicios en AUDIO GELA.</description><language>es</language><copyright>AUDIO GELA 2026</copyright><lastBuildDate>${new Date().toUTCString()}</lastBuildDate><atom:link href="${base}feed-fiki.xml" rel="self" type="application/rss+xml"/><itunes:author>AUDIO GELA</itunes:author><itunes:summary>Materia y medida · Materia eta neurketa. Cuatro bloques en castellano y euskera.</itunes:summary><itunes:image href="${base}portada.jpg"/><image><url>${base}portada.jpg</url><title>AUDIO GELA · FIKI</title><link>${base}index.html#asignatura-fiki</link></image><itunes:category text="Education"><itunes:category text="Courses"/></itunes:category><itunes:explicit>false</itunes:explicit><itunes:type>serial</itunes:type>
${['cast','eus'].map(lang=>unit[lang].topics.map((v,i)=>{
  const file=audioFile(lang,i),info=durations[file];
  return `<item><title>${lang==='cast'?'CAST':'EUS'} · U1 · ${i+1}. ${xml(v.title)}</title><link>${base}fiki-u1-${lang}.html?section=theory&amp;topic=${i}</link><guid isPermaLink="false">audiogela-fiki-2eso-2026-u1-${i+1}-${lang}</guid><pubDate>Sun, 04 Oct 2026 08:30:0${i} GMT</pubDate><description>${xml(v.summary)} ${lang==='cast'?'Versión corregida: teoría completa, autoevaluación independiente y ejercicios completos de este bloque.':'Bertsio zuzendua: teoria osoa, autoebaluazio independentea eta bloke honetako ariketa osoak. Ahotsa: gaztelaniazko ahoskera.'}</description><enclosure url="${base}${file}" length="${info.bytes}" type="audio/mpeg"/><itunes:duration>${info.seconds}</itunes:duration><itunes:season>${lang==='cast'?1:2}</itunes:season><itunes:episode>${i+1}</itunes:episode><itunes:episodeType>full</itunes:episodeType><itunes:explicit>false</itunes:explicit></item>`;
}).join('\n')).join('\n')}
</channel></rss>\n`;
writeFileSync(root+'feed-fiki.xml',rss);
console.log('Built two classrooms, eight audio entries and FIKI RSS.');
