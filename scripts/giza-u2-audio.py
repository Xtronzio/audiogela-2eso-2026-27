"""Generate U2 using the established Historia voices; cache and verify all segments."""
import asyncio,base64,hashlib,importlib,json,os,re,ssl,subprocess,time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import requests
from gtts import gTTS
import edge_tts
ROOT=Path(__file__).resolve().parents[1]
CERT=os.environ.get('CODEX_PROXY_CERT') or ssl.get_default_verify_paths().cafile
importlib.import_module('edge_tts.communicate')._SSL_CTX=ssl.create_default_context(cafile=CERT)
def load():
    items=[];item=None
    for line in (ROOT/'scripts/giza-u2-narrations.txt').read_text().splitlines():
        m=re.fullmatch(r'\[(\d) (cast|eus)\]',line)
        if m:
            item={'block':int(m[1]),'lang':m[2],'paragraphs':[]};items.append(item)
        elif line.strip():item['paragraphs'].append(line.strip())
    return items
def seconds(p):
    return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(p)]))
def google(prepared):
    for attempt in range(4):
        with requests.Session() as s:r=s.send(prepared,verify=CERT,timeout=45)
        if r.status_code==429 and attempt<3:
            time.sleep(10*(attempt+1));continue
        r.raise_for_status()
        for line in r.iter_lines(chunk_size=1024):
            m=re.search(r'jQ1olc","\[\\"(.*)\\"]',line.decode())
            if m:return base64.b64decode(m.group(1))
        raise RuntimeError('Google returned no audio')
    raise RuntimeError('Google rate limited')
def google_get(text):
    for attempt in range(4):
        r=requests.get('https://translate.google.com/translate_tts',params={'ie':'UTF-8','tl':'eu','client':'tw-ob','q':text},verify=CERT,timeout=40)
        if r.status_code==429 and attempt<3:
            time.sleep(10*(attempt+1));continue
        r.raise_for_status()
        if 'audio/' not in r.headers.get('content-type',''):raise RuntimeError('Google response is not audio')
        return r.content
    raise RuntimeError('Google rate limited')
async def edge(text,p):
    for attempt in range(3):
        try:
            chunks=[];words=[]
            async for event in edge_tts.Communicate(text,voice='es-ES-ElviraNeural',rate='-3%',boundary='WordBoundary',proxy=os.environ.get('HTTPS_PROXY'),connect_timeout=25,receive_timeout=60).stream():
                if event['type']=='audio':chunks.append(event['data'])
                elif event['type']=='WordBoundary':words.append(event['text'])
            normalize=lambda t:re.sub(r'[^\w]','',t).casefold()
            expected=normalize(text);spoken=normalize(''.join(words))
            # Check text coverage, including the last words, rather than relying on file size.
            if expected!=spoken:raise RuntimeError(f'Incomplete TTS boundary coverage {len(spoken)}/{len(expected)}')
            p.write_bytes(b''.join(chunks));p.with_suffix('.coverage.json').write_text(json.dumps({'text_sha256':hashlib.sha256(text.encode()).hexdigest(),'word_boundaries':len(words),'complete':True}))
            return
        except Exception:
            if attempt==2:raise
            await asyncio.sleep(3)
def generate(item):
    lang=item['lang'];block=item['block'];voice='es-ES-ElviraNeural' if lang=='cast' else 'Google TTS · eu'
    digest=hashlib.sha256(('\n\n'.join(item['paragraphs'])+voice).encode()).hexdigest()
    folder=ROOT/'.audio-cache'/f'u2-t{block}-{lang}-r2-{digest[:12]}';folder.mkdir(parents=True,exist_ok=True)
    files=[];meta=[]
    for i,text in enumerate(item['paragraphs']):
        p=ROOT/'.audio-cache'/'u2-paragraphs'/lang/(hashlib.sha256((text+voice).encode()).hexdigest()+'.mp3');p.parent.mkdir(parents=True,exist_ok=True)
        if not p.exists():
            if lang=='cast':asyncio.run(edge(text,p))
            else:
                texts=gTTS(text,lang='eu')._tokenize(text)
                def chunk(job):
                    j,part=job;c=folder/f'{i:02}-{j:03}.mp3'
                    if not c.exists():c.write_bytes(google_get(part))
                    return c.read_bytes()
                with ThreadPoolExecutor(max_workers=6) as pool:chunks=list(pool.map(chunk,enumerate(texts)))
                p.write_bytes(b''.join(chunks))
        duration=seconds(p)
        assert duration>max(1,len(text.split())*.22),'Truncated paragraph'
        files.append(p);meta.append({'paragraph':i+1,'words':len(text.split()),'seconds':duration})
        print(f'T{block} {lang} {i+1}/{len(item["paragraphs"])}',flush=True)
    concat=folder/'concat.txt';concat.write_text(''.join(f"file '{p}'\n" for p in files))
    out=ROOT/f'{block:02}-historia-{"eus-" if lang=="eus" else ""}u2-t{block:02}-r2.mp3'
    rendered=folder/'complete.mp3'
    subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(concat),'-ac','1','-b:a','48k','-metadata',f'title=Europa feudal · T{block:02} · {lang}','-metadata','artist=AUDIO GELA',str(rendered)],check=True)
    subprocess.run(['ffmpeg','-v','error','-i',str(rendered),'-f','null','-'],check=True)
    duration=seconds(rendered);assert abs(duration-sum(x['seconds'] for x in meta))<1
    rendered.replace(out)
    result={'file':out.name,'voice':voice,'rate':'-3%' if lang=='cast' else 'default','language':'es-ES' if lang=='cast' else 'eu','text_sha256':digest,'paragraphs':meta,'seconds':duration,'bytes':out.stat().st_size}
    target=ROOT/'scripts'/f'giza-u2-audio-t{block:02}-{lang}.json';target.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print(f'DONE T{block} {lang} {duration:.1f}s',flush=True)
    return result
if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser();parser.add_argument('--lang',choices=['cast','eus']);parser.add_argument('--topic',type=int);args=parser.parse_args()
    items=[i for i in load() if (not args.lang or i['lang']==args.lang) and (not args.topic or i['block']==args.topic)]
    with ThreadPoolExecutor(max_workers=3 if args.lang=='cast' else 1) as pool:list(pool.map(generate,items))
