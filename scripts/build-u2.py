"""Build the second GIZA unit without changing the existing lessons or feeds."""
import hashlib,html,json,re,sys
from pathlib import Path
from datetime import datetime,timezone
import importlib.util
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('u2_audio',ROOT/'scripts/u2-audio.py');audio=importlib.util.module_from_spec(spec);spec.loader.exec_module(audio)
META={
1:{'pages':[1,2,3,4,5,6],'sections':[1,2],'cast':['El feudalismo y la sociedad estamental','Invasiones, vasallaje, servidumbre, estamentos y monarquía.'],'eus':['Feudalismoa eta estamentuzko gizartea','Inbasioak, basailutza, joputza, estamentuak eta monarkia.']},
2:{'pages':[7,8,13,14],'sections':[3,6],'cast':['El feudo y la vida campesina','Tierras, rentas, derechos señoriales y agricultura de subsistencia.'],'eus':['Feudoa eta nekazarien bizimodua','Lurrak, errentak, jaun eskubideak eta biziraupeneko nekazaritza.']},
3:{'pages':[9,10,11,12],'sections':[4,5],'cast':['La nobleza y los castillos','Caballeros, damas, vida noble y organización del castillo.'],'eus':['Noblezia eta gazteluak','Zaldunak, damak, nobleen bizimodua eta gazteluaren antolaketa.']},
4:{'pages':[15,16,17,18],'sections':[7,8],'cast':['La Iglesia y los monasterios','Clero, creencias, reglas monásticas y funciones del monasterio.'],'eus':['Eliza eta monasterioak','Kleroa, sinesmenak, erregelak eta monasterioaren eginkizunak.']},
5:{'pages':[19,20,21,22],'sections':[9,10],'cast':['El arte románico','Arquitectura, pintura, escultura y mensajes de las imágenes.'],'eus':['Arte erromanikoa','Arkitektura, pintura, eskultura eta irudien mezuak.']}}
LEVELS={'cast':[('Conceptos básicos','Reconocer el vocabulario esencial.'),('Comprensión','Identificar conceptos a partir de su significado.'),('Relaciones','Relacionar y distinguir dos conceptos.'),('Aplicación','Reconocer conceptos en situaciones concretas.'),('Análisis histórico','Interpretar evidencias y razonar causas y consecuencias.')],'eus':[('Oinarrizko kontzeptuak','Funtsezko hiztegia ezagutzea.'),('Ulermena','Kontzeptuak esanahiaren bidez identifikatzea.'),('Loturak','Bi kontzeptu lotzea eta bereiztea.'),('Aplikazioa','Kontzeptuak egoera zehatzetan ezagutzea.'),('Analisi historikoa','Frogak interpretatu eta kausak eta ondorioak arrazoitzea.')]}
def read(p):return (ROOT/p).read_text()
def write(p,s): (ROOT/p).write_text(s)
def parse(name,count):
    data={};block=None
    for row in read('scripts/u2-'+name+'.txt').splitlines():
        if re.fullmatch(r'\[\d\]',row):block=int(row[1]);data[block]=[]
        elif row.strip():
            values=[p.split('~') for p in row.split('|')]
            assert len(values)==count and all(len(p)==2 and all(p) for p in values),(name,block,row)
            data[block].append(values)
    assert all(len(v)==20 for v in data.values()) and len(data)==5
    return data
def esc(s):return html.escape(str(s),quote=True)
def slug(b,lang):return f'historia-u2-b{b:02}-{lang}'
def anchor(b,lang):return f'historia-{"euskara" if lang=="eus" else "castellano"}-u2-b{b:02}'
def duration(m):
    n=round(m['seconds']);return f'{n//60}:{n%60:02}'
