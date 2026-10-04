"""Generate every paragraph separately; use a Spanish (Spain) voice for EU text.
Manifest hashes prevent silently keeping an outdated narration after text edits.
"""
import asyncio,hashlib,json,os,ssl,subprocess,tempfile
from pathlib import Path
import edge_tts
ROOT=Path(__file__).resolve().parents[1]
if os.environ.get('CODEX_PROXY_CERT'):
    edge_tts.communicate._SSL_CTX=ssl.create_default_context(cafile=os.environ['CODEX_PROXY_CERT'])
data=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {unit} from './fiki/u1-data.mjs';process.stdout.write(JSON.stringify(unit));"],cwd=ROOT))
VOICE='es-ES-ElviraNeural'
manifest_path=ROOT/'fiki/audio-manifest.json'
manifest=json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
semaphore=asyncio.Semaphore(2)
async def track(lang,index,topic):
    output=ROOT/f'fiki-u1-{index+1:02}-{lang}-r2.mp3'
    intro='AUDIO GELA. Física y Química. Segundo de ESO. Unidad uno. ' if lang=='cast' else 'AUDIO GELA. Fisika eta Kimika. Bigarren maila. Lehenengo unitatea. '
    parts=[intro+topic['title']+'.',*topic['paragraphs']]
    digest=hashlib.sha256(('\n\n'.join(parts)+VOICE+'-5%').encode()).hexdigest()
    if output.exists() and manifest.get(output.name,{}).get('text_sha256')==digest:return
    async with semaphore:
        with tempfile.TemporaryDirectory(prefix='fiki-r2-') as scratch:
            folder=Path(scratch);segments=[]
            for i,text in enumerate(parts):
                raw=folder/f'{i:02}.mp3'
                for attempt in range(3):
                    try:
                        await edge_tts.Communicate(text,voice=VOICE,rate='-5%',boundary='WordBoundary').save(str(raw))
                        duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(raw)]))
                        # Detect suspiciously short / missing paragraphs before concatenating.
                        if duration<max(1,len(text.split())*.17):raise RuntimeError(f'Short paragraph: {i}, {duration}')
                        segments.append({'words':len(text.split()),'seconds':duration});break
                    except Exception:
                        if attempt==2:raise
                        await asyncio.sleep(2)
                print(f'{lang} block {index+1}, segment {i+1}/{len(parts)} OK',flush=True)
            concat=folder/'segments.txt';concat.write_text(''.join(f"file '{folder/f'{i:02}.mp3'}'\n" for i in range(len(parts))))
            temp=folder/'final.mp3'
            subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(concat),'-ac','1','-b:a','48k','-metadata',f'title={topic["title"]}','-metadata','artist=AUDIO GELA','-metadata',f'album=FIKI · {data[lang]["title"]}',str(temp)],check=True)
            subprocess.run(['ffmpeg','-v','error','-i',str(temp),'-f','null','-'],check=True)
            duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(temp)]))
            if abs(duration-sum(p['seconds'] for p in segments))>1:raise RuntimeError('Incomplete concatenation')
            temp.replace(output)
            manifest[output.name]={'voice':VOICE,'text_language':lang,'rate':'-5%','text_sha256':digest,'segments':segments,'seconds':duration,'bytes':output.stat().st_size}
            manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
            print(f'DONE {output.name}: {duration:.2f}s, {output.stat().st_size} bytes',flush=True)
async def main():
    await asyncio.gather(*(track(lang,index,topic) for lang in ['cast','eus'] for index,topic in enumerate(data[lang]['topics'])))
asyncio.run(main())
