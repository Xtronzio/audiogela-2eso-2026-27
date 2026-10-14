(function(root){
'use strict';
const E=root.Trinkoak,D=root.GramatikaSource;
const moduleNames={trinkoak:'Aditz trinkoak',nori:'NOR-NORI',nork:'NOR / NORK',decl:'Deklinabidea',pron:'Izenordainak',sentences:'Completar frases'};
const caseMeaning={Nor:'quién / qué',Nork:'quién realiza la acción',Nori:'a quién',Noren:'de quién',Norekin:'con quién',Norentzat:'para quién',Norengan:'en quién',Norengana:'hacia quién',Norengandik:'desde quién',Norengatik:'por quién',Nortaz:'sobre quién',Non:'dónde',Nongo:'de dónde',Nora:'adónde',Nondik:'desde dónde',Noraino:'hasta dónde',Norantz:'hacia dónde',Norako:'para dónde'};
const bank=[];
const persons=['ni','hura','gu','zu','zuek','haiek'];
const P={
 Nor:['ni','hura','gu','zu','zuek','haiek'],Nork:['nik','hark','guk','zuk','zuek','haiek'],Nori:['niri','hari','guri','zuri','zuei','haiei'],
 Noren:['nire','haren','gure','zure','zuen','haien'],Norekin:['nirekin','harekin','gurekin','zurekin','zuekin','haiekin'],
 Norentzat:['niretzat','harentzat','guretzat','zuretzat','zuentzat','haientzat'],
 Norengan:['nigan','harengan','gugan','zugan','zuengan','haiengan'],Norengana:['nigana','harengana','gugana','zugana','zuengana','haiengana'],
 Norengandik:['nigandik','harengandik','gugandik','zugandik','zuengandik','haiengandik'],
 Norengatik:['niregatik','harengatik','gugatik','zuregatik','zuengatik','haiengatik'],Nortaz:['nitaz','hartaz','gutaz','zutaz','zuetaz','haietaz']
};
const aliases={nigan:['niregan'],gugan:['guregan'],zugan:['zuregan'],nigana:['niregana'],gugana:['guregana'],zugana:['zuregana'],nigandik:['niregandik'],gugandik:['guregandik'],zugandik:['zuregandik'],niregatik:['nigatik'],gugatik:['guregatik'],zuregatik:['zugatik'],hartaz:['harez'],haietaz:['haiez']};
const valid=a=>[a.toLowerCase(),...(aliases[a.toLowerCase()]||[])];
function add(module,topic,key,answer,prompt,display,meta,meaning,extra={}){
 const form=answer.toLowerCase();bank.push({id:`grammar:${module}:${key}`,module,topic,verb:moduleNames[module],family:'EXTRA',label:display,person:null,tense:'none',count:'one',form,answer,accepted:valid(answer),prompt,display,meta,meaning,detail:meta.join(' · '),...extra});
}
// IZAN is included because it appears in the grammar dossier, alongside the photograph's eight verbs.
const izan=['IZAN','ser','NOR',['naiz','haiz','da','gara','zara','zarete','dira'],['nintzen','hintzen','zen','ginen','zinen','zineten','ziren']];
E.specs.splice(4,0,izan);
for(const [tense,forms] of [['present',izan[3]],['past',izan[4]]])E.persons.forEach((person,i)=>E.entries.push({id:`IZAN:${tense}:${person}:one:x`,verb:'IZAN',meaning:'ser',family:'NOR',tense,person,count:'one',form:forms[i],hika:null}));
// All 24 singular/plural NOR-NORI paradigms; six recipients and two tenses.
for(const [nori,pOne,pMany,aOne,aMany] of D.NORI){for(const [tense,one,many] of [['present',pOne,pMany],['past',aOne,aMany]])for(const [count,a] of [['one',one],['many',many]]){
 const meta=['NOR-NORI',E.tenseLabel(tense),count==='one'?'NOR: HURA · singular':'NOR: HAIEK · plural'];
 add('nori','formas',`${nori}:${tense}:${count}`,a,'Elige el auxiliar',nori.toUpperCase(),meta,'NORI: a quién le ocurre o le gusta algo.',{tense,count});
}}
// NOR-NORI sentence pairs from both dossiers; each card hides just one auxiliary.
for(const source of ['ORIG','PR'])D[source+'_D'].forEach(([template,answers],i)=>{
 for(const tense of ['present','past']){
  const shift=tense==='past'?1:0;const replacements=answers.map((_,j)=>answers[j-j%2+shift]);
  for(let pair=0;pair<answers.length/2;pair++){
   let text=template.replace(/\{(\d+)\} \/ \{\d+\}/g,(_,n)=>Number(n)/2===pair?'_____':replacements[Number(n)]);
   if(tense==='past')text=text.replace(/\borain\b/g,'orduan').replace(/joan denean/g,'joan zenean').replace(/egin dugun/g,'egin genuen');
   add('nori','frases',`${source}:${i}:${pair}:${tense}`,answers[pair*2+shift],'Completa la frase sin escribir',text,['NOR-NORI',E.tenseLabel(tense)],'Fíjate en a quién le ocurre y si lo que ocurre es singular o plural.',{tense});
  }
 }
});
for(const source of ['ORIG','PR']){
 for(const [group,data,hints] of [['simples',D[source+'_F'],D[source==='ORIG'?'OF_STEMS':'PF_STEMS']],['frases',D[source+'_I'],D[source==='ORIG'?'OI_HINTS':'PI_HINTS']]]){
  data.forEach(([template,answers],i)=>answers.forEach((answer,j)=>{
   // Omit genuinely ambiguous ellipses or singular/plural readings, not useful as single-answer quizzes.
   if(group==='frases'&&((source==='ORIG'&&i===3&&j===1)||(i===13&&j===0)||(i===15&&j===1)||(i===16&&j===3)||(i===15&&j===2)))return;
   const text=template.replace(/\{(\d+)\}/g,(_,n)=>Number(n)===j?'_____':answers[Number(n)]);
   const word=hints[i][j];let forms=[];
   if(persons.includes(word.toLowerCase()))forms=Object.values(P).map(a=>a[persons.indexOf(word.toLowerCase())]);
   else if(['hau','hori','hura','horiek','batzuk'].includes(word.toLowerCase())){
    const map={hau:['hau','honek','honi','honen'],hori:['hori','horrek','horri','horren'],hura:['hura','hark','hari','haren'],horiek:['horiek','horiei','horien','horiekin'],batzuk:['batzuk','batzuek','batzuei','batzuen']};forms=map[word.toLowerCase()];
   }else{
    let base=word.toLowerCase();
    if(['bi','bost','bostehun'].includes(base))forms=[base,base+'ak',base+'ek',base+'ei',base+'en'];
    else if(/^[A-Z]/.test(word))forms=[base,base+(/[aeiou]$/.test(base)?'k':'ek'),base+(/[aeiou]$/.test(base)?'ri':'i'),base+(/[aeiou]$/.test(base)?'ren':'en')];
    else if(base.endsWith('a'))forms=[base,base+'k',base.slice(0,-1)+'k',base.slice(0,-1)+'ek',base+'ri',base+'ren'];
    else forms=[base,base+'a',base+'ak',base+'ek',base+(/[aeiou]$/.test(base)?'ri':'i'),base+'aren'];
   }
   add('nork',group,`${source}:${group}:${i}:${j}`,answer,'Completa la frase sin escribir',text,['NOR / NORK',group==='simples'?'Frase corta':'Frase larga'],`Palabra de partida: ${word}`,{choices:forms});
  }));
 }
}
for(const source of ['ORIG','PR'])for(const [category,rows] of [['Bizidunak',D[source+'_G1']],['Bizigabeak',D[source+'_G2']]])rows.forEach(([raw,cas,...forms],i)=>{
 const word=raw.replace('*','');forms.forEach((answer,j)=>add('decl',cas,`${source}:${category}:${i}:${j}`,answer,'Elige la forma declinada',word,[cas.toUpperCase(),['Singularra · singular','Plurala · plural','Mugagabea · indefinido'][j],category],caseMeaning[cas],{number:['singular','plural','indefinite'][j],choices:forms}));
});
for(const [cas,forms] of Object.entries(P))forms.forEach((a,i)=>add('pron',cas,`${cas}:${persons[i]}`,a,'Declina el pronombre',persons[i].toUpperCase(),[cas.toUpperCase(),'Izenordainak'],caseMeaning[cas],{choices:Object.values(P).map(f=>f[i])}));
for(const source of ['ORIG','PR'])D[source+'_H'].forEach(([template,answers],i)=>answers.forEach((a,j)=>{
 const hints=D[source==='ORIG'?'OH_HINTS':'PH_HINTS'];const [person,lower]=hints[i][j].split('-');const cas=Object.keys(P).find(k=>k.toLowerCase()===lower);const pi=persons.indexOf(person);
 const text=template.replace(/\{(\d+)\}/g,(_,n)=>Number(n)===j?'_____':answers[Number(n)]);
 add('pron',cas,`${source}:phrase:${i}:${j}`,a,'Completa con el pronombre',text,[cas.toUpperCase(),person.toUpperCase()],caseMeaning[cas],{choices:Object.values(P).map(f=>f[pi])});
}));
// Full sentences: tense and agreement must be inferred from the subject and context.
const originalBank=bank.slice();
const subject={ni:['Ni','Nik'],hi:['Hi','Hik'],hura:['Nire ahizpa','Nire anaiak'],gu:['Gu','Guk'],zu:['Zu','Zuk'],zuek:['Zuek','Zuek'],haiek:['Gure lagunak','Gure lagunek']};
for(const e of E.entries){for(let variant=0;variant<2;variant++){
 const who=subject[e.person][e.family==='NOR'?0:1].toLowerCase(),pl=['gu','zuek','haiek'].includes(e.person),past=e.tense==='past';let text;
 const when=past?'Atzo ordu horretan':'Orain';
 const objects=variant?['opari bat','hiru opari']:['liburu bat','bi liburu'];const object=objects[e.count==='one'?0:1];
 if(e.verb==='EGON')text=`${when}, ${who} ${variant?'etxean':'liburutegian'} _____, azterketa prestatzen.`;
 else if(e.verb==='JOAN')text=`${when}, ${who} ${variant?'mendira':'eskolara'} _____, motxila bizkarrean hartuta.`;
 else if(e.verb==='ETORRI')text=`${when}, ${who} ${variant?'liburutegitik':'entrenamendutik'} _____, etxera bidean.`;
 else if(e.verb==='IBILI')text=`${when}, ${who} ${variant?'kalean bizikletaz':'parkean oinez'} _____, lagunekin batera.`;
 else if(e.verb==='IZAN')text=`${past?'Iaz':'Aurten'}, ${who} ${variant?(pl?'ikasle arduratsuak':'ikasle arduratsua'):(pl?'taldeko kideak':'taldeko kidea')} _____.`;
 else if(e.verb==='EDUKI')text=`${when}, ${who} ${object} _____ ${variant?'mahai gainean':'motxilan'}.`;
 else if(e.verb==='JAKIN')text=`${past?'Atzo azterketa hasi aurretik':'Orain'}, ${who} ${e.count==='one'?(variant?'arau honen esanahia':'galdera honen erantzuna'):(variant?'arau hauen esanahiak':'galdera hauen erantzunak')} _____.`;
 else if(e.verb==='ERAMAN')text=`${when}, ${who} ${object} _____ ${variant?'lagunaren etxera':'eskolara'}.`;
 else if(e.verb==='EKARRI')text=`${when}, ${who} ${object} _____ ${variant?'dendatik':'liburutegitik'}.`;
 const choices=E.entries.filter(x=>x.verb===e.verb&&(!x.hika||x.hika===e.hika)&&x.person!=='hi').map(x=>x.form);
 add('sentences','trinkoak',`verb:${e.id}:${variant}`,e.form,'Completa la frase',text,['Trinkoak',e.verb],'La persona está en la frase. El momento indica el tiempo.',{tense:e.tense,person:e.person,hika:e.hika,choices,sourceVerb:e.verb});
}}
for(const e of originalBank.filter(e=>e.display.includes('_____'))){add('sentences',e.module,`source:${e.id}`,e.answer,'Completa la frase',e.display,e.meta,e.meaning,{tense:e.tense,choices:e.choices,sourceAccepted:e.accepted});}
const declTemplates={Nork:['_____ atea ireki du.','_____ atea ireki dute.','Zenbait _____ atea ireki dute.'],Nori:['Liburua _____ eman diot.','Liburua _____ eman diet.','Liburu bana eman diet zenbait _____.'],Noren:['Hau _____ motxila da.','Hauek _____ motxilak dira.','Hau zein _____ motxila da?'],Norekin:['_____ hitz egin dut.','_____ hitz egin dut.','Zenbait _____ hitz egin dut.'],Norentzat:['Opari bat erosi dut _____.','Opari batzuk erosi ditut _____.','Opariak erosi ditut zenbait _____.'],Norengana:['Laguntza eskatzera joan naiz _____.','Laguntza eskatzera joan naiz _____.','Laguntza eskatzera joan naiz zenbait _____.'],Norengandik:['Gutun bat jaso dut _____.','Gutunak jaso ditut _____.','Gutunak jaso ditut zenbait _____.'],Norengatik:['_____ kezkatuta nago.','_____ kezkatuta nago.','Zenbait _____ kezkatuta nago.'],Nortaz:['_____ ari gara hizketan.','_____ ari gara hizketan.','Zein _____ ari zarete hizketan?'],Noraino:['_____ iritsi gara oinez.','_____ iritsi gara oinez.','Zenbait _____ iritsi gara oinez.'],Nora:['_____ joan gara.','_____ joan gara.','Zein _____ joan zarete?'],Nongo:['Hau _____ argazki bat da.','Hauek _____ argazkiak dira.','Hau zein _____ argazki bat da?'],Nondik:['_____ etorri gara.','_____ etorri gara.','Zenbait _____ etorri gara.'],Norantz:['_____ abiatu gara.','_____ abiatu gara.','Zenbait _____ abiatu gara.'],Norako:['_____ txartelak erosi ditugu.','_____ txartelak erosi ditugu.','Zenbait _____ txartelak erosi ditugu.'],Non:['_____ marka bat ikusi dut.','_____ markak ikusi ditut.','Zenbait _____ markak ikusi ditut.']};
for(const e of originalBank.filter(e=>e.module==='decl')){
 const n=['singular','plural','indefinite'].indexOf(e.number);const text=declTemplates[e.topic][n];
 add('sentences','decl',`decl:${e.id}`,e.answer,'Completa con la declinación indicada',text,[e.topic.toUpperCase(),e.meta[1]],`Palabra: ${e.display}`,{choices:e.choices,number:e.number});
}
const pairs=[
 ['Atzo ni etxean _____ (EGON), baina gaur eskolara _____ (JOAN).',['nengoen','noa'],[['nago','noa'],['nengoen','nindoan'],['zegoen','noa']]],
 ['Orain gu etxean _____ (EGON); atzo, ordea, mendira _____ (JOAN).',['gaude','gindoazen'],[['geunden','gindoazen'],['gaude','goaz'],['daude','zihoazen']]],
 ['Iaz zuek taldeko kideak _____ (IZAN), eta aurten ere _____ (IZAN).',['zineten','zarete'],[['zinen','zara'],['zarete','zineten'],['ziren','dira']]],
 ['Atzo gure lagunak kaletik _____ (ETORRI); orain parkean _____ (IBILI).',['zetozen','dabiltza'],[['datoz','dabiltza'],['zetozen','zebiltzan'],['zetorren','dabil']]],
 ['Orain zuk liburu bat _____ (EDUKI), baina atzo bi liburu _____ (EDUKI).',['daukazu','zeneuzkan'],[['dauzkazu','zeneuzkan'],['daukazu','zeneukan'],['zeneukan','dauzkazu']]],
 ['Atzo nik erantzuna _____ (JAKIN); gaur bi erantzun _____ (JAKIN).',['nekien','dakizkit'],[['dakit','dakizkit'],['nekien','dakit'],['zekien','dakizki']]],
 ['Orain guk bi liburu _____ (ERAMAN), baina atzo bakarra _____ (ERAMAN).',['daramatzagu','generaman'],[['daramagu','generaman'],['daramatzagu','generamatzan'],['generamatzan','daramagu']]],
 ['Atzo zuek opari bat _____ (EKARRI); gaur hiru opari _____ (EKARRI).',['zenekarten','dakartzazue'],[['zenekarren','dakartzazu'],['zenekartzaten','dakarzue'],['dakarzue','zenekartzaten']]],
 ['Gaur egun niri musika entzutea gustatzen _____, baina belarriak batzuetan nekatzen _____.',['zait','zaizkit'],[['zaizkit','zait'],['zaio','zaizkio'],['zait','zaizkizu']]],
 ['Atzo guri giltzak galdu _____ eta atea itxi _____.',['zitzaizkigun','zitzaigun'],[['zaizkigu','zaigu'],['zitzaigun','zitzaizkigun'],['zitzaizkidan','zitzaidan']]],
 ['Gaur egun zuri filmak gustatzen _____, baina gero beldurra sartzen _____.',['zaizkizu','zaizu'],[['zaizu','zaizkizu'],['zaizkit','zait'],['zitzaizkizun','zitzaizun']]],
 ['Gaur egun nire lagunari txokolatea gustatzen _____ eta gozokiak ere bai: gustatzen _____.',['zaio','zaizkio'],[['zaizkio','zaio'],['zait','zaizkit'],['zaie','zaizkie']]],
 ['_____ lan gutxiago egin nahi dute, baina _____ ez daude ados. (ikasle / irakasle)',['Ikasleek','irakasleak'],[['Ikasleak','irakasleek'],['Ikasleek','irakasleek'],['Ikasleak','irakasleak']]],
 ['_____ galdera erantzun du, eta orain _____ oso pozik dago. (neska / neska)',['Neskak','neska'],[['Neska','neskak'],['Neskek','neskak'],['Neskak','neskak']]],
 ['_____ liburuak irakurri ditut, baina _____ nekatuta nago. (ni / ni)',['Nik','ni'],[['Ni','nik'],['Nik','nik'],['Ni','ni']]],
 ['Nekazari _____ sagarrak bildu ditu; lagun _____ etxean dago. (hau / hori)',['honek','hori'],[['hau','horrek'],['honek','horrek'],['hau','hori']]],
 ['_____ liburuak erosi dituzu, baina _____ ez zara liburutegira joan. (zu / zu)',['Zuk','zu'],[['Zu','zuk'],['Zuk','zuk'],['Zu','zu']]],
 ['_____ etxean geratu gara, baina _____ lanak egin ditugu. (gu / gu)',['Gu','guk'],[['Guk','gu'],['Gu','gu'],['Guk','guk']]],
 ['Haurra _____ etorri da (gu-norengana), eta _____ laguntza eskatu dit (ni-nori).',['gugana','niri'],[['guretzat','niri'],['gugana','nire'],['gugan','nik']]],
 ['_____ koadernoa aurkitu dut (zu-noren) eta _____ eman dizut (zu-nori).',['zure','zuri'],[['zuen','zuei'],['zuri','zure'],['zure','zu']]],
 ['_____ gutun bat jaso dut (hura-norengandik); opari hau _____ da (hura-norentzat).',['harengandik','harentzat'],[['harengana','harentzat'],['harengandik','haren'],['haiengandik','haientzat']]],
 ['_____ liburuak hemen daude (zuek-noren), baina ez naiz _____ joango (zuek-norengana).',['Zuen','zuengana'],[['Zure','zugana'],['Zuen','zuengandik'],['Zuei','zuentzat']]]
];
for(const [i,[text,fills,wrong]] of pairs.entries())add('sentences','pairs',`pair:${i}`,fills.join(' / '),'Completa los dos huecos',text,['Dos huecos · 2º ESO'],'Responde en orden: primer hueco / segundo hueco.',{fills,accepted:valid(fills[0]).flatMap(a=>valid(fills[1]).map(b=>a+' / '+b)),choices:wrong.map(a=>a.join(' / '))});
const normalizeAnswer=s=>s.toLowerCase().trim().replace(/\s*\/\s*/g,' / ');
const fillSentence=(entry,answer)=>{let i=0;const fills=entry.fills||[answer||entry.answer];return entry.display.replace(/_____/g,()=>fills[i++]||answer||entry.answer);};
const basePool=E.pool,baseQuestion=E.makeQuestion,basePronoun=E.pronoun;
E.pool=s=>!s.module||s.module==='trinkoak'?basePool(s):bank.filter(e=>e.module===s.module&&(s.topic==='all'||e.topic===s.topic)&&(e.tense==='none'||s.tense==='both'||e.tense===s.tense)&&(e.module!=='decl'||s.number==='all'||e.number===s.number)&&(s.module!=='sentences'||s.hi||e.person!=='hi')&&(!e.hika||e.hika===s.hika));
E.pronoun=e=>e.module?e.label:basePronoun(e);
E.makeQuestion=(entry,s,rng=Math.random,forcedKind=null)=>{
 if(!entry.module)return baseQuestion(entry,s,rng,forcedKind);
 const accepted=entry.sourceAccepted||entry.accepted;const normalize=normalizeAnswer;
 const same=E.shuffle(bank.filter(e=>e.module===entry.module&&e.topic===entry.topic),rng).map(e=>e.answer);
 const more=E.shuffle(bank.filter(e=>e.module===entry.module),rng).map(e=>e.answer);
 let candidates=[...(entry.choices||[]),...same,...more];const wrong=[];
 if(s.difficulty==='standard'&&entry.topic!=='pairs'){
  const priority=E.shuffle(entry.choices||[],rng).concat(same,more);candidates=E.nearest(priority,entry.answer);
 }
 for(const c of candidates){if(!accepted.includes(normalize(c))&&!wrong.some(w=>normalize(w)===normalize(c)))wrong.push(c);if(wrong.length===3)break;}
 if(wrong.length!==3)throw Error('No hay cuatro opciones válidas: '+entry.id);
 return {entry,target:entry,kind:'form',answer:entry.answer,accepted,heading:entry.prompt,display:entry.display,meta:entry.meta,meaning:entry.meaning,sentence:entry.display.includes('_____'),options:E.shuffle([entry.answer,...wrong],rng),explanation:`${fillSentence(entry)} · ${entry.meta.join(' · ')}${aliases[entry.answer.toLowerCase()]?' · También: '+aliases[entry.answer.toLowerCase()].join(', '):''}`};
};
E.modules=moduleNames;E.grammarBank=bank;E.normalizeAnswer=normalizeAnswer;E.fillSentence=fillSentence;
E.topics={nori:[['formas','Auxiliares · tabla'],['frases','Auxiliares · frases'],['all','Todo NOR-NORI']],nork:[['simples','Frases cortas'],['frases','Frases largas'],['all','Todo NOR / NORK']],decl:[...new Set(bank.filter(e=>e.module==='decl').map(e=>e.topic))].map(c=>[c,c.toUpperCase()+' · '+caseMeaning[c]]).concat([['all','Todos los casos']]),pron:Object.keys(P).map(c=>[c,c.toUpperCase()+' · '+caseMeaning[c]]).concat([['all','Todos los casos']])};
E.topics.sentences=[['all','Todas · mezcladas'],['trinkoak','Frases con trinkoak'],['nori','Frases con NOR-NORI'],['nork','Frases con NOR / NORK'],['decl','Frases con declinaciones'],['pron','Frases con pronombres'],['pairs','Dos huecos · combinado']];
})(typeof window!=='undefined'?window:globalThis);
