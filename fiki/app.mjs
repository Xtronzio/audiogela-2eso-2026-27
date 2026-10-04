import {unit,properties,baseUnits,propertyDefinitions,audioFile} from './u1-data.mjs?v=20261004-r2';
import {bookExercises} from './exercises.mjs?v=20261004-r2';
import {checkAnswer,practiceSet} from './engine.mjs?v=20261004-r2';

const lang=document.documentElement.lang==='eu'?'eus':'cast', cast=lang==='cast', course=unit[lang];
const t=(es,eu)=>cast?es:eu;
const page=`fiki-u1-${lang}.html`, params=new URLSearchParams(location.search);
let section=['theory','quiz','practice','sheet'].includes(params.get('section'))?params.get('section'):'theory';
let topic=/^[0-3]$/.test(params.get('topic')||'')?Number(params.get('topic')):0;
const $=selector=>document.querySelector(selector);
const esc=value=>String(value).replace(/[&<>"']/g,v=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[v]));
const tabNames={theory:t('Teoría y audio','Teoria eta audioa'),quiz:t('Autoevaluación · teoría','Autoebaluazioa · teoria'),practice:t('Ejercicios','Ariketak'),sheet:t('Autoevaluación imprimible','Autoebaluazio inprimagarria')};
let exercises=[], checked=new Map(),previous=[];

function navigate(next){if(next==='quiz'||next==='sheet'){location.assign(`${next==='quiz'?'test':'ficha'}-fiki-u1-b${topic+1}-${lang}.html`);return;} section=next;params.set('section',next);history.replaceState(null,'',`${page}?${params}`);render();}
function render(){
  const currentTopic=topic;
  $('#tabs').innerHTML=Object.entries(tabNames).map(([key,label])=>`<a href="${page}?section=${key}&topic=${currentTopic}" ${key===section?'aria-current="page"':''} data-section="${key}">${label}</a>`).join('');
  document.querySelectorAll('[data-section]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();navigate(link.dataset.section);}));
  $('#blocks').innerHTML=course.topics.map((v,i)=>`<button type="button" data-topic="${i}" aria-pressed="${i===topic}">${i+1}. ${v.title}</button>`).join('');
  document.querySelectorAll('[data-topic]').forEach(button=>button.onclick=()=>{topic=Number(button.dataset.topic);params.set('topic',topic);history.replaceState(null,'',`${page}?${params}`);render();});
  $('#language-link').href=`fiki-u1-${cast?'eus':'cast'}.html?section=${section}&topic=${currentTopic}`;
  if(section==='theory')renderTheory();
  else if(section==='quiz'||section==='sheet')location.replace(`${section==='quiz'?'test':'ficha'}-fiki-u1-b${topic+1}-${lang}.html`);
  else renderPractice();
}

function renderTheory(){
  const topicData=course.topics[topic];
  let reference='';
  if(topic===1){
    const labels=cast?[['Cuantitativa','Cualitativa'],['Intensiva','Extensiva'],['General','Característica']]:[['Kuantitatiboa','Kualitatiboa'],['Intentsiboa','Estentsiboa'],['Orokorra','Bereizgarria']];
    reference=`<section class="definitions"><h3>${t('Las seis definiciones','Sei definizioak')}</h3><p>${t('Son tres criterios independientes. Elige una etiqueta de cada pareja.','Hiru irizpide independente dira. Aukeratu bikote bakoitzeko etiketa bat.')}</p><dl>${propertyDefinitions[lang].map(d=>`<div><dt>${d[0]}</dt><dd>${d[1]}<br><strong>${d[2]}</strong></dd></div>`).join('')}</dl></section><h3>${t('Tabla de repaso','Errepasatzeko taula')}</h3><div class="table-scroll"><table><thead><tr><th>${t('Propiedad','Propietatea')}</th><th>${t('Medida / cualidad','Neurria / nolakotasuna')}</th><th>${t('Cantidad','Kantitatea')}</th><th>${t('Identificación','Identifikazioa')}</th></tr></thead><tbody>${properties.map(p=>`<tr><td>${esc(p.name[cast?0:1])}</td>${[p.type,p.amount,p.identity].map((n,i)=>`<td>${labels[i][n]}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  if(topic===2)reference=`<h3>${t('Unidades básicas del SI','SIko oinarrizko unitateak')}</h3><div class="table-scroll"><table><thead><tr><th>${t('Magnitud','Magnitudea')}</th><th>${t('Unidad','Unitatea')}</th><th>${t('Símbolo','Ikurra')}</th></tr></thead><tbody>${baseUnits.map(u=>`<tr><td>${u[cast?0:1]}</td><td>${u[cast?3:4]}</td><td>${u[2]}</td></tr>`).join('')}</tbody></table></div><div class="formula">1 L = 1 dm³ · 1 mL = 1 cm³ · 1 m³ = 1000 L<br>1 m² = 10 000 cm² · 1 m³ = 1 000 000 cm³</div><p class="small muted">${t('Referencia de unidades:','Unitateen erreferentzia:')} <a href="https://www.bipm.org/en/publications/si-brochure/" target="_blank" rel="noopener">BIPM · SI</a></p>`;
  if(topic===3)reference=`<div class="formula">d = m / V · m = d × V · V = m / d<br>1 g/cm³ = 1000 kg/m³</div>`;
  $('#content').innerHTML=`<article class="panel"><div class="eyebrow">${t('Bloque','Blokea')} ${topic+1} / 4</div><h2>${topicData.title}</h2><p class="muted">${topicData.summary}</p><audio aria-label="${esc(topicData.title)}" controls preload="metadata" src="${audioFile(lang,topic)}"></audio><div class="player-settings"><label for="speed">${t('Velocidad','Abiadura')}</label><select id="speed"><option value="0.8">0,8×</option><option value="1" selected>1×</option><option value="1.15">1,15×</option><option value="1.3">1,3×</option></select><a href="${audioFile(lang,topic)}" download>${t('Descargar audio','Audioa deskargatu')}</a></div>${topic===1?reference:''}<div class="theory-text">${topicData.paragraphs.map(p=>`<p>${p}</p>`).join('')}</div>${topic!==1?reference:''}<div class="quiz-actions"><button class="button" id="go-practice">${t('Practicar este bloque','Bloke hau landu')}</button><button class="button secondary" id="go-quiz">${t('Autoevaluación de este bloque','Bloke honetako autoebaluazioa')}</button></div></article><section class="panel"><h2>${t('Podcast de FIKI','FIKIren podcasta')}</h2><p>${t('Los cuatro bloques en castellano y euskera. En Apple Podcasts: Biblioteca → ··· → Seguir un programa por URL.','Lau blokeak gaztelaniaz eta euskaraz. Apple Podcasts aplikazioan: Biblioteca → ··· → Seguir un programa por URL.')}</p><div class="feed-row"><input id="podcast-url" aria-label="${t('URL del podcast','Podcastaren URLa')}" readonly value="https://xtronzio.github.io/audiogela-2eso-2026-27/feed-fiki.xml"><button class="button" id="copy-podcast">${t('Copiar URL','URLa kopiatu')}</button></div><p id="copy-status" class="small" role="status"></p></section>`;
  $('#speed').onchange=event=>$('audio').playbackRate=Number(event.target.value);
  $('#go-practice').onclick=()=>navigate('practice');$('#go-quiz').onclick=()=>navigate('quiz');
  $('#copy-podcast').onclick=async()=>{try{await navigator.clipboard.writeText($('#podcast-url').value);$('#copy-status').textContent=t('URL copiada.','URLa kopiatuta.');}catch{$('#podcast-url').select();$('#copy-status').textContent=t('Selecciona y copia la dirección.','Hautatu eta kopiatu helbidea.');}};
}

function renderPractice(){
  checked=new Map();previous=[];
  $('#content').innerHTML=`<section class="panel"><div class="eyebrow">${t('Bloque','Blokea')} ${topic+1} / 4</div><h2>${course.topics[topic].title} · ${t('Ejercicios','Ariketak')}</h2><p class="muted">${t('Completa todos los apartados de un ejercicio y pulsa Comprobar. Verás la corrección de cada apartado, el resultado y el razonamiento.','Bete ariketa baten atal guztiak eta sakatu Egiaztatu. Atal bakoitzaren zuzenketa, emaitza eta arrazoibidea ikusiko dituzu.')}</p><div class="controls"><label for="practice-style">${t('Ejercicios','Ariketak')}<select id="practice-style"><option value="book">${t('Temario completo y repaso','Temario osoa eta errepasoa')}</option><option value="new">${t('Practicar con otros datos','Beste datu batzuekin landu')}</option></select></label><button class="button" id="new-practice">${t('Otra tanda','Beste sorta bat')}</button><button class="button secondary" id="print-sheet">${t('Imprimir ejercicios / guardar PDF','Ariketak inprimatu / PDF gorde')}</button></div><p class="note small">${t('Números: coma o punto decimal, espacios para miles y notación científica. Añade la unidad solicitada. Las soluciones se muestran al enviar todos los apartados completos.','Zenbakiak: koma edo puntu hamartarra, espazioak milakoetarako eta notazio zientifikoa. Gehitu eskatutako unitatea. Soluzioak atal guztiak beteta bidaltzean agertzen dira.')}</p><p class="small muted no-print">${t('Puedes imprimir los ejercicios en blanco. Las correcciones solo se imprimen si ya has respondido y comprobado.','Ariketak hutsik inprima ditzakezu. Zuzenketak erantzun eta egiaztatu ondoren bakarrik inprimatzen dira.')}</p></section><p id="progress" role="status"></p><div id="exercise-list"></div>`;
  $('#new-practice').onclick=newPractice;
  $('#practice-style').onchange=()=>{previous=[];newPractice();};
  $('#print-sheet').onclick=()=>window.print();
  newPractice();
}
const propertyLabels=cast?[['Cuantitativa','Cualitativa'],['Intensiva','Extensiva'],['General','Característica']]:[['Kuantitatiboa','Kualitatiboa'],['Intentsiboa','Estentsiboa'],['Orokorra','Bereizgarria']];
function fieldHTML(field,i,j){
 const id=`answer-${i}-${j}`;
 if(field.kind==='property-choice')return `<tr data-field="${j}"><th scope="row">${esc(field.prompt)}</th>${propertyLabels.flatMap((pair,dimension)=>pair.map(label=>`<td><input type="checkbox" name="property-${i}-${j}-${dimension}" value="${label.toLowerCase()}" aria-label="${esc(field.prompt+' · '+label)}"></td>`)).join('')}</tr>`;
 return `<div class="subexercise" data-field="${j}"><label for="${id}">${esc(field.prompt)}<input id="${id}" name="answer-${j}" type="text" autocomplete="off" spellcheck="false" aria-describedby="feedback-${i}" ${field.kind==='number'?'inputmode="decimal"':''} required></label>${field.kind==='number'?`<label for="unit-${i}-${j}">${t('Unidad','Unitatea')}<input id="unit-${i}-${j}" name="unit-${j}" type="text" autocomplete="off" spellcheck="false" aria-describedby="feedback-${i}" required></label>`:''}<div class="print-line"></div></div>`;
}
function newPractice(){
  const style=$('#practice-style').value;
  exercises=style==='book'?bookExercises(lang,topic):practiceSet(lang,topic,'new',previous);previous=exercises.map(e=>e.id);checked.clear();
  $('#new-practice').hidden=style==='book';
  $('#exercise-list').innerHTML=exercises.map((e,i)=>{
    const fields=e.kind==='multi'?e.fields:[{...e,prompt:t('Tu respuesta','Zure erantzuna')}],table=fields.every(f=>f.kind==='property-choice');
    const inputs=fields.map((field,j)=>fieldHTML(field,i,j)).join('');
    return `<article class="card exercise"><h3>${t('Ejercicio','Ariketa')} ${i+1}</h3><p class="instruction">${esc(e.prompt)}</p>${e.passage?`<blockquote>${esc(e.passage)}</blockquote>`:''}<form data-exercise="${i}" novalidate>${table?`<div class="table-scroll"><table class="property-table"><thead><tr><th>${t('Propiedad','Propietatea')}</th>${propertyLabels.flat().map(label=>`<th>${label}</th>`).join('')}</tr></thead><tbody>${inputs}</tbody></table></div>`:inputs}<button class="button" type="submit">${t('Comprobar todos los apartados','Egiaztatu atal guztiak')}</button></form><div id="feedback-${i}" class="feedback" role="status" aria-live="polite"></div></article>`;
  }).join('');
  document.querySelectorAll('[data-exercise]').forEach(form=>{
    form.onsubmit=gradeExercise;
    form.querySelectorAll('input[type="checkbox"]').forEach(box=>box.onchange=()=>{if(box.checked)form.querySelectorAll(`input[name="${box.name}"]`).forEach(other=>{if(other!==box)other.checked=false;});});
  });updateProgress();
}
function fieldValue(form,field,j){return {answer:field.kind==='property-choice'?[...form.querySelectorAll(`[data-field="${j}"] input:checked`)].map(input=>input.value).join(', '):form.elements[`answer-${j}`]?.value||'',unit:form.elements[`unit-${j}`]?.value||''};}
function gradeExercise(event){
  event.preventDefault();const form=event.currentTarget,index=Number(form.dataset.exercise),exercise=exercises[index];
  const values=exercise.kind==='multi'?Object.fromEntries(exercise.fields.map((f,j)=>[f.id,fieldValue(form,f,j)])):fieldValue(form,exercise,0);
  const result=exercise.kind==='multi'?checkAnswer(exercise,values):checkAnswer(exercise,values.answer,values.unit),feedback=$(`#feedback-${index}`);
  if(!result.submitted){feedback.className='feedback status error';feedback.textContent=result.reason==='empty'?t('Completa todos los apartados y las unidades. En la tabla, selecciona una casilla de cada pareja por fila.','Bete atal guztiak eta unitateak. Taulan, hautatu bikote bakoitzeko laukitxo bat lerro bakoitzean.'):t('Escribe un número válido. Ejemplos: 0,875; 0.875; 8e4.','Idatzi baliozko zenbakia. Adibideak: 0,875; 0.875; 8e4.');return;}
  checked.set(exercise.id,result.correct);updateProgress();feedback.className=`feedback status ${result.correct?'success':'error'}`;
  let detail='';
  if(exercise.kind==='number' && !result.correct)detail=`<p>${!result.numberOK?t('Revisa el cálculo.','Berrikusi kalkulua.'):''} ${!result.unitOK?t('Revisa la unidad solicitada.','Berrikusi eskatutako unitatea.'):''}</p>`;
  const details=exercise.kind==='multi'?exercise.fields.map((f,j)=>`<li><strong>${esc(f.prompt)} · ${result.results[j].correct?t('Correcto','Zuzena'):t('Incorrecto','Okerra')}</strong><p>${t('Resultado','Emaitza')}: ${esc(f.solution)}</p><ol>${f.steps.map(step=>`<li>${esc(step)}</li>`).join('')}</ol></li>`).join(''):'';
  feedback.innerHTML=`<strong>${result.correct?t('Correcto','Zuzena'):t('Todavía no es correcto','Oraindik ez da zuzena')}</strong>${detail}${exercise.kind==='multi'?`<ol class="corrections">${details}</ol>`:`<p>${t('Resultado','Emaitza')}: <b>${esc(exercise.solution)}</b></p><ol>${exercise.steps.map(step=>`<li>${esc(step)}</li>`).join('')}</ol>`}`;
  form.querySelector('button').textContent=t('Volver a comprobar','Berriro egiaztatu');
}
function updateProgress(){const right=[...checked.values()].filter(Boolean).length;$('#progress').textContent=t(`${checked.size}/${exercises.length} ejercicios comprobados · ${right} correctos.`,` ${checked.size}/${exercises.length} ariketa egiaztatuta · ${right} zuzen.`);}
render();
