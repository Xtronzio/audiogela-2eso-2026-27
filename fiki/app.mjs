import {unit,properties,baseUnits} from './u1-data.mjs';
import {questionBank} from './quiz.mjs';
import {checkAnswer,practiceSet,shuffle,quizSet,prettyUnit} from './engine.mjs';

const lang=document.documentElement.lang==='eu'?'eus':'cast', cast=lang==='cast', course=unit[lang];
const t=(es,eu)=>cast?es:eu;
const page=`fiki-u1-${lang}.html`, params=new URLSearchParams(location.search);
let section=['theory','quiz','practice','sheet'].includes(params.get('section'))?params.get('section'):'theory';
let topic=/^[0-3]$/.test(params.get('topic')||'')?Number(params.get('topic')):0;
const $=selector=>document.querySelector(selector);
const esc=value=>String(value).replace(/[&<>"']/g,v=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[v]));
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{}};
const tabNames={theory:t('Teoría y audio','Teoria eta audioa'),quiz:t('Autoevaluación · teoría','Autoebaluazioa · teoria'),practice:t('Ejercicios','Ariketak'),sheet:t('Ficha imprimible','Fitxa inprimagarria')};
let quiz=[], exercises=[], checked=new Map(),previous=[];

function navigate(next){section=next;params.set('section',next);history.replaceState(null,'',`${page}?${params}`);render();}
function render(){
  const currentTopic=params.get('topic')==='all'?'all':topic;
  $('#tabs').innerHTML=Object.entries(tabNames).map(([key,label])=>`<a href="${page}?section=${key}&topic=${currentTopic}" ${key===section?'aria-current="page"':''} data-section="${key}">${label}</a>`).join('');
  document.querySelectorAll('[data-section]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();navigate(link.dataset.section);}));
  $('#language-link').href=`fiki-u1-${cast?'eus':'cast'}.html?section=${section}&topic=${currentTopic}`;
  if(section==='theory')renderTheory();
  else if(section==='quiz')renderQuiz();
  else renderPractice(section==='sheet');
}

function renderTheory(){
  const topicData=course.topics[topic];
  let reference='';
  if(topic===1){
    const labels=cast?[['Cuantitativa','Cualitativa'],['Intensiva','Extensiva'],['General','Característica']]:[['Kuantitatiboa','Kualitatiboa'],['Intentsiboa','Estentsiboa'],['Orokorra','Bereizgarria']];
    reference=`<h3>${t('Tabla de repaso','Errepasatzeko taula')}</h3><div class="table-scroll"><table><thead><tr><th>${t('Propiedad','Propietatea')}</th><th>${t('Medida / cualidad','Neurria / nolakotasuna')}</th><th>${t('Cantidad','Kantitatea')}</th><th>${t('Identificación','Identifikazioa')}</th></tr></thead><tbody>${properties.map(p=>`<tr><td>${esc(p.name[cast?0:1])}</td>${[p.type,p.amount,p.identity].map((n,i)=>`<td>${labels[i][n]}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  if(topic===2)reference=`<h3>${t('Unidades básicas del SI','SIko oinarrizko unitateak')}</h3><div class="table-scroll"><table><thead><tr><th>${t('Magnitud','Magnitudea')}</th><th>${t('Unidad','Unitatea')}</th><th>${t('Símbolo','Ikurra')}</th></tr></thead><tbody>${baseUnits.map(u=>`<tr><td>${u[cast?0:1]}</td><td>${u[cast?3:4]}</td><td>${u[2]}</td></tr>`).join('')}</tbody></table></div><div class="formula">1 L = 1 dm³ · 1 mL = 1 cm³ · 1 m³ = 1000 L<br>1 m² = 10 000 cm² · 1 m³ = 1 000 000 cm³</div><p class="small muted">${t('Referencia de unidades:','Unitateen erreferentzia:')} <a href="https://www.bipm.org/en/publications/si-brochure/" target="_blank" rel="noopener">BIPM · SI</a></p>`;
  if(topic===3)reference=`<div class="formula">d = m / V · m = d × V · V = m / d<br>1 g/cm³ = 1000 kg/m³</div>`;
  $('#content').innerHTML=`<div class="topic-buttons">${course.topics.map((v,i)=>`<button type="button" data-topic="${i}" aria-pressed="${i===topic}">${i+1}. ${v.title}</button>`).join('')}</div><article class="panel"><div class="eyebrow">${t('Bloque','Blokea')} ${topic+1} / 4</div><h2>${topicData.title}</h2><p class="muted">${topicData.summary}</p><audio aria-label="${esc(topicData.title)}" controls preload="metadata" src="fiki-u1-${String(topic+1).padStart(2,'0')}-${lang}.mp3"></audio><div class="player-settings"><label for="speed">${t('Velocidad','Abiadura')}</label><select id="speed"><option value="0.8">0,8×</option><option value="1" selected>1×</option><option value="1.15">1,15×</option><option value="1.3">1,3×</option></select><a href="fiki-u1-${String(topic+1).padStart(2,'0')}-${lang}.mp3" download>${t('Descargar audio','Audioa deskargatu')}</a></div><div class="theory-text">${topicData.paragraphs.map(p=>`<p>${p}</p>`).join('')}</div>${reference}<div class="quiz-actions"><button class="button" id="go-practice">${t('Practicar este bloque','Bloke hau landu')}</button><button class="button secondary" id="go-quiz">${t('Autoevaluar la unidad','Unitatea autoebaluatu')}</button></div></article><section class="panel"><h2>${t('Podcast de FIKI','FIKIren podcasta')}</h2><p>${t('Los cuatro bloques en castellano y euskera. En Apple Podcasts: Biblioteca → ··· → Seguir un programa por URL.','Lau blokeak gaztelaniaz eta euskaraz. Apple Podcasts aplikazioan: Biblioteca → ··· → Seguir un programa por URL.')}</p><div class="feed-row"><input id="podcast-url" aria-label="${t('URL del podcast','Podcastaren URLa')}" readonly value="https://xtronzio.github.io/audiogela-2eso-2026-27/feed-fiki.xml"><button class="button" id="copy-podcast">${t('Copiar URL','URLa kopiatu')}</button></div><p id="copy-status" class="small" role="status"></p></section>`;
  document.querySelectorAll('[data-topic]').forEach(button=>button.onclick=()=>{topic=Number(button.dataset.topic);params.set('topic',topic);history.replaceState(null,'',`${page}?${params}`);render();});
  $('#speed').onchange=event=>$('audio').playbackRate=Number(event.target.value);
  $('#go-practice').onclick=()=>navigate('practice');$('#go-quiz').onclick=()=>navigate('quiz');
  $('#copy-podcast').onclick=async()=>{try{await navigator.clipboard.writeText($('#podcast-url').value);$('#copy-status').textContent=t('URL copiada.','URLa kopiatuta.');}catch{$('#podcast-url').select();$('#copy-status').textContent=t('Selecciona y copia la dirección.','Hautatu eta kopiatu helbidea.');}};
}

function renderQuiz(){
  const names=cast?['1 · Fundamentos','2 · Comprender','3 · Clasificar','4 · Aplicar','5 · Razonar']:['1 · Oinarriak','2 · Ulertzea','3 · Sailkatzea','4 · Aplikatzea','5 · Arrazoitzea'];
  $('#content').innerHTML=`<section class="panel"><h2>${t('Autoevaluación de teoría','Teoriaren autoebaluazioa')}</h2><p class="muted">${t('Cinco niveles, 20 preguntas por nivel. Cada ronda tiene 10; la siguiente utiliza las otras 10. Responde todas antes de corregir.','Bost maila, 20 galdera maila bakoitzean. Txanda bakoitzak 10 ditu; hurrengoak beste 10ak erabiltzen ditu. Erantzun denei zuzendu aurretik.')}</p><div class="controls"><label for="level">${t('Intensidad','Maila')}<select id="level">${names.map((n,i)=>`<option value="${i+1}">${n}</option>`).join('')}</select></label><button type="button" class="button" id="start-quiz">${t('Empezar 10 preguntas','Hasi 10 galdera')}</button></div><p class="small muted">${t('La teoría y los ejercicios se corrigen por separado.','Teoria eta ariketak bereizita zuzentzen dira.')}</p></section><div id="quiz-result" class="status result-anchor" role="status" tabindex="-1"></div><form id="quiz-form"></form>`;
  $('#start-quiz').onclick=startQuiz;
  $('#level').onchange=()=>{quiz=[];$('#quiz-form').innerHTML='';$('#quiz-result').textContent='';$('#start-quiz').textContent=t('Empezar 10 preguntas','Hasi 10 galdera');};
  $('#quiz-form').onsubmit=gradeQuiz;
}
function startQuiz(){
  const level=Number($('#level').value),key=`audiogela:fiki:u1:${lang}:l${level}`;
  const next=quizSet(questionBank(lang).filter(q=>q.level===level),read(key,{}));write(key,next.state);
  quiz=next.questions.map(q=>({...q,options:shuffle(q.options.map((text,index)=>({text,index})))}));
  $('#quiz-result').textContent='';$('#quiz-result').className='status result-anchor';
  $('#start-quiz').textContent=t('Otra ronda de 10','Beste 10eko txanda');
  $('#quiz-form').innerHTML=quiz.map((q,i)=>`<section class="card quiz-card"><fieldset><legend>${i+1}. ${esc(q.prompt)}</legend><div class="options">${q.options.map((option,j)=>`<label class="option"><input type="radio" name="q-${i}" value="${option.index}" required><span>${esc(option.text)}</span></label>`).join('')}</div></fieldset><div id="quiz-feedback-${i}" class="feedback" role="status"></div></section>`).join('')+`<button class="button" id="grade-quiz" type="submit">${t('Corregir teoría','Teoria zuzendu')}</button>`;
}
function gradeQuiz(event){
  event.preventDefault();
  const answers=quiz.map((q,i)=>$(`input[name="q-${i}"]:checked`));
  if(answers.some(a=>!a)){ $('#quiz-result').textContent=t('Responde las 10 preguntas antes de corregir.','Erantzun 10 galderei zuzendu aurretik.');return;}
  let total=0;
  quiz.forEach((q,i)=>{
    const correct=Number(answers[i].value)===q.correct;if(correct)total++;
    document.querySelectorAll(`input[name="q-${i}"]`).forEach(input=>{input.disabled=true;if(Number(input.value)===q.correct)input.closest('label').classList.add('correct-answer');else if(input.checked)input.closest('label').classList.add('wrong-answer');});
    const feedback=$(`#quiz-feedback-${i}`);feedback.className=`feedback status ${correct?'success':'error'}`;
    feedback.innerHTML=`<strong>${correct?t('Correcto','Zuzena'):t('Revisa esta respuesta','Berrikusi erantzun hau')}</strong><p>${esc(q.options.find(o=>o.index===q.correct).text)}</p><p>${esc(q.explanation)}</p>`;
  });
  $('#quiz-result').textContent=t(`Resultado de teoría: ${total}/10. Revisa las explicaciones y prueba la siguiente ronda.`,`Teoriaren emaitza: ${total}/10. Berrikusi azalpenak eta egin hurrengo txanda.`);
  $('#quiz-result').className='status success result-anchor';$('#quiz-result').focus();$('#grade-quiz').disabled=true;
}

function renderPractice(sheet=false){
  checked=new Map();previous=[];
  $('#content').innerHTML=`<section class="panel"><h2>${sheet?t('Ficha de trabajo','Lan fitxa'):t('Ejercicios con corrección','Zuzenketa duten ariketak')}</h2><p class="muted">${t('Escribe tu respuesta y pulsa Comprobar. Después verás si es correcta, el resultado y el razonamiento.','Idatzi erantzuna eta sakatu Egiaztatu. Ondoren, zuzentasuna, emaitza eta arrazoibidea ikusiko dituzu.')}</p>${sheet?`<div class="sheet-heading"><label>${t('Nombre','Izena')}<input aria-label="${t('Nombre','Izena')}" autocomplete="off"></label></div>`:''}<div class="controls"><label for="practice-topic">${t('Bloque','Blokea')}<select id="practice-topic"><option value="all">${t('Toda la unidad','Unitate osoa')}</option>${course.topics.map((v,i)=>`<option value="${i}">${i+1}. ${v.title}</option>`).join('')}</select></label><label for="practice-style">${t('Ejercicios','Ariketak')}<select id="practice-style"><option value="book">${t('Del temario y repaso','Temariokoak eta errepasoa')}</option><option value="new">${t('Practicar con otros datos','Beste datu batzuekin landu')}</option></select></label><button class="button" id="new-practice">${t('Otra tanda','Beste sorta bat')}</button>${sheet?`<button class="button secondary" id="print-sheet">${t('Imprimir / guardar PDF','Inprimatu / PDF gorde')}</button>`:''}</div><p class="note small">${t('Números: coma o punto decimal, espacios para miles y notación científica (8e4 o 8×10^4). Escribe la unidad solicitada: cm3 y cm³ son equivalentes. Las soluciones aparecen al enviar una respuesta completa.','Zenbakiak: koma edo puntu hamartarra, espazioak milakoetarako eta notazio zientifikoa (8e4 edo 8×10^4). Idatzi eskatutako unitatea: cm3 eta cm³ baliokideak dira. Erantzun osoa bidaltzean agertzen dira soluzioak.')}</p>${sheet?`<p class="small muted no-print">${t('Puedes imprimir la ficha en blanco. Para imprimir las soluciones, responde y comprueba cada ejercicio primero.','Fitxa hutsik inprima dezakezu. Soluzioak inprimatzeko, erantzun eta egiaztatu ariketa bakoitza lehenik.')}</p>`:''}</section><p id="progress" role="status"></p><div id="exercise-list"></div>`;
  $('#practice-topic').value=sheet||params.get('topic')==='all'?'all':String(topic);
  $('#new-practice').onclick=()=>newPractice();
  $('#practice-topic').onchange=()=>{
    const selected=$('#practice-topic').value;
    if(selected!=='all')topic=Number(selected);
    params.set('topic',selected);history.replaceState(null,'',`${page}?${params}`);
    $('#language-link').href=`fiki-u1-${cast?'eus':'cast'}.html?section=${section}&topic=${selected}`;
    document.querySelectorAll('[data-section]').forEach(link=>link.href=`${page}?section=${link.dataset.section}&topic=${selected}`);
    previous=[];newPractice();
  };$('#practice-style').onchange=()=>{previous=[];newPractice();};
  if(sheet)$('#print-sheet').onclick=()=>window.print();newPractice();
}
function newPractice(){
  exercises=practiceSet(lang,$('#practice-topic').value,$('#practice-style').value,previous);previous=exercises.map(e=>e.id);checked.clear();
  $('#exercise-list').innerHTML=exercises.map((e,i)=>`<article class="card exercise"><h3>${t('Ejercicio','Ariketa')} ${i+1}</h3><p class="instruction">${esc(e.prompt)}</p><form data-exercise="${i}" novalidate><div class="answer-row"><label class="${e.kind!=='number'?'word-field':''}" for="answer-${i}">${t('Tu respuesta','Zure erantzuna')}<input id="answer-${i}" name="answer" type="text" autocomplete="off" spellcheck="false" ${e.kind==='number'?'inputmode="decimal"':''} aria-describedby="feedback-${i}" required></label>${e.kind==='number'?`<label class="unit-field" for="unit-${i}">${t('Unidad','Unitatea')}<input id="unit-${i}" name="unit" type="text" autocomplete="off" spellcheck="false" aria-describedby="feedback-${i}" required></label>`:''}<button class="button" type="submit">${t('Comprobar','Egiaztatu')}</button></div></form><div class="print-line"></div><div id="feedback-${i}" class="feedback" role="status" aria-live="polite"></div></article>`).join('');
  document.querySelectorAll('[data-exercise]').forEach(form=>form.onsubmit=gradeExercise);updateProgress();
}
function gradeExercise(event){
  event.preventDefault();const form=event.currentTarget,index=Number(form.dataset.exercise),exercise=exercises[index];
  const answer=form.elements.answer.value,unitValue=form.elements.unit?.value||'',result=checkAnswer(exercise,answer,unitValue),feedback=$(`#feedback-${index}`);
  if(!result.submitted){feedback.className='feedback status error';feedback.textContent=result.reason==='empty'?t('Completa la respuesta y, si corresponde, la unidad.','Bete erantzuna eta, dagokionean, unitatea.'):t('Escribe un número válido. Ejemplos: 0,875; 0.875; 8e4.','Idatzi baliozko zenbakia. Adibideak: 0,875; 0.875; 8e4.');return;}
  checked.set(exercise.id,result.correct);updateProgress();feedback.className=`feedback status ${result.correct?'success':'error'}`;
  let detail='';
  if(exercise.kind==='number' && !result.correct)detail=`<p>${!result.numberOK?t('Revisa el cálculo.','Berrikusi kalkulua.'):''} ${!result.unitOK?t('Revisa la unidad solicitada.','Berrikusi eskatutako unitatea.'):''}</p>`;
  feedback.innerHTML=`<strong>${result.correct?t('Correcto','Zuzena'):t('Todavía no es correcto','Oraindik ez da zuzena')}</strong>${detail}<p>${t('Resultado','Emaitza')}: <b>${esc(exercise.solution)}</b></p><ol>${exercise.steps.map(step=>`<li>${esc(step)}</li>`).join('')}</ol>`;
  form.querySelector('button').textContent=t('Volver a comprobar','Berriro egiaztatu');
}
function updateProgress(){const right=[...checked.values()].filter(Boolean).length;$('#progress').textContent=t(`${checked.size}/${exercises.length} ejercicios comprobados · ${right} correctos.`,` ${checked.size}/${exercises.length} ariketa egiaztatuta · ${right} zuzen.`);}
render();