def questions(cards,analysis,lang):
    side=lang=='eus';rows=[[f[side] for f in c] for c in cards];levels=[]
    # Meaning alternatives are similar in length; all belong to this block.
    def distractors(i,field):
        others=[j for j in range(20) if j!=i]
        return sorted(others,key=lambda j:(abs(len(rows[j][field])-len(rows[i][field])),(j-i)%20))[:3]
    for lv in range(5):
        name,description=LEVELS[lang][lv];items=[]
        for i,(term,definition,case) in enumerate(rows):
            evidence=f'{term}: {definition}'
            if lv==0:
                q=f'¿Qué definición corresponde a «{term}»?' if not side else f'Zein definizio dagokio «{term}» kontzeptuari?'
                opts=[definition]+[rows[j][1] for j in distractors(i,1)]
            elif lv==1:
                q=f'Identifica el concepto: {definition}' if not side else f'Identifikatu kontzeptua: {definition}'
                opts=[term]+[rows[j][0] for j in distractors(i,0)]
            elif lv==2:
                j=(i+1)%20;t2,d2,_=rows[j]
                q=f'¿Qué relación asigna correctamente los significados de «{term}» y «{t2}», en ese orden?' if not side else f'Zein loturak ematen ditu «{term}» eta «{t2}» kontzeptuen esanahi zuzenak, ordena horretan?'
                k=(i+7)%20;d3=rows[k][1]
                opts=[f'{definition} / {d2}',f'{d2} / {definition}',f'{definition} / {d3}',f'{d3} / {d2}']
                evidence+=f' {t2}: {d2}'
            elif lv==3:
                q=f'{case} ¿Qué concepto lo describe mejor?' if not side else f'{case} Zein kontzeptuk deskribatzen du hobekien?'
                opts=[term]+[rows[j][0] for j in distractors(i,0)]
            else:
                q,*rest=[f[side] for f in analysis[i]];opts=rest[:4];evidence=rest[4]
            shift=i%4;opts=opts[-shift:]+opts[:-shift] if shift else opts
            assert len(set(opts))==4
            items.append([q,opts,shift,evidence])
        levels.append({'nivel':lv+1,'nombre':name,'descripcion':description,'preguntas':items})
    assert len(set(q[0] for l in levels for q in l['preguntas']))==100
    return levels
def quiz(b,lang,levels):
    s=read(f'test-historia-u1-t07-{lang}.html')
    s=s.replace('u1-t07',f'u2-b{b:02}').replace('u1:t07',f'u2:b{b:02}').replace('T07',f'B{b:02}')
    s=s.replace('UNIDAD 1 · TEMA 7',f'UNIDAD 2 · BLOQUE {b}').replace('1. UNITATEA · 7. GAIA',f'2. UNITATEA · {b}. BLOKEA')
    s=s.replace('Al-Ándalus: etapas, economía y sociedad',META[b]['cast'][0]).replace('Al-Andalus: etapak, ekonomia eta gizartea',META[b]['eus'][0])
    s=s.replace('20261007','20261021')
    s=s.replace('NIVELES_B'+f'{b:02}', 'NIVELES_U2_B'+f'{b:02}')
    constant=f'NIVELES_U2_B{b:02}'+('_EUS' if lang=='eus' else '')
    write(f'preguntas-{slug(b,lang)}.js',f'const {constant} = '+json.dumps(levels,ensure_ascii=False,indent=2)+';\n')
    # Do not lose an in-progress session when browser storage is unavailable.
    marker="const shuffle="
    storage="const volatileStorage=new Map();const storage={getItem(k){try{return window.localStorage.getItem(k)}catch{return volatileStorage.get(k)??null}},setItem(k,v){try{window.localStorage.setItem(k,v)}catch{volatileStorage.set(k,String(v))}},removeItem(k){try{window.localStorage.removeItem(k)}catch{volatileStorage.delete(k)}}};\n"
    s=s.replace('localStorage.','storage.').replace(marker,storage+marker)
    write(f'test-{slug(b,lang)}.html',s)
def worksheet(b,lang,levels):
    s=read(f'ficha-historia-u1-t07-{lang}.html');eu=lang=='eus'
    s=s.replace('u1-t07',f'u2-b{b:02}').replace('T07',f'B{b:02}').replace('U1', 'U2').replace('UNIDAD 1', 'UNIDAD 2').replace('1. UNITATEA', '2. UNITATEA').replace('Al-Ándalus: etapas, economía y sociedad',META[b]['cast'][0]).replace('Al-Andalus: etapak, ekonomia eta gizartea',META[b]['eus'][0])
    chosen=[(lv,levels[lv]['preguntas'][i]) for lv in range(5) for i in [0,4,8,12,16]]
    # Written practice: no multiple-choice options. Model answers remain on a separate page.
    start=s.index('<ol class="questions">');end=s.index('</ol>',start)
    rows=[]
    for lv,q in chosen:
        text=q[0]
        if lv==2:
            text=(('Explica la relación y define ambos conceptos: ' if not eu else 'Azaldu lotura eta definitu bi kontzeptuak: ')+' / '.join(re.findall('«(.*?)»',text)))
        rows.append(f'<li><small>{"Maila" if eu else "Nivel"} {lv+1}</small> · {esc(text)}<div class="write large"></div></li>')
    s=s[:start]+'<ol class="questions">'+''.join(rows)+s[end:]
    mark=s.index('id="solutions"');start=s.index('<ol>',mark);end=s.index('</ol>',start)
    s=s[:start]+'<ol>'+''.join(f'<li>{esc(q[1][q[2]])} {esc(q[3])}</li>' for lv,q in chosen)+s[end:]
    write(f'ficha-{slug(b,lang)}.html',s)
