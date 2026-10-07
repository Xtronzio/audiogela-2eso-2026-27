import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(p,s)=>fs.writeFileSync(path.join(root,p),s);
const data=JSON.parse(read('scripts/alandalus-content.json'));
const audio=JSON.parse(read('scripts/alandalus-audio-manifest.json'));
const sheet=JSON.parse(read('scripts/alandalus-worksheet.json'));
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const descriptions={cast:[['Conceptos básicos','Identificar fechas, protagonistas y grupos.'],['Comprensión','Explicar términos y distinguir ideas.'],['Relaciones y cronología','Ordenar etapas y conectar causas y consecuencias.'],['Análisis histórico','Interpretar ejemplos, datos y afirmaciones.'],['Competencial avanzado','Aplicar lo aprendido y construir explicaciones.']],eus:[['Oinarrizko kontzeptuak','Datak, protagonistak eta taldeak identifikatzea.'],['Ulermena','Terminoak azaltzea eta ideiak bereiztea.'],['Loturak eta kronologia','Etapak ordenatzea eta kausak eta ondorioak lotzea.'],['Analisi historikoa','Adibideak, datuak eta baieztapenak interpretatzea.'],['Gaitasun-maila aurreratua','Ikasitakoa aplikatzea eta azalpenak eraikitzea.']]};

export function parseQuestions(lang){
 const side=lang==='cast'?0:1;let level;
 const levels=[];
 for(const line of read('scripts/alandalus-questions.txt').split('\n')){
  if(!line.trim())continue;
  if(/^\[\d\]$/.test(line)){const n=Number(line[1]);const [nombre,descripcion]=descriptions[lang][n-1];level={nivel:n,nombre,descripcion,preguntas:[]};levels.push(level);continue;}
  const fields=line.split('|').map(x=>x.split('~')[side]);
  if(fields.length!==6||fields.some(x=>!x))throw Error('Invalid bilingual row');
  const [question,correct,...rest]=fields;const explanation=rest.pop();const options=[correct,...rest];
  const shift=level.preguntas.length%4;
  const rotated=options.slice(4-shift).concat(options.slice(0,4-shift));
  level.preguntas.push([question,rotated,shift,explanation]);
 }
 return levels;
}

function duration(lang){const seconds=Math.round(audio[lang].seconds);return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;}

function quiz(lang){
 const constant=`NIVELES_T07${lang==='eus'?'_EUS':''}`;
 write(`preguntas-historia-u1-t07-${lang}.js`,`const ${constant} = ${JSON.stringify(parseQuestions(lang),null,2)};\n`);
 let html=read(`test-historia-u1-t06-${lang}.html`);
 const begin=html.indexOf('<script>\nconst Q=');
 const end=html.indexOf('</script><script>',begin);
 if(begin<0||end<0)throw Error('Quiz scaffold missing');
 html=html.slice(0,begin)+`<script src="preguntas-historia-u1-t07-${lang}.js?v=20261007"></script><script>`+html.slice(end+'</script><script>'.length);
 html=html.replaceAll('t06','t07').replaceAll('T06','T07').replaceAll('TEMA 6','TEMA 7').replaceAll('6. GAIA','7. GAIA');
 html=html.replaceAll(lang==='cast'?'Nacimiento y expansión del islam':'Islamaren sorrera eta hedapena',data[lang].title);
 // Use a course-specific namespace, so scores never overlap with other classrooms.
 html=html.replaceAll('audiogela:t07:','audiogela:2eso:u1:t07:');
 write(`test-historia-u1-t07-${lang}.html`,html);
}

function worksheet(lang){
 const eu=lang==='eus',side=eu?1:0;
 let html=read(`ficha-historia-u1-t06-${lang}.html`).replaceAll('t06','t07').replaceAll('T06','T07');
 html=html.replaceAll(eu?'Islamaren sorrera eta hedapena':'Nacimiento y expansión del islam',data[lang].title);
 const first=html.indexOf('<ol class="questions">'),end=html.indexOf('</ol>',first);
 const questions=sheet.map((q,i)=>`<li><small>${eu?'Maila':'Nivel'} ${Math.floor(i/5)+1}</small> · ${esc(q[side])}<div class="write ${i>=22?'xlarge':'large'}"></div></li>`).join('\n');
 html=html.slice(0,first)+`<ol class="questions">\n${questions}\n`+html.slice(end);
 const marker=html.indexOf('id="solutions"');const start=html.indexOf('<ol>',marker),finish=html.indexOf('</ol>',start);
 if(start<0)throw Error('Solution scaffold missing');
 html=html.slice(0,start)+'<ol>\n'+sheet.map(q=>`<li>${esc(q[side+2])}</li>`).join('\n')+'\n'+html.slice(finish);
 write(`ficha-historia-u1-t07-${lang}.html`,html);
}

