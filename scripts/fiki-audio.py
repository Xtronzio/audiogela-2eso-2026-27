"""Generate the bilingual Unit 1 tracks from the same text used in the classroom.
Install edge-tts and use PYTHONPATH if dependencies live outside this repository.
"""
import asyncio, json, os, ssl, subprocess, tempfile
from pathlib import Path
import edge_tts

ROOT = Path(__file__).resolve().parents[1]
if os.environ.get('CODEX_PROXY_CERT'):
    edge_tts.communicate._SSL_CTX = ssl.create_default_context(cafile=os.environ['CODEX_PROXY_CERT'])

data = json.loads(subprocess.check_output([
    'node', '--input-type=module', '-e',
    "import {unit} from './fiki/u1-data.mjs'; process.stdout.write(JSON.stringify(unit));"
], cwd=ROOT))
semaphore = asyncio.Semaphore(2)

async def track(lang, index, topic):
    output = ROOT / f'fiki-u1-{index+1:02}-{lang}.mp3'
    if output.exists():
        return
    intro = ('AUDIO GELA. Física y Química. Segundo de ESO. Unidad uno. '
             if lang == 'cast' else 'AUDIO GELA. Fisika eta Kimika. DBHko bigarren maila. Lehenengo unitatea. ')
    voice = 'es-ES-ElviraNeural' if lang == 'cast' else 'en-US-EmmaMultilingualNeural'
    text = intro + topic['title'] + '. ' + '\n\n'.join(topic['paragraphs'])
    async with semaphore:
        raw = Path(tempfile.gettempdir()) / f'fiki-raw-{index}-{lang}.mp3'
        for attempt in range(3):
            try:
                await edge_tts.Communicate(text, voice=voice, rate='-3%').save(str(raw))
                subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(raw),
                    '-ac','1','-b:a','48k','-metadata',f'title={topic["title"]}',
                    '-metadata','artist=AUDIO GELA','-metadata',f'album=FIKI · {data[lang]["title"]}',
                    str(output)],check=True)
                duration = subprocess.check_output(['ffprobe','-v','error','-show_entries',
                    'format=duration','-of','default=noprint_wrappers=1:nokey=1',str(output)]).decode().strip()
                print(output.name, duration, output.stat().st_size, flush=True)
                return
            except Exception as error:
                if attempt == 2: raise
                print(f'Retrying {lang}/{index+1}: {type(error).__name__}',flush=True)
                await asyncio.sleep(2)

async def main():
    await asyncio.gather(*(track(lang,index,topic) for lang in data for index,topic in enumerate(data[lang]['topics'])))

asyncio.run(main())