def transcript(b,lang,paragraphs,m):
    eu=lang=='eus';s=read(f'guion-historia-u1-t07-{lang}.html');head=s[:s.index('</head>')]
    head=head.replace('Al-Ándalus: etapas, economía y sociedad',META[b]['cast'][0]).replace('Al-Andalus: etapak, ekonomia eta gizartea',META[b]['eus'][0])
    pages=', '.join(map(str,META[b]['pages']))
    source=f'Material de clase: TEMA 2.pdf · apartados {" y ".join(map(str,META[b]["sections"]))} · páginas del PDF {pages}.' if not eu else f'Gelako materiala: TEMA 2.pdf · {" eta ".join(map(str,META[b]["sections"]))}. atalak · PDFaren orrialdeak: {pages}.'
    body=f'</head><body><nav class="toolbar"><a href="index.html#{anchor(b,lang)}">← AUDIO GELA</a><a href="test-{slug(b,lang)}.html">{"Autoebaluazioa" if eu else "Autoevaluación"}</a><button onclick="window.print()">{"Inprimatu" if eu else "Imprimir"}</button></nav><main class="page"><header><div class="brand">AUDIO GELA · 2.º ESO · GIZA · U2 · B{b:02} · {lang.upper()}</div><h1>{esc(META[b][lang][0])}</h1><div class="label">{esc(META[b][lang][1])}</div><audio controls preload="none" src="{m["file"]}"></audio></header>'
    body+=''.join(f'<p>{esc(p)}</p>' for p in paragraphs)+f'<footer>{esc(source)}</footer></main></body></html>\n'
    write(f'guion-{slug(b,lang)}.html',head+body)
def episode(b,lang,m):
    eu=lang=='eus';title,summary=META[b][lang]
    resources=[('test','Autoevaluación interactiva','Autoebaluazio interaktiboa'),('ficha','Autoevaluación imprimible','Autoebaluazio inprimagarria'),('guion','Texto del audio','Audioaren testua')]
    links=''.join(f'<a class="resource {"primary" if kind=="test" else ""}" href="{kind}-{slug(b,lang)}.html">{eus if eu else cast}</a>' for kind,cast,eus in resources)
    return f'<details class="episode" id="{anchor(b,lang)}"><summary class="episode-summary"><span class="episode-number">B{b:02}</span><span class="summary-copy"><strong>{esc(title)}</strong><span>{esc(summary)}</span></span><span class="duration">{duration(m)}</span><span class="chevron" aria-hidden="true"></span></summary><div class="episode-body"><p>{esc(summary)}</p><audio controls preload="none" aria-label="{esc(title)}" src="{m["file"]}"></audio><div class="resources">{links}<a class="resource" href="{m["file"]}" download>{"Audioa deskargatu" if eu else "Descargar audio"}</a><span class="resource-note">{"5 maila · 100 galdera · 10+10 txandaketa · 25 jarduera eta erantzunak aparte." if eu else "5 niveles · 100 preguntas · rotación 10+10 · 25 actividades y soluciones separadas."}</span></div></div></details>'
