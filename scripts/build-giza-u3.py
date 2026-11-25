"""Build the third GIZA unit without changing the existing lessons or feeds."""
import hashlib,html,json,re,sys
from pathlib import Path
from datetime import datetime,timezone
import importlib.util
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('u3_audio',ROOT/'scripts/giza-u3-audio.py');audio=importlib.util.module_from_spec(spec);spec.loader.exec_module(audio)
META={1: {'pages': [62, 63], 'pdf_page': 2, 'sections': [1], 'cast': ['¿Qué provocó el renacer de las ciudades?', 'Seguridad, mejoras agrícolas, población, excedentes y nuevos burgos.'], 'eus': ['Zerk eragin zuen hiriak berpiztea?', 'Segurtasuna, nekazaritzako hobekuntzak, biztanleria, soberakinak eta burgu berriak.']}, 2: {'pages': [64, 65], 'pdf_page': 3, 'sections': [2], 'cast': ['¿Cómo se produjo la expansión comercial?', 'Transportes, rutas, mercados, ferias, monedas y nacimiento de la banca.'], 'eus': ['Nola gertatu zen merkataritza-hedapena?', 'Garraioak, ibilbideak, merkatuak, azokak, txanponak eta bankaren sorrera.']}, 3: {'pages': [66, 67], 'pdf_page': 4, 'sections': [3], 'cast': ['¿Cómo eran las ciudades medievales?', 'Emplazamiento, murallas, plano, edificios, barrios y gobierno urbano.'], 'eus': ['Nolakoak ziren Erdi Aroko hiriak?', 'Kokalekua, harresiak, oinplanoa, eraikinak, auzoak eta hiriko gobernua.']}, 4: {'pages': [68, 69], 'pdf_page': 5, 'sections': [4], 'cast': ['¿Cómo vivían los habitantes de las ciudades medievales?', 'Artesanía, gremios, talleres, aprendizaje, burguesía y vida cotidiana.'], 'eus': ['Nola bizi ziren Erdi Aroko hirietako biztanleak?', 'Artisautza, gremioak, lantegiak, ikaskuntza, burgesia eta eguneroko bizitza.']}, 5: {'pages': [70, 71], 'pdf_page': 6, 'sections': [5], 'cast': ['¿Quién gobernaba en la Edad Media?', 'Monarquía, burguesía, cartas urbanas, fueros, impuestos y Cortes.'], 'eus': ['Nork agintzen zuen Erdi Aroan?', 'Monarkia, burgesia, hiri-gutunak, foruak, zergak eta gorteak.']}, 6: {'pages': [72, 73], 'pdf_page': 7, 'sections': [6], 'cast': ['¿Qué impacto tuvo la Peste Negra en la sociedad europea?', 'Crisis del siglo XIV, contagio y consecuencias demográficas, económicas y sociales.'], 'eus': ['Zer eragin izan zuen Izurrite Beltzak Europako gizartean?', 'XIV. mendeko krisia, kutsatzea eta ondorio demografikoak, ekonomikoak eta sozialak.']}}

LEVELS={'cast':[('Conceptos básicos','Reconocer el vocabulario esencial.'),('Comprensión','Identificar conceptos a partir de su significado.'),('Relaciones y cronología','Relacionar y distinguir conceptos del apartado.'),('Análisis histórico','Interpretar conceptos en situaciones concretas.'),('Competencial avanzado','Interpretar evidencias y razonar causas y consecuencias.')],'eus':[('Oinarrizko kontzeptuak','Funtsezko hiztegia ezagutzea.'),('Ulermena','Kontzeptuak esanahiaren bidez identifikatzea.'),('Loturak eta kronologia','Ataleko kontzeptuak lotzea eta bereiztea.'),('Analisi historikoa','Kontzeptuak egoera zehatzetan interpretatzea.'),('Gaitasun-maila aurreratua','Frogak interpretatu eta kausak eta ondorioak arrazoitzea.')]}
def read(p):return (ROOT/p).read_text()
def write(p,s): (ROOT/p).write_text(s)
def parse(name,count):
    data={};block=None
    for row in read('scripts/giza-u3-'+name+'.txt').splitlines():
        if re.fullmatch(r'\[\d\]',row):block=int(row[1]);data[block]=[]
        elif row.strip():
            values=[p.split('~') for p in row.split('|')]
            assert len(values)==count and all(len(p)==2 and all(p) for p in values),(name,block,row)
            data[block].append(values)
    assert all(len(v)==20 for v in data.values()) and len(data)==6
    return data
