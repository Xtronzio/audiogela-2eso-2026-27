import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {parseHTML}=require(process.env.AUDIOGELA_QA_MODULES||'linkedom');
const read=p=>fs.readFileSync(p,'utf8');
const {document:catalogue}=parseHTML(read('index.html'));
const ids=[...catalogue.querySelectorAll('[id]')].map(x=>x.id);assert.equal(ids.length,new Set(ids).size);
let total=0;
for(let block=1;block<=7;block++)for(const lang of ['cast','eus']){
 const stem=`historia-u2-t${String(block).padStart(2,'0')}-${lang}`;
 const html=read(`test-${stem}.html`);
 const {document,window}=parseHTML(html);
 const saved=new Map();const localStorage={getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,String(v)),removeItem:k=>saved.delete(k)};
 Object.defineProperty(window,'localStorage',{value:localStorage,configurable:true});
 const context=vm.createContext({document,window,console});
 vm.runInContext(read(`preguntas-${stem}.js`),context);
 for(const script of document.querySelectorAll('script:not([src])'))vm.runInContext(script.textContent,context);
 const constant=`NIVELES_U2_T${String(block).padStart(2,'0')}${lang==='eus'?'_EUS':''}`;
 const levels=JSON.parse(vm.runInContext(`JSON.stringify(${constant})`,context));
 assert.equal(document.querySelectorAll('.level').length,5);assert.equal(levels.length,5);
 const allQuestions=[];
 for(let level=0;level<5;level++){
  const qs=levels[level].preguntas;assert.equal(qs.length,20);
  assert.deepEqual([0,1,2,3].map(i=>qs.filter(q=>q[2]===i).length),[5,5,5,5]);
  for(const q of qs){assert.equal(new Set(q[1]).size,4);assert.ok(q[0]&&q[3]);allQuestions.push(q[0]);}
  document.querySelectorAll('.level')[level].onclick();let seen=[];
  for(let round=0;round<2;round++){
   for(let n=0;n<10;n++){
    const q=vm.runInContext('questions[index]',context);seen.push(q[0]);
    const b=[...document.querySelectorAll('.answer')].find(b=>b.textContent===q[1][q[2]]);assert.ok(b);b.onclick();
    assert.equal(document.querySelectorAll('.answer.correct').length,1);
    assert.ok([...document.querySelectorAll('.answer')].every(b=>b.disabled));
    assert.ok(document.getElementById('feedback').textContent.includes(q[3]));
    // A second click cannot increase the score.
    b.onclick();assert.equal(vm.runInContext('correct',context),n+1);
    document.getElementById('next').onclick();
   }
   assert.equal(document.getElementById('score').textContent,'10/10');
   if(round===0)document.getElementById('retry').onclick();
  }
  assert.equal(new Set(seen).size,20,'10+10 must cover the entire bank');
  document.getElementById('levels-button').onclick();
 }
 assert.equal(new Set(allQuestions).size,100);total+=100;
 // Wrong answers display the correct option, produce zero points and preserve best score.
 document.querySelectorAll('.level')[0].onclick();
 for(let n=0;n<10;n++){
  const q=vm.runInContext('questions[index]',context);
  [...document.querySelectorAll('.answer')].find(b=>b.textContent!==q[1][q[2]]).onclick();
  assert.equal(document.querySelectorAll('.answer.wrong').length,1);
  assert.ok(document.getElementById('feedback').textContent.includes(q[1][q[2]]));document.getElementById('next').onclick();
 }
 assert.equal(document.getElementById('score').textContent,'0/10');assert.equal(Number(localStorage.getItem(`audiogela:2eso:u2:t${String(block).padStart(2,'0')}:${lang}:nivel:1`)),10);
 assert.ok([...saved.keys()].every(k=>k.startsWith(`audiogela:2eso:u2:t${String(block).padStart(2,'0')}:${lang}:`)));
 const {document:sheet}=parseHTML(read(`ficha-${stem}.html`));assert.equal(sheet.querySelectorAll('ol.questions > li').length,25);assert.equal(sheet.querySelectorAll('#solutions ol > li').length,25);
 for(const kind of ['test','guion','ficha']){
  const file=`${kind}-${stem}.html`;const {document:d}=parseHTML(read(file));
  assert.ok(!/Al-Ándalus|Al-Andalus|UNIDAD 1|1\. UNITATEA|U1 ·/.test(d.body.textContent),`${file} contains stale topic`);
  for(const a of d.querySelectorAll('a[href]')){
   const href=a.getAttribute('href');if(href.startsWith('http'))continue;
   const [path,hash]=href.split('#');assert.ok(fs.existsSync(path.split('?')[0]),`Missing link ${file} -> ${href}`);
   if(hash)assert.ok(ids.includes(hash),`Missing catalogue anchor ${hash}`);
  }
 }
 const manifest=JSON.parse(read(`scripts/giza-u2-audio-t${String(block).padStart(2,'0')}-${lang}.json`));const file=manifest.file;
 assert.equal(fs.statSync(file).size,manifest.bytes);assert.ok(manifest.seconds>150&&manifest.seconds<900);
 assert.equal(manifest.voice,lang==='cast'?'es-ES-ElviraNeural':'Google TTS · eu');
 const narration=read('scripts/giza-u2-narrations.txt').split(`[${block} ${lang}]\n`)[1].split(/\n\[\d /)[0].trim();
 const digest=(await import('node:crypto')).createHash('sha256').update(narration+manifest.voice).digest('hex');assert.equal(manifest.text_sha256,digest);
 const {document:t}=parseHTML(read(`guion-${stem}.html`));assert.equal([...t.querySelectorAll('main > p')].map(p=>p.textContent).join('\n\n'),narration);
 const sec=Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',file],{encoding:'utf8'}));assert.ok(Math.abs(sec-manifest.seconds)<.1);
 console.log(`${stem}: quiz rounds, feedback, score, worksheet, transcript, audio OK`);
}
assert.equal(total,1400);
// Existing unrelated resources and lessons must stay byte-identical.
const changes=execFileSync('git',['diff','--name-only','HEAD'],{encoding:'utf8'}).split('\n').filter(Boolean);
for(const file of changes)assert.ok(file==='index.html'||file==='feed.xml'||file==='README.md'||file==='.gitignore'||file.includes('u2')||file.startsWith('.audio-cache/')||file.includes('__pycache__'),`Unexpected change: ${file}`);
console.log('1400 questions and preservation checks passed.');
