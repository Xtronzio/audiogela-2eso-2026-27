'use strict';
const E=Trinkoak,$=id=>document.getElementById(id),KEY='audiogela-euskera-entrenador-v1';
const defaults={module:'trinkoak',topic:'formas',number:'all',family:'NOR',verbs:['EGON'],tense:'present',object:'one',hi:false,hika:'male',direction:'form',quick:false,mode:'quiz'};
let state={settings:{...defaults},stats:{},total:0,days:{},step:0,streak:0},q=null,answered=false,timer=null,recent=[],roundCount=0,roundHits=0,roundErrors=[],storageWarning=false;
function load(){try{let raw=JSON.parse(localStorage.getItem(KEY)||'null');if(raw?.version===1){state={...state,...raw,settings:{...defaults,...raw.settings}};sanitize();}}catch(_){storageWarning=true;}}
function sanitize(){
 const s=state.settings;
 if(!E.modules[s.module])s.module='trinkoak';
 if(s.module!=='trinkoak'&&!E.topics[s.module].some(t=>t[0]===s.topic))s.topic=s.module==='pron'?'Noren':E.topics[s.module][0][0];
 if(!['all','singular','plural','indefinite'].includes(s.number))s.number='all';
 if(!['NOR','NORK','ALL'].includes(s.family))s.family='NOR';
 if(!['present','past','both'].includes(s.tense))s.tense='present';
 if(!['one','many','both'].includes(s.object))s.object='one';
 if(!['quiz','cards','write'].includes(s.mode))s.mode='quiz';
 if(!['male','female'].includes(s.hika))s.hika='male';
 s.hi=!!s.hi;s.quick=!!s.quick;s.verbs=(Array.isArray(s.verbs)?s.verbs:[]).filter(v=>E.specs.some(x=>x[0]===v&&(s.family==='ALL'||x[2]===s.family)));
 if(!s.verbs.length)s.verbs=[s.family==='NORK'?'EDUKI':'EGON'];
 state.stats=state.stats&&typeof state.stats==='object'&&!Array.isArray(state.stats)?state.stats:{};
 state.days=state.days&&typeof state.days==='object'?state.days:{};
 ['total','step','streak'].forEach(k=>{state[k]=Math.max(0,Number(state[k])||0);});
}
function save(){try{localStorage.setItem(KEY,JSON.stringify({...state,version:1}));}catch(_){if(!storageWarning){storageWarning=true;toast('No se pudo guardar el progreso en este navegador.');}}}
function day(){const d=new Date();return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;}
function esc(s){return String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));}
function toast(s){$('toast').textContent=s;$('toast').hidden=false;setTimeout(()=>$('toast').hidden=true,3000);}
function stopTimer(){if(timer){clearTimeout(timer);timer=null;}}
function all(){return E.pool(state.settings);}
function renderSettings(){
 const s=state.settings;
 $('module').value=s.module;$('grammarSettings').hidden=s.module==='trinkoak';$('trinkoSettings').hidden=s.module!=='trinkoak';$('trinkoMore').hidden=s.module!=='trinkoak';$('tenseWrap').hidden=!['trinkoak','nori'].includes(s.module);$('numberWrap').hidden=s.module!=='decl';$('number').value=s.number;
 if(s.module!=='trinkoak'){$('topic').innerHTML=E.topics[s.module].map(t=>`<option value="${t[0]}">${esc(t[1])}</option>`).join('');$('topic').value=s.topic;}
 ['family','tense','object','mode'].forEach(group=>$(group).querySelectorAll('button').forEach(b=>{const active=b.dataset.value===s[group];b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));}));
 $('familyHelp').textContent=s.family==='NOR'?'Quién está, va, viene o anda.':s.family==='NORK'?'Quién tiene, sabe, lleva o trae una o varias cosas.':'Ambas familias. Mejor mezclarlas cuando ya las reconozcas.';
 $('verbs').innerHTML=E.specs.filter(v=>s.family==='ALL'||v[2]===s.family).map(v=>`<button data-verb="${v[0]}" class="${s.verbs.includes(v[0])?'active':''}" aria-pressed="${s.verbs.includes(v[0])}">${v[0]}<span>${v[1]}</span></button>`).join('');
 $('objectWrap').hidden=s.module!=='trinkoak'||s.family==='NOR';$('hi').checked=s.hi;$('hika').value=s.hika;$('hikaWrap').hidden=!s.hi;$('mixed').checked=s.direction==='mixed';$('quick').checked=s.quick;
 $('allVerbs').textContent=s.verbs.length===E.specs.filter(v=>s.family==='ALL'||v[2]===s.family).length?'Dejar solo el primer verbo':'Seleccionar todos';
}
function updateCounters(){
 $('todayCount').textContent=(state.days[day()]||0).toLocaleString('es');$('totalCount').textContent=state.total.toLocaleString('es');$('streakCount').textContent=state.streak;
 const list=all(),m=list.filter(e=>state.stats[e.id]?.streak>=4).length;$('masteredCount').textContent=`${m} / ${list.length}`;
 $('roundText').textContent=`${roundCount} / 20`;$('roundBar').style.width=`${Math.min(100,roundCount*5)}%`;
 $('encouragement').textContent=state.total===0?'No hace falta saberlo ya. Hace falta volver a intentarlo.':m===list.length?'Este bloque va bien. Prueba otro verbo o vuelve mañana.':state.streak>=5?`${state.streak} seguidas bien. Las formas van resultando más familiares.`:'Los errores no restan. Te indican qué conviene volver a practicar.';
}
function newQuestion(){
 stopTimer();const list=all();if(!list.length){toast('Selecciona un verbo.');return;}
 const entry=E.choose(list,state.stats,state.step,recent);const s=state.stats[entry.id];
 q=E.makeQuestion(entry,{...state.settings,direction:state.settings.mode==='quiz'?state.settings.direction:'form'},Math.random,s?.retryAt!=null&&s.retryAt<=state.step?s.retryKind:null);
 recent.push(entry.id);recent=recent.slice(-6);answered=false;
 $('chips').innerHTML=q.meta.map(t=>`<span class="chip">${esc(t)}</span>`).join('');$('prompt').textContent=q.heading;$('questionWord').textContent=q.display;
 $('questionWord').classList.toggle('sentence',!!q.sentence);
 $('meaning').textContent=q.meaning||(q.kind==='form'?`${E.labels[entry.person][2]} · ${entry.meaning}`:q.kind==='change'?`Cambia el tiempo. Mantén la misma persona${entry.family==='NORK'?' y el mismo objeto':''}.`:'Mira la forma y reconoce sus datos.');
 $('options').hidden=state.settings.mode!=='quiz';$('flipArea').hidden=state.settings.mode!=='cards';$('writeForm').hidden=state.settings.mode!=='write';
 $('flipButton').hidden=false;$('cardAnswer').hidden=true;$('feedback').hidden=true;$('nextButton').hidden=true;
 $('options').innerHTML=q.options.map((value,i)=>`<button class="option" data-answer="${esc(value)}"><span class="key">${i+1}</span><span>${esc(value)}</span></button>`).join('');
 $('writeInput').value='';$('writeInput').disabled=false;$('writeForm').querySelector('button').disabled=false;
 $('cardAnswer').querySelectorAll('button').forEach(b=>b.disabled=false);
 $('retryNote').textContent=s?.retryAt!=null?'Repaso de una forma que te costó.':'Tus errores volverán a aparecer.';
 $('shortcut').textContent=state.settings.mode==='quiz'?'Teclas 1–4 · espacio para seguir':'Espacio para revelar o seguir';updateCounters();
}
function respond(value,self=false){
 if(answered||!q)return;stopTimer();answered=true;
 const correct=self?value==='yes':(q.accepted||[q.answer.toLowerCase()]).includes(value.toLowerCase().trim());
 state.step++;state.total++;state.days[day()]=(state.days[day()]||0)+1;state.streak=correct?state.streak+1:0;
 const stat=E.record(state.stats,q.entry.id,correct,state.step);stat.retryKind=correct?null:q.kind;
 roundCount++;if(correct)roundHits++;else roundErrors.push(q.entry.id);save();
 $('options').querySelectorAll('button').forEach(b=>{b.disabled=true;if(b.dataset.answer===q.answer)b.classList.add('correct');else if(b.dataset.answer===value)b.classList.add('wrong');});
 $('cardAnswer').querySelectorAll('button').forEach(b=>b.disabled=true);$('writeInput').disabled=true;$('writeForm').querySelector('button').disabled=true;
 $('feedback').hidden=false;$('feedback').classList.toggle('error',!correct);
 const title=self?(correct?'Bien: la recordabas.':value==='doubt'?'La volveremos a practicar.':'No pasa nada. Mira la forma y sigue.'):(correct?'Bien hecho.':`La forma correcta es ${q.answer}.`);
 $('feedback').innerHTML=`<strong>${esc(title)}</strong>${esc(q.explanation)}${!correct?'<br>Volverá después de unas pocas preguntas.':''}`;
 $('nextButton').hidden=false;updateCounters();
 if(roundCount>=20){$('nextButton').innerHTML='Ver esta tanda <span>→</span>';}
 else{$('nextButton').innerHTML='Siguiente tarjeta <span>→</span>';}
 if(state.settings.quick&&state.settings.mode==='quiz')timer=setTimeout(next,correct?900:2400);
}
function next(){if(!answered)return;stopTimer();if(roundCount>=20){roundSummary();}else newQuestion();}
function openDialog(title,html){stopTimer();$('dialogTitle').textContent=title;$('dialogBody').innerHTML=html;if(!$('dialog').open)$('dialog').showModal();}
function closeDialog(){$('dialog').close();}
function roundSummary(){
 const errors=[...new Set(roundErrors)].map(id=>E.entries.find(e=>e.id===id)).filter(Boolean);
 openDialog('Tanda terminada. ¿Otras 20?',`<div class="modal-figure">${roundHits}<span style="font-size:23px"> / 20</span></div><p>${state.settings.mode==='cards'?'Tarjetas que has marcado como «la sabía».':'Respuestas correctas en esta tanda.'} No es un examen: puedes seguir todo lo que quieras.</p>${errors.length?'<p><b>Volveremos a practicar:</b></p>'+errors.slice(0,6).map(e=>`<div class="stat-row"><span>${esc(e.module?e.verb:E.pronoun(e)+' · '+e.verb)}<small>${esc(e.detail||(e.tense==='past'?'Pasado':'Presente'))}</small></span><b>${esc(e.form)}</b></div>`).join(''):'<p>Muy buena tanda. Vuelve a este bloque otro día para comprobar que lo recuerdas.</p>'}<div class="dialog-actions"><button id="continueRound" class="primary">Otras 20 →</button><button id="finishRound" class="quiet">Descansar</button></div>`);
 $('continueRound').onclick=()=>{roundCount=0;roundHits=0;roundErrors=[];closeDialog();newQuestion();};
 $('finishRound').onclick=()=>{roundCount=0;roundHits=0;roundErrors=[];closeDialog();newQuestion();toast('Progreso guardado. Puedes cerrar y volver más tarde.');};
}
function changed(){if(roundCount>=20){roundCount=0;roundHits=0;roundErrors=[];}sanitize();save();renderSettings();recent=[];newQuestion();}
['module','topic','number'].forEach(id=>$(id).onchange=()=>{state.settings[id]=$(id).value;if(id==='module')state.settings.topic='';changed();});
['family','tense','object','mode'].forEach(group=>$(group).onclick=e=>{
 const b=e.target.closest('button');if(!b)return;const value=b.dataset.value;
 if(group==='mode'&&value==='write'&&state.total<40){openDialog('Primero, reconocer. Después, escribir.','<p>Haz al menos 40 tarjetas antes de activar la escritura. Ahora puedes elegir opciones o dar la vuelta a las tarjetas. La escritura es opcional y nunca sustituye esos modos.</p>');return;}
 state.settings[group]=value;
 if(group==='family')state.settings.verbs=[value==='NORK'?'EDUKI':'EGON'];changed();
});
$('verbs').onclick=e=>{let b=e.target.closest('button');if(!b)return;const v=b.dataset.verb,s=state.settings;if(s.verbs.includes(v)){if(s.verbs.length===1){toast('Deja seleccionado al menos un verbo.');return;}s.verbs=s.verbs.filter(x=>x!==v);}else s.verbs.push(v);changed();};
$('allVerbs').onclick=()=>{let vs=E.specs.filter(v=>state.settings.family==='ALL'||v[2]===state.settings.family).map(v=>v[0]);state.settings.verbs=state.settings.verbs.length===vs.length?[vs[0]]:vs;changed();};
['hi','quick','mixed','hika'].forEach(id=>$(id).onchange=()=>{if(id==='mixed')state.settings.direction=$('mixed').checked?'mixed':'form';else state.settings[id]=id==='hika'?$('hika').value:$(id).checked;changed();});
$('options').onclick=e=>{const b=e.target.closest('button');if(b&&!b.disabled)respond(b.dataset.answer);};
$('nextButton').onclick=next;
$('flipButton').onclick=()=>{$('flipButton').hidden=true;$('cardAnswer').hidden=false;$('revealedForm').textContent=q.answer;};
document.querySelectorAll('[data-rating]').forEach(b=>b.onclick=()=>respond(b.dataset.rating,true));
$('writeForm').onsubmit=e=>{e.preventDefault();const value=$('writeInput').value.trim();if(!value){$('writeInput').focus();return;}respond(value);};
$('closeDialog').onclick=closeDialog;
$('dialog').onclick=e=>{if(e.target===$('dialog')){const r=$('dialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();}};
$('settingsToggle').onclick=()=>{const open=$('settings').classList.toggle('open');$('settingsToggle').setAttribute('aria-expanded',String(open));};
$('pauseButton').onclick=()=>openDialog('Pausa. Lo que llevas cuenta.',`<p>Llevas <b>${state.days[day()]||0}</b> tarjetas hoy y <b>${state.total}</b> en total. El progreso se guarda en este navegador.</p><p>Puedes cerrar y volver después. No hay cuenta atrás ni penalización.</p><div class="dialog-actions"><button class="primary" id="resume">Seguir practicando</button></div>`),$('pauseButton').addEventListener('click',()=>{$('resume').onclick=closeDialog;});
$('shareButton').onclick=async()=>{try{await navigator.clipboard.writeText(location.href.split('#')[0]);toast('Enlace copiado. El acceso depende de la privacidad del sitio.');}catch(_){openDialog('Enlace del entrenador',`<p>Copia este enlace:</p><input style="width:100%;padding:12px" readonly value="${esc(location.href.split('#')[0])}"><p>El progreso no se copia con el enlace.</p>`);}};
function showTable(){
 if(state.settings.module!=='trinkoak'){
  const list=all();openDialog(E.modules[state.settings.module]+' · consulta','<p>Respuestas del bloque seleccionado. La práctica seguirá disponible al cerrar.</p>'+list.map(e=>`<div class="reference-row"><b>${esc(e.answer)}</b><p>${esc(e.explanation||e.display.replace('_____',e.answer))}<br><small>${esc(e.detail)}</small></p></div>`).join(''));return;
 }
 let html='<p>Consulta las formas de los verbos seleccionados. En NORK, «una / varias» se refiere a lo que tienes, sabes, llevas o traes.</p>';
 for(const v of E.specs.filter(v=>state.settings.verbs.includes(v[0]))){html+=`<h3>${v[0]} · ${v[1]}</h3>`;const counts=v[2]==='NOR'?['one']:['one','many'];for(const count of counts){if(v[2]==='NORK')html+=`<p><b>${count==='one'?'Una cosa':'Varias cosas'}</b></p>`;html+='<div class="table-scroll"><table class="modal-table"><thead><tr><th>Persona</th><th>Presente</th><th>Pasado</th></tr></thead><tbody>';for(const person of E.persons.filter(p=>state.settings.hi||p!=='hi')){const find=t=>E.entries.find(e=>e.verb===v[0]&&e.person===person&&e.tense===t&&e.count===count&&(!e.hika||e.hika===state.settings.hika));let a=find('present'),b=find('past');html+=`<tr><td>${E.pronoun(a)}</td><td>${a.form}</td><td>${b.form}</td></tr>`;}html+='</tbody></table></div>';}}
 html+='<p class="table-note">Formas de indicativo de euskera batua. Para HIK, se usa la variante masculina o femenina elegida en los ajustes. <a href="https://www.euskaltzaindia.eus/dok/euskera/7623.pdf" target="_blank" rel="noopener">Referencia: Euskaltzaindia</a>.</p>';openDialog('La tabla, a mano.',html);
}
$('tableButton').onclick=showTable;
function showStats(){
 const list=all(),seen=list.filter(e=>state.stats[e.id]?.seen),mastered=list.filter(e=>state.stats[e.id]?.streak>=4),hard=[...seen].sort((a,b)=>(state.stats[b.id].misses-state.stats[a.id].misses)||(state.stats[a.id].streak-state.stats[b.id].streak)).filter(e=>state.stats[e.id].misses>0).slice(0,10);
 let html=`<div class="modal-figure">${state.total.toLocaleString('es')}</div><p>Tarjetas practicadas en total. Hoy: <b>${state.days[day()]||0}</b>.</p><p>Bloque actual: <b>${seen.length} / ${list.length}</b> formas vistas y <b>${mastered.length}</b> afianzadas (4 respuestas seguidas bien). Es un indicador de práctica, no una garantía de haberlas memorizado.</p><h3>Las que conviene repetir</h3>`;
 html+=hard.length?hard.map(e=>`<div class="stat-row"><span>${esc(e.module?e.verb:E.pronoun(e)+' · '+e.verb)}<small>${esc(e.detail||(e.tense==='past'?'Pasado':'Presente'))}</small></span><span><b>${esc(e.form)}</b><small>${state.stats[e.id].misses} fallos</small></span></div>`).join(''):'<p>Aquí aparecerán las formas que te cuesten.</p>';
 html+='<div class="dialog-actions"><button id="exportProgress" class="quiet">Guardar copia del progreso</button><button id="importProgress" class="quiet">Cargar copia</button><button id="resetProgress" class="text-button">Borrar progreso</button><input id="importFile" type="file" accept="application/json,.json" hidden></div><p class="table-note">Guardado local: cambiar de navegador o borrar sus datos puede eliminar el progreso. Una copia permite llevarlo a otro dispositivo.</p>';openDialog('Cada repetición cuenta.',html);
 $('exportProgress').onclick=()=>{const blob=new Blob([JSON.stringify({...state,version:1},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='trinkoak-progreso.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);};
 $('importProgress').onclick=()=>$('importFile').click();$('importFile').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>2000000)throw Error();const data=JSON.parse(await file.text());if(data.version!==1||!data.settings||!data.stats||typeof data.total!=='number')throw Error();if(!confirm('¿Sustituir el progreso de este navegador por el de la copia?'))return;state={...state,...data};sanitize();save();roundCount=0;roundHits=0;roundErrors=[];closeDialog();renderSettings();newQuestion();toast('Progreso cargado.');}catch(_){toast('La copia no es válida. Usa una exportada por este entrenador.');}};
 $('resetProgress').onclick=()=>{if(confirm('¿Borrar todo el progreso de este entrenador en este navegador? Esta acción no se puede deshacer si no tienes una copia.')){state={settings:{...state.settings},stats:{},total:0,days:{},step:0,streak:0};roundCount=0;roundHits=0;roundErrors=[];save();closeDialog();newQuestion();}};
}
$('statsButton').onclick=showStats;
$('helpButton').onclick=()=>openDialog('Muchísimas tarjetas. Bloques pequeños.','<p><b>1.</b> Empieza con un verbo y un tiempo. Elige una de las cuatro opciones. La respuesta se muestra al instante.</p><p><b>2.</b> Los errores vuelven después de unas pocas preguntas; las formas que cuestan se practican más. Tras cada tanda de 20 puedes seguir con otras 20, sin límite.</p><p><b>3.</b> En «Dale la vuelta», piensa la respuesta antes de verla. Marca «la sabía» solo si la recordabas. «Dudaba» vuelve al repaso, como «no la sabía».</p><p><b>4.</b> Añade verbos y pasado poco a poco. «Variar» también pregunta persona, verbo y cambio de tiempo. HI / HIK está apagado al empezar.</p><p><b>5.</b> Escribir se habilita tras 40 tarjetas, pero sigue siendo opcional. No hay cronómetro ni puntos que se pierdan.</p><p>Haz varias tandas cortas y vuelve otro día. El progreso se guarda aquí, en este navegador. Puedes exportarlo en «Mi progreso».</p>');
document.addEventListener('keydown',e=>{if($('dialog').open||e.target.matches('input,select,textarea'))return;if(/^[1-4]$/.test(e.key)&&state.settings.mode==='quiz'&&!answered){const b=$('options').children[Number(e.key)-1];if(b)b.click();}if(e.code==='Space'){e.preventDefault();if(answered)next();else if(state.settings.mode==='cards'&&!$('flipButton').hidden)$('flipButton').click();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopTimer();save();}});
load();const requestedModule=new URLSearchParams(location.search).get('module');if(E.modules[requestedModule]){state.settings.module=requestedModule;state.settings.topic='';sanitize();}renderSettings();newQuestion();if(storageWarning)toast('El navegador no permite guardar el progreso.');

