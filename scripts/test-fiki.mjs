import assert from 'node:assert/strict';
import {parseNumber,normalizeUnit,conversion,conversionTasks,makeConversion,checkAnswer,makeDensity,fixedPractice,practiceSet,quizSet} from '../fiki/engine.mjs';
import {questionBank} from '../fiki/quiz.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<Math.max(Math.abs(b)*1e-10,1e-15),`${a} != ${b}`);
for(const [raw,expected] of [['0,875',.875],['0.875',.875],['80 000',80000],['8e4',80000],['8×10^4',80000],['7/8',.875],['80.000,00',80000],['80,000.00',80000],['−2,5',-2.5]])close(parseNumber(raw),expected);
for(const invalid of ['', '8abc','Infinity','NaN','1/0','1,2,3','1.23,4','<script>1</script>'])assert.equal(parseNumber(invalid),null,invalid);
assert.equal(normalizeUnit('cm³'),'cm3');assert.equal(normalizeUnit('g / cm^3'),'g/cm3');assert.equal(normalizeUnit('ml'),'mL');assert.notEqual(normalizeUnit('ML'),'mL');
const expected=[80000,5700,.548,.000037,.8456,860,80,7500000,.875,650000,378,.0805,35,2500,.0048];
conversionTasks.forEach(([n,from,to],i)=>{
  close(conversion(n,from,to),expected[i]);close(conversion(conversion(n,from,to),to,from),n);
  const e=makeConversion(n,from,to);
  assert.equal(checkAnswer(e,'','').submitted,false);assert.equal(checkAnswer(e,String(expected[i]),'').submitted,false);
  assert.equal(checkAnswer(e,'abc',to).submitted,false);
  assert.equal(checkAnswer(e,String(expected[i]).replace('.',','),to).correct,true);
  assert.equal(checkAnswer(e,String(expected[i]),'incorrect').correct,false);
  assert.equal(checkAnswer(e,String(expected[i]*10),to).correct,false);
});
assert.throws(()=>conversion(1,'m','m2'));assert.throws(()=>conversion(1,'kg','L'));
for(const lang of ['cast','eus']){
  for(const [mode,answer,unit] of [['density',2,'g/cm³'],['mass',60,'g'],['volume',30,'cm3']])assert.equal(checkAnswer(makeDensity(mode,2,30,lang),String(answer),unit).correct,true);
  assert.equal(checkAnswer(makeDensity('density',2,500,lang,true),'2','g/cm3').correct,true);
  const p=fixedPractice(lang).find(e=>e.id==='property-5');
  assert.equal(checkAnswer(p,'característica, cuantitativa e intensiva').correct,true);
  assert.equal(checkAnswer(p,'característica, cuantitativa y intensiva').correct,true);
  assert.equal(checkAnswer(p,'kuantitatiboa, intentsiboa eta bereizgarria').correct,true);
  assert.equal(checkAnswer(p,'cuantitativa, intensiva, general').correct,false);
  assert.equal(checkAnswer(p,'cuantitativa, cuantitativa, característica').correct,false);
  const order=fixedPractice(lang).find(e=>e.id==='order-length');
  assert.equal(checkAnswer(order,'C > A > B').correct,true);assert.equal(checkAnswer(order,'C < A < B').correct,false);
  const bank=questionBank(lang);assert.equal(bank.length,100);assert.equal(new Set(bank.map(q=>q.id)).size,100);
  for(const q of bank){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.ok(q.explanation.length>10);}
  for(const level of [1,2,3,4,5]){
    const pool=bank.filter(q=>q.level===level);assert.equal(pool.length,20);
    const first=quizSet(pool),second=quizSet(pool,first.state);assert.equal(first.questions.length,10);assert.equal(second.questions.length,10);
    assert.ok(second.questions.every(q=>!first.state.used.includes(q.id)));assert.equal(second.state.used.length,20);
    assert.equal(quizSet(pool,second.state).state.used.length,10);
  }
  for(const topic of ['all',0,1,2,3])for(const style of ['book','new']){
    const exercises=practiceSet(lang,topic,style);assert.ok(exercises.length>0);assert.equal(new Set(exercises.map(e=>e.id)).size,exercises.length);
    if(topic!=='all')assert.ok(exercises.every(e=>e.topic===Number(topic)));
  }
  const first=practiceSet(lang,2,'new'),second=practiceSet(lang,2,'new',first.map(e=>e.id));assert.ok(second.every(e=>!first.some(f=>f.id===e.id)));
}
console.log('PASS · parsing, units, 15 original conversions, density, classification, 200 questions, disjoint rounds and varied practice.');
