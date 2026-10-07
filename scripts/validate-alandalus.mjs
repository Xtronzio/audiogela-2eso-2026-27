import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {parseQuestions} from './build-alandalus.mjs';

const require=createRequire(import.meta.url);
const {parseHTML}=require(process.env.AUDIOGELA_QA_MODULES||'linkedom');
const read=p=>fs.readFileSync(p,'utf8');
const old=p=>execFileSync('git',['show',`HEAD:${p}`],{encoding:'utf8'});
const data=JSON.parse(read('scripts/alandalus-content.json'));
const manifest=JSON.parse(read('scripts/alandalus-audio-manifest.json'));

for(const lang of ['cast','eus']){
 const html=read(`test-historia-u1-t07-${lang}.html`);
 const {document,window}=parseHTML(html);
 window.HTMLElement.prototype.scrollIntoView=()=>{};
 const saved=new Map();
 const localStorage={getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,String(v)),removeItem:k=>saved.delete(k)};
 const context=vm.createContext({document,window,localStorage,console});
 vm.runInContext(read(`preguntas-historia-u1-t07-${lang}.js`),context);
 for(const script of document.querySelectorAll('script:not([src])'))vm.runInContext(script.textContent,context);
 assert.equal(document.querySelectorAll('.level').length,5);
 const levels=parseQuestions(lang);
 for(let level=0;level<5;level++){
  assert.equal(levels[level].preguntas.length,20);
  assert.deepEqual([0,1,2,3].map(i=>levels[level].preguntas.filter(q=>q[2]===i).length),[5,5,5,5]);
  for(const q of levels[level].preguntas){assert.equal(new Set(q[1]).size,4);assert.ok(q[0]&&q[3]);}
  document.querySelectorAll('.level')[level].onclick();
  let seen=[];
  for(let round=0;round<2;round++){
   for(let n=0;n<10;n++){
    seen.push(document.getElementById('question').textContent);
    const right=vm.runInContext('questions[index][1][questions[index][2]]',context);
    const button=[...document.querySelectorAll('.answer')].find(b=>b.textContent===right);
    assert.ok(button);button.onclick();
    assert.equal(document.querySelectorAll('.answer.correct').length,1);
    assert.ok(document.getElementById('feedback').textContent.includes(vm.runInContext('questions[index][3]',context)));
    document.getElementById('next').onclick();
   }
   assert.equal(document.getElementById('score').textContent,'10/10');
   if(round===0)document.getElementById('retry').onclick();
  }
  assert.equal(new Set(seen).size,20,'Two attempts must cover all questions without repeats');
  document.getElementById('levels-button').onclick();
 }
 // Also take a wrong answer and make sure it displays the correct explanation.
 document.querySelector('.level').onclick();
 const correct=vm.runInContext('questions[index][1][questions[index][2]]',context);
 [...document.querySelectorAll('.answer')].find(b=>b.textContent!==correct).onclick();
 assert.equal(document.querySelectorAll('.answer.wrong').length,1);
 assert.equal(document.querySelectorAll('.answer.correct').length,1);
 const {document:worksheet}=parseHTML(read(`ficha-historia-u1-t07-${lang}.html`));
 assert.equal(worksheet.querySelectorAll('.questions > li').length,25);
 assert.equal(worksheet.querySelectorAll('#solutions ol > li').length,25);
 const record=manifest[lang];assert.equal(record.paragraphs.length,data[lang].paragraphs.length);
 assert.equal(record.bytes,fs.statSync(data[lang].file).size);
 assert.ok(Math.abs(record.seconds-record.paragraphs.reduce((sum,p)=>sum+p.seconds,0))<1);
 execFileSync('ffmpeg',['-v','error','-i',data[lang].file,'-f','null','-']);
 console.log(`PASS ${lang}: 100 preguntas, cinco niveles, rotación 10+10, aciertos/errores, ficha y MP3 completo`);
}

const {document:current}=parseHTML(read('index.html'));
const {document:original}=parseHTML(old('index.html'));
for(const item of original.querySelectorAll('details.episode[id]'))assert.equal(current.getElementById(item.id).outerHTML,item.outerHTML,`Changed old lesson ${item.id}`);
for(const lang of ['castellano','euskara']){
 const parent=current.getElementById(`historia-${lang}-u1-t07`).parentElement;
 assert.deepEqual([...parent.children].filter(e=>e.tagName==='DETAILS').map(e=>e.id),Array.from({length:7},(_,i)=>`historia-${lang}-u1-t${String(i+1).padStart(2,'0')}`));
}
for(const file of execFileSync('git',['ls-files'],{encoding:'utf8'}).trim().split('\n')){
 if(['index.html','feed.xml'].includes(file))continue;
 assert.ok(fs.readFileSync(file).equals(execFileSync('git',['show',`HEAD:${file}`],{maxBuffer:20_000_000})),`Changed existing resource ${file}`);
}
execFileSync('python',['-c',String.raw`
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET
import subprocess
class Links(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.ids=set()
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:
   assert a['id'] not in self.ids;self.ids.add(a['id'])
  if tag in ('a','audio','script','img','link'):
   value=a.get('href') or a.get('src')
   if value:self.links.append(value)
for f in [Path('index.html'),*Path('.').glob('*t07*.html')]:
 p=Links();p.feed(f.read_text())
 for ref in p.links:
  u=urlsplit(ref)
  if not u.scheme and u.path and not u.path.startswith('/'):
   assert Path(u.path).is_file(),(f,ref)
ns={'i':'http://www.itunes.com/dtds/podcast-1.0.dtd'}
channel=ET.parse('feed.xml').getroot().find('channel');items=channel.findall('item')
before=ET.fromstring(subprocess.check_output(['git','show','HEAD:feed.xml'])).find('channel').findall('item')
assert len(items)==len(before)+2
assert len({i.findtext('guid') for i in items})==len(items)
for old in before:
 new=next(i for i in items if i.findtext('guid')==old.findtext('guid'))
 assert ET.tostring(old).strip()==ET.tostring(new).strip(),'Changed old RSS episode'
new=[i for i in items if i.findtext('i:episode',namespaces=ns)=='7']
assert len(new)==2 and {i.findtext('i:season',namespaces=ns) for i in new}=={'1','2'}
for i in new:
 e=i.find('enclosure');p=Path(urlsplit(e.attrib['url']).path.rsplit('/',1)[-1])
 assert p.stat().st_size==int(e.attrib['length'])
print('PASS web: T07 después de T06, enlaces correctos y 14 episodios en RSS')
`],{stdio:'inherit'});
console.log('PASS contenido anterior de Historia, FIKI y Euskara sin modificaciones');
