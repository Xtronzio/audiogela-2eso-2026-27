(function(root){
'use strict';
const E=root.Trinkoak,D=root.GramatikaSource;
const moduleNames={trinkoak:'Aditz trinkoak',nori:'NOR-NORI',nork:'NOR / NORK',decl:'Deklinabidea',pron:'Izenordainak'};
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
const aliases={nigan:['niregan'],gugan:['guregan'],zugan:['zuregan'],nigana:['niregana'],gugana:['guregana'],zugana:['zuregana'],nigandik:['niregandik'],gugandik:['guregandik'],zugandik:['zuregandik'],niregatik:['nigatik'],gugatik:['guregatik'],hartaz:['harez'],haietaz:['haiez']};
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
const basePool=E.pool,baseQuestion=E.makeQuestion,basePronoun=E.pronoun;
E.pool=s=>!s.module||s.module==='trinkoak'?basePool(s):bank.filter(e=>e.module===s.module&&(s.topic==='all'||e.topic===s.topic)&&(e.tense==='none'||s.tense==='both'||e.tense===s.tense)&&(e.module!=='decl'||s.number==='all'||e.number===s.number));
E.pronoun=e=>e.module?e.label:basePronoun(e);
E.makeQuestion=(entry,s,rng=Math.random,forcedKind=null)=>{
 if(!entry.module)return baseQuestion(entry,s,rng,forcedKind);
 const accepted=entry.accepted;const normalize=v=>v.toLowerCase().trim();
 const same=E.shuffle(bank.filter(e=>e.module===entry.module&&e.topic===entry.topic),rng).map(e=>e.answer);
 const more=E.shuffle(bank.filter(e=>e.module===entry.module),rng).map(e=>e.answer);
 const candidates=[...(entry.choices||[]),...same,...more];const wrong=[];
 for(const c of candidates){if(!accepted.includes(normalize(c))&&!wrong.some(w=>normalize(w)===normalize(c)))wrong.push(c);if(wrong.length===3)break;}
 if(wrong.length!==3)throw Error('No hay cuatro opciones válidas: '+entry.id);
 return {entry,target:entry,kind:'form',answer:entry.answer,accepted,heading:entry.prompt,display:entry.display,meta:entry.meta,meaning:entry.meaning,sentence:entry.display.includes('_____'),options:E.shuffle([entry.answer,...wrong],rng),explanation:`${entry.display.replace('_____',entry.answer)} · ${entry.meta.join(' · ')}${aliases[entry.answer.toLowerCase()]?' · También: '+aliases[entry.answer.toLowerCase()].join(', '):''}`};
};
E.modules=moduleNames;E.grammarBank=bank;
E.topics={nori:[['formas','Auxiliares · tabla'],['frases','Auxiliares · frases'],['all','Todo NOR-NORI']],nork:[['simples','Frases cortas'],['frases','Frases largas'],['all','Todo NOR / NORK']],decl:[...new Set(bank.filter(e=>e.module==='decl').map(e=>e.topic))].map(c=>[c,c.toUpperCase()+' · '+caseMeaning[c]]).concat([['all','Todos los casos']]),pron:Object.keys(P).map(c=>[c,c.toUpperCase()+' · '+caseMeaning[c]]).concat([['all','Todos los casos']])};
})(typeof window!=='undefined'?window:globalThis);
