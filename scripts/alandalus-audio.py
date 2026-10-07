"""Generate Al-Andalus narration paragraph by paragraph with completeness checks."""
import asyncio, hashlib, importlib, json, os, ssl, subprocess, tempfile
from pathlib import Path
import edge_tts

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'scripts/alandalus-content.json').read_text())
importlib.import_module('edge_tts.communicate')._SSL_CTX = ssl.create_default_context()
PROXY = os.environ.get('HTTPS_PROXY')
MANIFEST = ROOT / 'scripts/alandalus-audio-manifest.json'
manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}

async def generate(lang, voice):
    item = DATA[lang]
    output = ROOT / item['file']
    digest = hashlib.sha256(('\n\n'.join(item['paragraphs']) + voice).encode()).hexdigest()
    if output.exists() and manifest.get(lang, {}).get('text_sha256') == digest:
        return
    segments = []
    with tempfile.TemporaryDirectory(prefix='alandalus-') as tmp:
        folder = Path(tmp)
        for index, text in enumerate(item['paragraphs']):
            raw = folder / f'{index:02}.mp3'
            for attempt in range(3):
                try:
                    await edge_tts.Communicate(text, voice=voice, rate='-3%', proxy=PROXY,
                                              connect_timeout=30, receive_timeout=90).save(str(raw))
                    seconds = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries',
                        'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', str(raw)]))
                    if seconds < max(1, len(text.split()) * .17):
                        raise RuntimeError('Truncated paragraph')
                    segments.append({'paragraph': index + 1, 'words': len(text.split()), 'seconds': seconds})
                    print(f'{lang}: {index+1}/{len(item["paragraphs"])} OK', flush=True)
                    break
                except Exception as exc:
                    print(f'{lang}: retry {attempt+1}: {type(exc).__name__}: {exc}', flush=True)
                    if attempt == 2:
                        raise
                    await asyncio.sleep(2)
        concat = folder / 'concat.txt'
        concat.write_text(''.join(f"file '{folder / f'{i:02}.mp3'}'\n" for i in range(len(segments))))
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(concat),
                        '-ac', '1', '-b:a', '48k', '-metadata', f'title={item["title"]}',
                        '-metadata', 'artist=AUDIO GELA', '-metadata', f'album=Historia · GIZA · 2.º ESO · {lang}',
                        str(output)], check=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-i', str(output), '-f', 'null', '-'], check=True)
        duration = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                         '-of', 'default=noprint_wrappers=1:nokey=1', str(output)]))
        assert abs(duration - sum(x['seconds'] for x in segments)) < 1
        manifest[lang] = {'file': output.name, 'voice': voice, 'text_sha256': digest,
                          'paragraphs': segments, 'seconds': duration, 'bytes': output.stat().st_size}
        MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
        print(f'DONE {lang}: {duration:.2f}s', flush=True)

async def main():
    await asyncio.gather(generate('cast', 'es-ES-ElviraNeural'), generate('eus', 'es-ES-XimenaNeural'))

if __name__ == '__main__':
    asyncio.run(main())
