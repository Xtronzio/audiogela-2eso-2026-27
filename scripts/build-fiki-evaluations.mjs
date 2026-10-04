import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {unit} from '../fiki/u1-data.mjs';
import {blockQuestionBank} from '../fiki/block-bank.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=name=>readFileSync(root+name,'utf8'),write=(name,text)=>writeFileSync(root+name,text);
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names={cast:[['Conceptos básicos','Reconocer los conceptos esenciales del bloque.'],['Comprensión','Comprender ejemplos y explicar criterios.'],['Relaciones y clasificación','Relacionar magnitudes, procesos y clasificaciones.'],['Aplicación y análisis','Detectar y corregir errores en situaciones del bloque.'],['Razonamiento','Justificar decisiones y valorar explicaciones.']],eus:[['Oinarrizko kontzeptuak','Blokearen oinarrizko kontzeptuak ezagutzea.'],['Ulermena','Adibideak ulertzea eta irizpideak azaltzea.'],['Loturak eta sailkapena','Magnitudeak, prozesuak eta sailkapenak lotzea.'],['Aplikazioa eta analisia','Blokeko egoeretako akatsak aurkitu eta zuzentzea.'],['Arrazoitzea','Erabakiak justifikatzea eta azalpenak baloratzea.']]};
for(const lang of ['cast','eus'])for(let topic=0;topic<4;topic++){
 const eu=lang==='eus',title=unit[lang].topics[topic].title;
 const bank=blockQuestionBank(lang,topic),levels=names[lang].map(([nombre,descripcion],l)=>({nivel:l+1,nombre,descripcion,preguntas:bank.filter(q=>q.level===l+1).map(q=>[q.prompt,q.options,q.correct,q.explanation])}));
 let template=read(`test-historia-u1-t01-${lang}.html`),firstScript=template.indexOf('<script>'),lastScript=template.lastIndexOf('<script>');
 // Reuse the existing classroom's five-level UI and tested 10+10 engine.
 let body=template.slice(0,firstScript),engine=template.slice(lastScript+8,template.indexOf('</script>',lastScript));
 body=body.replaceAll('HISTORIA ·','FIKI ·').replace(/href="index.html#[^"]+"/,`href="index.html#fiki-${lang}-u1-t${topic+1}"`);
 body=body.replaceAll(eu?'Nola hasi zen Erdi Aroa':'Cómo comenzó la Edad Media',esc(title));
 body=body.replaceAll(eu?'1. UNITATEA · 1. GAIA':'UNIDAD 1 · TEMA 1',eu?`1. UNITATEA · ${topic+1}. BLOKEA`:`UNIDAD 1 · BLOQUE ${topic+1}`);
 body=body.replace(/<title>.*?<\/title>/,`<title>${eu?'Autoebaluazioa':'Autoevaluación'} · FIKI · ${esc(title)}</title>`);
 body=body.replace('<span class="brand">',`<a class="back" href="fiki-u1-${lang}.html?section=theory&amp;topic=${topic}">${eu?'Teoria eta audioa':'Teoría y audio'}</a><span class="brand">`);
 engine=engine.replaceAll(eu?'NIVELES_T01_EUS':'NIVELES_T01','FIKI_LEVELS').replaceAll(`audiogela:t01:${lang}:`,`audiogela:fiki:u1:b${topic+1}:${lang}:r2:`);
 engine=engine.replaceAll('localStorage.','safeStorage.');
 const safe=`const safeStorage={getItem:key=>{try{return localStorage.getItem(key);}catch{return null;}},setItem:(key,value)=>{try{localStorage.setItem(key,value);}catch{}},removeItem:key=>{try{localStorage.removeItem(key);}catch{}}};`;
 write(`test-fiki-u1-b${topic+1}-${lang}.html`,body+`<script>const FIKI_LEVELS=${JSON.stringify(levels)};\n${safe}\n${engine}</script></body></html>\n`);
 let sheet=read(`ficha-historia-u1-t01-${lang}.html`);
 sheet=sheet.replaceAll(eu?'Nola hasi zen Erdi Aroa':'Cómo comenzó la Edad Media',esc(title)).replaceAll('HISTORIA','FIKI').replaceAll('T01',`B0${topic+1}`).replace(/href="index.html#[^"]+"/,`href="index.html#fiki-${lang}-u1-t${topic+1}"`);
 sheet=sheet.replace(/<div class="instructions">[\s\S]*?<\/div>/,`<div class="instructions">${eu?'25 jarduera, bost mailak uztartuta. Aukeratu erantzun zuzena eta justifikatu esaldi osoekin. Galdera guztiak bloke honetakoak dira. Soluzioak aparte daude.':'25 actividades que combinan los cinco niveles. Elige la respuesta correcta y justifícala con frases completas. Todas las preguntas pertenecen a este bloque. Las soluciones están separadas.'}</div>`);
 const selected=levels.flatMap((level,l)=>[0,1,2,3,4].map(offset=>({level:level.nivel,q:level.preguntas[(l*4+offset)%20]})));
 const questions=selected.map(({level,q})=>`<li><small>${eu?'Maila':'Nivel'} ${level}</small> · ${esc(q[0])}<ul>${q[1].map((option,j)=>`<li>${'ABCD'[j]}. ${esc(option)}</li>`).join('')}</ul><div class="write large"></div></li>`).join('\n');
 const solutions=selected.map(({q})=>`<li><strong>${'ABCD'[q[2]]}. ${esc(q[1][q[2]])}.</strong> ${esc(q[3])}</li>`).join('\n');
 sheet=sheet.replace(/<ol class="questions">[\s\S]*?<\/ol>/,`<ol class="questions">${questions}</ol>`);
 const start=sheet.indexOf('<ol>',sheet.indexOf('id="solutions"')),end=sheet.indexOf('</ol>',start);
 sheet=sheet.slice(0,start)+'<ol>'+solutions+sheet.slice(end);
 write(`ficha-fiki-u1-b${topic+1}-${lang}.html`,sheet);
 console.log(`FIKI ${lang} block ${topic+1}: 100 questions and 25 printable activities.`);
}