function transcript(lang){
 const eu=lang==='eus';const template=read(`ficha-historia-u1-t07-${lang}.html`);
 const head=template.slice(0,template.indexOf('</head>')).replaceAll(eu?'Autoebaluazio inprimagarria':'Autoevaluación imprimible',eu?'Audioaren testua':'Texto del audio');
 write(`guion-historia-u1-t07-${lang}.html`,head+`</head><body><nav class="toolbar"><a href="index.html#historia-${eu?'euskara':'castellano'}-u1-t07">← AUDIO GELA</a><button class="primary" onclick="window.print()">${eu?'Testua inprimatu':'Imprimir texto'}</button></nav><main class="page worksheet"><header><div class="brand">AUDIO GELA · 2.º ESO · HISTORIA · GIZA</div><h1>${esc(data[lang].title)}</h1></header>${data[lang].paragraphs.map(p=>`<p style="line-height:1.65">${esc(p)}</p>`).join('\n')}<p class="instructions">${eu?'Gelako materiala: Al-Andalusen laburpena, 8., 9. eta 10. atalak.':'Material de clase: resumen de Al-Ándalus, apartados 8, 9 y 10.'}</p><div class="instructions">${eu?'Kronologiaren egiaztapena':'Comprobación de la cronología'}: <a href="https://tesauros.cultura.gob.es/tesauros/contextosculturales/1006736.html">Ministerio de Cultura · Emirato</a> · <a href="https://tesauros.cultura.gob.es/tesauros/contextosculturales/1006745.html">Califato</a> · <a href="https://www.alhambra-patronato.es/elemento-del-mes/el-origen-del-reino-nazari-y-de-la-alhambra">Patronato de la Alhambra · Nazarí</a></div></main><style>@media print{.worksheet{display:block!important}}</style></body></html>\n`);
}

function episode(lang){const eu=lang==='eus';return `<details class="episode" id="historia-${eu?'euskara':'castellano'}-u1-t07"><summary class="episode-summary"><span class="episode-number">T07</span><span class="summary-copy"><strong>${esc(data[lang].title)}</strong><span>${esc(data[lang].summary)}</span></span><span class="duration">${duration(lang)}</span><span class="chevron" aria-hidden="true"></span></summary><div class="episode-body"><p>${esc(data[lang].summary)}</p><audio controls preload="none" src="${data[lang].file}"></audio><div class="resources"><a class="resource primary" href="test-historia-u1-t07-${lang}.html?v=20261007">${eu?'Autoebaluazio interaktiboa':'Autoevaluación interactiva'}</a><a class="resource" href="ficha-historia-u1-t07-${lang}.html?v=20261007">${eu?'Autoebaluazio inprimagarria':'Autoevaluación imprimible'}</a><a class="resource" href="guion-historia-u1-t07-${lang}.html">${eu?'Audioaren testua':'Texto del audio'}</a><span class="resource-note">${eu?'Bost maila · 20 galdera maila bakoitzeko · 10+10 txandaketa · 25 jarduera eta erantzunak aparte.':'Cinco niveles · 20 preguntas por nivel · rotación 10+10 · 25 actividades con soluciones separadas.'}</span></div></div></details>`;}

function catalogue(){
 let html=read('index.html');
 if(html.includes('id="historia-castellano-u1-t07"'))throw Error('T07 already present: do not duplicate');
 for(const lang of ['cast','eus']){
  const start=html.indexOf(`id="historia-${lang==='eus'?'euskara':'castellano'}-u1-t06"`);
  const end=html.indexOf('</details>',start)+'</details>'.length;
  if(start<0||end<10)throw Error('Existing T06 missing');
  html=html.slice(0,end)+'\n'+episode(lang)+'\n'+html.slice(end);
 }
 const stop=html.indexOf('id="asignatura-fiki"');
 const before=html.slice(0,stop).replaceAll('12 audios disponibles','14 audios disponibles').replaceAll('6 episodios disponibles','7 episodios disponibles').replaceAll('6 temas','7 temas').replaceAll('6 atal erabilgarri','7 atal erabilgarri').replaceAll('6 gai','7 gai');
 write('index.html',before+html.slice(stop));
}

function feed(){
 let xml=read('feed.xml');const date=new Date().toUTCString();const base='https://xtronzio.github.io/audiogela-2eso-2026-27/';
 if(xml.includes('u1-t07</guid>'))throw Error('Podcast episode already present');
 const items=['eus','cast'].map(lang=>`<item><title>HISTORIA · ${lang.toUpperCase()} · U1 · T07 — ${esc(data[lang].title)}</title><link>${base}index.html#historia-${lang==='eus'?'euskara':'castellano'}-u1-t07</link><description>${esc(data[lang].summary)}</description><content:encoded><![CDATA[<p>${esc(data[lang].summary)}</p><p><a href="${base}test-historia-u1-t07-${lang}.html">${lang==='eus'?'Autoebaluazio interaktiboa':'Autoevaluación interactiva'}</a></p>]]></content:encoded><pubDate>${date}</pubDate><guid isPermaLink="false">audiogela-2eso-2026-27-historia-${lang}-u1-t07</guid><enclosure url="${base}${data[lang].file}" length="${fs.statSync(path.join(root,data[lang].file)).size}" type="audio/mpeg"/><itunes:episode>7</itunes:episode><itunes:season>${lang==='eus'?2:1}</itunes:season><itunes:episodeType>full</itunes:episodeType><itunes:duration>${duration(lang)}</itunes:duration><itunes:explicit>false</itunes:explicit></item>`).join('\n');
 xml=xml.replace(/<lastBuildDate>.*?<\/lastBuildDate>/,`<lastBuildDate>${date}</lastBuildDate>`);
 xml=xml.replace('    <item>',items+'\n\n    <item>');write('feed.xml',xml);
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 for(const lang of ['cast','eus']){quiz(lang);worksheet(lang);transcript(lang);console.log(`${lang}: 100 preguntas, 25 actividades, audio ${duration(lang)}`);}
 catalogue();feed();
}
