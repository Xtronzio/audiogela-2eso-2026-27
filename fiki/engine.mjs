import {properties} from './u1-data.mjs?v=20261004-r2';

export function parseNumber(raw) {
  let value = String(raw).trim().replace(/\u2212/g,'-').replace(/[\s\u00a0\u202f]/g,'');
  if (!value) return null;
  value = value.replace(/(?:×|x|\*)10\^([+-]?\d+)$/i,'e$1');
  if (value.includes(',') && value.includes('.')) {
    const commaDecimal = value.lastIndexOf(',') > value.lastIndexOf('.');
    const grouping = commaDecimal ? /^[-+]?\d{1,3}(?:\.\d{3})+,\d+(?:e[-+]?\d+)?$/i : /^[-+]?\d{1,3}(?:,\d{3})+\.\d+(?:e[-+]?\d+)?$/i;
    if (!grouping.test(value)) return null;
    value = commaDecimal ? value.replace(/\./g,'').replace(',','.') : value.replace(/,/g,'');
  } else value = value.replace(',','.');
  if (/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?$/i.test(value)) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }
  const fraction = value.match(/^([-+]?(?:\d+(?:\.\d*)?|\.\d+))\/([-+]?(?:\d+(?:\.\d*)?|\.\d+))$/);
  if (fraction && Number(fraction[2]) !== 0) return Number(fraction[1])/Number(fraction[2]);
  return null;
}

export function normalizeUnit(value) {
  const raw = String(value).trim().replace(/\s/g,'').replace(/³/g,'3').replace(/²/g,'2').replace(/\^/g,'');
  const names = {litro:'L',litros:'L',litroa:'L',litroak:'L',mililitro:'mL',mililitros:'mL',
    gramo:'g',gramos:'g',gramoa:'g',gramoak:'g',kilogramo:'kg',kilogramos:'kg',kilogramoa:'kg',kilogramoak:'kg',
    metro:'m',metros:'m',metroa:'m',metroak:'m',ml:'mL',cl:'cL',dl:'dL',dal:'daL',hl:'hL',kl:'kL',l:'L'};
  return names[raw] || raw;
}

export const fmt = number => Number(number.toPrecision(11)).toLocaleString('es-ES',{useGrouping:false,maximumFractionDigits:12});
const clean = value => String(value).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
export function checkAnswer(exercise, answer, answerUnit='') {
  if(exercise.kind==='multi'){
    const results=exercise.fields.map(field=>{
      const value=answer?.[field.id]||{};
      if(field.kind==='property-choice' && String(value.answer||'').split(',').filter(Boolean).length!==3)return {submitted:false,reason:'empty'};
      return checkAnswer(field.kind==='property-choice'?{...field,kind:'property'}:field,value.answer||'',value.unit||'');
    });
    const invalid=results.find(result=>!result.submitted);
    if(invalid)return {...invalid,results};
    return {submitted:true,correct:results.every(result=>result.correct),results};
  }

  if (!String(answer).trim() || (exercise.kind==='number' && !String(answerUnit).trim())) return {submitted:false,reason:'empty'};
  if (exercise.kind==='number') {
    const number = parseNumber(answer);
    if (number === null) return {submitted:false,reason:'number'};
    const numberOK = Math.abs(number-exercise.result) <= Math.max(Math.abs(exercise.result)*1e-9,Number.EPSILON*16);
    const unitOK = normalizeUnit(answerUnit) === normalizeUnit(exercise.unit);
    return {submitted:true,correct:numberOK && unitOK,numberOK,unitOK};
  }
  if (exercise.kind==='property') {
    const aliases={cuantitativa:'quant',cuantitativo:'quant',kuantitatiboa:'quant',kuantitatibo:'quant',
      cualitativa:'qual',cualitativo:'qual',kualitatiboa:'qual',kualitatibo:'qual',
      intensiva:'int',intensivo:'int',intentsiboa:'int',intentsibo:'int',
      extensiva:'ext',extensivo:'ext',estentsiboa:'ext',estentsibo:'ext',
      general:'gen',orokorra:'gen',orokor:'gen',caracteristica:'char',caracteristico:'char',bereizgarria:'char',bereizgarri:'char'};
    const tokens=String(answer).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').split(/[^a-z]+/).filter(v=>v && !['y','e','eta'].includes(v));
    if(tokens.length<3)return {submitted:false,reason:'empty'};
    const mapped=tokens.map(v=>aliases[v]);
    const expected=exercise.tags;
    return {submitted:true,correct:mapped.length===3 && mapped.every(v=>v && expected.includes(v)) && new Set(mapped).size===3};
  }
  if (exercise.kind==='order' && /[<=]/.test(answer)) return {submitted:true,correct:false};
  const value = clean(answer);
  return {submitted:true,correct:exercise.accepted.some(option=>clean(option)===value)};
}

