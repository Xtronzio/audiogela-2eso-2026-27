"""Replace the T07 EU enclosure in place, retaining episode identity."""
import json,re
from datetime import datetime,timezone
from email.utils import format_datetime
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
m=json.loads((ROOT/'scripts/alandalus-audio-manifest.json').read_text())['eus']
old='07-historia-eus-u1-al-andalus.mp3';new=m['file'];secs=round(m['seconds']);duration=f'{secs//60}:{secs%60:02}'
p=ROOT/'index.html';s=p.read_text().replace(old,new)
s=re.sub(r'(<details class="episode" id="historia-euskara-u1-t07">.*?<span class="duration">).*?(</span>)',r'\g<1>'+duration+r'\2',s,flags=re.S);p.write_text(s)
p=ROOT/'feed.xml';s=p.read_text()
def fix(match):
 text=match[0]
 if 'audiogela-2eso-2026-27-historia-eus-u1-t07</guid>' in text:
  text=text.replace(old,new)
  text=re.sub(r'(<enclosure[^>]*length=")\d+("[^>]*>)',r'\g<1>'+str(m['bytes'])+r'\2',text)
  text=re.sub(r'<itunes:duration>.*?</itunes:duration>',f'<itunes:duration>{duration}</itunes:duration>',text)
 return text
s=re.sub(r'<item>.*?</item>',fix,s,flags=re.S)
s=re.sub(r'<lastBuildDate>.*?</lastBuildDate>',f'<lastBuildDate>{format_datetime(datetime.now(timezone.utc),usegmt=True)}</lastBuildDate>',s)
p.write_text(s)
print(f'EUS T07 updated: {new} · {duration} · {m["bytes"]}bytes')
