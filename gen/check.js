const fs=require('fs');const f=process.argv[2];let a;try{a=JSON.parse(fs.readFileSync(f,'utf8'))}catch(e){console.log('JSON invalide:',e.message);process.exit(1)}
const norm=s=>String(s).toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const ok=(q,v)=>{const n=' '+norm(v)+' ';return q.k.some(k=>k.split('&').every(p=>{p=norm(p);return p.length<=3?n.includes(' '+p+' '):n.includes(p)}))};
let errs=[],seen=new Set(),lv={1:0,2:0,3:0};
a.forEach((q,i)=>{const t=`#${i} «${(q.q||'').slice(0,50)}»`;
 if(!q.c||!q.q||!q.a)errs.push(t+' champ manquant');
 if(![1,2,3].includes(q.lvl))errs.push(t+' lvl invalide');else lv[q.lvl]++;
 if(!Array.isArray(q.k)||!q.k.length)errs.push(t+' k manquant');
 else{if(q.k.some(k=>k!==norm(k).replace(/ /g,' ')&&!k.includes('&')))errs.push(t+' k doit être en minuscules sans accents: '+q.k);
   if(!ok(q,q.a))errs.push(t+' la réponse «'+q.a+'» n\'est pas reconnue par k '+JSON.stringify(q.k));
   if(q.d&&q.d.some(x=>ok(q,x)))errs.push(t+' un faux choix est accepté comme bonne réponse: '+q.d.find(x=>ok(q,x)));}
 if(!Array.isArray(q.d)||q.d.length!==3||new Set(q.d).size!==3||q.d.includes(q.a))errs.push(t+' d doit avoir 3 faux différents de la réponse');
 if(q.q&&!q.q.trim().endsWith('?'))errs.push(t+' la question doit finir par ?');
 const key=norm(q.a);if(seen.has(key))errs.push(t+' réponse en double dans le lot: '+q.a);seen.add(key);
});
console.log(a.length,'questions · niveaux',JSON.stringify(lv));
if(errs.length){console.log(errs.length+' problème(s):\n'+errs.slice(0,60).join('\n'));process.exit(1)}else console.log('OK');