export const factors = {
  kg:{mass:1e3},hg:{mass:1e2},dag:{mass:10},g:{mass:1},dg:{mass:.1},cg:{mass:.01},mg:{mass:.001},
  km:{length:1000},hm:{length:100},dam:{length:10},m:{length:1},dm:{length:.1},cm:{length:.01},mm:{length:.001},
  kL:{volume:1e6},hL:{volume:1e5},daL:{volume:1e4},L:{volume:1000},dL:{volume:100},cL:{volume:10},mL:{volume:1}
};
for (const [symbol, values] of Object.entries({...factors})) {
  if (values.length) {
    factors[symbol+'2']={area:values.length**2};
    factors[symbol+'3']={volume:(values.length*100)**3}; // reference volume: cm³
  }
}
export const prettyUnit = symbol => symbol.replace(/2/g,'²').replace(/3/g,'³');
export function conversion(value, from, to) {
  const a=factors[normalizeUnit(from)], b=factors[normalizeUnit(to)];
  if (!a || !b) throw new Error('Unknown unit');
  const dimension=Object.keys(a)[0];
  if (!(dimension in b)) throw new Error('Incompatible dimensions');
  return value*a[dimension]/b[dimension];
}
export const conversionTasks = [
  [.08,'kg','mg'],[5.7,'dag','cg'],[548,'dg','hg'],[37,'mg','kg'],
  [8456,'cm2','m2'],[.00086,'km2','m2'],[.8,'dam2','m2'],
  [7.5,'dam3','L'],[875,'mL','dm3'],[.00065,'km3','m3'],[378,'dm3','L'],
  [805,'cL','hL'],[.35,'daL','dL'],[2.5,'L','mL'],[48,'mL','daL']
];

export function makeConversion(value, from, to, lang='cast', id='') {
  const cast=lang==='cast', ratio=conversion(1,from,to), result=conversion(value,from,to);
  const operation=ratio>=1 ? (cast?'multiplicar por':'biderkatu:')+' '+fmt(ratio) : (cast?'dividir entre':'zatitu:')+' '+fmt(1/ratio);
  return {id:id||`convert:${value}:${from}:${to}`,topic:2,kind:'number',unit:to,result,
    prompt:cast?`Convierte ${fmt(value)} ${prettyUnit(from)} a ${prettyUnit(to)}.`:`Bihurtu ${fmt(value)} ${prettyUnit(from)} ${prettyUnit(to)} unitatera.`,
    solution:`${fmt(result)} ${prettyUnit(to)}`,
    steps:[`1 ${prettyUnit(from)} = ${fmt(ratio)} ${prettyUnit(to)}`,
      cast?`Para conservar la misma cantidad, hay que ${operation}.`:`Kantitate bera mantentzeko, ${operation}`,
      `${fmt(value)} × ${fmt(ratio)} = ${fmt(result)} ${prettyUnit(to)}`],
    hint:cast?'Convierte las unidades sin cambiar la cantidad.':'Aldatu unitateak, kantitatea aldatu gabe.'};
}

