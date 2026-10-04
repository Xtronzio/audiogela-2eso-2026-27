import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {unit,audioFile} from '../fiki/u1-data.mjs';
import {blockQuestionBank} from '../fiki/block-bank.mjs';
const manifest=JSON.parse(fs.readFileSync('fiki/audio-manifest.json'));
for(const lang of ['cast','eus'])for(let topic=0;topic<4;topic++){
 const filename=audioFile(lang,topic),meta=manifest[filename];
 assert.equal(meta.voice,'es-ES-ElviraNeural');assert.equal(meta.segments.length,unit[lang].topics[topic].paragraphs.length+1);
 assert.equal(fs.statSync(filename).size,meta.bytes);
 const seconds=Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',filename],{encoding:'utf8'}));
 assert.ok(Math.abs(seconds-meta.seconds)<.1);assert.ok(Math.abs(seconds-meta.segments.reduce((n,s)=>n+s.seconds,0))<1);
 execFileSync('ffmpeg',['-v','error','-i',filename,'-f','null','-'],{stdio:'pipe'});
 const html=fs.readFileSync(`test-fiki-u1-b${topic+1}-${lang}.html`,'utf8');
 const bank=JSON.parse(html.match(/const FIKI_LEVELS=(.*?);\n/)[1]);
 const authored=blockQuestionBank(lang,topic);
 assert.equal(bank.length,5);
 for(const level of bank){assert.equal(level.preguntas.length,20);assert.deepEqual(level.preguntas,authored.filter(q=>q.level===level.nivel).map(q=>[q.prompt,q.options,q.correct,q.explanation]));}
 assert.ok(html.includes(`audiogela:fiki:u1:b${topic+1}:${lang}:r2:`));
 assert.ok(!html.includes('HISTORIA'));
 for(const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(script[1]);
 const sheet=fs.readFileSync(`ficha-fiki-u1-b${topic+1}-${lang}.html`,'utf8');
 const printablePrompts=bank.flatMap((level,l)=>[0,1,2,3,4].map(offset=>level.preguntas[(l*4+offset)%20][0]));
 const printableConcepts=printablePrompts.map(prompt=>authored.find(q=>q.prompt===prompt).id.split('-q')[1]);
 assert.equal(new Set(printableConcepts).size,20);
 assert.ok(sheet.includes('id="solutions"'));assert.ok(!sheet.includes('HISTORIA'));
}
const python=`
from pathlib import Path
from html.parser import HTMLParser
import xml.etree.ElementTree as ET
from urllib.parse import urlsplit
import subprocess
class Page(HTMLParser):
 def __init__(self):super().__init__();self.refs=[];self.ids=[];self.lists={};self.active=None;self.depth=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  for key in ('href','src'):
   if key in a:self.refs.append(a[key])
  if tag=='ol':
   if a.get('class')=='questions':self.active='questions';self.depth=0
   elif self.active is None:self.active='solutions';self.depth=0
   self.depth+=1
  if tag=='li' and self.active and self.depth==1:self.lists[self.active]=self.lists.get(self.active,0)+1
  if tag=='ul' and self.active:self.depth+=1
 def handle_endtag(self,tag):
  if tag in ('ol','ul') and self.active:
   self.depth-=1
   if self.depth==0:self.active=None
files=[Path('index.html'),*Path('.').glob('*fiki*.html')]
for file in files:
 p=Page();p.feed(file.read_text());assert len(p.ids)==len(set(p.ids)),file
 for ref in p.refs:
  parsed=urlsplit(ref)
  if parsed.scheme or ref.startswith('/') or not parsed.path:continue
  target=file.parent/parsed.path
  assert target.exists(),(file,ref)
 if file.name.startswith('ficha-fiki'):assert p.lists=={'questions':25,'solutions':25},(file,p.lists)
feed=ET.parse('feed-fiki.xml');items=feed.findall('./channel/item');assert len(items)==8
old=ET.fromstring(subprocess.check_output(['git','show','HEAD:feed-fiki.xml']))
assert {i.findtext('guid') for i in items}=={i.findtext('guid') for i in old.findall('./channel/item')}
for item in items:
 enc=item.find('enclosure');path=Path(urlsplit(enc.attrib['url']).path).name
 assert path.endswith('-r2.mp3');assert int(enc.attrib['length'])==Path(path).stat().st_size
# History files, feed and the remembered active-subject controller must stay byte-identical.
for name in ['feed.xml','catalog.js',*[p.name for p in Path('.').glob('*historia*.html')],*[p.name for p in Path('.').glob('*historia*.mp3')]]:
 assert subprocess.check_output(['git','show','HEAD:'+name])==Path(name).read_bytes(),name
print('PASS: local references, 8 printable sheets, stable podcast GUIDs/enclosures and Historia preserved.')
`;
execFileSync('python',['-c',python],{stdio:'inherit'});
console.log('PASS: 8 full narrated tracks, 800 emitted questions and isolated block keys.');
