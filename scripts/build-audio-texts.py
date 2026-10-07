"""Publish original narration texts for every current 2ESO audio."""
import html,json,os,re,subprocess
from datetime import datetime,timezone
from email.utils import format_datetime
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path(os.environ.get('AUDIOGELA_ORIGINAL_NARRATIONS', str(ROOT/'scripts/narrations')))
orig=ROOT/'scripts/narrations';orig.mkdir(exist_ok=True)
cast=['Podcast_tema_1_comienzo_Edad_Media_guion.txt','Podcast_tema_2_Imperio_bizantino_guion.txt','Podcast_tema_3_reinos_germanicos_guion.txt','Podcast_tema_4_reino_visigodo_guion.txt','Podcast_tema_5_Imperio_carolingio_guion.txt','Podcast_tema_6_nacimiento_expansion_islam_guion.txt']
for lang in ['cast','eus']:
 for i in range(1,7):
  filename=f'guion-historia-u1-t{i:02}-{lang}.txt'
  source=SOURCE/(cast[i-1] if lang=='cast' else filename)
  if source.exists():(orig/filename).write_text(source.read_text())
unit=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {unit} from './fiki/u1-data.mjs';process.stdout.write(JSON.stringify(unit));"],cwd=ROOT))
al=json.loads((ROOT/'scripts/alandalus-content.json').read_text())
css=''' :root{--blue:#0b438f;--text:#172f46;--muted:#607486;--line:#cbd7e3}*{box-sizing:border-box}body{margin:0;background:#eef3f8;color:var(--text);font-family:Arial,Helvetica,sans-serif}.toolbar{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;padding:14px;background:#fff;border-bottom:1px solid var(--line)}.toolbar a,.toolbar button{padding:10px 14px;border-radius:10px;border:1px solid var(--blue);background:#fff;color:var(--blue);font:inherit;font-weight:700;text-decoration:none;cursor:pointer}.page{width:min(900px,calc(100% - 24px));margin:20px auto;background:#fff;padding:clamp(20px,5vw,48px);border-radius:16px;box-shadow:0 12px 35px rgba(20,49,75,.1)}header{border-bottom:3px solid var(--blue);padding-bottom:16px;margin-bottom:24px}.brand{font-size:12px;color:var(--blue);font-weight:800;letter-spacing:1.2px}h1{font-size:clamp(25px,4vw,34px);line-height:1.2;color:var(--blue);margin:12px 0}.label{color:var(--muted);font-size:15px}p{font-size:18px;line-height:1.75;margin:0 0 20px}audio{width:100%;margin-top:12px}footer{border-top:1px solid var(--line);padding-top:16px;color:var(--muted);font-size:14px}@media print{@page{size:A4;margin:18mm}.toolbar,audio{display:none}body{background:#fff}.page{width:auto;margin:0;padding:0;border-radius:0;box-shadow:none}p{font-size:12pt;line-height:1.55}header{break-after:avoid}h1{font-size:21pt}}'''
index=(ROOT/'index.html').read_text();records=[]
def episode(match):
 whole=match[0];eid=match[1];body=match[2]
 title=html.unescape(re.search(r'<strong>(.*?)</strong>',body,re.S)[1])
 audio=html.unescape(re.search(r'<audio[^>]*src="([^"]+)',body)[1])
 if eid.startswith('historia-'):
  lang='eus' if 'euskara' in eid else 'cast';i=int(eid[-2:]);filename=f'guion-historia-u1-t{i:02}-{lang}.html';subject='HISTORIA · GIZA'
  if i==7:paragraphs=al[lang]['paragraphs']
  else:paragraphs=(orig/f'guion-historia-u1-t{i:02}-{lang}.txt').read_text().strip().split('\n\n')
 else:
  lang='eus' if '-eus-' in eid else 'cast';i=int(eid[-1]);filename=f'guion-fiki-u1-t{i:02}-{lang}.html';subject='FÍSICA Y QUÍMICA · FIKI' if lang=='cast' else 'FISIKA ETA KIMIKA · FIKI'
  topic=unit[lang]['topics'][i-1]
  intro='AUDIO GELA. Física y Química. Segundo de ESO. Unidad uno. ' if lang=='cast' else 'AUDIO GELA. Fisika eta Kimika. Bigarren maila. Lehenengo unitatea. '
  paragraphs=[intro+topic['title']+'.',*topic['paragraphs']]
  (orig/f'guion-fiki-u1-t{i:02}-{lang}.txt').write_text('\n\n'.join(paragraphs)+'\n')
 label='Texto del audio' if lang=='cast' else 'Audioaren testua';printing='Imprimir texto' if lang=='cast' else 'Testua inprimatu'
 page=f'<!doctype html><html lang="{"es" if lang=="cast" else "eu"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0B438F"><title>{label} · {html.escape(title)} · AUDIO GELA</title><link rel="icon" href="favicon.ico"><style>{css}</style></head><body><nav class="toolbar"><a href="index.html#{eid}">← AUDIO GELA</a><button type="button" onclick="window.print()">{printing}</button></nav><main class="page"><header><div class="brand">AUDIO GELA · 2.º ESO · {subject} · {lang.upper()}</div><h1>{html.escape(title)}</h1><div class="label">{label}</div><audio controls preload="none" src="{audio}" aria-label="{html.escape(title,quote=True)}"></audio></header>'+'\n'.join('<p>'+html.escape(p.strip()).replace('\n','<br>')+'</p>' for p in paragraphs)+f'<footer>AUDIO GELA · T{i:02} · {lang.upper()}</footer></main></body></html>\n'
 if eid.startswith('historia-') and i==7:
  source='Gelako materiala: Al-Andalusen laburpena, 8., 9. eta 10. atalak.' if lang=='eus' else 'Material de clase: resumen de Al-Ándalus, apartados 8, 9 y 10.'
  links='<div class="label"><a href="https://tesauros.cultura.gob.es/tesauros/contextosculturales/1006736.html">Ministerio de Cultura · Emirato</a> · <a href="https://tesauros.cultura.gob.es/tesauros/contextosculturales/1006745.html">Califato</a> · <a href="https://www.alhambra-patronato.es/elemento-del-mes/el-origen-del-reino-nazari-y-de-la-alhambra">Patronato de la Alhambra · Nazarí</a></div>'
  page=page.replace('<footer>',f'<div class="label">{source}</div>{links}<footer>')
 (ROOT/filename).write_text(page)
 if not re.search(r'href="'+re.escape(filename)+r'"',whole):
  whole=whole.replace('<span class="resource-note">',f'<a class="resource" href="{filename}">{label}</a><span class="resource-note">')
 records.append({'id':eid,'audio':audio,'page':filename,'lang':lang,'paragraphs':len(paragraphs)})
 return whole