export function makeDensity(mode, density, volume, lang='cast', mixed=false) {
  const cast=lang==='cast', mass=density*volume;
  let result, unit, prompt, steps;
  if (mode==='density') {
    result=density; unit='g/cm3';
    prompt=cast?`Una muestra tiene ${fmt(mixed?mass/1000:mass)} ${mixed?'kg':'g'} de masa y ${fmt(volume)} cm³ de volumen. Calcula su densidad en g/cm³.`:`Lagin baten masa ${fmt(mixed?mass/1000:mass)} ${mixed?'kg':'g'} da, eta bolumena ${fmt(volume)} cm³. Kalkulatu dentsitatea g/cm³ unitatean.`;
    steps=[...(mixed?[`${fmt(mass/1000)} kg × 1000 = ${fmt(mass)} g`]:[]),'d = m / V',`d = ${fmt(mass)} g / ${fmt(volume)} cm³ = ${fmt(density)} g/cm³`];
  } else if (mode==='mass') {
    result=mass; unit='g';
    prompt=cast?`Una sustancia tiene densidad ${fmt(density)} g/cm³ y volumen ${fmt(volume)} cm³. Calcula su masa en g.`:`Substantzia baten dentsitatea ${fmt(density)} g/cm³ da, eta bolumena ${fmt(volume)} cm³. Kalkulatu masa g unitatean.`;
    steps=['m = d × V',`m = ${fmt(density)} g/cm³ × ${fmt(volume)} cm³ = ${fmt(mass)} g`];
  } else {
    result=volume; unit='cm3';
    prompt=cast?`Una muestra tiene masa ${fmt(mass)} g y densidad ${fmt(density)} g/cm³. Calcula su volumen en cm³.`:`Lagin baten masa ${fmt(mass)} g da, eta dentsitatea ${fmt(density)} g/cm³. Kalkulatu bolumena cm³ unitatean.`;
    steps=['V = m / d',`V = ${fmt(mass)} g / ${fmt(density)} g/cm³ = ${fmt(volume)} cm³`];
  }
  return {id:`${mode}:${density}:${volume}:${mixed}`,topic:3,kind:'number',result,unit,prompt,steps,
    solution:`${fmt(result)} ${prettyUnit(unit)}`,hint:cast?'Elige la fórmula y comprueba que las unidades sean compatibles.':'Aukeratu formula eta egiaztatu unitateak bateragarriak diren.'};
}

const word = (id,topic,prompts,accepted,solution,steps,lang) => ({id,topic,kind:'word',prompt:prompts[lang==='cast'?0:1],accepted,
  solution:solution[lang==='cast'?0:1],steps:[steps[lang==='cast'?0:1]],hint:lang==='cast'?'Escribe tu respuesta antes de comprobar.':'Idatzi erantzuna egiaztatu aurretik.'});

