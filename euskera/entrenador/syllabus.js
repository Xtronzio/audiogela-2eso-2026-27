(function(root){
'use strict';
const E=root.Trinkoak,bank=[];
Object.assign(E.modules,{aux:'Aditz laguntzaileak · auxiliares',dem:'Erakusleak · demostrativos',concepts:'Comprender la gramática'});
const meaning={Nor:'quién / qué',Nork:'quién realiza la acción transitiva',Nori:'a quién',Noren:'de quién',Norekin:'con quién',Norentzat:'para quién',Norengan:'en quién',Norengana:'hacia quién',Norengandik:'desde quién',Nortaz:'sobre quién',Norengatik:'por quién',Non:'dónde',Nongo:'de dónde',Nondik:'desde dónde',Nora:'adónde',Noraino:'hasta dónde',Norantz:'hacia dónde'};
function add(module,topic,key,answer,display,meta,extra={}){
 bank.push({id:`syllabus:${module}:${key}`,syllabus:true,module,topic,verb:E.modules[module],family:'EXTRA',label:display,person:null,tense:'none',count:'one',form:answer.toLowerCase(),answer,accepted:[E.normalizeAnswer(answer)],prompt:'Elige la respuesta correcta',display,meta,meaning:'',detail:meta.join(' · '),...extra});
}
function sentence(e,text,topic=e.module){add('sentences',topic,e.id,e.answer,text,e.meta,{tense:e.tense,number:e.number,choices:e.choices,accepted:e.accepted,meaning:e.meaning,explanation:e.explanation});}
// These complete the tables in pages 14–15 of the supplied classroom notes.
const cases=['Nor','Nork','Nori','Noren','Norekin','Norentzat','Norengan','Norengana','Norengandik','Nortaz','Norengatik'];
const nounTables={
 ume:[['umea','umeak','umeari','umearen','umearekin','umearentzat','umearengan','umearengana','umearengandik','umeaz','umearengatik'],['umeak','umeek','umeei','umeen','umeekin','umeentzat','umeengan','umeengana','umeengandik','umeez','umeengatik'],['ume','umek','umeri','umeren','umerekin','umerentzat','umerengan','umerengana','umerengandik','umez','umerengatik']],
 mutil:[['mutila','mutilak','mutilari','mutilaren','mutilarekin','mutilarentzat','mutilarengan','mutilarengana','mutilarengandik','mutilaz','mutilarengatik'],['mutilak','mutilek','mutilei','mutilen','mutilekin','mutilentzat','mutilengan','mutilengana','mutilengandik','mutilez','mutilengatik'],['mutil','mutilek','mutili','mutilen','mutilekin','mutilentzat','mutilengan','mutilengana','mutilengandik','mutilez','mutilengatik']],
 mendi:[['mendian','mendiko','menditik','mendira','mendiraino','mendirantz'],['mendietan','mendietako','mendietatik','mendietara','mendietaraino','mendietarantz'],['menditan','menditako','menditatik','menditara','menditaraino','menditarantz']],
 haran:[['haranean','haraneko','haranetik','haranera','haraneraino','haranerantz'],['haranetan','haranetako','haranetatik','haranetara','haranetaraino','haranetarantz'],['haranetan','haranetako','haranetatik','haranetara','haranetaraino','haranetarantz']]
};
const locCases=['Non','Nongo','Nondik','Nora','Noraino','Norantz'];
const templates={Nor:['_____ etxean dago.','_____ etxean daude.','Hiru _____ etxean daude.'],Nork:['_____ liburua irakurri du.','_____ liburua irakurri dute.','Zenbait _____ liburua irakurri dute.'],Nori:['Oparia _____ eman diot.','Oparia _____ eman diet.','Opari bana eman diet zenbait _____.'],Noren:['Hau _____ motxila da.','Hau _____ motxila da.','Hau zein _____ motxila da?'],Norekin:['_____ hitz egin dut.','_____ hitz egin dut.','Zenbait _____ hitz egin dut.'],Norentzat:['Oparia _____ da.','Oparia _____ da.','Opariak zenbait _____ dira.'],Norengan:['_____ konfiantza dut.','_____ konfiantza dut.','Zenbait _____ konfiantza dut.'],Norengana:['_____ joan naiz.','_____ joan naiz.','Zenbait _____ joan naiz.'],Norengandik:['_____ gutun bat jaso dut.','_____ gutun bat jaso dut.','Zenbait _____ gutun bat jaso dut.'],Nortaz:['_____ hitz egin dugu.','_____ hitz egin dugu.','Zein _____ hitz egin duzue?'],Norengatik:['_____ kezkatuta nago.','_____ kezkatuta nago.','Zenbait _____ kezkatuta nago.'],Non:['_____ ibili gara.','_____ ibili gara.','Zenbait _____ ibili gara.'],Nongo:['Hau _____ argazkia da.','Hauek _____ argazkiak dira.','Hau zein _____ argazkia da?'],Nondik:['_____ etorri gara.','_____ etorri gara.','Zenbait _____ etorri gara.'],Nora:['_____ joan gara.','_____ joan gara.','Zein _____ joan zarete?'],Noraino:['_____ iritsi gara.','_____ iritsi gara.','Zenbait _____ iritsi gara.'],Norantz:['_____ abiatu gara.','_____ abiatu gara.','Zenbait _____ abiatu gara.']};
for(const [word,rows] of Object.entries(nounTables)){
 const list=['mendi','haran'].includes(word)?locCases:cases;
 rows.forEach((forms,n)=>forms.forEach((a,i)=>{
  const cas=list[i];add('decl',cas,`${word}:${cas}:${n}`,a,word,[cas.toUpperCase(),['Singularra','Plurala','Mugagabea'][n]],{number:['singular','plural','indefinite'][n],choices:rows.flat(),meaning:meaning[cas]});
  sentence(bank.at(-1),templates[cas][n]);bank.at(-1).meaning=`Palabra: ${word}`;
 }));
}
// Demonstrative roots change outside NOR: hon-, horr-, har-, haue-, horie-, haie-.
const demonstratives={Nor:['hau','hori','hura','hauek','horiek','haiek'],Nork:['honek','horrek','hark','hauek','horiek','haiek'],Nori:['honi','horri','hari','hauei','horiei','haiei'],Noren:['honen','horren','haren','hauen','horien','haien'],Norekin:['honekin','horrekin','harekin','hauekin','horiekin','haiekin'],Norentzat:['honentzat','horrentzat','harentzat','hauentzat','horientzat','haientzat'],Norengan:['honengan','horrengan','harengan','hauengan','horiengan','haiengan'],Norengana:['honengana','horrengana','harengana','hauengana','horiengana','haiengana'],Norengandik:['honengandik','horrengandik','harengandik','hauengandik','horiengandik','haiengandik'],Nortaz:['honetaz','horretaz','hartaz','hauetaz','horietaz','haietaz'],Norengatik:['honengatik','horrengatik','harengatik','hauengatik','horiengatik','haiengatik']};
const demBase=demonstratives.Nor;
for(const [cas,forms] of Object.entries(demonstratives))forms.forEach((a,i)=>{
 const alternatives=Object.values(demonstratives).map(r=>r[i]).concat(forms);
 add('dem',cas,`${cas}:${i}`,a,demBase[i].toUpperCase(),[cas.toUpperCase(),i<3?'Singularra':'Plurala'],{choices:alternatives,meaning:meaning[cas],prompt:'Declina el demostrativo'});
 sentence(bank.at(-1),templates[cas][i<3?0:1]);bank.at(-1).meaning=`Demostrativo: ${demBase[i]}`;
});
// Indicative standard forms checked against Euskaltzaindia, rule 78. Null cells
// avoid combinations involving the same first/second person as actor and object.
const actors=['nik','hark','guk','zuk','zuek','haiek'],objects=['ni','hura','gu','zu','zuek','haiek'],recipients=['niri','hari','guri','zuri','zuei','haiei'];
const norNork={present:[
 [null,'dut',null,'zaitut','zaituztet','ditut'],['nau','du','gaitu','zaitu','zaituzte','ditu'],[null,'dugu',null,'zaitugu','zaituztegu','ditugu'],['nauzu','duzu','gaituzu',null,null,'dituzu'],['nauzue','duzue','gaituzue',null,null,'dituzue'],['naute','dute','gaituzte','zaituzte','zaituztete','dituzte']],past:[
 [null,'nuen',null,'zintudan','zintuztedan','nituen'],['ninduen','zuen','gintuen','zintuen','zintuzten','zituen'],[null,'genuen',null,'zintugun','zintuztegun','genituen'],['ninduzun','zenuen','gintuzun',null,null,'zenituen'],['ninduzuen','zenuten','gintuzuen',null,null,'zenituzten'],['ninduten','zuten','gintuzten','zintuzten','zintuzteten','zituzten']]};
const triples={present:{one:[
 [null,'diot',null,'dizut','dizuet','diet'],['dit','dio','digu','dizu','dizue','die'],[null,'diogu',null,'dizugu','dizuegu','diegu'],['didazu','diozu','diguzu',null,null,'diezu'],['didazue','diozue','diguzue',null,null,'diezue'],['didate','diote','digute','dizute','dizuete','diete']],many:[
 [null,'dizkiot',null,'dizkizut','dizkizuet','dizkiet'],['dizkit','dizkio','dizkigu','dizkizu','dizkizue','dizkie'],[null,'dizkiogu',null,'dizkizugu','dizkizuegu','dizkiegu'],['dizkidazu','dizkiozu','dizkiguzu',null,null,'dizkiezu'],['dizkidazue','dizkiozue','dizkiguzue',null,null,'dizkiezue'],['dizkidate','dizkiote','dizkigute','dizkizute','dizkizuete','dizkiete']]},past:{one:[
 [null,'nion',null,'nizun','nizuen','nien'],['zidan','zion','zigun','zizun','zizuen','zien'],[null,'genion',null,'genizun','genizuen','genien'],['zenidan','zenion','zenigun',null,null,'zenien'],['zenidaten','zenioten','zeniguten',null,null,'zenieten'],['zidaten','zioten','ziguten','zizuten','zizueten','zieten']],many:[
 [null,'nizkion',null,'nizkizun','nizkizuen','nizkien'],['zizkidan','zizkion','zizkigun','zizkizun','zizkizuen','zizkien'],[null,'genizkion',null,'genizkizun','genizkizuen','genizkien'],['zenizkidan','zenizkion','zenizkigun',null,null,'zenizkien'],['zenizkidaten','zenizkioten','zenizkiguten',null,null,'zenizkieten'],['zizkidaten','zizkioten','zizkiguten','zizkizuten','zizkizueten','zizkieten']]}};
function auxiliary(topic,key,a,text,tense,details,choices){
 const variant={zaituztete:'zaituzte',zintuzteten:'zintuzten'}[a];
 add('aux',topic,key,a,text,[topic,E.tenseLabel(tense),...details],{tense,choices,accepted:variant?[a,variant]:[a],prompt:'Completa con el auxiliar',explanation:`${text.replace('_____',a)} · ${details.join(' · ')}. El auxiliar concuerda con los participantes indicados.${variant?' También se admite '+variant+'.':''}`});
 sentence(bank.at(-1),text,'aux');
}
for(const e of E.entries.filter(e=>e.verb==='IZAN'&&e.person!=='hi'))auxiliary('NOR',e.id,e.form,`${e.tense==='past'?'Atzo':'Gaur'}, ${e.person} etxera etorri _____.`,e.tense,[`NOR: ${e.person}`],E.entries.filter(e=>e.verb==='IZAN'&&e.person!=='hi').map(e=>e.form));
for(const e of E.grammarBank.filter(e=>e.module==='nori'&&e.topic==='formas')){
 const recipient=e.display.toLowerCase();auxiliary('NOR-NORI',e.id,e.answer,`${e.tense==='past'?'Atzo':'Gaur'}, ${recipient} ${e.count==='many'?'giltzak':'giltza'} galdu _____.`,e.tense,[`NORI: ${recipient}`,e.count==='many'?'NOR: HAIEK':'NOR: HURA'],E.grammarBank.filter(e=>e.module==='nori'&&e.topic==='formas').map(e=>e.answer));
}
for(const [tense,rows] of Object.entries(norNork))rows.forEach((row,i)=>row.forEach((a,j)=>{
 if(!a)return;auxiliary('NOR-NORK',`${tense}:${i}:${j}`,a,`${tense==='past'?'Atzo':'Gaur'}, ${actors[i]} ${objects[j]} ikusi _____.`,tense,[`NORK: ${actors[i]}`,`NOR: ${objects[j]}`],Object.values(norNork).flat(2).filter(Boolean));
}));
for(const [tense,counts] of Object.entries(triples))for(const [count,rows] of Object.entries(counts))rows.forEach((row,i)=>row.forEach((a,j)=>{
 if(!a)return;auxiliary('NOR-NORI-NORK',`${tense}:${count}:${i}:${j}`,a,`${tense==='past'?'Atzo':'Gaur'}, ${actors[i]} ${recipients[j]} ${count==='one'?'liburu bat':'bi liburu'} eman _____.`,tense,[`NORK: ${actors[i]}`,`NORI: ${recipients[j]}`,count==='one'?'NOR: HURA':'NOR: HAIEK'],Object.values(triples).flatMap(c=>Object.values(c).flat(2)).filter(Boolean));
}));
function concept(topic,key,text,answer,choices,why){add('concepts',topic,`${topic}:${key}`,answer,text,['Razonar · 2º ESO'],{choices,prompt:'Lee la frase y distingue la función',explanation:why});}
const roleOptions=['NOR','NORK','NORI','NON'];
const roleSentences=[
 ['Ni etxean nago.','Ni','NOR','Sujeto de EGON, verbo intransitivo.'],['Nik liburua irakurri dut.','Nik','NORK','Sujeto de IRAKURRI, verbo transitivo; liburua es el objeto NOR.'],['Nik liburua irakurri dut.','liburua','NOR','Objeto directo: responde a ZER irakurri dut?'],['Zuk ipuinak kontatu dituzu.','Zuk','NORK','Quien cuenta los cuentos; el objeto es ipuinak.'],['Zuk ipuinak kontatu dituzu.','ipuinak','NOR','Objeto directo plural; dituzu marca varias cosas.'],['Neskak sagarra jan du.','Neskak','NORK','Sujeto singular transitivo: -ak. Du marca un actor singular.'],['Neskak azkarrak dira.','Neskak','NOR','Sujeto plural de IZAN. Dira marca plural; -ak también puede ser NOR plural.'],['Neskek sagarra jan dute.','Neskek','NORK','Sujeto plural transitivo: -ek y dute.'],['Neskak sagarra jan du.','sagarra','NOR','Objeto directo singular: lo que se come.'],['Irakasleak lanak zuzendu ditu.','Irakasleak','NORK','El profesor realiza la acción; ditu concuerda con lanak, objeto plural.'],['Irakasleak pozik daude.','Irakasleak','NOR','Sujeto plural de EGON, sin objeto directo.'],['Anek Mikeli liburua eman dio.','Anek','NORK','Quien da el libro, sujeto transitivo.'],['Anek Mikeli liburua eman dio.','Mikeli','NORI','Destinatario: a quién se da el libro.'],['Anek Mikeli liburua eman dio.','liburua','NOR','Objeto directo: lo que se da.'],['Niri liburuak gustatzen zaizkit.','Niri','NORI','A quién le gustan los libros; no es NORK.'],['Niri liburuak gustatzen zaizkit.','liburuak','NOR','Sujeto plural de GUSTATU; zaizkit concuerda con él y con niri.'],['Gu mendira goaz.','Gu','NOR','Sujeto de JOAN, verbo intransitivo.'],['Guk motxila daramagu.','Guk','NORK','Sujeto de ERAMAN; motxila es el objeto NOR.'],['Gu etxean gaude.','etxean','NON','Indica dónde; no es un objeto directo.'],['Ardiak larrean dabiltza.','Ardiak','NOR','Sujeto plural de IBILI, verbo intransitivo.'],['Edalontzia erori da.','Edalontzia','NOR','Sujeto singular de ERORI, verbo intransitivo.'],['Lagunek opariak eman dizkidate.','Lagunek','NORK','Quienes dan los regalos, sujeto plural transitivo.'],['Lagunek opariak eman dizkidate.','opariak','NOR','Objeto directo plural: lo que dan.'],['Zuek pozik zaudete.','Zuek','NOR','Sujeto de EGON. La forma zuek también existe en NORK, pero aquí es NOR.'],['Zuek liburua erosi duzue.','Zuek','NORK','Sujeto de EROSI, verbo transitivo.']
];
roleSentences.forEach(([text,word,a,why],i)=>concept('roles',i,`${text}\n¿Qué caso tiene «${word}»?`,a,roleOptions,`${word}: ${a}. ${why}`));
const classified=[
 ['Ni etorri naiz.','Intransitivo · perifrástico','NOR','etorri + naiz'],['Gu bizi gara.','Intransitivo · perifrástico','NOR','bizi + gara'],['Guri edalontzia apurtu zaigu.','Intransitivo · perifrástico','NOR-NORI','apurtu + zaigu'],['Niri giltzak galdu zaizkit.','Intransitivo · perifrástico','NOR-NORI','galdu + zaizkit'],['Ni nator.','Intransitivo · trinkoa','NOR','nator'],['Gu goaz.','Intransitivo · trinkoa','NOR','goaz'],['Zuek zaudete.','Intransitivo · trinkoa','NOR','zaudete'],['Haiek dabiltza.','Intransitivo · trinkoa','NOR','dabiltza'],['Nik zu ikusi zaitut.','Transitivo · perifrástico','NOR-NORK','ikusi + zaitut'],['Nik zuri liburua eman dizut.','Transitivo · perifrástico','NOR-NORI-NORK','eman + dizut'],['Guk lanak egin ditugu.','Transitivo · perifrástico','NOR-NORK','egin + ditugu'],['Hark guri liburuak eman dizkigu.','Transitivo · perifrástico','NOR-NORI-NORK','eman + dizkigu'],['Nik liburua daukat.','Transitivo · trinkoa','NOR-NORK','daukat'],['Zuk erantzuna dakizu.','Transitivo · trinkoa','NOR-NORK','dakizu'],['Guk motxila daramagu.','Transitivo · trinkoa','NOR-NORK','daramagu'],['Haiek opariak dakartzate.','Transitivo · trinkoa','NOR-NORK','dakartzate']
];
classified.forEach(([text,type,family,parts],i)=>{
 concept('types',i,`${text}\n¿Cómo es el verbo de esta frase?`,type,['Transitivo · trinkoa','Transitivo · perifrástico','Intransitivo · trinkoa','Intransitivo · perifrástico'],`${type}. Forma verbal: ${parts}. Familia: ${family}. ${type.startsWith('Transitivo')?'Hay sujeto NORK y objeto directo NOR.':'El sujeto está en NOR; no hay sujeto NORK.'}`);
 concept('families',i,`${text}\n¿Qué participantes marca la forma verbal?`,family,['NOR','NOR-NORI','NOR-NORK','NOR-NORI-NORK'],`${family}. ${parts}. ${family.includes('NORK')?'Marca quien realiza la acción y el objeto directo.':'Marca el sujeto NOR.'}${family.includes('NORI')?' También marca a quién: NORI.':''}`);
});
const mug=[['Zein _____ dauka teilatua hondatuta? (etxe)','etxek',['etxea','etxeak','etxeek'],'Zein exige mugagabea. Etxe termina en vocal: NORK -k.'],['Zein _____ irakurri du liburua? (mutil)','mutilek',['mutila','mutilak','mutil'],'Zein exige mugagabea. Mutil termina en consonante: NORK -ek.'],['_____ afaria prestatu du. (Koldo)','Koldok',['Koldo','Koldoa','Koldoak'],'Nombre propio terminado en vocal: NORK -k.'],['_____ liburua irakurri du. (Mikel)','Mikelek',['Mikel','Mikelak','Mikela'],'Nombre propio terminado en consonante: NORK -ek.'],['Hiru _____ etorri dira. (ume)','ume',['umea','umeak','umeek'],'Tras hiru, mugagabea; sujeto NOR sin sufijo.'],['Hiru _____ liburua irakurri dute. (ume)','umek',['ume','umeak','umeek'],'Tras hiru, mugagabea. NORK con vocal: -k.'],['Zein _____ eman diozu liburua? (ume)','umeri',['umeari','umeei','umea'],'Zein exige mugagabea. NORI con vocal: -ri.'],['Zein _____ joan zara? (mendi)','menditara',['mendira','mendietara','menditan'],'Zein exige mugagabea y JOAN aquí pide destino NORA.'],['Zein _____ liburua da hau? (mutil)','mutilen',['mutilaren','mutilari','mutilak'],'Zein exige mugagabea. NOREN con consonante: -en.']];
mug.forEach(([text,a,choices,why],i)=>{concept('mugagabea',i,text,a,choices,why);sentence(bank.at(-1),text,'concepts');});
E.topics.aux=[['all','Las cuatro familias · mezcladas'],['NOR','NOR'],['NOR-NORI','NOR-NORI'],['NOR-NORK','NOR-NORK'],['NOR-NORI-NORK','NOR-NORI-NORK']];
E.topics.dem=cases.map(c=>[c,c.toUpperCase()+' · '+meaning[c]]).concat([['all','Todos los casos']]);
E.topics.concepts=[['all','Todo · mezclado'],['roles','Distinguir NOR, NORI y NORK'],['types','Transitivo / intransitivo · trinkoa / perifrástico'],['families','Reconocer la familia verbal'],['mugagabea','Mugagabea y nombres propios']];
for(const c of [...cases,...locCases])if(!E.topics.decl.some(t=>t[0]===c))E.topics.decl.splice(-1,0,[c,c.toUpperCase()+' · '+meaning[c]]);
E.topics.sentences.splice(-1,0,['aux','Frases con los cuatro auxiliares'],['dem','Frases con demostrativos'],['concepts','Frases con mugagabea']);
const basePool=E.pool,baseQuestion=E.makeQuestion;
E.pool=s=>basePool(s).concat(bank.filter(e=>e.module===s.module&&(s.topic==='all'||e.topic===s.topic)&&(e.tense==='none'||s.tense==='both'||e.tense===s.tense)&&(e.module!=='decl'||s.number==='all'||e.number===s.number)));
E.makeQuestion=(entry,s,rng=Math.random,forcedKind=null)=>{
 if(!entry.syllabus)return baseQuestion(entry,s,rng,forcedKind);
 const accepted=entry.accepted,wrong=[];
 let candidates=E.shuffle(entry.choices||[],rng);
 if(s.difficulty==='standard'&&entry.module!=='concepts')candidates=E.nearest(candidates,entry.answer);
 for(const c of candidates){if(!accepted.includes(E.normalizeAnswer(c))&&!wrong.some(w=>E.normalizeAnswer(w)===E.normalizeAnswer(c)))wrong.push(c);if(wrong.length===3)break;}
 if(wrong.length!==3)throw Error('Faltan opciones: '+entry.id);
 return {entry,target:entry,kind:'form',answer:entry.answer,accepted,heading:entry.prompt,display:entry.display,meta:entry.meta,meaning:entry.meaning,sentence:entry.display.includes('_____')||entry.module==='concepts',options:E.shuffle([entry.answer,...wrong],rng),explanation:entry.explanation||`${E.fillSentence(entry)} · ${entry.meta.join(' · ')}`};
};
E.grammarBank.push(...bank);
})(typeof window!=='undefined'?window:globalThis);
