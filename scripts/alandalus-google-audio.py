"""Use the validated Google TTS Basque voice used by Historia T01–T06."""
import base64,hashlib,json,os,re,ssl,subprocess,time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import requests
from gtts import gTTS
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'scripts/alandalus-content.json').read_text())['eus']
cert=os.environ.get('CODEX_PROXY_CERT') or ssl.get_default_verify_paths().cafile

def download(prepared):
    for attempt in range(3):
        try:
            with requests.Session() as session:
                response=session.send(prepared,verify=cert,timeout=60)
            response.raise_for_status()
            for line in response.iter_lines(chunk_size=1024):
                line=line.decode('utf-8')
                match=re.search(r'jQ1olc","\[\\"(.*)\\"]',line)
                if match:return base64.b64decode(match.group(1).encode('ascii'))
            raise RuntimeError('Google returned no audio')
        except Exception:
            if attempt==2:raise
            time.sleep(2)

def duration(path):
    return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(path)]))

digest=hashlib.sha256(('\n\n'.join(data['paragraphs'])+'Google TTS · eu').encode()).hexdigest()
cache=ROOT/f'.audio-cache/alandalus-eu-google-{digest[:16]}'
cache.mkdir(parents=True,exist_ok=True)
if True:
    folder=cache;segments=[];jobs=[];requests_by_paragraph=[]
    for i,text in enumerate(data['paragraphs']):
        prepared=gTTS(text=text,lang='eu')._prepare_requests()
        requests_by_paragraph.append(prepared)
        if not (folder/f'{i:02}.mp3').exists():
            jobs.extend((i,j,request) for j,request in enumerate(prepared))
    def chunk(job):
        i,j,prepared=job
        target=folder/f'{i:02}-{j:03}.mp3'
        if not target.exists():target.write_bytes(download(prepared))
        return target
    with ThreadPoolExecutor(max_workers=8) as pool:
        for count,_ in enumerate(pool.map(chunk,jobs),1):
            if count%20==0 or count==len(jobs):print(f'Google EU: {count}/{len(jobs)} chunks saved',flush=True)
    for i,text in enumerate(data['paragraphs']):
        prepared=requests_by_paragraph[i];p=folder/f'{i:02}.mp3'
        if not p.exists():p.write_bytes(b''.join((folder/f'{i:02}-{j:03}.mp3').read_bytes() for j in range(len(prepared))))
        seconds=duration(p)
        assert seconds>max(1,len(text.split())*.17),'Truncated paragraph'
        segments.append({'paragraph':i+1,'words':len(text.split()),'chunks':len(prepared),'seconds':seconds})
        print(f'EUS Google: {i+1}/{len(data["paragraphs"])} complete ({seconds:.1f}s)',flush=True)
    concat=folder/'concat.txt';concat.write_text(''.join(f"file '{folder/f'{i:02}.mp3'}'\n" for i in range(len(segments))))
    out=ROOT/data['file']
    subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(concat),'-ac','1','-b:a','48k','-metadata',f'title={data["title"]}','-metadata','artist=AUDIO GELA',str(out)],check=True)
    subprocess.run(['ffmpeg','-v','error','-i',str(out),'-f','null','-'],check=True)
    seconds=duration(out)
    assert abs(seconds-sum(s['seconds'] for s in segments))<1
    mpath=ROOT/'scripts/alandalus-audio-manifest.json';m=json.loads(mpath.read_text())
    m['eus']={'file':out.name,'voice':'Google TTS · eu','language':'eu','text_sha256':hashlib.sha256(('\n\n'.join(data['paragraphs'])+'Google TTS · eu').encode()).hexdigest(),'paragraphs':segments,'seconds':seconds,'bytes':out.stat().st_size}
    mpath.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
    print(f'DONE: {out.name} {seconds:.2f}s {out.stat().st_size}bytes',flush=True)