export function fixedPractice(lang='cast') {
  const list=conversionTasks.map(([value,from,to])=>makeConversion(value,from,to,lang));
  list.push(word('order-length',2,['Ordena de mayor a menor: A = 254 cm; B = 0,0003 km; C = 8,2 dam. Escribe las letras, por ejemplo A > B > C.','Ordenatu handienetik txikienera: A = 254 cm; B = 0,0003 km; C = 8,2 dam. Idatzi letrak, adibidez A > B > C.'],['C>A>B'],['C > A > B','C > A > B'],['A = 2,54 m; B = 0,3 m; C = 82 m. Comparamos en la misma unidad.','A = 2,54 m; B = 0,3 m; C = 82 m. Unitate berean alderatzen ditugu.'],lang));
  list.push(word('order-area',2,['Ordena de mayor a menor: A = 8456 cm²; B = 0,00086 km²; C = 0,8 dam². Escribe las letras.','Ordenatu handienetik txikienera: A = 8456 cm²; B = 0,00086 km²; C = 0,8 dam². Idatzi letrak.'],['B>C>A'],['B > C > A','B > C > A'],['A = 0,8456 m²; B = 860 m²; C = 80 m². En superficies, cada salto de prefijo tiene factor 100.','A = 0,8456 m²; B = 860 m²; C = 80 m². Azaleretan aurrizki urrats bakoitzak 100eko faktorea du.'],lang));
  list.push(...['density','mass','volume'].map(mode=>makeDensity(mode,2,30,lang)),makeDensity('density',2,500,lang,true));
  const matter=[['aire','airea',true],['luz','argia',false],['humo','kea',true],['música','musika',false],['dióxido de carbono','karbono dioxidoa',true],['arena','harea',true]];
  matter.forEach(([es,eu,yes],i)=>list.push(word('matter-'+i,0,[`¿Es materia: ${es}? Responde sí o no.`,`Materia al da ${eu}? Erantzun bai edo ez.`],yes?['sí','si','bai']:['no','ez'],yes?['Sí','Bai']:['No','Ez'],yes?['Tiene masa y ocupa volumen.','Masa du eta bolumena hartzen du.']:['Es un fenómeno o una forma de energía, no una sustancia material.','Fenomeno bat edo energia mota bat da, ez substantzia material bat.'],lang)));
  const changes=[['derretir hielo','izotza urtzea',false],['quemar papel','papera erretzea',true],['cortar papel','papera moztea',false],['oxidar hierro','burdina oxidatzea',true]];
  changes.forEach(([es,eu,chemical],i)=>list.push(word('change-'+i,0,[`Clasifica ${es}: físico o químico.`,`Sailkatu ${eu}: fisikoa edo kimikoa.`],chemical?['químico','cambio químico','kimikoa','aldaketa kimikoa']:['físico','cambio físico','fisikoa','aldaketa fisikoa'],chemical?['Químico','Kimikoa']:['Físico','Fisikoa'],chemical?['Se forman sustancias nuevas.','Substantzia berriak sortzen dira.']:['Cambia la forma o el estado; la sustancia sigue siendo la misma.','Forma edo egoera aldatzen da; substantzia bera da.'],lang)));
  const labels=[['cuantitativa','cualitativa'],['intensiva','extensiva'],['general','característica']],eusLabels=[['kuantitatiboa','kualitatiboa'],['intentsiboa','estentsiboa'],['orokorra','bereizgarria']];
  properties.forEach((p,i)=>{
    const indexes=[p.type,p.amount,p.identity],es=indexes.map((n,j)=>labels[j][n]).join(', '),eu=indexes.map((n,j)=>eusLabels[j][n]).join(', ');
    list.push({...word('property-'+i,1,[`Clasifica ${p.name[0].toLowerCase()} con tres etiquetas: medida/cualidad, cantidad e identificación.`,`Sailkatu ${p.name[1].toLowerCase()} hiru etiketarekin: neurria/nolakotasuna, kantitatea eta identifikazioa.`],[es,eu],[es,eu],[`${p.type===0?'Se mide':'Describe una cualidad'}; ${p.amount===0?'no depende':'depende'} de la cantidad; ${p.identity===1?'ayuda':'no basta'} para identificar la sustancia.`,`${p.type===0?'Neurtu daiteke':'Nolakotasun bat deskribatzen du'}; ${p.amount===0?'ez da':'bada'} kantitatearen araberakoa; ${p.identity===1?'substantzia identifikatzen laguntzen du':'ez da nahikoa substantzia identifikatzeko'}.`],lang),kind:'property',tags:[p.type?'qual':'quant',p.amount?'ext':'int',p.identity?'char':'gen']});
  });
  return list.map(e=>e.id.startsWith('order-')?{...e,kind:'order'}:e);
}

export function shuffle(values,random=Math.random) {
  const out=[...values]; for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];} return out;
}
export function practiceSet(lang='cast',topic='all',style='book',avoid=[],random=Math.random) {
  let pool=fixedPractice(lang);
  if(style==='new') {
    const values=[.12,.25,.48,1.6,2.4,7.2,18,32,64,125,480,750];
    pool=pool.filter(e=>e.kind!=='number');
    for(const [unused,from,to] of conversionTasks) {
      for(const n of shuffle(values,random).slice(0,3)) pool.push(makeConversion(n,from,to,lang));
    }
    for(const density of [.5,.8,1.2,2,2.5,4,8]) for(const volume of [10,20,25,40,80]) {
      for(const mode of ['density','mass','volume']) pool.push(makeDensity(mode,density,volume,lang));
      pool.push(makeDensity('density',density,volume,lang,true));
    }
  }
  if(topic!=='all') pool=pool.filter(e=>e.topic===Number(topic));
  const fresh=shuffle(pool.filter(e=>!avoid.includes(e.id)),random);
  const old=shuffle(pool.filter(e=>avoid.includes(e.id)),random);
  return [...fresh,...old].slice(0,10);
}

// Keep both halves of a level disjoint, even after a reload.
export function quizSet(bank, state={}, random=Math.random) {
  const available=bank.filter(q=>!(state.used||[]).includes(q.id));
  const reset=available.length<10;
  const selected=shuffle(reset?bank:available,random).slice(0,10);
  return {questions:selected,state:{used:[...(reset?[]:state.used||[]),...selected.map(q=>q.id)]}};
}
