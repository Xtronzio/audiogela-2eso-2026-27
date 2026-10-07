import json,re,subprocess,xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
root=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self,s):
  super().__init__();self.hrefs=[];self.srcs=[];self.paragraphs=[];self.current=None;self.feed(s)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'href' in a:self.hrefs.append(a['href'])
  if tag=='audio':self.srcs.append(a['src'])
  if tag=='p':self.current=[]
  if tag=='br' and self.current is not None:self.current.append('\n')
 def handle_data(self,data):
  if self.current is not None:self.current.append(data)
 def handle_endtag(self,tag):
  if tag=='p':self.paragraphs.append(''.join(self.current));self.current=None
records=json.loads((root/'scripts/audio-texts-manifest.json').read_text());assert len(records)==22
index=Page((root/'index.html').read_text());assert len(index.srcs)==22
for r in records:
 p=Page((root/r['page']).read_text())
 assert p.srcs==[r['audio']]
 assert r['page'] in index.hrefs
 assert 'index.html#'+r['id'] in p.hrefs
 assert len(p.paragraphs)==r['paragraphs']
 if r['page'].startswith('guion-historia-u1-t07'):
  lang=r['lang'];original=json.loads((root/'scripts/alandalus-content.json').read_text())[lang]['paragraphs']
 else:original=(root/'scripts/narrations'/r['page'].replace('.html','.txt')).read_text().strip().split('\n\n')
 assert p.paragraphs==[s.strip() for s in original],r['page']
 assert (root/r['audio']).exists()
ns={'itunes':'http://www.itunes.com/dtds/podcast-1.0.dtd','content':'http://purl.org/rss/1.0/modules/content/'}
for feed,count in [('feed.xml',14),('feed-fiki.xml',8)]:
 new=ET.fromstring((root/feed).read_text());old=ET.fromstring(subprocess.check_output(['git','show','HEAD:'+feed],cwd=root))
 ni=new.findall('./channel/item');oi=old.findall('./channel/item');assert len(ni)==len(oi)==count
 assert [i.findtext('guid') for i in ni]==[i.findtext('guid') for i in oi]
 for a,b in zip(ni,oi):
  assert a.findtext('itunes:episode',namespaces=ns)==b.findtext('itunes:episode',namespaces=ns)
  assert a.findtext('itunes:season',namespaces=ns)==b.findtext('itunes:season',namespaces=ns)
  audio=a.find('enclosure').get('url').split('/')[-1];r=next(r for r in records if r['audio']==audio)
  assert r['page'] in a.findtext('content:encoded',namespaces=ns)
  if audio=='07-historia-eus-u1-al-andalus-google-r2.mp3':
   m=json.loads((root/'scripts/alandalus-audio-manifest.json').read_text())['eus']
   assert m['voice']=='Google TTS · eu'
   assert int(a.find('enclosure').get('length'))==(root/audio).stat().st_size==m['bytes']
   assert len(m['paragraphs'])==13
  else:assert a.find('enclosure').attrib==b.find('enclosure').attrib
for name in ['test-historia-u1-t07-cast.html','test-historia-u1-t07-eus.html','catalog.js']:
 assert (root/name).read_bytes()==subprocess.check_output(['git','show','HEAD:'+name],cwd=root)
print('PASS: 22 exact texts + links + audio files; 22 RSS items preserve identity; Google EU narration complete; quizzes unchanged.')
