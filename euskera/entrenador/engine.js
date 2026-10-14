(function(root){
'use strict';
const persons=['ni','hi','hura','gu','zu','zuek','haiek'];
const labels={ni:['NI','NIK','yo'],hi:['HI','HIK','tú informal'],hura:['HURA','HARK','él / ella'],gu:['GU','GUK','nosotros/as'],zu:['ZU','ZUK','tú'],zuek:['ZUEK','ZUEK','vosotros/as'],haiek:['HAIEK','HAIEK','ellos / ellas']};
const specs=[
 ['EGON','estar','NOR',['nago','hago','dago','gaude','zaude','zaudete','daude'],['nengoen','hengoen','zegoen','geunden','zeunden','zeundeten','zeuden']],
 ['JOAN','ir','NOR',['noa','hoa','doa','goaz','zoaz','zoazte','doaz'],['nindoan','hindoan','zihoan','gindoazen','zindoazen','zindoazten','zihoazen']],
 ['ETORRI','venir','NOR',['nator','hator','dator','gatoz','zatoz','zatozte','datoz'],['nentorren','hentorren','zetorren','gentozen','zentozen','zentozten','zetozen']],
 ['IBILI','andar','NOR',['nabil','habil','dabil','gabiltza','zabiltza','zabiltzate','dabiltza'],['nenbilen','henbilen','zebilen','genbiltzan','zenbiltzan','zenbiltzaten','zebiltzan']],
 ['EDUKI','tener','NORK',['daukat','daukak|daukan','dauka','daukagu','daukazu','daukazue','daukate'],['neukan','heukan','zeukan','geneukan','zeneukan','zeneukaten','zeukaten'],['dauzkat','dauzkak|dauzkan','dauzka','dauzkagu','dauzkazu','dauzkazue','dauzkate'],['neuzkan','heuzkan','zeuzkan','geneuzkan','zeneuzkan','zeneuzkaten','zeuzkaten']],
 ['JAKIN','saber','NORK',['dakit','dakik|dakin','daki','dakigu','dakizu','dakizue','dakite'],['nekien','hekien','zekien','genekien','zenekien','zenekiten','zekiten'],['dakizkit','dakizkik|dakizkin','dakizki','dakizkigu','dakizkizu','dakizkizue','dakizkite'],['nekizkien','hekizkien','zekizkien','genekizkien','zenekizkien','zenekizkiten','zekizkiten']],
 ['ERAMAN','llevar','NORK',['daramat','daramak|daraman','darama','daramagu','daramazu','daramazue','daramate'],['neraman','heraman','zeraman','generaman','zeneraman','zeneramaten','zeramaten'],['daramatzat','daramatzak|daramatzan','daramatza','daramatzagu','daramatzazu','daramatzazue','daramatzate'],['neramatzan','heramatzan','zeramatzan','generamatzan','zeneramatzan','zeneramatzaten','zeramatzaten']],
 ['EKARRI','traer','NORK',['dakart','dakark|dakarna','dakar','dakargu','dakarzu','dakarzue','dakarte'],['nekarren','hekarren','zekarren','genekarren','zenekarren','zenekarten','zekarten'],['dakartzat','dakartzak|dakartzan','dakartza','dakartzagu','dakartzazu','dakartzazue','dakartzate'],['nekartzan','hekartzan','zekartzan','genekartzan','zenekartzan','zenekartzaten','zekartzaten']]
];
const entries=[];
for(const [verb,meaning,family,pres,past,plPres,plPast] of specs){
 for(const [tense,forms,count] of [['present',pres,'one'],['past',past,'one'],...(family==='NORK'?[['present',plPres,'many'],['past',plPast,'many']]:[])]){
  persons.forEach((person,i)=>forms[i].split('|').forEach((form,j)=>entries.push({id:[verb,tense,person,count,forms[i].includes('|')?j:'x'].join(':'),verb,meaning,family,tense,person,count,form,hika:forms[i].includes('|')?(j===0?'male':'female'):null})))
 }
}
function pool(settings){return entries.filter(e=>(settings.family==='ALL'||e.family===settings.family)&&settings.verbs.includes(e.verb)&&(settings.tense==='both'||settings.tense===e.tense)&&(e.family==='NOR'||settings.object==='both'||settings.object===e.count)&&(settings.hi||e.person!=='hi')&&(!e.hika||e.hika===settings.hika));}
const shuffle=(a,rng=Math.random)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const unique=a=>[...new Set(a)];
function distance(a,b){a=a.toLowerCase();b=b.toLowerCase();let row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let next=[i];for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+(a[i-1]===b[j-1]?0:1));row=next;}return row[b.length];}
const nearest=(forms,answer)=>unique(forms).map(form=>({form,score:distance(form,answer)})).sort((a,b)=>a.score-b.score).map(e=>e.form);
const pronoun=e=>labels[e.person][e.family==='NOR'?0:1];
const tenseLabel=t=>t==='present'?'ORAINALDIA · presente':'LEHENALDIA · pasado';
function choose(list,stats,step,recent,rng=Math.random){
 if(!list.length)throw Error('Selecciona al menos un verbo.');
 let choices=list.filter(e=>!recent.slice(-2).includes(e.id));if(!choices.length)choices=list;
 const due=choices.filter(e=>stats[e.id]?.retryAt!=null&&stats[e.id].retryAt<=step);
 if(due.length)return due.sort((a,b)=>(stats[a.id].retryAt-stats[b.id].retryAt)||(stats[b.id].misses-stats[a.id].misses))[0];
 // Do not re-show a failed card before its three-question interval.
 let normal=choices.filter(e=>stats[e.id]?.retryAt==null||stats[e.id].retryAt<=step);if(!normal.length)normal=choices;
 const weights=normal.map(e=>{let s=stats[e.id];if(!s)return 5;let mastery=Math.min(4,s.streak||0);let age=Math.max(1,step-(s.lastStep||0));let dueTime=Date.now()>(s.reviewAt||0)?1.8:.65;return (1+(4-mastery)*1.5+Math.min(s.misses||0,5)) * Math.min(2,age/8)*dueTime;});
 let target=rng()*weights.reduce((a,b)=>a+b,0);for(let i=0;i<normal.length;i++){target-=weights[i];if(target<=0)return normal[i];}return normal.at(-1);
}
function makeQuestion(entry,settings,rng=Math.random,forcedKind=null){
 const kind=forcedKind||(settings.direction==='mixed'?shuffle(settings.difficulty==='standard'?['form','form','person','change','change']:['form','form','person','verb','change'],rng)[0]:'form');
 let answer=entry.form,candidates=[],heading='Elige la forma correcta',display=pronoun(entry),meta=[entry.verb,tenseLabel(entry.tense)],target=entry;
 if(kind==='person'){
  answer=pronoun(entry);display=entry.form;heading='¿A qué persona corresponde?';
  candidates=persons.filter(p=>settings.hi||p!=='hi').map(p=>labels[p][entry.family==='NOR'?0:1]);
 }else if(kind==='verb'){
  answer=entry.verb;display=entry.form;heading='¿De qué verbo es esta forma?';
  meta=[pronoun(entry),tenseLabel(entry.tense)];candidates=specs.filter(v=>v[2]===entry.family).map(v=>v[0]);
 }else{
  if(kind==='change'){
   const other=entries.find(e=>e.verb===entry.verb&&e.person===entry.person&&e.count===entry.count&&e.tense!==entry.tense&&(!e.hika||e.hika===settings.hika));
   answer=entry.form;display=other.form;heading=entry.tense==='past'?'Pásala al pasado':'Pásala al presente';meta=[entry.verb,pronoun(entry),tenseLabel(entry.tense)];
  }
  const compatible=e=>(settings.hi||e.person!=='hi')&&(!e.hika||e.hika===settings.hika)&&e.form!==answer;
  const tight=shuffle(entries.filter(e=>e.verb===target.verb&&e.tense===target.tense&&e.count===target.count&&compatible(e)),rng).map(e=>e.form);
  const near=shuffle(entries.filter(e=>e.verb===target.verb&&e.person===target.person&&compatible(e)),rng).map(e=>e.form);
  const broad=shuffle(entries.filter(e=>e.family===target.family&&compatible(e)),rng).map(e=>e.form);
  candidates=unique([...tight.slice(0,2),...near.slice(0,1),...tight,...broad]);
  if(settings.difficulty==='standard')candidates=nearest(shuffle(entries.filter(e=>e.verb===target.verb&&compatible(e)),rng).map(e=>e.form),answer);
 }
 if(entry.family==='NORK')meta.push(entry.count==='one'?'Una cosa · singular':'Varias cosas · plural');
 if(entry.person==='hi'&&entry.family==='NORK'&&entry.tense==='present')meta.push(settings.hika==='male'?'HIK: masculino':'HIK: femenino');
 const wrong=unique(candidates).filter(x=>x!==answer).slice(0,3);
 if(wrong.length!==3)throw Error('No se pudieron crear cuatro opciones distintas.');
 const options=shuffle([answer,...wrong],rng);
 return {entry,target,kind,answer,heading,display,meta,options,explanation:`${pronoun(target)} · ${target.verb} (${target.meaning}) · ${target.tense==='present'?'presente':'pasado'}${target.family==='NORK'?(target.count==='one'?' · una cosa':' · varias cosas'):''} → ${target.form}`};
}
function record(stats,id,correct,step,now=Date.now()){
 const s=stats[id]||{seen:0,hits:0,misses:0,streak:0};s.seen++;s.lastStep=step;
 if(correct){s.hits++;s.streak=(s.streak||0)+1;s.retryAt=null;s.reviewAt=now+[0,30000,120000,600000,86400000][Math.min(4,s.streak)];}
 else{s.misses++;s.streak=0;s.retryAt=step+3;s.reviewAt=now;}
 stats[id]=s;return s;
}
root.Trinkoak={persons,labels,specs,entries,pool,shuffle,pronoun,tenseLabel,choose,makeQuestion,record,distance,nearest};
if(typeof module!=='undefined')module.exports=root.Trinkoak;
})(typeof window!=='undefined'?window:globalThis);