index=re.sub(r'<details class="episode[^>]*id="([^"]+)"[^>]*>(.*?)</details>',episode,index,flags=re.S)
(ROOT/'index.html').write_text(index)
for feed in ['feed.xml','feed-fiki.xml']:
 text=(ROOT/feed).read_text()
 def item(m):
  s=m[0];url=re.search(r'<enclosure[^>]*url="([^"]+)',s)[1].split('/')[-1]
  record=next((r for r in records if r['audio']==url),None)
  if record:
   label='Texto del audio' if record['lang']=='cast' else 'Audioaren testua'
   link=f'<p><a href="https://xtronzio.github.io/audiogela-2eso-2026-27/{record["page"]}">{label}</a></p>'
   if record['page'] not in s:
    if ']]></content:encoded>' in s:s=s.replace(']]></content:encoded>',link+']]></content:encoded>')
    else:s=s.replace('</item>',f'<content:encoded><![CDATA[{link}]]></content:encoded></item>')
  return s
 text=re.sub(r'<item>.*?</item>',item,text,flags=re.S)
 text=re.sub(r'<lastBuildDate>.*?</lastBuildDate>',f'<lastBuildDate>{format_datetime(datetime.now(timezone.utc),usegmt=True)}</lastBuildDate>',text)
 (ROOT/feed).write_text(text)
(ROOT/'scripts/audio-texts-manifest.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
assert len(records)==22
print(f'{len(records)} audios with complete original narration texts')
