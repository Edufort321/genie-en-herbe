const fs=require('fs'),vm=require('vm');const W={};W.window=W;vm.createContext(W);
vm.runInContext(fs.readFileSync('data.js','utf8')+';'+fs.readFileSync('culture.js','utf8'),W);
const norm=s=>String(s).toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const ok=(k,v)=>{const n=' '+norm(v)+' ';return k.some(x=>x.split('&').every(p=>{p=norm(p);return p.length<=3?n.includes(' '+p+' '):n.includes(p)}))};
const strip=s=>norm(s.replace(/\([^)]*\)/g,'')).replace(/^(the|a|an) /,'').replace(/ s$/,'').trim();
function keys(a,d){const par=(a.match(/\(([^)]*)\)/)||[])[1];const core=strip(a);let k;
  const m=core.match(/^(.+) and (.+)$/);if(m&&!/ /.test(m[1]))k=[m[1]+'&'+m[2]];
  else{const w=a.replace(/\([^)]*\)/g,'').trim().split(/\s+/);
    if(w.length>=2&&w.length<=4&&w.every(x=>/^[A-ZÀ-Ý]/.test(x)||/^(de|da|van|von|of|la|le|du|d')$/i.test(x))&&!/^(The|A|An)$/.test(w[0])){const last=norm(w[w.length-1]);if(last.length>3&&!d.some(x=>ok([last],x)))k=[last]}
    if(!k)k=[core];if(d.some(x=>ok(k,x)))k=[norm(a)]}
  if(par){const p=strip(par);if(p&&p.length>2&&!d.some(x=>ok([p],x))&&!k.includes(p))k.push(p)}
  return k}
const CAT={'Géographie':'Geography','Animaux et nature':'Animals and nature','Sciences':'Science','Histoire':'History','Québec et Canada':'Québec and Canada','Corps humain et santé':'Human body and health','Arts et littérature':'Arts and literature','Musique':'Music','Cinéma, télé et jeux':'Movies, TV and games','Langue française':'English language','Sports':'Sports','Maths et logique':'Math and logic','Technologie et inventions':'Technology and inventions','Monde et cuisine':'World and food',
'Langues et langage':'Language','Maths, info, techno':'Math, computers, tech','Arts':'Arts','Monde littéraire':'Literature','Québec':'Québec','Divertissement':'Entertainment','Éducation financière':'Financial literacy'};
const read=f=>fs.readFileSync('gen/'+f,'utf8').split('\n').filter(l=>l.trim()).map(l=>{const [q,a,d]=l.split('|');return{q:q.trim(),a:a.trim(),d:d.split(';').map(x=>x.trim())}});
const cu=[...read('en1.txt'),...read('en2.txt'),...read('en3.txt')],dv=read('en4.txt');
if(cu.length!==W.CULTURE.length||dv.length!==W.DIVERS.length)throw new Error(`counts ${cu.length}/${W.CULTURE.length} ${dv.length}/${W.DIVERS.length}`);
let errs=[];
const mk=(src,fr,extra)=>src.map((e,i)=>{const f=fr[i];const c=CAT[f.c];if(!c)errs.push('cat '+f.c);
  const k=keys(e.a,e.d);if(!ok(k,e.a))errs.push(i+' key fails '+e.a+' '+k);const bad=e.d.find(x=>ok(k,x));if(bad)errs.push(i+' distractor ok '+e.a+' ~ '+bad+' '+k);
  if(e.d.length!==3||new Set(e.d).size!==3)errs.push(i+' d '+e.d);if(!e.q.endsWith('?'))errs.push(i+' ?');
  return Object.assign({c,q:e.q,a:e.a,k,d:e.d},extra(f))});
const CE=mk(cu,W.CULTURE,f=>({lvl:f.lvl})),DE=mk(dv,W.DIVERS,f=>({n:f.n}));
if(errs.length){console.log(errs.join('\n'));process.exit(1)}
fs.writeFileSync('culture-en.js','// English edition: General knowledge (CULTURE_EN) and Mixed (DIVERS_EN), same order and levels as the French files.\nwindow.CULTURE_EN='+JSON.stringify(CE)+';\nwindow.DIVERS_EN='+JSON.stringify(DE)+';\n');
console.log('OK',CE.length,DE.length);CE.slice(100,112).forEach(q=>console.log(q.a,'→',q.k));