def esc(s):return html.escape(str(s),quote=True)
def slug(b,lang):return f'historia-u3-t{b:02}-{lang}'
def anchor(b,lang):return f'historia-{"euskara" if lang=="eus" else "castellano"}-u3-t{b:02}'
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
    # Preserve the established anti-pattern rule: length must not reveal the answer.
    # Longer distractors combine two already-authored false propositions; no filler is added.
    for level in levels:
        longest=[q for q in level['preguntas'] if len(q[1][q[2]])>max(len(v) for j,v in enumerate(q[1]) if j!=q[2])]
        excess=max(0,len(longest)-6)
        for q in reversed(longest):
            if not excess:break
            if max(map(len,q[1]))<12:continue
            wrong=sorted((j for j in range(4) if j!=q[2]),key=lambda j:len(q[1][j]),reverse=True)
            a,b=wrong[:2]
            q[1][a]=q[1][a].rstrip('.')+'. '+q[1][b]
            assert len(q[1][a])>len(q[1][q[2]])
            excess-=1
        assert not excess
    assert len(set(q[0] for l in levels for q in l['preguntas']))==100
    return levels
def quiz(b,lang,levels):
    s=read(f'test-historia-u1-t07-{lang}.html')
    s=s.replace('u1-t07',f'u3-t{b:02}').replace('u1:t07',f'u3:t{b:02}').replace('T07',f'T{b:02}')
    s=s.replace('UNIDAD 1 · TEMA 7',f'UNIDAD 3 · TEMA {b}').replace('1. UNITATEA · 7. GAIA',f'3. UNITATEA · {b}. GAIA')
    s=s.replace('Al-Ándalus: etapas, economía y sociedad',META[b]['cast'][0]).replace('Al-Andalus: etapak, ekonomia eta gizartea',META[b]['eus'][0])
    s=s.replace('20261007','20261125')
    s=s.replace('NIVELES_T'+f'{b:02}', 'NIVELES_U3_T'+f'{b:02}')
    constant=f'NIVELES_U3_T{b:02}'+('_EUS' if lang=='eus' else '')
    write(f'preguntas-{slug(b,lang)}.js',f'const {constant} = '+json.dumps(levels,ensure_ascii=False,indent=2)+';\n')
    # Do not lose an in-progress session when browser storage is unavailable.
    marker="const shuffle="
    storage="const volatileStorage=new Map();const storage={getItem(k){try{return window.localStorage.getItem(k)}catch{return volatileStorage.get(k)??null}},setItem(k,v){try{window.localStorage.setItem(k,v)}catch{volatileStorage.set(k,String(v))}},removeItem(k){try{window.localStorage.removeItem(k)}catch{volatileStorage.delete(k)}}};\n"
    s=s.replace('localStorage.','storage.').replace(marker,storage+marker)
    write(f'test-{slug(b,lang)}.html',s)
def worksheet(b,lang,levels):
    s=read(f'ficha-historia-u1-t07-{lang}.html');eu=lang=='eus'
    s=s.replace('u1-t07',f'u3-t{b:02}').replace('T07',f'T{b:02}').replace('U1', 'U3').replace('UNIDAD 1', 'UNIDAD 3').replace('1. UNITATEA', '3. UNITATEA').replace('Al-Ándalus: etapas, economía y sociedad',META[b]['cast'][0]).replace('Al-Andalus: etapak, ekonomia eta gizartea',META[b]['eus'][0])
    chosen=[(lv,levels[lv]['preguntas'][i]) for lv in range(5) for i in (list(range(lv,20,4)) if lv<4 else [0,4,8,12,16])]
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
    source=f'Material de clase: tema 3 · apartado {b} · páginas {pages}. Explicación adaptada del contenido no tachado.' if not eu else f'Gelako materiala: 3. gaia · {b}. atala · orrialdeak: {pages}. Marratu gabeko edukien azalpen egokitua.'
    body=f'</head><body><nav class="toolbar"><a href="index.html#{anchor(b,lang)}">← AUDIO GELA</a><a href="test-{slug(b,lang)}.html">{"Autoebaluazioa" if eu else "Autoevaluación"}</a><button onclick="window.print()">{"Inprimatu" if eu else "Imprimir"}</button></nav><main class="page"><header><div class="brand">AUDIO GELA · 2.º ESO · GIZA · U3 · T{b:02} · {lang.upper()}</div><h1>{esc(META[b][lang][0])}</h1><div class="label">{esc(META[b][lang][1])}</div><audio controls preload="none" src="{m["file"]}"></audio></header>'
    body+=''.join(f'<p>{esc(p)}</p>' for p in paragraphs)+f'<footer>{esc(source)}</footer></main></body></html>\n'
    write(f'guion-{slug(b,lang)}.html',head+body)