def build():
    cards=parse('cards',3);analysis=parse('analysis',6);narrations={(i['block'],i['lang']):i['paragraphs'] for i in audio.load()};manifests={}
    for b in range(1,6):
        for lang in ['cast','eus']:
            m=json.loads(read(f'scripts/u2-audio-b{b}-{lang}.json'));manifests[b,lang]=m
            assert (ROOT/m['file']).stat().st_size==m['bytes']
            levels=questions(cards[b],analysis[b],lang);quiz(b,lang,levels);worksheet(b,lang,levels);transcript(b,lang,narrations[b,lang],m)
    s=read('index.html')
    for lang,label in [('cast','castellano'),('eus','euskara')]:
        unit_id=f'historia-{label}-u2';start=s.find(f'<details class="unit remember" id="{unit_id}"')
        if start>=0:
            # Idempotent replacement through explicit boundaries.
            a=s.index(f'<!-- U2 {lang} START -->');z=s.index(f'<!-- U2 {lang} END -->',a)+len(f'<!-- U2 {lang} END -->');s=s[:a]+s[z:]
        unit_title='Unidad 2 · La Europa feudal' if lang=='cast' else '2. unitatea · Europa feudala'
        count='5 bloques · 500 preguntas · 5 audios' if lang=='cast' else '5 bloke · 500 galdera · 5 audio'
        unit=f'<!-- U2 {lang} START --><details class="unit remember" id="{unit_id}" open><summary class="unit-summary"><span class="summary-copy"><strong>{unit_title}</strong><span>{count}</span></span><span class="chevron" aria-hidden="true"></span></summary><div class="episodes">'+''.join(episode(b,lang,manifests[b,lang]) for b in range(1,6))+'</div></details>'+f'<!-- U2 {lang} END -->'
        # Insert after the existing U1 details, inside the current language body.
        a=s.index(f'id="historia-{label}-u1"');pos=s.index('</details>',s.index(f'id="historia-{label}-u1-t07"',a))+len('</details>');pos=s.index('</details>',pos)+len('</details>')
        s=s[:pos]+unit+s[pos:]
    before,after=s.split('id="asignatura-fiki"',1)
    before=before.replace('1 unidad · 2 idiomas','2 unidades · 2 idiomas').replace('14 audios disponibles','24 audios disponibles').replace('7 episodios disponibles','12 episodios disponibles').replace('6 audio erabilgarri','12 audio erabilgarri')
    write('index.html',before+'id="asignatura-fiki"'+after)
    # Seasons continue to represent languages, so new units use episode numbers 8–12.
    xml=read('feed.xml');xml=re.sub(r'<item>\s*<title>HISTORIA · (?:CAST|EUS) · U2.*?</item>\s*','',xml,flags=re.S)
    now=datetime.now(timezone.utc).strftime('%a, %d %b %Y %H:%M:%S GMT');base='https://xtronzio.github.io/audiogela-2eso-2026-27/'
    items=[]
    for lang in ['eus','cast']:
        for b in range(5,0,-1):
            m=manifests[b,lang];title,summary=META[b][lang];link=base+'index.html#'+anchor(b,lang)
            desc=f'<p>{esc(summary)}</p><p><a href="{base}test-{slug(b,lang)}.html">{"Autoebaluazioa" if lang=="eus" else "Autoevaluación"}</a> · <a href="{base}guion-{slug(b,lang)}.html">{"Audioaren testua" if lang=="eus" else "Texto del audio"}</a></p>'
            items.append(f'<item><title>HISTORIA · {lang.upper()} · U2 · B{b:02} — {esc(title)}</title><link>{link}</link><description>{esc(summary)}</description><content:encoded><![CDATA[{desc}]]></content:encoded><pubDate>{now}</pubDate><guid isPermaLink="false">audiogela-2eso-2026-27-historia-{lang}-u2-b{b:02}</guid><enclosure url="{base}{m["file"]}" length="{m["bytes"]}" type="audio/mpeg"/><itunes:episode>{7+b}</itunes:episode><itunes:season>{2 if lang=="eus" else 1}</itunes:season><itunes:episodeType>full</itunes:episodeType><itunes:duration>{duration(m)}</itunes:duration><itunes:explicit>false</itunes:explicit></item>')
    xml=re.sub(r'<lastBuildDate>.*?</lastBuildDate>',f'<lastBuildDate>{now}</lastBuildDate>',xml)
    pos=xml.index('<item>');xml=xml[:pos]+'\n'.join(items)+'\n'+xml[pos:];write('feed.xml',xml)
    write('scripts/u2-content-manifest.json',json.dumps({'unit':2,'source':'TEMA 2.pdf','source_sha256':'d1ed7a98a975fb6bd5cda0feb80fb5a427f385ab09b03ea35dfc441b94da59d9','duplicate_pages':[{'page':16,'duplicate_of':15}],'blocks':META,'questions_per_block_language':100,'worksheet_items_per_block_language':25,'voices':{'cast':'es-ES-ElviraNeural','eus':'Google TTS · eu'},'podcast_seasons':{'cast':1,'eus':2},'podcast_episodes':[8,9,10,11,12]},ensure_ascii=False,indent=2)+'\n')
    print('U2 built: 10 audios, 1000 questions, 250 written activities, 10 new RSS items.')
if __name__=='__main__':build()
