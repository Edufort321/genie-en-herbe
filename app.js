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
const SRC={mine:()=>[...SHEET,...mine()],divers:()=>DIVERS};
let S=store.get('geh-prefs',{src:'mine',cats:{},lv:[1,2,3,4,5],len:20,timer:true});
if(!SRC[S.src])S.src='mine';
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
const openF=new Set(store.get('geh-open',[]));
const fold=(id,title,sum,body)=>`<details class="fold" data-fold="${id}" ${openF.has(id)?'open':''}><summary><span>${title}</span><em>${esc(sum)}</em></summary><div class="fb">${body}</div></details>`;
app.addEventListener('toggle',e=>{const f=e.target.dataset?.fold;if(!f)return;e.target.open?openF.add(f):openF.delete(f);store.set('geh-open',[...openF])},true);
function home(){
  stopTimer();G=null;
  const cats=catsOf(S.src),off=S.cats[S.src]||[],n=pool().length,best=store.get('geh-best',{})[S.src];
  const tab=(k,t,c)=>`<button data-src="${k}" class="${S.src===k?'on':''}">${t}<small>${c} questions</small></button>`;
  app.innerHTML=`
  <div class="hero"><img src="icon-192.webp" alt="Logo Génie en herbe"><div><h1>Génie en herbe</h1><p>${P?['Salut '+esc(P.nom),esc(P.ecole)].filter(Boolean).join(' · '):'Révise, teste-toi, deviens imbattable.'}</p></div>${P?`<button class="me" data-act="profil" aria-label="Mon profil">${esc(P.nom.trim()[0]||'?').toUpperCase()}</button>`:''}</div>
  <div class="tabs">${tab('mine','Mes questions',SHEET.length+mine().length)}${tab('divers','Divers',DIVERS.length)}</div>
  ${S.src==='divers'?fold('lv','Niveau',S.lv.length===5?'Sec 1 à 5':S.lv.map(l=>'Sec '+l).join(', '),`<div class="chips">${[1,2,3,4,5].map(l=>`<button class="chip gold ${S.lv.includes(l)?'on':''}" data-lv="${l}">Sec ${l}</button>`).join('')}</div>`):''}
  ${false?`<div class="drop" id="drop0"><h3>Aucun document pour l'instant</h3><p>Glisse des photos de feuilles de questions, ou un fichier .txt / .csv / .json.</p><div class="row" style="justify-content:center"><button class="btn gold" data-go="import">Ajouter des documents</button></div></div>`:`
  ${fold('cat','Catégories',off.length?`${cats.length-off.length} sur ${cats.length}`:'Toutes',`<div class="chips"><button class="chip ${off.length?'':'on'}" data-all>Toutes</button>${cats.map(c=>`<button class="chip ${off.includes(c)?'':'on'}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>`)}
  ${fold('opt','Réglages',`${qcm()?'Choix multiples':'Réponse écrite'} · ${S.len||'Toutes les'} q.`,`<div class="opts"><div class="seg"><button data-act="qcm" class="${qcm()?'on':''}">Choix multiples</button><button data-act="qcm" class="${qcm()?'':'on'}">Réponse écrite</button></div></div><div class="lbl">Examen</div><div class="opts"><div class="seg">${[10,20,30,0].map(l=>`<button data-len="${l}" class="${S.len===l?'on':''}">${l||'Tout'}</button>`).join('')}</div>
    <button class="tog" data-timer><span class="sw ${S.timer?'on':''}"></span>Chrono</button></div>`)}
  <div class="count"><b>${n}</b> question${n>1?'s':''} sélectionnée${n>1?'s':''}</div>
  <div class="modes">
    <button class="mode rev" data-go="rev"><h2>Révision</h2><p>Ordre aléatoire. Tu dévoiles la réponse et tu dis si tu la savais. Les ratées reviennent.</p><span class="go">Commencer</span></button>
    <button class="mode exa" data-go="exam"><h2>Examen</h2><p>Tu écris ta réponse, on calcule ton pointage comme en vrai match.</p><span class="go">Me tester</span></button>
    <button class="mode duo" data-go="duel"><h2>Duel</h2><p>2 joueurs face à face sur le même téléphone.</p><span class="go">Affronter</span></button>
    <button class="mode onl" data-go="online"><h2>En ligne</h2><p>Entre dans une salle avec un code, vois qui est là et lance un défi.</p><span class="go">Jouer en ligne</span></button>
  </div>
  ${best!=null?`<div class="best">Meilleur examen ici : <b>${best} %</b></div>`:''}`}
  <div class="row">${S.src==='mine'?'<button class="btn gold" data-go="import">Ajouter photos ou documents</button>':''}${installEvt?'<button class="btn ghost" data-install>Installer l\'app</button>':''}</div>`;
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
  else if(d.go==='duel')duelSetup();
  else if(d.go==='online')onlineScreen();
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
// ---------- choix de réponses ----------
const qcm=()=>S.qcm!==false;
const NUMW=['Deux','Trois','Quatre','Cinq','Six','Sept','Huit','Neuf','Dix','Onze','Douze'];
const GRAM=['Nom','Verbe','Adjectif','Adverbe','Déterminant','Pronom','Préposition','Conjonction'];
const wc=t=>String(t).split(/\s+/).length;
function misspell(w){const v=new Set(),R=[[/ss/,'s'],[/([^s])s(?!s)/,'$1ss'],[/é/,'è'],[/é/,'e'],[/ph/,'f'],[/ie$/,'i'],[/ées$/,'és'],[/ées$/,'ée'],[/nn/,'n'],[/n(?!n)/,'nn'],[/i/,'y'],[/g/,'gu'],[/a/,'e']];
  for(const[a,b]of R)if(a.test(w))v.add(w.replace(a,b));v.delete(w);return shuffle([...v]).slice(0,3)}
function choicesFor(q){
  const ans=answerOf(q);let d=[];
  if(q.d)d=shuffle(q.d).slice(0,3);
  else if(q.spell)d=misspell(q.spell);
  else if(NUMW.includes(ans)){const i=NUMW.indexOf(ans);d=shuffle([i-2,i-1,i+1,i+2].filter(x=>x>=0&&x<NUMW.length).map(x=>NUMW[x])).slice(0,3)}
  else if(GRAM.includes(ans))d=shuffle(GRAM.filter(x=>x!==ans)).slice(0,3);
  else if(/^\d+$/.test(norm(ans))){const n=+norm(ans),st=n>1000?[-10,10,-100,25]:n>100?[-10,10,20,-20,100]:[-2,-1,1,2,n];d=shuffle([...new Set(st.map(x=>n+x).filter(x=>x>0&&x!==n))]).slice(0,3).map(String)}
  if(d.length<3){
    const all=[...SRC[S.src](),...SHEET,...DIVERS],seen=new Set([norm(ans)]),pick=list=>shuffle(list).sort((x,y)=>Math.abs(wc(answerOf(x))-wc(ans))-Math.abs(wc(answerOf(y))-wc(ans))).forEach(x=>{const t=answerOf(x),n=norm(t);if(d.length<3&&!seen.has(n)&&!x.spell&&!isRight(q,t)){seen.add(n);d.push(t)}});
    d.forEach(t=>seen.add(norm(t)));
    pick(all.filter(x=>x.c===q.c&&x!==q));pick(all.filter(x=>x!==q));
  }
  return shuffle([ans,...d.slice(0,3)]);
}
function chBlock(q,picked,lock){
  if(G.chFor!==q){G.ch=choicesFor(q);G.chFor=q}
  const ans=answerOf(q);
  return `<div class="choices">${G.ch.map((c,i)=>`<button class="choice ${lock?(c===ans?'ok':c===picked?'ko':'dim'):''}" data-act="pick" data-i="${i}" ${lock?'disabled':''}><b>${'ABCD'[i]}</b><span>${esc(c)}</span></button>`).join('')}</div>`;
}
function rev(){
  const q=G.deck[G.i];if(!q)return revEnd();
  const more=q.clues&&G.ci<q.clues.length-1&&!G.rev,mc=qcm();
  app.innerHTML=topBar(G.i,G.deck.length)+`<div class="card">${qBlock(q,G.ci,G.rev)}
  ${mc?chBlock(q,G.picked,G.rev):''}
  ${G.rev?(mc?`<div class="ans ${G.picked===answerOf(q)?'ok':'ko'}"><small>${G.picked===answerOf(q)?'Bravo !':'La bonne réponse'}</small><div>${esc(answerOf(q))}</div></div>
   <div class="acts"><button class="btn pri" data-act="mcnext">Suivante</button></div>`
   :`<div class="ans"><small>Réponse</small><div>${esc(answerOf(q))}</div></div>
   <div class="acts"><button class="btn bad" data-act="again">À revoir</button><button class="btn good" data-act="knew">Je savais</button></div>`)
  :`<div class="acts">${more?'<button class="btn" data-act="clue">Indice suivant</button>':''}${mc?'<button class="btn ghost" data-act="show">Je ne sais pas</button>':'<button class="btn pri" data-act="show">Voir la réponse</button>'}</div>`}
  </div><div class="keys">${mc?'1 à 4 : choisir · Entrée : suivante':'Espace : réponse · 1 : à revoir · 2 : je savais'}</div>`;
  if(q.spell&&!G.rev)setTimeout(()=>speak(q),250);
}
function revNext(knew){
  const q=G.deck[G.i];
  if(!G.first.has(q))G.first.set(q,knew);
  if(!knew)G.deck.splice(Math.min(G.i+4,G.deck.length),0,q);
  G.i++;G.ci=0;G.rev=false;G.picked=null;G.chFor=null;rev();
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
  ${G.done&&r.mc?chBlock(q,r.val,true):''}
  ${G.done?`<div class="ans ${r.ok?'ok':'ko'}"><small>${r.ok?'Bonne réponse · +'+r.pts+' pts':(r.val?'Pas tout à fait':'Temps écoulé ou passé')}</small><div>${esc(answerOf(q))}</div>${r.val&&!r.ok?`<div class="v">Ta réponse : ${esc(r.val)}</div>`:''}</div>
   <div class="acts">${!r.ok&&r.val&&!r.mc?'<button class="btn good" data-act="override">J\'avais raison</button>':''}<button class="btn pri" data-act="next">${G.i+1<G.deck.length?'Question suivante':'Voir mon résultat'}</button></div>`
  :`${qcm()?chBlock(q,null,false):'<input class="in" id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Ta réponse…">'}
   ${S.timer?'<div class="timer" id="tm"><i style="width:100%"></i></div>':''}
   <div class="acts">${more?`<button class="btn" data-act="clue">Indice suivant (${ptsOf(q,G.ci+1)} pts)</button>`:''}<button class="btn ghost" data-act="skip">Passer</button>${qcm()?'':'<button class="btn pri" data-act="submit">Valider</button>'}</div>`}
  </div><div class="keys">Entrée : valider / continuer</div>`;
  if(!G.done){
    const inp=$('#ans');if(inp)setTimeout(()=>inp.focus(),50);
    if(q.spell)setTimeout(()=>speak(q),250);
    if(S.timer){const tot=q.clues?20:(q.spell?30:25);let t=G.tleft??tot;G.tleft=t;const tm=$('#tm');
      const draw=()=>{tm.firstChild.style.width=(t/tot*100)+'%';tm.classList.toggle('low',t<=5)};draw();
      timerId=setInterval(()=>{t--;G.tleft=t;draw();if(t<=0){stopTimer();submit($('#ans')?.value||'')}},1000)}
  }
}
function submit(val){
  stopTimer();const q=G.deck[G.i],mc=qcm(),ok=mc?val===answerOf(q):isRight(q,val),pts=ok?ptsOf(q,G.ci):0;
  G.score+=pts;G.res[G.i]={q,val:val.trim(),ok,pts,mc};G.done=true;G.tleft=null;exam();
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
  show(){G.rev=true;G.picked=null;rev()},
  clue(){G.ci++;G.mode==='rev'?rev():(G.tleft=null,exam())},
  knew(){revNext(true)},again(){revNext(false)},
  revagain(){startRev(G.last)},
  submit(){submit($('#ans').value)},
  skip(){submit('')},
  next(){G.i++;G.ci=0;G.done=false;G.chFor=null;exam()},
  pick(b){const v=G.ch[+b.dataset.i];if(G.mode==='rev'){G.picked=v;G.rev=true;rev()}else if(!G.done)submit(v)},
  mcnext(){revNext(G.picked===answerOf(G.deck[G.i]))},
  qcm(){S.qcm=!qcm();save();home()},
  override(){const r=G.res[G.i];r.ok=true;r.pts=ptsOf(r.q,G.ci);G.score+=r.pts;exam()},
  revmiss(){startRev(G.missed)},
};
document.addEventListener('keydown',e=>{
  if(!G)return;
  if(qcm()&&/^[1-4]$/.test(e.key)&&!(G.mode==='rev'?G.rev:G.done)){const b=document.querySelectorAll('.choice')[+e.key-1];if(b)ACT.pick(b);return}
  if(G.mode==='rev'&&qcm()){if(e.key==='Enter'&&G.rev)ACT.mcnext();return}
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
  <div class="row"><input class="in" id="cat" style="margin:0;flex:1;font-size:15px" placeholder="Catégorie (ex. Feuille 2021-22)" value="Feuille importée"><button class="btn pri" data-act="doimport">Ajouter</button></div></div>
  <div class="note">Questions importées de tes photos et documents : <b style="color:var(--gold)">${m.length}</b> questions enregistrées sur cet appareil.</div>
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
    const cat=($('#cat').value||'Feuille importée').trim();
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
// ---------- accueil animé + profil ----------
let P=store.get('geh-profil',null);
function profil(){
  G=null;stopTimer();
  app.innerHTML=`<div class="onb"><img src="icon-192.webp" alt=""><h1>${P?'Mon profil':'Bienvenue !'}</h1><p>${P?'Modifie tes infos.':'Présente-toi avant de commencer.'}</p>
  <form id="pf" autocomplete="off">
    <label>Prénom<input class="in" id="pn" maxlength="30" required value="${esc(P?.nom||'')}" placeholder="Ton prénom"></label>
    <label>Âge<input class="in" id="pa" type="number" inputmode="numeric" min="8" max="20" value="${esc(P?.age||'')}" placeholder="12"></label>
    <label>École<input class="in" id="pe" maxlength="60" value="${esc(P?.ecole||'')}" placeholder="Nom de ton école"></label>
    <button class="btn pri go" id="pgo" type="submit">Go</button>
  </form><small>Ces infos restent seulement sur ton appareil.</small></div>`;
  const f=$('#pf'),pn=$('#pn'),chk=()=>$('#pgo').disabled=!pn.value.trim();chk();pn.addEventListener('input',chk);
  if(!P)setTimeout(()=>pn.focus(),300);
  f.addEventListener('submit',e=>{e.preventDefault();if(!pn.value.trim())return;
    const age=parseInt($('#pa').value)||null,first=!P;
    P={nom:pn.value.trim(),age,ecole:$('#pe').value.trim()};store.set('geh-profil',P);
    if(first&&age){const lv=Math.min(5,Math.max(1,age-11));S.lv=Array.from({length:lv},(_,i)=>i+1);save()}
    home()});
}
ACT.profil=profil;
function boot(){
  app.innerHTML=`<div class="splash"><img src="icon-192.webp" alt=""><h1>Génie en herbe</h1></div>`;
  setTimeout(()=>{const sp=$('.splash');if(sp)sp.classList.add('out');setTimeout(()=>P?home():profil(),350)},1900);
}
// ---------- duel 2 joueurs ----------
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let D=null,dT=[],rec=null,actx=null;
const later=(f,ms)=>dT.push(setTimeout(f,ms));
function dClear(){dT.forEach(clearTimeout);dT=[];if(D)clearInterval(D.iv),clearInterval(D.civ);try{rec&&rec.abort()}catch(e){}rec=null}
function beep(f=880,d=.15){try{actx=actx||new(window.AudioContext||window.webkitAudioContext)();const o=actx.createOscillator(),g=actx.createGain();o.type='square';o.frequency.value=f;g.gain.value=.07;o.connect(g);g.connect(actx.destination);o.start();o.stop(actx.currentTime+d)}catch(e){}}
function say(t,cb){
  if(!('speechSynthesis' in window)){cb&&cb();return}
  speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t),vs=speechSynthesis.getVoices();
  const v=vs.find(v=>/fr[-_]CA/i.test(v.lang))||vs.find(v=>/^fr/i.test(v.lang));if(v)u.voice=v;u.lang='fr-CA';u.rate=1.05;
  if(cb){let done=false;u.onend=u.onerror=()=>{if(!done){done=true;cb()}}}
  speechSynthesis.speak(u);
}
async function micOK(){
  try{if(!navigator.mediaDevices?.getUserMedia)return false;
    const st=await navigator.mediaDevices.getUserMedia({audio:true});st.getTracks().forEach(t=>t.stop());return true}catch(e){return false}
}
const dPool=()=>pool().filter(q=>!q.spell);
function duelSetup(){
  stopTimer();G=null;dClear();D=null;
  const n=dPool().length,dl=S.dlen||10,voc=SR&&S.dvoc!==false;
  app.innerHTML=`<div class="onb"><img src="icon-192.webp" alt=""><h1>Duel 2 joueurs</h1><p>Posez le téléphone à plat entre vous deux.</p>
  <form id="df" autocomplete="off">
    <label>Joueur 1 (en bas)<input class="in" id="d1" maxlength="20" value="${esc(S.dn1||P?.nom||'Joueur 1')}"></label>
    <label>Joueur 2 (en haut)<input class="in" id="d2" maxlength="20" value="${esc(S.dn2||'Joueur 2')}"></label>
    <label>Nombre de questions</label><div class="seg" style="margin-top:6px">${[10,15,20].map(l=>`<button type="button" data-dl="${l}" class="${dl===l?'on':''}">${l}</button>`).join('')}</div>
    <label>Réponse</label><div class="seg" style="margin-top:6px"><button type="button" data-dv="1" class="${voc?'on':''}" ${SR?'':'disabled'}>Au micro</button><button type="button" data-dv="0" class="${voc?'':'on'}">Choix A B C D</button></div>
    ${SR?'':'<small>Ce navigateur ne permet pas la reconnaissance vocale : réponses par choix.</small>'}
    <button class="btn pri go" type="submit">Lancer le duel</button>
  </form><small>${n} questions disponibles avec tes filtres actuels.</small><div class="row" style="justify-content:center"><button class="btn ghost" data-go="home">Retour</button></div></div>`;
  $('#df').addEventListener('click',e=>{const b=e.target.closest('button[type=button]');if(!b)return;
    if(b.dataset.dl){S.dlen=+b.dataset.dl}else if(b.dataset.dv){S.dvoc=b.dataset.dv==='1'}S.dn1=$('#d1').value;S.dn2=$('#d2').value;save();duelSetup()});
  $('#df').addEventListener('submit',async e=>{e.preventDefault();S.dn1=$('#d1').value.trim()||'Joueur 1';S.dn2=$('#d2').value.trim()||'Joueur 2';save();
    const deck=shuffle(dPool()).slice(0,S.dlen||10);if(!deck.length)return;
    let vocal=!!(SR&&S.dvoc!==false);
    if(vocal){const go=$('#df .go');go.disabled=true;go.textContent='Autorisation du micro…';
      if(!(await micOK())){S.dvoc=false;save();go.disabled=false;go.textContent='Lancer le duel';
        const m=document.createElement('small');m.style.color='var(--bad)';m.textContent='Micro refusé ou indisponible : le duel se jouera avec les choix A B C D. Appuie de nouveau sur Lancer, ou autorise le micro dans les réglages de Chrome (icône à gauche de l\'adresse).';
        $('#df').appendChild(m);$('#df [data-dv="1"]').classList.remove('on');$('#df [data-dv="0"]').classList.add('on');return}}
    D={p:[{n:S.dn1,s:0},{n:S.dn2,s:0}],deck,i:0,vocal};
    say('Duel ! '+S.dn1+' contre '+S.dn2+'. Prêts ?');dStart()});
}
function dStart(){
  dClear();const q=D.deck[D.i];
  Object.assign(D,{ci:0,phase:'read',who:null,bad:[],tried:[false,false],heard:'',ok:null,ch:choicesFor(q),deadline:Infinity,total:1});
  dRender();later(()=>dRead(),D.i?300:1700);
  D.iv=setInterval(dTick,200);
}
const dText=q=>q.clues?q.clues[D.ci]:q.q;
function dRead(){
  const q=D.deck[D.i];if(D.phase!=='read')return;
  const t=dText(q);D.deadline=Date.now()+t.length*75+12000;D.total=D.deadline-Date.now();
  say(t,()=>{if(D&&D.phase==='read'){D.deadline=Date.now()+(q.clues&&D.ci<q.clues.length-1?6000:12000);D.total=D.deadline-Date.now()}});
}
function dTick(){
  if(!D)return;const left=D.deadline-Date.now(),bar=$('#dbar');
  if(bar)bar.style.width=(isFinite(left)?Math.max(0,left/D.total*100):100)+'%';
  if(left<=0){const q=D.deck[D.i];
    if(D.phase==='read'){if(q.clues&&D.ci<q.clues.length-1&&!D.tried.some(Boolean)){D.ci++;dRender();dRead()}else dReveal()}
    else if(D.phase==='ans')dJudge(D.who,[])}
}
function dBuzz(k){
  if(!D||D.phase!=='read'||D.tried[k])return;
  speechSynthesis.cancel();if(!D.vocal)beep();navigator.vibrate&&navigator.vibrate(90);
  Object.assign(D,{phase:'ans',who:k,heard:'',alts:[],lock:Date.now()+600});D.tried[k]=true;D.deadline=Date.now()+(D.vocal?10000:10000);D.total=D.deadline-Date.now();
  dRender();if(D.vocal)dListen(k);
}
function lev(a,b){const m=[...Array(b.length+1).keys()];for(let i=1;i<=a.length;i++){let p=m[0];m[0]=i;for(let j=1;j<=b.length;j++){const t=m[j];m[j]=Math.min(m[j]+1,m[j-1]+1,p+(a[i-1]===b[j-1]?0:1));p=t}}return m[b.length]}
function voiceRight(q,v){
  if(isRight(q,v))return true;
  const n=norm(v),ws=n.split(' ');
  const near=k=>{k=norm(k);if(k.length<5)return n.includes(k);const tol=k.length>=8?2:1;
    if(lev(n.replace(/ /g,''),k.replace(/ /g,''))<=tol)return true;
    const kw=k.split(' ').length;for(let i=0;i+kw<=ws.length;i++)if(lev(ws.slice(i,i+kw).join(' '),k)<=tol)return true;return false};
  // tolérance aux erreurs de transcription : un mot proche (1 lettre d'écart, 2 pour les mots longs)
  return (q.k||autoKeys(q.a)).some(alt=>alt.split('&').every(near));
}
function dListen(k,lang){
  try{rec&&rec.abort()}catch(e){}
  let r;try{r=new SR()}catch(e){D.vocal=false;dRender();return}
  rec=r;r.lang=lang||'fr-CA';r.interimResults=true;r.maxAlternatives=5;r.continuous=true;
  const st=t=>{const h=$('#mst'+k);if(h)h.textContent=t};
  D.alts=D.alts||[];
  r.onaudiostart=()=>st('Micro ouvert, parle !');
  r.onspeechstart=()=>st('J\'écoute…');
  r.onresult=e=>{
    for(let i=e.resultIndex;i<e.results.length;i++){const res=e.results[i],alts=[...res].map(a=>a.transcript.trim()).filter(Boolean);
      if(!alts.length)continue;D.heard=alts[0];const h=$('#heard'+k);if(h)h.textContent='« '+D.heard+' »';
      if(alts.some(v=>voiceRight(D.deck[D.i],v))){dJudge(k,alts);return}
      if(res.isFinal)D.alts.push(...alts)}
  };
  r.onerror=e=>{
    if(e.error==='not-allowed'||e.error==='service-not-allowed'){st('Micro refusé : on passe aux choix');later(()=>ACT.dchoix(),900);return}
    if(e.error==='language-not-supported'&&r.lang!=='fr-FR'){dListen(k,'fr-FR');return}
    if(e.error==='network'){st('Pas d\'internet pour la voix : on passe aux choix');later(()=>ACT.dchoix(),1200);return}
    st(e.error==='no-speech'?'Je n\'entends rien… parle plus fort':'Micro : '+e.error);
  };
  r.onend=()=>{ // relance tant qu'il reste du temps (Android coupe souvent l'écoute)
    if(rec===r&&D&&D.phase==='ans'&&D.who===k&&D.vocal&&D.deadline-Date.now()>800)later(()=>{if(rec===r&&D&&D.phase==='ans')dListen(k,r.lang)},150);
  };
  try{r.start()}catch(e){st('Micro indisponible');}
}
function dJudge(k,vals){
  if(!D||D.phase!=='ans'||D.who!==k)return;
  try{rec&&rec.abort()}catch(e){}rec=null;
  const q=D.deck[D.i],ans=answerOf(q);if(!vals.length&&D.alts&&D.alts.length)vals=D.alts;const ok=vals.some(v=>v===ans||voiceRight(q,v));
  D.heard=vals[0]||'';
  if(ok){const pts=ptsOf(q,D.ci);D.p[k].s+=pts;Object.assign(D,{phase:'show',ok:k,gain:pts});beep(1320,.12);later(()=>beep(1760,.15),130);dRender();say('Bonne réponse ! '+ans);later(dNext,3200);return}
  beep(200,.35);navigator.vibrate&&navigator.vibrate([60,60,60]);
  if(!D.tried[1-k]){Object.assign(D,{phase:'read',who:null,miss:k});D.deadline=Date.now()+8000;D.total=8000;dRender();say('Non. Réplique pour '+D.p[1-k].n)}
  else dReveal();
}
function dReveal(){
  if(!D)return;Object.assign(D,{phase:'show',ok:null});dRender();const a=answerOf(D.deck[D.i]);say('La réponse était : '+a);later(dNext,3600);
}
function dNext(){if(!D)return;dClear();D.i++;D.i>=D.deck.length?dEnd():dStart()}
function dHalf(k){
  const q=D.deck[D.i],me=D.p[k],ans=answerOf(q);let z;
  if(D.phase==='ans'&&D.who===k){
    z=D.vocal?`<div class="state talk"><div class="mic"></div><div id="mst${k}">Parle maintenant !</div><div class="heard" id="heard${k}">${D.heard?'« '+esc(D.heard)+' »':''}</div><div class="row" style="margin-top:4px;justify-content:center"><button class="btn ghost" data-act="dmic" data-k="${k}">Relancer le micro</button><button class="btn ghost" data-act="dchoix">Choix A B C D</button></div></div>`
      :`<div class="choices">${D.ch.map((c,i)=>`<button class="choice" data-act="dpick" data-k="${k}" data-i="${i}"><b>${'ABCD'[i]}</b><span>${esc(c)}</span></button>`).join('')}</div>`;
  }else if(D.phase==='ans')z=`<div class="state">${esc(D.p[D.who].n)} répond…</div>`;
  else if(D.phase==='show')z=`<div class="state ${D.ok===k?'win':D.ok===null?'':'lose'}"><small>${D.ok===k?'+'+D.gain+' points !':D.ok===null?'Personne':esc(D.p[D.ok].n)+' a eu le point'}</small><div class="big2">${esc(ans)}</div>${D.heard&&D.ok!==k&&D.who===k?`<small>Tu as dit « ${esc(D.heard)} »</small>`:''}</div>`;
  else if(D.tried[k])z=`<div class="state lose">Raté ! ${D.miss===k?esc(D.heard?'« '+D.heard+' »':''):''}<small>Réplique pour ${esc(D.p[1-k].n)}</small></div>`;
  else if(!D.vocal)z=`<div class="fast">${D.tried[1-k]?'<div class="rep">RÉPLIQUE !</div>':''}${D.ch.map((c,i)=>`<button class="fbtn" data-dfast="${k}" data-i="${i}" ${D.bad.includes(i)?'disabled':''}><b>${'ABCD'[i]}</b><span>${esc(c)}</span></button>`).join('')}</div>`;
  else z=`<button class="buzz" data-buzz="${k}">${D.tried[1-k]?'RÉPLIQUE !':'BUZZ'}</button>`;
  return `<div class="half p${k} ${k===1?'flip':''}"><div class="hd"><span>${esc(me.n)}</span><b>${me.s}</b></div>
  <div class="dq">${q.clues?`<em>${q.pts[D.ci]} pts · indice ${D.ci+1}/${q.clues.length}</em> `:''}${esc(dText(q))}</div>${z}</div>`;
}
function dRender(){
  if(!D)return;
  app.innerHTML=`<div class="duel">${dHalf(1)}<div class="mid"><button class="x" data-act="dquit" aria-label="Quitter">✕</button><span>Question ${D.i+1}/${D.deck.length}</span><div class="bar"><i id="dbar" style="width:100%"></i></div><button class="x" data-act="dsay" aria-label="Relire">↻</button></div>${dHalf(0)}</div>`;
}
function dEnd(){
  dClear();const [a,b]=D.p,w=a.s===b.s?null:(a.s>b.s?a:b);
  say(w?'Victoire de '+w.n+' !':'Égalité !');
  app.innerHTML=`<div class="card end"><img src="icon-192.webp" alt=""><div class="big">${w?esc(w.n):'Égalité'}</div><p class="count">${w?'remporte le duel':'Match nul, revanche ?'}</p>
  <div class="stats"><div><b>${a.s}</b>${esc(a.n)}</div><div><b>${b.s}</b>${esc(b.n)}</div></div>
  <div class="row" style="justify-content:center"><button class="btn pri" data-go="duel">Revanche</button><button class="btn" data-act="dhome">Accueil</button></div></div>`;
}
function dFast(k,i){
  if(!D||D.phase!=='read'||D.tried[k]||D.bad.includes(i))return;
  speechSynthesis.cancel();navigator.vibrate&&navigator.vibrate(60);
  Object.assign(D,{phase:'ans',who:k,heard:''});D.tried[k]=true;
  const v=D.ch[i];if(v!==answerOf(D.deck[D.i]))D.bad.push(i);dJudge(k,[v]);
}
app.addEventListener('pointerdown',e=>{const f=e.target.closest('[data-dfast]');if(f&&!f.disabled){e.preventDefault();dFast(+f.dataset.dfast,+f.dataset.i);return}
  const b=e.target.closest('[data-buzz]');if(b){e.preventDefault();dBuzz(+b.dataset.buzz)}});
Object.assign(ACT,{
  dpick(b){if(Date.now()<(D?.lock||0))return;const k=+b.dataset.k;dJudge(k,[D.ch[+b.dataset.i]])},
  dchoix(b){if(b&&Date.now()<(D?.lock||0))return;try{rec&&rec.abort()}catch(e){}D.vocal=false;D.deadline=Date.now()+10000;D.total=10000;dRender()},
  dmic(b){if(Date.now()<(D?.lock||0))return;dListen(+b.dataset.k)},
  dquit(){dClear();speechSynthesis.cancel();D=null;home()},
  dhome(){D=null;home()},
  dsay(){if(D&&D.phase==='read')dRead()},
});

// ---------- en ligne (salle privée avec code) ----------
const CFG=window.GEH_CONFIG||{},QS=new URLSearchParams(location.search);
const myId=QS.get('pid')||store.get('geh-id',null)||(()=>{const id=Math.random().toString(36).slice(2,10);store.set('geh-id',id);return id})();
const myNom=()=>QS.get('pn')||P?.nom||'Joueur';
let NET=null,ROOM=null,PEERS={},O=null,INV=null,OUT=null,sbc=null;
const CODECH='ABCDEFGHJKMNPQRSTUVWXYZ23456789',newCode=()=>Array.from({length:5},()=>CODECH[Math.random()*CODECH.length|0]).join('');
function loadSB(){return window.supabase?Promise.resolve():new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';s.onload=res;s.onerror=()=>rej(new Error('net'));document.head.appendChild(s)})}
async function netJoin(code,onPeers,onMsg){
  const me=()=>({id:myId,nom:myNom(),ecole:P?.ecole||'',busy:!!O});
  if(CFG.supabaseUrl&&CFG.supabaseKey){
    await loadSB();sbc=sbc||window.supabase.createClient(CFG.supabaseUrl,CFG.supabaseKey,{auth:{persistSession:false}});
    const ch=sbc.channel('geh-'+code,{config:{presence:{key:myId},broadcast:{self:false}}});
    ch.on('presence',{event:'sync'},()=>{const out={};Object.values(ch.presenceState()).forEach(a=>a.forEach(m=>{if(m.id!==myId)out[m.id]=m}));onPeers(out)});
    ch.on('broadcast',{event:'m'},({payload})=>onMsg(payload));
    await new Promise((res,rej)=>{const to=setTimeout(()=>rej(new Error('timeout')),10000);ch.subscribe(st=>{if(st==='SUBSCRIBED'){clearTimeout(to);ch.track(me());res()}else if(st==='CHANNEL_ERROR'||st==='TIMED_OUT'){clearTimeout(to);rej(new Error(st))}})});
    return {send:m=>ch.send({type:'broadcast',event:'m',payload:{...m,from:myId}}),update:()=>ch.track(me()),leave:()=>sbc.removeChannel(ch)};
  }
  // mode test sans serveur : onglets du même appareil
  const bc=new BroadcastChannel('geh-'+code),seen={},peersOf=()=>Object.fromEntries(Object.entries(seen).map(([k,v])=>[k,v.p]));
  const hello=()=>bc.postMessage({t:'_hi',p:me(),from:myId});
  const iv=setInterval(()=>{hello();let c=false;for(const k in seen)if(Date.now()-seen[k].at>7000){delete seen[k];c=true}if(c)onPeers(peersOf())},2500);
  bc.onmessage=e=>{const m=e.data;if(m.from===myId)return;
    if(m.t==='_bye'){delete seen[m.from];onPeers(peersOf());return}
    if(m.t==='_hi'){const nw=!seen[m.from];seen[m.from]={p:m.p,at:Date.now()};if(nw)hello();onPeers(peersOf());return}
    onMsg(m)};
  hello();
  return {send:m=>bc.postMessage({...m,from:myId}),update:hello,leave:()=>{bc.postMessage({t:'_bye',from:myId});clearInterval(iv);bc.close()}};
}
function oStatus(t){const e=$('#ost');if(e)e.textContent=t}
function onlineScreen(){
  stopTimer();G=null;if(D){dClear();D=null}
  if(!P){profil();return}
  if(ROOM){roomRender(true);return}
  app.innerHTML=`<div class="onb"><img src="icon-192.webp" alt=""><h1>En ligne</h1><p>Joue contre tes amis avec un code de salle.</p>
  <button class="btn pri go" data-act="ocreate">Créer une salle</button>
  <div class="lbl" style="margin-top:20px">ou rejoindre une salle</div>
  <div class="row" style="margin-top:6px"><input class="in codein" id="ocode" maxlength="5" placeholder="CODE" autocapitalize="characters" value="${esc(S.room||'')}"><button class="btn gold" data-act="ojoin">Entrer</button></div>
  <div id="ost" class="note"></div>
  ${CFG.supabaseUrl?'':'<small>Mode test : le serveur en ligne n\'est pas encore branché. La salle fonctionne seulement entre onglets de cet appareil.</small>'}
  <small>Seuls ton prénom et ton école sont visibles par les joueurs de la salle. Rien n'est conservé.</small>
  <div class="row" style="justify-content:center"><button class="btn ghost" data-go="home">Retour</button></div></div>`;
}
async function enterRoom(code){
  code=code.toUpperCase().replace(/[^A-Z0-9]/g,'');if(code.length<4){oStatus('Le code doit avoir 5 caractères.');return}
  oStatus('Connexion…');
  try{NET=await netJoin(code,p=>{PEERS=p;if(O&&!O.over&&!PEERS[O.opp])oAbort((O.oppNom||'Ton adversaire')+' a quitté.');else roomRender(false)},onNet)}
  catch(e){oStatus('Connexion impossible. Vérifie internet et réessaie.');return}
  ROOM=code;S.room=code;save();roomRender(true);
}
function leaveRoom(){try{NET&&NET.leave()}catch(e){}NET=null;ROOM=null;PEERS={};INV=null;OUT=null}
function invHTML(){return INV?`<div class="ov"><div class="ovc"><img src="icon-192.webp" alt=""><h2>${esc(INV.nom)} te lance un défi !</h2><p>${INV.deck.length} questions · réponses A B C D</p><div class="row" style="justify-content:center"><button class="btn bad" data-act="odec">Refuser</button><button class="btn pri" data-act="oacc">Accepter</button></div></div></div>`:''}
function roomRender(force){
  if(!ROOM||(O&&!O.over))return;if(!force&&!$('.room'))return;
  const list=Object.values(PEERS).sort((a,b)=>a.nom.localeCompare(b.nom));
  app.innerHTML=`<div class="room"><div class="top"><button class="x" data-act="oleave" aria-label="Quitter la salle">✕</button><h2 style="font-size:20px">Salle</h2></div>
  <div class="codebox"><small>Code de la salle</small><div class="code">${ROOM}</div><button class="btn" data-act="oshare">Partager le code</button></div>
  <div class="lbl">En ligne maintenant (${list.length})</div>
  ${list.length?list.map(p=>`<div class="peer"><span class="dot ${p.busy?'busy':''}"></span><div class="pn"><b>${esc(p.nom)}</b><small>${esc(p.ecole||'')}${p.busy?(p.ecole?' · ':'')+'en partie':''}</small></div><button class="btn pri" data-act="oinvite" data-id="${esc(p.id)}" ${p.busy||OUT?'disabled':''}>Défier</button></div>`).join('')
   :`<p class="note">Personne d'autre pour l'instant. Donne le code <b style="color:var(--gold)">${ROOM}</b> à tes amis.</p>`}
  <div class="lbl">Partie</div><div class="opts"><div class="seg">${[5,10,15].map(l=>`<button data-act="olen" data-l="${l}" class="${(S.olen||10)===l?'on':''}">${l} questions</button>`).join('')}</div></div>
  <div id="ost" class="note">${OUT?'Défi envoyé à '+esc(OUT.nom)+'…':''}</div></div>`+invHTML();
}
function onNet(m){
  if(m.to&&m.to!==myId)return;
  if(m.t==='inv'){if(O&&!O.over||INV){NET.send({t:'dec',to:m.from,gid:m.gid,busy:1});return}
    INV=m;beep(990,.1);navigator.vibrate&&navigator.vibrate([80,60,80]);say(m.nom+' te lance un défi !');
    if(O&&O.over){O=null}roomRender(true);setTimeout(()=>{if(INV&&INV.gid===m.gid){INV=null;roomRender(false)}},25000);return}
  if(m.t==='dec'){if(OUT&&OUT.gid===m.gid){const n=OUT.nom;OUT=null;roomRender(false);oStatus(n+(m.busy?' est occupé(e).':' a refusé le défi.'))}return}
  if(m.t==='acc'){if(OUT&&OUT.gid===m.gid){const o=OUT;OUT=null;oStart(true,o.to,o.nom,o.gid,o.deck)}return}
  if(!O||m.gid!==O.gid)return;
  if(m.t==='q')oShowQ(m.i);
  else if(m.t==='ans'&&O.host)hostAns(m.from,m.i,m.v,m.rt);
  else if(m.t==='miss'){oMiss(m.who,m.v)}
  else if(m.t==='res')oRes(m);
  else if(m.t==='end')oEnd(m.sc);
  else if(m.t==='quit')oAbort(O.oppNom+' a quitté la partie.');
}
function packQ(q){const ch=choicesFor(q);return{c:q.c,q:q.clues?q.clues.join(' '):q.q,a:answerOf(q),ch,p:10}}
function oStart(host,opp,oppNom,gid,deck){
  INV=null;O={host,opp,oppNom,gid,deck,i:-1,sc:{[myId]:0,[opp]:0},over:false};NET.update();
  say('Défi contre '+oppNom+' !');
  if(host)setTimeout(oNextQ,1600);else oRender();
}
function oNextQ(){if(!O||O.over)return;const i=O.i+1;if(i>=O.deck.length){NET.send({t:'end',to:O.opp,gid:O.gid,sc:O.sc});oEnd(O.sc);return}
  NET.send({t:'q',to:O.opp,gid:O.gid,i});oShowQ(i)}
function oShowQ(i){
  clearTimeout(O.tm);clearTimeout(O.grace);
  Object.assign(O,{i,phase:'read',mine:null,locked:{},bad:[],pend:[],res:null,shown:performance.now()});
  oRender();say(O.deck[i].q);
  if(O.host)O.tm=setTimeout(()=>{if(O&&O.phase==='read'&&O.i===i)hostResolve(null,null)},25000);
}
function oTap(idx){
  if(!O||O.phase!=='read'||O.locked[myId]||O.mine!=null||O.bad.includes(idx))return;
  const rt=performance.now()-O.shown;O.mine=idx;navigator.vibrate&&navigator.vibrate(50);speechSynthesis.cancel();oRender();
  if(O.host)hostAns(myId,O.i,idx,rt);else NET.send({t:'ans',to:O.opp,gid:O.gid,i:O.i,v:idx,rt});
}
function hostAns(who,i,v,rt){
  if(!O||O.phase!=='read'||i!==O.i||O.locked[who])return;
  O.pend.push({who,v,rt});if(!O.grace)O.grace=setTimeout(hostJudge,350); // petite fenêtre : le plus rapide gagne, peu importe le réseau
}
function hostJudge(){
  O.grace=null;O.pend.sort((a,b)=>a.rt-b.rt);
  while(O.pend.length&&O.phase==='read'){const {who,v}=O.pend.shift();if(O.locked[who])continue;
    const q=O.deck[O.i];
    if(q.ch[v]===q.a){hostResolve(who,v);return}
    O.locked[who]=true;O.bad.push(v);NET.send({t:'miss',to:O.opp,gid:O.gid,who,v});oMiss(who,v,true);
    if(O.locked[myId]&&O.locked[O.opp]){hostResolve(null,null);return}}
}
function hostResolve(win,v){
  if(win)O.sc[win]+=O.deck[O.i].p;
  const m={t:'res',to:O.opp,gid:O.gid,i:O.i,win,v,sc:O.sc};NET.send(m);oRes(m);setTimeout(oNextQ,3000);
}
function oMiss(who,v,local){
  if(!O)return;O.locked[who]=true;if(!O.bad.includes(v))O.bad.push(v);
  if(who===myId){beep(200,.3);O.mine=null}else{say(O.oppNom+' s\'est trompé. À toi !')}
  oRender();
}
function oRes(m){
  if(!O)return;clearTimeout(O.tm);O.phase='show';O.sc=m.sc;O.res=m;oRender();
  const a=O.deck[O.i].a;
  if(m.win===myId){beep(1320,.12);say('Bravo ! '+a)}else if(m.win){say(O.oppNom+' a le point. '+a)}else say('La réponse était : '+a);
}
function oRender(){
  if(!O)return;const q=O.deck[O.i],me=O.sc[myId],op=O.sc[O.opp];
  let z='';
  if(!q)z='<div class="state">Préparation…</div>';
  else if(O.phase==='show'){const r=O.res;z=`<div class="state ${r.win===myId?'win':r.win?'lose':''}"><small>${r.win===myId?'+'+q.p+' points !':r.win?esc(O.oppNom)+' a eu le point':'Personne n\'a trouvé'}</small><div class="big2">${esc(q.a)}</div></div>`}
  else if(O.locked[myId])z=`<div class="state lose">Raté !<small>Réplique pour ${esc(O.oppNom)}</small></div>`;
  else if(O.mine!=null)z=`<div class="state">Réponse envoyée…<small>${esc(q.ch[O.mine])}</small></div>`;
  else z=`<div class="fast">${O.locked[O.opp]?'<div class="rep">RÉPLIQUE !</div>':''}${q.ch.map((c,i)=>`<button class="fbtn" data-ofast="${i}" ${O.bad.includes(i)?'disabled':''}><b>${'ABCD'[i]}</b><span>${esc(c)}</span></button>`).join('')}</div>`;
  app.innerHTML=`<div class="oplay p0"><div class="top"><button class="x" data-act="oquit" aria-label="Quitter">✕</button><div class="bar"><i style="width:${Math.max(0,O.i)/O.deck.length*100}%"></i></div><span class="n">${Math.max(1,O.i+1)} / ${O.deck.length}</span></div>
  <div class="vs"><div><small>${esc(myNom())}</small><b>${me}</b></div><span>VS</span><div><small>${esc(O.oppNom)}</small><b>${op}</b></div></div>
  ${q?`<div class="card ocard"><span class="tag">${esc(q.c)}</span><div class="q">${esc(q.q)}</div>${z}</div>`:z}</div>`;
}
function oEnd(sc){
  if(!O)return;clearTimeout(O.tm);O.over=true;O.sc=sc;NET.update();
  const me=sc[myId],op=sc[O.opp],res=me>op?'Victoire !':me<op?'Défaite':'Égalité';
  say(me>op?'Victoire !':me<op?O.oppNom+' gagne.':'Égalité !');
  app.innerHTML=`<div class="card end"><img src="icon-192.webp" alt=""><div class="big">${res}</div>
  <div class="stats"><div><b>${me}</b>${esc(myNom())}</div><div><b>${op}</b>${esc(O.oppNom)}</div></div>
  <div class="row" style="justify-content:center"><button class="btn pri" data-act="orematch">Revanche</button><button class="btn" data-act="oroom">Retour à la salle</button></div></div>`+invHTML();
}
function oAbort(msg){if(!O)return;clearTimeout(O.tm);clearTimeout(O.grace);O=null;if(NET)NET.update();roomRender(true);oStatus(msg)}
function oInvite(id){
  const p=PEERS[id];if(!p||OUT)return;
  const base=pool().filter(q=>!q.spell);const deck=shuffle(base.length?base:SHEET.filter(q=>!q.spell)).slice(0,S.olen||10).map(packQ);
  OUT={to:id,nom:p.nom,gid:myId+Date.now(),deck};NET.send({t:'inv',to:id,gid:OUT.gid,nom:myNom(),deck});
  if(O&&O.over)O=null;roomRender(true);const g=OUT.gid;
  setTimeout(()=>{if(OUT&&OUT.gid===g){OUT=null;roomRender(false);oStatus(p.nom+' n\'a pas répondu.')}},25000);
}
app.addEventListener('pointerdown',e=>{const f=e.target.closest('[data-ofast]');if(f&&!f.disabled){e.preventDefault();oTap(+f.dataset.ofast)}});
Object.assign(ACT,{
  ocreate(){enterRoom(newCode())},
  ojoin(){enterRoom($('#ocode').value)},
  oleave(){leaveRoom();onlineScreen()},
  oshare(){const t=`Viens jouer à Génie en herbe avec moi ! Code de salle : ${ROOM}\n${location.origin}`;
    if(navigator.share)navigator.share({text:t}).catch(()=>{});else navigator.clipboard?.writeText(t).then(()=>oStatus('Code copié !'),()=>{})},
  olen(b){S.olen=+b.dataset.l;save();roomRender(true)},
  oinvite(b){oInvite(b.dataset.id)},
  oacc(){const v=INV;if(!v)return;NET.send({t:'acc',to:v.from,gid:v.gid});oStart(false,v.from,v.nom,v.gid,v.deck)},
  odec(){if(INV)NET.send({t:'dec',to:INV.from,gid:INV.gid});INV=null;O&&O.over?oEnd(O.sc):roomRender(true)},
  oquit(){if(O)NET.send({t:'quit',to:O.opp,gid:O.gid});O=null;NET.update();roomRender(true)},
  orematch(){const id=O.opp;O=null;NET.update();if(PEERS[id])oInvite(id);else{roomRender(true);oStatus('Ton adversaire n\'est plus dans la salle.')}},
  oroom(){O=null;NET.update();roomRender(true)},
});

boot();
})();