def episode(b,lang,m):
    eu=lang=='eus';title,summary=META[b][lang]
    resources=[('test','Autoevaluación interactiva','Autoebaluazio interaktiboa'),('ficha','Autoevaluación imprimible','Autoebaluazio inprimagarria'),('guion','Texto del audio','Audioaren testua')]
    links=''.join(f'<a class="resource {"primary" if kind=="test" else ""}" href="{kind}-{slug(b,lang)}.html">{eus if eu else cast}</a>' for kind,cast,eus in resources)
    return f'<details class="episode" id="{anchor(b,lang)}"><summary class="episode-summary"><span class="episode-number">T{b:02}</span><span class="summary-copy"><strong>{esc(title)}</strong><span>{esc(summary)}</span></span><span class="duration">{duration(m)}</span><span class="chevron" aria-hidden="true"></span></summary><div class="episode-body"><p>{esc(summary)}</p><audio controls preload="none" aria-label="{esc(title)}" src="{m["file"]}"></audio><div class="resources">{links}<a class="resource" href="{m["file"]}" download>{"Audioa deskargatu" if eu else "Descargar audio"}</a><span class="resource-note">{"5 maila · 100 galdera · 10+10 txandaketa · 25 jarduera eta erantzunak aparte." if eu else "5 niveles · 100 preguntas · rotación 10+10 · 25 actividades y soluciones separadas."}</span></div></div></details>'
