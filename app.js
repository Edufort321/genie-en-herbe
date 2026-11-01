(()=>{
const $=s=>document.querySelector(s), app=$('#app');
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const norm=s=>String(s||'').toLowerCase().replace(/œ/g,'oe').replace(/æ/g,'ae').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const ARTS=/^(le|la|les|l|un|une|des|du|de|d|the|a)\s+/;
const autoKeys=a=>{let n=norm(a);while(ARTS.test(n))n=n.replace(ARTS,'');return [n||norm(a)]};
const ptsOf=(q,ci=0)=>q.clues?q.pts[Math.min(ci,q.pts.length-1)]:(q.p||10);
const answerOf=q=>q.spell?q.spell:q.a;
function isRight(q,val){
  if(!val||!val.trim())return false;
  if(q.spell)return val.trim().toLowerCase().replace(/’/g,"'")===q.spell;
  const n=' '+norm(val)+' ';
  return (q.k||autoKeys(q.a)).some(k=>k.split('&').every(p=>{p=norm(p);return p.length<=3?n.includes(' '+p+' '):n.includes(p)}));
}
function speak(q){
  if(!('speechSynthesis' in window))return;
  speechSynthesis.cancel();
  const v=speechSynthesis.getVoices().find(v=>/fr[-_]CA/i.test(v.lang))||speechSynthesis.getVoices().find(v=>/^fr/i.test(v.lang));
  [q.spell,q.s,q.spell].forEach(t=>{const u=new SpeechSynthesisUtterance(t);u.lang='fr-CA';if(v)u.voice=v;u.rate=.9;speechSynthesis.speak(u)});
}
const blank=q=>esc(q.s).replace(new RegExp(q.spell,'i'),'<b style="color:var(--gold)">_____</b>');

// ---------- banques ----------
const mine=()=>store.get('geh-mine',[]);
const SRC={sheet:()=>SHEET,divers:()=>DIVERS,mine};
let S=store.get('geh-prefs',{src:'sheet',cats:{},lv:[1,2,3,4,5],len:20,timer:true});
const save=()=>store.set('geh-prefs',S);
const catsOf=src=>[...new Set(SRC[src]().map(q=>q.c))];
function pool(){
  let list=SRC[S.src]();
  if(S.src==='divers')list=list.filter(q=>S.lv.includes(q.n));
  const off=S.cats[S.src]||[];
  return list.filter(q=>!off.includes(q.c));
}
let G=null,timerId=null;
const stopTimer=()=>{clearInterval(timerId);timerId=null};

// ---------- accueil ----------
function home(){
  stopTimer();G=null;
  const cats=catsOf(S.src),off=S.cats[S.src]||[],n=pool().length,best=store.get('geh-best',{})[S.src];
  const tab=(k,t,c)=>`<button data-src="${k}" class="${S.src===k?'on':''}">${t}<small>${c} questions</small></button>`;
  app.innerHTML=`
  <div class="hero"><img src="icon-192.webp" alt="Logo Génie en herbe"><div><h1>Génie en herbe</h1><p>Révise, teste-toi, deviens imbattable.</p></div></div>
  <div class="tabs">${tab('sheet','Feuille 2020-21',SHEET.length)}${tab('divers','Divers sec 1-5',DIVERS.length)}${tab('mine','Mes documents',mine().length)}</div>
  ${S.src==='divers'?`<div class="lbl">Niveau</div><div class="chips">${[1,2,3,4,5].map(l=>`<button class="chip gold ${S.lv.includes(l)?'on':''}" data-lv="${l}">Sec ${l}</button>`).join('')}</div>`:''}
  ${S.src==='mine'&&!mine().length?`<div class="drop" id="drop0"><h3>Aucun document pour l'instant</h3><p>Glisse des photos de feuilles de questions, ou un fichier .txt / .csv / .json.</p><div class="row" style="justify-content:center"><button class="btn gold" data-go="import">Ajouter des documents</button></div></div>`:`
  <div class="lbl">Catégories</div><div class="chips"><button class="chip ${off.length?'':'on'}" data-all>Toutes</button>${cats.map(c=>`<button class="chip ${off.includes(c)?'':'on'}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>
  <div class="count"><b>${n}</b> question${n>1?'s':''} sélectionnée${n>1?'s':''}</div>
  <div class="modes">
    <button class="mode rev" data-go="rev"><h2>Révision</h2><p>Ordre aléatoire. Tu dévoiles la réponse et tu dis si tu la savais. Les ratées reviennent.</p><span class="go">Commencer</span></button>
    <button class="mode exa" data-go="exam"><h2>Examen</h2><p>Tu écris ta réponse, on calcule ton pointage comme en vrai match.</p><span class="go">Me tester</span></button>
  </div>
  <div class="opts"><span class="lbl" style="margin:0">Examen</span>
    <div class="seg">${[10,20,30,0].map(l=>`<button data-len="${l}" class="${S.len===l?'on':''}">${l||'Tout'}</button>`).join('')}</div>
    <button class="tog" data-timer><span class="sw ${S.timer?'on':''}"></span>Chrono</button>
  </div>
  ${best!=null?`<div class="best">Meilleur examen ici : <b>${best} %</b></div>`:''}`}
  <div class="row"><button class="btn" data-go="import">Ajouter des documents</button>${installEvt?'<button class="btn ghost" data-install>Installer l\'app</button>':''}</div>`;
}
app.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;const d=b.dataset;
  if(d.src){S.src=d.src;save();home()}
  else if(d.lv){const l=+d.lv;S.lv=S.lv.includes(l)?S.lv.filter(x=>x!==l):[...S.lv,l].sort();if(!S.lv.length)S.lv=[l];save();home()}
  else if('all' in d){S.cats[S.src]=[];save();home()}
  else if(d.cat){const o=S.cats[S.src]||[];const c=d.cat;let nx=o.includes(c)?o.filter(x=>x!==c):[...o,c];if(nx.length>=catsOf(S.src).length)nx=catsOf(S.src).filter(x=>x!==c);S.cats[S.src]=nx;save();home()}
  else if(d.len){S.len=+d.len;save();home()}
  else if('timer' in d){S.timer=!S.timer;save();home()}
  else if('install' in d){installEvt.prompt();installEvt=null}
  else if(d.go==='rev')startRev(pool());
  else if(d.go==='exam')startExam();
  else if(d.go==='import')importScreen();
  else if(d.go==='home')home();
  else if(d.act&&ACT[d.act])ACT[d.act](b);
});

// ---------- rendu question ----------
function qBlock(q,ci,reveal){
  let h=`<span class="tag">${esc(q.c)}${q.n?` <em>Sec ${q.n}</em>`:''}${G.mode==='exam'?` <em>${ptsOf(q,ci)} pts</em>`:''}</span>`;
  if(q.clues){h+=q.clues.slice(0,ci+1).map((c,i)=>`<div class="clue"><b>${q.pts[i]} p.</b>${esc(c)}</div>`).join('')}
  else if(q.spell){h+=`<div class="q">Comment épelle-t-on le mot manquant ?</div><div class="clue">${reveal?esc(q.s):blank(q)}</div><button class="say" data-act="say">Écouter le mot et la phrase</button>`}
  else h+=`<div class="q">${esc(q.q)}</div>`;
  if(q.h)h+=`<div class="hint">Indice : ${esc(q.h)}</div>`;
  return h;
}
const topBar=(i,n,extra='')=>`<div class="top"><button class="x" data-go="home" aria-label="Quitter">✕</button><div class="bar"><i style="width:${i/n*100}%"></i></div>${extra}<span class="n">${Math.min(i+1,n)} / ${n}</span></div>`;

// ---------- révision ----------
function startRev(list){
  if(!list.length)return;
  G={mode:'rev',deck:shuffle(list),i:0,ci:0,rev:false,first:new Map(),total:list.length};
  rev();
}
function rev(){
  const q=G.deck[G.i];if(!q)return revEnd();
  const more=q.clues&&G.ci<q.clues.length-1&&!G.rev;
  app.innerHTML=topBar(G.i,G.deck.length)+`<div class="card">${qBlock(q,G.ci,G.rev)}
  ${G.rev?`<div class="ans"><small>Réponse</small><div>${esc(answerOf(q))}</div></div>
   <div class="acts"><button class="btn bad" data-act="again">À revoir</button><button class="btn good" data-act="knew">Je savais</button></div>`
  :`<div class="acts">${more?'<button class="btn" data-act="clue">Indice suivant</button>':''}<button class="btn pri" data-act="show">Voir la réponse</button></div>`}
  </div><div class="keys">Espace : réponse · 1 : à revoir · 2 : je savais</div>`;
  if(q.spell&&!G.rev)setTimeout(()=>speak(q),250);
}
function revNext(knew){
  const q=G.deck[G.i];
  if(!G.first.has(q))G.first.set(q,knew);
  if(!knew)G.deck.splice(Math.min(G.i+4,G.deck.length),0,q);
  G.i++;G.ci=0;G.rev=false;rev();
}
function revEnd(){
  const ok=[...G.first.values()].filter(Boolean).length,t=G.first.size;
  app.innerHTML=`<div class="card end"><img src="icon-192.webp" alt=""><div class="big">${ok}/${t}</div><p class="count">réussies du premier coup</p>
  <div class="row" style="justify-content:center"><button class="btn pri" data-act="revagain">Recommencer</button><button class="btn" data-go="home">Accueil</button></div></div>`;
  G.last=[...G.first.keys()];
}

// ---------- examen ----------
function startExam(list){
  let d=shuffle(list||pool());if(!list&&S.len)d=d.slice(0,S.len);if(!d.length)return;
  G={mode:'exam',deck:d,i:0,ci:0,done:false,score:0,max:d.reduce((s,q)=>s+ptsOf(q,0),0),res:[]};
  exam();
}
function exam(){
  stopTimer();
  const q=G.deck[G.i];if(!q)return examEnd();
  const r=G.res[G.i],more=q.clues&&G.ci<q.clues.length-1&&!G.done;
  app.innerHTML=topBar(G.i,G.deck.length,`<span class="score">${G.score} pts</span>`)+`<div class="card">${qBlock(q,G.ci,G.done)}
  ${G.done?`<div class="ans ${r.ok?'ok':'ko'}"><small>${r.ok?'Bonne réponse · +'+r.pts+' pts':(r.val?'Pas tout à fait':'Temps écoulé ou passé')}</small><div>${esc(answerOf(q))}</div>${r.val&&!r.ok?`<div class="v">Ta réponse : ${esc(r.val)}</div>`:''}</div>
   <div class="acts">${!r.ok&&r.val?'<button class="btn good" data-act="override">J\'avais raison</button>':''}<button class="btn pri" data-act="next">${G.i+1<G.deck.length?'Question suivante':'Voir mon résultat'}</button></div>`
  :`<input class="in" id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Ta réponse…">
   ${S.timer?'<div class="timer" id="tm"><i style="width:100%"></i></div>':''}
   <div class="acts">${more?`<button class="btn" data-act="clue">Indice suivant (${ptsOf(q,G.ci+1)} pts)</button>`:''}<button class="btn ghost" data-act="skip">Passer</button><button class="btn pri" data-act="submit">Valider</button></div>`}
  </div><div class="keys">Entrée : valider / continuer</div>`;
  if(!G.done){
    const inp=$('#ans');setTimeout(()=>inp.focus(),50);
    if(q.spell)setTimeout(()=>speak(q),250);
    if(S.timer){const tot=q.clues?20:(q.spell?30:25);let t=G.tleft??tot;G.tleft=t;const tm=$('#tm');
      const draw=()=>{tm.firstChild.style.width=(t/tot*100)+'%';tm.classList.toggle('low',t<=5)};draw();
      timerId=setInterval(()=>{t--;G.tleft=t;draw();if(t<=0){stopTimer();submit($('#ans').value)}},1000)}
  }
}
function submit(val){
  stopTimer();const q=G.deck[G.i],ok=isRight(q,val),pts=ok?ptsOf(q,G.ci):0;
  G.score+=pts;G.res[G.i]={q,val:val.trim(),ok,pts};G.done=true;G.tleft=null;exam();
}
function examEnd(){
  stopTimer();
  const pc=G.max?Math.round(G.score/G.max*100):0,ok=G.res.filter(r=>r.ok).length,miss=G.res.filter(r=>!r.ok);
  const best=store.get('geh-best',{});if(G.deck.length>=10&&(best[S.src]??-1)<pc){best[S.src]=pc;store.set('geh-best',best)}
  const msg=pc>=90?'Niveau finale provinciale.':pc>=75?'Solide. Ton équipe compte sur toi.':pc>=50?'Bon départ, encore un peu de révision.':'On révise et on revient plus fort.';
  app.innerHTML=`<div class="card end"><img src="icon-192.webp" alt=""><div class="big">${pc} %</div><p class="count">${msg}</p>
  <div class="stats"><div><b>${G.score}</b>points / ${G.max}</div><div><b>${ok}/${G.res.length}</b>bonnes réponses</div></div>
  <div class="row" style="justify-content:center">${miss.length?'<button class="btn gold" data-act="revmiss">Réviser mes erreurs</button>':''}<button class="btn pri" data-go="exam">Nouvel examen</button><button class="btn" data-go="home">Accueil</button></div>
  ${miss.length?`<ul class="miss">${miss.map(r=>`<li>${esc(r.q.q||(r.q.clues?r.q.clues.at(-1):'Épeler : '+r.q.s))}<span>${esc(answerOf(r.q))}</span>${r.val?`<i>Toi : ${esc(r.val)}</i>`:''}</li>`).join('')}</ul>`:''}</div>`;
  G.missed=miss.map(r=>r.q);
}

const ACT={
  say(){speak(G.deck[G.i])},
  show(){G.rev=true;rev()},
  clue(){G.ci++;G.mode==='rev'?rev():(G.tleft=null,exam())},
  knew(){revNext(true)},again(){revNext(false)},
  revagain(){startRev(G.last)},
  submit(){submit($('#ans').value)},
  skip(){submit('')},
  next(){G.i++;G.ci=0;G.done=false;exam()},
  override(){const r=G.res[G.i];r.ok=true;r.pts=ptsOf(r.q,G.ci);G.score+=r.pts;exam()},
  revmiss(){startRev(G.missed)},
};
document.addEventListener('keydown',e=>{
  if(!G)return;
  if(G.mode==='rev'){if(e.target.tagName==='TEXTAREA')return;
    if(e.key===' '&&!G.rev){e.preventDefault();ACT.show()}else if(G.rev&&e.key==='1')ACT.again();else if(G.rev&&(e.key==='2'||e.key==='Enter'))ACT.knew()}
  else if(G.mode==='exam'&&e.key==='Enter'){e.preventDefault();G.done?ACT.next():ACT.submit()}
});

// ---------- import ----------
let pending='';
function importScreen(){
  stopTimer();G=null;const m=mine();
  app.innerHTML=`<div class="top"><button class="x" data-go="home" aria-label="Retour">✕</button><h2 style="font-size:22px">Ajouter des documents</h2></div>
  <div class="drop" id="drop"><h3>Glisse tes fichiers ici</h3><p>Photos de feuilles (lecture automatique du texte), ou fichiers .txt, .csv, .json.<br>Format texte : une question par ligne, <b>question | réponse</b></p>
  <div class="row" style="justify-content:center"><label class="btn gold" style="cursor:pointer">Choisir des fichiers<input type="file" id="file" multiple accept="image/*,.txt,.csv,.json" hidden></label></div></div>
  <div id="stat" class="note"></div>
  <div id="ed" style="${pending?'':'display:none'}"><div class="lbl">Vérifie avant d'ajouter (question | réponse)</div>
  <textarea class="in" id="txt">${esc(pending)}</textarea>
  <div class="row"><input class="in" id="cat" style="margin:0;flex:1;font-size:15px" placeholder="Catégorie (ex. Feuille 2021-22)" value="Mes documents"><button class="btn pri" data-act="doimport">Ajouter</button></div></div>
  <div class="note">Mes documents : <b style="color:var(--gold)">${m.length}</b> questions enregistrées sur cet appareil.</div>
  ${m.length?`<div class="row"><button class="btn" data-act="export">Exporter (.json)</button><button class="btn bad" data-act="wipe">Tout effacer</button></div>`:''}`;
  const dz=$('#drop');
  ['dragenter','dragover'].forEach(t=>dz.addEventListener(t,e=>{e.preventDefault();dz.classList.add('hov')}));
  ['dragleave','drop'].forEach(t=>dz.addEventListener(t,()=>dz.classList.remove('hov')));
  $('#file').addEventListener('change',e=>handleFiles(e.target.files));
}
function linesFromParsed(arr){return arr.map(o=>`${(o.q||'').replace(/\|/g,'/')} | ${o.a||''}`).join('\n')}
function parseOcr(text){
  const out=[];let buf=[];
  text.split('\n').map(l=>l.trim()).filter(Boolean).forEach(l=>{
    const m=l.match(/^(.*?)\bR\s*\.?\s*:\s*(.+)$/);
    if(m){buf.push(m[1]);const q=buf.join(' ').replace(/^\s*\d+\s*[.)]?\s*/,'').replace(/^\d+\s*p\.\s*/,'').trim();if(q||m[2])out.push({q,a:m[2].trim()});buf=[]}
    else if(/^#\d+|points? par|©|Saison|secondaire$|^Q\.\s*#/i.test(l)){buf=[]}
    else buf.push(l);
  });
  return out;
}
let tess=null;
function loadTess(){return tess||(tess=new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';s.onload=res;s.onerror=()=>rej(new Error('Lecture d\'image indisponible hors ligne'));document.head.appendChild(s)}))}
async function handleFiles(files){
  files=[...files];if(!files.length)return;
  if(!$('#drop'))importScreen();
  const st=$('#stat');let acc=[];
  for(const [i,f] of files.entries()){
    st.textContent=`Lecture de ${f.name} (${i+1}/${files.length})…`;
    try{
      if(f.type.startsWith('image/')){
        await loadTess();
        const r=await Tesseract.recognize(f,'fra',{logger:m=>{if(m.status==='recognizing text')st.textContent=`Lecture de ${f.name} : ${Math.round(m.progress*100)} %`}});
        const p=parseOcr(r.data.text);acc.push(p.length?linesFromParsed(p):r.data.text);
      }else{
        const t=await f.text();
        if(/\.json$/i.test(f.name)){const j=JSON.parse(t);acc.push(linesFromParsed(Array.isArray(j)?j:j.questions||[]))}
        else acc.push(t.split('\n').map(l=>l.replace(/\t|;/,' | ')).join('\n'));
      }
    }catch(err){st.textContent='Erreur avec '+f.name+' : '+err.message}
  }
  pending=[pending,...acc].filter(Boolean).join('\n').trim();
  st.textContent='Texte extrait. Corrige au besoin, puis ajoute.';
  $('#ed').style.display='';$('#txt').value=pending;
}
Object.assign(ACT,{
  doimport(){
    const cat=($('#cat').value||'Mes documents').trim();
    const add=$('#txt').value.split('\n').map(l=>l.split('|')).filter(p=>p.length>=2&&p[0].trim()&&p[1].trim()).map(p=>({c:cat,q:p[0].trim(),a:p.slice(1).join('|').trim(),k:autoKeys(p.slice(1).join('|'))}));
    if(!add.length){$('#stat').textContent='Aucune ligne au format « question | réponse ».';return}
    store.set('geh-mine',[...mine(),...add]);pending='';S.src='mine';save();
    importScreen();$('#stat').textContent=add.length+' questions ajoutées.';
  },
  export(){const b=new Blob([JSON.stringify(mine(),null,1)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='genie-en-herbe-mes-questions.json';a.click()},
  wipe(){if(confirm('Effacer toutes tes questions importées ?')){store.set('geh-mine',[]);importScreen()}}
});
// glisser-déposer n'importe où
let dc=0;const cover=$('#dragcover');
addEventListener('dragenter',e=>{if(e.dataTransfer?.types?.includes('Files')){dc++;cover.style.display='flex'}});
addEventListener('dragleave',()=>{if(--dc<=0){dc=0;cover.style.display='none'}});
addEventListener('dragover',e=>e.preventDefault());
addEventListener('drop',e=>{e.preventDefault();dc=0;cover.style.display='none';if(e.dataTransfer.files.length)handleFiles(e.dataTransfer.files)});

// ---------- PWA ----------
let installEvt=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvt=e;if(!G&&!$('#drop'))home()});
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
home();
})();