def build():
    cards=parse('cards',3);analysis=parse('analysis',6);narrations={(i['block'],i['lang']):i['paragraphs'] for i in audio.load()};manifests={}
    for b in range(1,7):
        for lang in ['cast','eus']:
            m=json.loads(read(f'scripts/giza-u3-audio-t{b:02}-{lang}.json'));manifests[b,lang]=m
            assert (ROOT/m['file']).stat().st_size==m['bytes']
            levels=questions(cards[b],analysis[b],lang);quiz(b,lang,levels);worksheet(b,lang,levels);transcript(b,lang,narrations[b,lang],m)
    s=read('index.html')
    for lang,label in [('cast','castellano'),('eus','euskara')]:
        unit_id=f'historia-{label}-u3';start=s.find(f'<details class="unit remember" id="{unit_id}"')
        if start>=0:
            # Idempotent replacement through explicit boundaries.
            a=s.index(f'<!-- U3 {lang} START -->');z=s.index(f'<!-- U3 {lang} END -->',a)+len(f'<!-- U3 {lang} END -->');s=s[:a]+s[z:]
        unit_title='Unidad 3 · Por caminos y murallas' if lang=='cast' else '3. unitatea · Bide eta harresietan zehar'
        count='6 subtemas · 600 preguntas · 6 audios' if lang=='cast' else '6 azpigai · 600 galdera · 6 audio'
        unit=f'<!-- U3 {lang} START --><details class="unit remember" id="{unit_id}" open><summary class="unit-summary"><span class="summary-copy"><strong>{unit_title}</strong><span>{count}</span></span><span class="chevron" aria-hidden="true"></span></summary><div class="episodes">'+''.join(episode(b,lang,manifests[b,lang]) for b in range(1,7))+'</div></details>'+f'<!-- U3 {lang} END -->'
        # Append U3 after U2 within the existing language group.
        marker=f'<!-- U2 {lang} END -->';pos=s.index(marker)+len(marker)
        s=s[:pos]+unit+s[pos:]
    before,after=s.split('id="asignatura-fiki"',1)
    before=before.replace('2 unidades · 2 idiomas','3 unidades · 2 idiomas').replace('28 audios disponibles','40 audios disponibles').replace('14 episodios disponibles','20 episodios disponibles').replace('14 audio erabilgarri','20 audio erabilgarri')
    write('index.html',before+'id="asignatura-fiki"'+after)
    # Seasons represent languages; U3 continues with episodes 15–20.
    xml=read('feed.xml');xml=re.sub(r'<item>\s*<title>HISTORIA · (?:CAST|EUS) · U3.*?</item>\s*','',xml,flags=re.S)
    now=datetime.now(timezone.utc).strftime('%a, %d %b %Y %H:%M:%S GMT');base='https://xtronzio.github.io/audiogela-2eso-2026-27/'
    items=[]
    for lang in ['eus','cast']:
        for b in range(6,0,-1):
            m=manifests[b,lang];title,summary=META[b][lang];link=base+'index.html#'+anchor(b,lang)
            desc=f'<p>{esc(summary)}</p><p><a href="{base}test-{slug(b,lang)}.html">{"Autoebaluazioa" if lang=="eus" else "Autoevaluación"}</a> · <a href="{base}guion-{slug(b,lang)}.html">{"Audioaren testua" if lang=="eus" else "Texto del audio"}</a></p>'
            items.append(f'<item><title>HISTORIA · {lang.upper()} · U3 · T{b:02} — {esc(title)}</title><link>{link}</link><description>{esc(summary)}</description><content:encoded><![CDATA[{desc}]]></content:encoded><pubDate>{now}</pubDate><guid isPermaLink="false">audiogela-2eso-2026-27-historia-{lang}-u3-t{b:02}</guid><enclosure url="{base}{m["file"]}" length="{m["bytes"]}" type="audio/mpeg"/><itunes:episode>{14+b}</itunes:episode><itunes:season>{2 if lang=="eus" else 1}</itunes:season><itunes:episodeType>full</itunes:episodeType><itunes:duration>{duration(m)}</itunes:duration><itunes:explicit>false</itunes:explicit></item>')
    xml=re.sub(r'<lastBuildDate>.*?</lastBuildDate>',f'<lastBuildDate>{now}</lastBuildDate>',xml)
    pos=xml.index('<item>');xml=xml[:pos]+'\n'.join(items)+'\n'+xml[pos:];write('feed.xml',xml)
    write('scripts/giza-u3-content-manifest.json',json.dumps({'unit': 3, 'title': 'Bide eta harresietan zehar', 'source': 'Documento escaneado 24-11-26 (11.31.39).pdf', 'source_sha256': '4d85bc9a645bc974988b55dcff1ae72003914b7ee4be5c3b1db12916cf4ba833', 'scope': 'Six numbered sections; introductory spread provides context; red-crossed source boxes and exercises are excluded.', 'subtopics': {1: {'pages': [62, 63], 'pdf_page': 2, 'sections': [1], 'cast': ['¿Qué provocó el renacer de las ciudades?', 'Seguridad, mejoras agrícolas, población, excedentes y nuevos burgos.'], 'eus': ['Zerk eragin zuen hiriak berpiztea?', 'Segurtasuna, nekazaritzako hobekuntzak, biztanleria, soberakinak eta burgu berriak.']}, 2: {'pages': [64, 65], 'pdf_page': 3, 'sections': [2], 'cast': ['¿Cómo se produjo la expansión comercial?', 'Transportes, rutas, mercados, ferias, monedas y nacimiento de la banca.'], 'eus': ['Nola gertatu zen merkataritza-hedapena?', 'Garraioak, ibilbideak, merkatuak, azokak, txanponak eta bankaren sorrera.']}, 3: {'pages': [66, 67], 'pdf_page': 4, 'sections': [3], 'cast': ['¿Cómo eran las ciudades medievales?', 'Emplazamiento, murallas, plano, edificios, barrios y gobierno urbano.'], 'eus': ['Nolakoak ziren Erdi Aroko hiriak?', 'Kokalekua, harresiak, oinplanoa, eraikinak, auzoak eta hiriko gobernua.']}, 4: {'pages': [68, 69], 'pdf_page': 5, 'sections': [4], 'cast': ['¿Cómo vivían los habitantes de las ciudades medievales?', 'Artesanía, gremios, talleres, aprendizaje, burguesía y vida cotidiana.'], 'eus': ['Nola bizi ziren Erdi Aroko hirietako biztanleak?', 'Artisautza, gremioak, lantegiak, ikaskuntza, burgesia eta eguneroko bizitza.']}, 5: {'pages': [70, 71], 'pdf_page': 6, 'sections': [5], 'cast': ['¿Quién gobernaba en la Edad Media?', 'Monarquía, burguesía, cartas urbanas, fueros, impuestos y Cortes.'], 'eus': ['Nork agintzen zuen Erdi Aroan?', 'Monarkia, burgesia, hiri-gutunak, foruak, zergak eta gorteak.']}, 6: {'pages': [72, 73], 'pdf_page': 7, 'sections': [6], 'cast': ['¿Qué impacto tuvo la Peste Negra en la sociedad europea?', 'Crisis del siglo XIV, contagio y consecuencias demográficas, económicas y sociales.'], 'eus': ['Zer eragin izan zuen Izurrite Beltzak Europako gizartean?', 'XIV. mendeko krisia, kutsatzea eta ondorio demografikoak, ekonomikoak eta sozialak.']}}, 'questions_per_subtopic_language': 100, 'worksheet_items_per_subtopic_language': 25, 'voices': {'cast': 'es-ES-ElviraNeural', 'eus': 'Google TTS · eu'}, 'podcast_seasons': {'cast': 1, 'eus': 2}, 'podcast_episodes': [15, 16, 17, 18, 19, 20]},ensure_ascii=False,indent=2)+'\n')
    print('U3 built: 6 independent subtopics, 12 audios, 1200 questions, 300 written activities, 12 RSS items.')
if __name__=='__main__':build()
