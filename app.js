(()=>{
const $=s=>document.querySelector(s), app=$('#app');
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const norm=s=>String(s||'').toLowerCase().replace(/œ/g,'oe').replace(/æ/g,'ae').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const ARTS=/^(le|la|les|l|un|une|des|du|de|d|the|a)\s+/;
const autoKeys=a=>{let n=norm(a);while(ARTS.test(n))n=n.replace(ARTS,'');return [n||norm(a)]};
const NAV=20,avSrc=n=>`avatars/a${n}.webp`,avImg=(n,c='av')=>n?`<img class="${c}" src="${avSrc(n)}" alt="">`:'';
const pct=(a,b)=>b?Math.round(a/b*100):0;
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
  stopTimer();G=null;setTimeout(pillUpd,0);
  const cats=catsOf(S.src),off=S.cats[S.src]||[],n=pool().length,best=store.get('geh-best',{})[S.src];
  const tab=(k,t,c)=>`<button data-src="${k}" class="${S.src===k?'on':''}">${t}<small>${c} questions</small></button>`;
  app.innerHTML=`
  <div class="hero"><img src="icon-192.webp" alt="Logo Génie en herbe"><div><h1>Génie en herbe</h1><p>${P?['Salut '+esc(P.nom),esc(P.ecole)].filter(Boolean).join(' · '):'Révise, teste-toi, deviens imbattable.'}</p></div>${P?`<button class="me ${P.av?'hasav':''}" data-act="profil" aria-label="Mon profil">${P.av?avImg(P.av,'meav'):esc(P.nom.trim()[0]||'?').toUpperCase()}</button>`:''}</div>
  <button class="pill" id="pill" data-go="online" style="display:none"></button>
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
  <div class="row">${installEvt?'<button class="btn ghost" data-install>Installer l\'app</button>':''}</div>`;
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
  app.innerHTML=`<div class="card end"><img src="icon-192.webp" alt=""><div class="big">${pct(ok,t)} %</div><p class="count">réussies du premier coup (${ok} sur ${t})</p>
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
  app.innerHTML=topBar(G.i,G.deck.length,`<span class="score">${pct(G.score,G.res.reduce((t,r)=>t+ptsOf(r.q,0),0))} %</span>`)+`<div class="card">${qBlock(q,G.ci,G.done)}
  ${G.done&&r.mc?chBlock(q,r.val,true):''}
  ${G.done?`<div class="ans ${r.ok?'ok':'ko'}"><small>${r.ok?'Bonne réponse !':(r.val?'Pas tout à fait':'Temps écoulé ou passé')}</small><div>${esc(answerOf(q))}</div>${r.val&&!r.ok?`<div class="v">Ta réponse : ${esc(r.val)}</div>`:''}</div>
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
  <div class="stats"><div><b>${pct(ok,G.res.length)} %</b>de bonnes réponses</div><div><b>${ok}/${G.res.length}</b>bonnes réponses</div></div>
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
  app.innerHTML=`<div class="top"><button class="x" data-go="home" aria-label="Retour">✕</button><h2 style="font-size:22px">Mes questions perso</h2></div>
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
  app.innerHTML=`<div class="onb"><img src="icon-192.webp" alt=""><h1>${P?'Mon profil':'Bienvenue !'}</h1><p>${P?'Modifie tes infos.':pendingRoom?'Présente-toi, puis tu entres dans la salle '+esc(pendingRoom)+'.':'Présente-toi avant de commencer.'}</p>
  <form id="pf" autocomplete="off">
    <label>Ton avatar</label><div class="avgrid" id="avg">${Array.from({length:NAV},(_,i)=>`<button type="button" class="avb ${(P?.av||0)===i+1?'on':''}" data-av="${i+1}">${avImg(i+1)}</button>`).join('')}</div>
    <label>Prénom<input class="in" id="pn" maxlength="30" required value="${esc(P?.nom||'')}" placeholder="Ton prénom"></label>
    <label>Âge<input class="in" id="pa" type="number" inputmode="numeric" min="8" max="20" value="${esc(P?.age||'')}" placeholder="12"></label>
    <label>École<input class="in" id="pe" maxlength="60" value="${esc(P?.ecole||'')}" placeholder="Nom de ton école"></label>
    <button class="btn pri go" id="pgo" type="submit">${P?'Enregistrer':'Go'}</button>
  </form><small>Ces infos restent seulement sur ton appareil. <a href="confidentialite.html" style="color:var(--cyan)">Confidentialité</a></small>
  ${P?`<div class="lbl" style="margin-top:22px;text-align:left">Mes questions perso</div>
  <button class="btn" style="width:100%" data-go="import">Mes questions perso (sur ce téléphone)${mine().length?' · '+mine().length:''}</button>
  <small>Photographie une feuille ou tes notes de classe pour réviser dessus. Elles restent seulement sur ce téléphone.</small>
  <div class="row" style="justify-content:center"><button class="btn ghost" data-go="home">Retour</button></div>`:''}</div>`;
  $('#avg').addEventListener('click',e=>{const b=e.target.closest('.avb');if(!b)return;$('#avg .avb.on')?.classList.remove('on');b.classList.add('on')});
  const f=$('#pf'),pn=$('#pn'),chk=()=>$('#pgo').disabled=!pn.value.trim();chk();pn.addEventListener('input',chk);
  if(!P)setTimeout(()=>pn.focus(),300);
  f.addEventListener('submit',e=>{e.preventDefault();if(!pn.value.trim())return;
    const age=parseInt($('#pa').value)||null,first=!P;
    P={nom:pn.value.trim(),age,ecole:$('#pe').value.trim(),av:+($('#avg .avb.on')?.dataset.av||0)||P?.av||0};store.set('geh-profil',P);
    if(first&&age){const lv=Math.min(5,Math.max(1,age-11));S.lv=Array.from({length:lv},(_,i)=>i+1);save()}
    afterProfile()});
}
ACT.profil=profil;
const IQS=new URLSearchParams(location.search),INVITE=((location.pathname.match(/^\/s\/([A-Za-z0-9]{4,6})/)||[])[1]||IQS.get('salle')||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
if(INVITE){try{IQS.delete('salle');history.replaceState(null,'','/'+(IQS.toString()?'?'+IQS:''))}catch(e){}}
let pendingRoom=INVITE.length>=4?INVITE:'';
function avPopup(){
  if(!P||P.av||S.avAsk)return;
  const box=document.createElement('div');box.className='ov';box.id='avpop';
  box.innerHTML=`<div class="ovc"><h2>Nouveau : ton avatar !</h2><p>Choisis le personnage qui te représente. Tes amis le verront en ligne.</p>
  <div class="avgrid">${Array.from({length:NAV},(_,i)=>`<button type="button" class="avb" data-avp="${i+1}">${avImg(i+1)}</button>`).join('')}</div>
  <div class="row" style="justify-content:center"><button class="btn ghost" data-avlater>Plus tard</button></div></div>`;
  box.addEventListener('click',e=>{const b=e.target.closest('[data-avp]');
    if(b){P.av=+b.dataset.avp;store.set('geh-profil',P);box.remove();if(NET)NET.update();if($('.hero'))home();return}
    if(e.target.closest('[data-avlater]')){S.avAsk=true;save();box.remove()}});
  document.body.appendChild(box);
}
function afterProfile(){if(pendingRoom){const c=pendingRoom;pendingRoom='';app.innerHTML='<div class="onb" style="padding-top:30vh"><div id="ost" class="note">Connexion à la salle '+esc(c)+'…</div></div>';enterRoom(c)}else home()}
function boot(){
  app.innerHTML=`<div class="splash"><img src="icon-192.webp" alt=""><h1>Génie en herbe</h1></div>`;
  setTimeout(()=>{const sp=$('.splash');if(sp)sp.classList.add('out');setTimeout(()=>{P?afterProfile():profil();setTimeout(avPopup,600)},350)},1900);
  if(P&&!pendingRoom&&S.room&&S.stay&&(window.GEH_CONFIG||{}).supabaseUrl)setTimeout(()=>enterRoom(S.room,true),2400);
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
    <label>Avatar du joueur 2</label><div class="avgrid" id="dav">${Array.from({length:NAV},(_,i)=>`<button type="button" class="avb ${(S.dav2||0)===i+1?'on':''}" data-dav="${i+1}">${avImg(i+1)}</button>`).join('')}</div>
    <label>Nombre de questions</label><div class="seg" style="margin-top:6px">${[10,15,20].map(l=>`<button type="button" data-dl="${l}" class="${dl===l?'on':''}">${l}</button>`).join('')}</div>
    <label>Réponse</label><div class="seg" style="margin-top:6px"><button type="button" data-dv="1" class="${voc?'on':''}" ${SR?'':'disabled'}>Au micro</button><button type="button" data-dv="0" class="${voc?'':'on'}">Choix A B C D</button></div>
    ${SR?'':'<small>Ce navigateur ne permet pas la reconnaissance vocale : réponses par choix.</small>'}
    <button class="btn pri go" type="submit">Lancer le duel</button>
  </form><small>${n} questions disponibles avec tes filtres actuels.</small><div class="row" style="justify-content:center"><button class="btn ghost" data-go="home">Retour</button></div></div>`;
  $('#df').addEventListener('click',e=>{const b=e.target.closest('button[type=button]');if(!b)return;
    if(b.dataset.dav){S.dav2=+b.dataset.dav;S.dn1=$('#d1').value;S.dn2=$('#d2').value;save();$('#dav .avb.on')?.classList.remove('on');b.classList.add('on');return}
    if(b.dataset.dl){S.dlen=+b.dataset.dl}else if(b.dataset.dv){S.dvoc=b.dataset.dv==='1'}S.dn1=$('#d1').value;S.dn2=$('#d2').value;save();duelSetup()});
  $('#df').addEventListener('submit',async e=>{e.preventDefault();S.dn1=$('#d1').value.trim()||'Joueur 1';S.dn2=$('#d2').value.trim()||'Joueur 2';save();
    const deck=shuffle(dPool()).slice(0,S.dlen||10);if(!deck.length)return;
    let vocal=!!(SR&&S.dvoc!==false);
    if(vocal){const go=$('#df .go');go.disabled=true;go.textContent='Autorisation du micro…';
      if(!(await micOK())){S.dvoc=false;save();go.disabled=false;go.textContent='Lancer le duel';
        const m=document.createElement('small');m.style.color='var(--bad)';m.textContent='Micro refusé ou indisponible : le duel se jouera avec les choix A B C D. Appuie de nouveau sur Lancer, ou autorise le micro dans les réglages de Chrome (icône à gauche de l\'adresse).';
        $('#df').appendChild(m);$('#df [data-dv="1"]').classList.remove('on');$('#df [data-dv="0"]').classList.add('on');return}}
    D={p:[{n:S.dn1,s:0,av:P?.av||0},{n:S.dn2,s:0,av:S.dav2||0}],deck,i:0,vocal};
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
function dNext(){if(!D)return;dClear();D.done=(D.done||0)+ptsOf(D.deck[D.i],0);D.i++;D.i>=D.deck.length?dEnd():dStart()}
function dHalf(k){
  const q=D.deck[D.i],me=D.p[k],ans=answerOf(q);let z;
  if(D.phase==='ans'&&D.who===k){
    z=D.vocal?`<div class="state talk"><div class="mic"></div><div id="mst${k}">Parle maintenant !</div><div class="heard" id="heard${k}">${D.heard?'« '+esc(D.heard)+' »':''}</div><div class="row" style="margin-top:4px;justify-content:center"><button class="btn ghost" data-act="dmic" data-k="${k}">Relancer le micro</button><button class="btn ghost" data-act="dchoix">Choix A B C D</button></div></div>`
      :`<div class="choices">${D.ch.map((c,i)=>`<button class="choice" data-act="dpick" data-k="${k}" data-i="${i}"><b>${'ABCD'[i]}</b><span>${esc(c)}</span></button>`).join('')}</div>`;
  }else if(D.phase==='ans')z=`<div class="state">${esc(D.p[D.who].n)} répond…</div>`;
  else if(D.phase==='show')z=`<div class="state ${D.ok===k?'win':D.ok===null?'':'lose'}">${D.ok!=null?avImg(D.p[D.ok].av,'wav'):''}<small>${D.ok===k?'Bonne réponse !':D.ok===null?'Personne':esc(D.p[D.ok].n)+' a eu le point'}</small><div class="big2">${esc(ans)}</div>${D.heard&&D.ok!==k&&D.who===k?`<small>Tu as dit « ${esc(D.heard)} »</small>`:''}</div>`;
  else if(D.tried[k])z=`<div class="state lose">Raté ! ${D.miss===k?esc(D.heard?'« '+D.heard+' »':''):''}<small>Réplique pour ${esc(D.p[1-k].n)}</small></div>`;
  else if(!D.vocal)z=`<div class="fast">${D.tried[1-k]?'<div class="rep">RÉPLIQUE !</div>':''}${D.ch.map((c,i)=>`<button class="fbtn" data-dfast="${k}" data-i="${i}" ${D.bad.includes(i)?'disabled':''}><b>${'ABCD'[i]}</b><span>${esc(c)}</span></button>`).join('')}</div>`;
  else z=`<button class="buzz" data-buzz="${k}">${D.tried[1-k]?'RÉPLIQUE !':'BUZZ'}</button>`;
  return `<div class="half p${k} ${k===1?'flip':''}"><div class="hd"><span class="hdn">${avImg(me.av,'hav')}${esc(me.n)}</span><b>${pct(me.s,D.done||0)} %</b></div>
  <div class="dq">${q.clues?`<em>${q.pts[D.ci]} pts · indice ${D.ci+1}/${q.clues.length}</em> `:''}${esc(dText(q))}</div>${z}</div>`;
}
function dRender(){
  if(!D)return;
  app.innerHTML=`<div class="duel">${dHalf(1)}<div class="mid"><button class="x" data-act="dquit" aria-label="Quitter">✕</button><span>Question ${D.i+1}/${D.deck.length}</span><div class="bar"><i id="dbar" style="width:100%"></i></div><button class="x" data-act="dsay" aria-label="Relire">↻</button></div>${dHalf(0)}</div>`;
}
function dEnd(){
  dClear();const [a,b]=D.p;const w=a.s===b.s?null:(a.s>b.s?a:b);
  say(w?'Victoire de '+w.n+' !':'Égalité !');
  app.innerHTML=`<div class="card end"><img src="icon-192.webp" alt="">${w&&w.av?avImg(w.av,'ovav'):''}<div class="big">${w?esc(w.n):'Égalité'}</div><p class="count">${w?'remporte le duel':'Match nul, revanche ?'}</p>
  <div class="stats"><div><b>${pct(a.s,D.done)} %</b>${esc(a.n)}</div><div><b>${pct(b.s,D.done)} %</b>${esc(b.n)}</div></div>
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
let NET=null,ROOM=null,PEERS={},O=null,INV=null,sbc=null;
const CODECH='ABCDEFGHJKMNPQRSTUVWXYZ23456789',newCode=()=>Array.from({length:5},()=>CODECH[Math.random()*CODECH.length|0]).join('');
function loadSB(){return window.supabase?Promise.resolve():new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';s.onload=res;s.onerror=()=>rej(new Error('librairie Supabase non chargée'));document.head.appendChild(s)})}
async function netJoin(code,onPeers,onMsg,onDrop){
  const me=()=>({id:myId,nom:myNom(),ecole:P?.ecole||'',av:P?.av||0,busy:!!O});
  if(CFG.supabaseUrl&&CFG.supabaseKey){
    await loadSB();sbc=sbc||window.supabase.createClient(new URL(CFG.supabaseUrl).origin,CFG.supabaseKey,{auth:{persistSession:false}});
    const ch=sbc.channel('geh-'+code,{config:{presence:{key:myId},broadcast:{self:false}}});
    ch.on('presence',{event:'sync'},()=>{const out={};Object.values(ch.presenceState()).forEach(a=>a.forEach(m=>{if(m.id!==myId)out[m.id]=m}));onPeers(out)});
    ch.on('broadcast',{event:'m'},({payload})=>onMsg(payload));
    let state='JOINING',ok=false,left=false;
    await new Promise((res,rej)=>{const to=setTimeout(()=>rej(new Error('délai dépassé')),12000);ch.subscribe((st,err)=>{state=st;
      if(st==='SUBSCRIBED'){clearTimeout(to);ch.track(me());if(!ok){ok=true;res()}}
      else if(st==='CHANNEL_ERROR'||st==='TIMED_OUT'||st==='CLOSED'){clearTimeout(to);
        if(!ok){try{sbc.removeChannel(ch)}catch(e){}rej(new Error(st+(err?.message?' : '+err.message:'')))}
        else if(!left&&onDrop)onDrop()}})});   // connexion perdue après coup -> reconnexion
    return {send:m=>ch.send({type:'broadcast',event:'m',payload:{...m,from:myId}}),update:()=>ch.track(me()),state:()=>state,
      leave:()=>{left=true;sbc.removeChannel(ch)}};
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
  return {send:m=>bc.postMessage({...m,from:myId}),update:hello,state:()=>'SUBSCRIBED',leave:()=>{bc.postMessage({t:'_bye',from:myId});clearInterval(iv);bc.close()}};
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
let joinedAt=0,toasts=[];
async function enterRoom(code,silent){
  code=code.toUpperCase().replace(/[^A-Z0-9]/g,'');if(code.length<4){oStatus('Le code doit avoir 5 caractères.');return}
  if(NET)leaveRoom();
  oStatus('Connexion…');
  try{NET=await netJoin(code,onPeers,onNet,onDrop)}
  catch(e){if(!silent)oStatus('Connexion impossible ('+(e?.message||e)+'). Vérifie internet et réessaie.');return}
  ROOM=code;S.room=code;S.stay=true;save();joinedAt=Date.now();
  silent?pillUpd():roomRender(true);
}
// ---------- reconnexion automatique (Android coupe la connexion en arrière-plan) ----------
let rejoining=false,conn='ok';
function setConn(c){conn=c;pillUpd();const e=$('#conn');if(e){e.className='conn '+c;e.textContent=c==='ok'?'Connecté':'Reconnexion…'}}
function onDrop(){setConn('re');setTimeout(rejoin,1500)}
async function rejoin(){
  if(!ROOM||rejoining)return;rejoining=true;setConn('re');
  try{try{NET&&NET.leave()}catch(e){}NET=await netJoin(ROOM,onPeers,onNet,onDrop);joinedAt=Date.now();setConn('ok')}
  catch(e){setTimeout(()=>{rejoining=false;rejoin()},4000);return}
  rejoining=false;
}
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState!=='visible'||!ROOM||!NET)return;
  if(NET.state&&NET.state()!=='SUBSCRIBED')rejoin();else{try{NET.update()}catch(e){rejoin()}}
});
setInterval(()=>{if(ROOM&&NET&&document.visibilityState==='visible'){if(NET.state&&NET.state()!=='SUBSCRIBED')rejoin();else try{NET.update()}catch(e){}}},20000);
function onPeers(p){
  const old=PEERS;PEERS=p;
  if(O&&!O.over){
    // tolérance : un joueur peut disparaître quelques secondes le temps de se reconnecter
    const g=O.gid;
    if(!O.isHost&&!PEERS[O.host])setTimeout(()=>{if(O&&O.gid===g&&!O.over&&!PEERS[O.host])oAbort((O.names[O.host]||'L\'hôte')+' a quitté : partie terminée.')},10000);
    if(O.isHost)setTimeout(()=>{if(!O||O.gid!==g||O.over)return;let c=false;for(const id of Object.keys(O.sc))if(id!==myId&&!PEERS[id]){delete O.sc[id];c=true}
      if(c){gList();if(O.phase==='read')hostAllLocked();oRender()}},10000);
  }
  if(Date.now()-joinedAt>2500&&!(O&&!O.over))Object.values(p).filter(x=>!old[x.id]).forEach(friendToast);
  roomRender(false);pillUpd();
}
// ---------- couche d'alertes (par-dessus n'importe quel écran) ----------
const layer=document.createElement('div');layer.id='layer';document.body.appendChild(layer);
layer.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.act;
  if(a==='tclose'){toasts=toasts.filter(t=>t.k!==b.dataset.k);drawLayer()}
  else if(a&&ACT[a]){if(a==='oinvite'){toasts=toasts.filter(t=>t.id!==b.dataset.id)}ACT[a](b);drawLayer()}});
function drawLayer(){
  layer.innerHTML=`<div class="toasts">${toasts.map(t=>`<div class="toast"><span class="dot"></span><div class="tt">${t.html}</div>${t.id&&PEERS[t.id]&&!PEERS[t.id].busy&&!(O&&!O.over)?`<button class="btn pri" data-act="oinvite" data-id="${esc(t.id)}">Démarrer</button>`:''}<button class="tx" data-act="tclose" data-k="${t.k}" aria-label="Fermer">✕</button></div>`).join('')}</div>`+invHTML();
}
function toast(html,id,ms=12000){const k=Math.random().toString(36).slice(2);toasts.push({k,html,id});toasts=toasts.slice(-3);drawLayer();setTimeout(()=>{toasts=toasts.filter(t=>t.k!==k);drawLayer()},ms)}
function friendToast(p){
  beep(880,.09);setTimeout(()=>beep(1175,.12),110);navigator.vibrate&&navigator.vibrate([70,50,70]);
  toast(`${p.av?avImg(p.av,'tav'):''}<b>${esc(p.nom)}</b> est en ligne !<small>Salle ${esc(ROOM)}</small>`,p.id);
}
function pillUpd(){const e=$('#pill');if(!e)return;if(!ROOM){e.style.display='none';return}const n=Object.keys(PEERS).length;e.style.display='';e.innerHTML=`<span class="dot ${conn!=='ok'?'busy':n?'':'off'}"></span>Salle ${esc(ROOM)} · ${conn!=='ok'?'reconnexion…':n?n+' en ligne':'personne pour l\'instant'}`}
function leaveRoom(){if(O&&!O.over)ACT.oquit(true);try{NET&&NET.leave()}catch(e){}NET=null;ROOM=null;PEERS={};INV=null;O=null;toasts=[];drawLayer()}
function invHTML(){return INV?`<div class="ov"><div class="ovc">${INV.av?avImg(INV.av,'ovav'):'<img src="icon-192.webp" alt="">'}<h2>${esc(INV.nom)} ${INV.duel?'te défie':'lance une partie'} !</h2><p>${INV.deck.length} questions${INV.duel?'':' · pour toute la salle'}</p><div class="row" style="justify-content:center"><button class="btn bad" data-act="odec">Non merci</button><button class="btn pri" data-act="oacc">Jouer !</button></div></div></div>`:''}
function roomRender(force){
  if(!ROOM||(O&&!O.over))return;if(!force&&!$('.room'))return;
  const list=Object.values(PEERS).sort((a,b)=>a.nom.localeCompare(b.nom)),mic=S.omode==='micro';
  app.innerHTML=`<div class="room"><div class="top"><button class="x" data-go="home" aria-label="Retour au jeu">←</button><h2 style="font-size:20px;flex:1">Salle <span id="conn" class="conn ${conn}">${conn==='ok'?'Connecté':'Reconnexion…'}</span></h2><button class="btn bad" style="padding:8px 12px;font-size:13px" data-act="oleave">Quitter la salle</button></div>
  <p class="note" style="margin:0 0 10px">Tu peux retourner jouer : tu restes connecté et une alerte s'affiche quand un ami arrive ou lance une partie.</p>
  <div class="codebox"><small>Code de la salle</small><div class="code">${ROOM}</div><button class="btn pri" data-act="oshare">Inviter des amis (lien)</button><small style="display:block;margin-top:8px;text-transform:none;letter-spacing:0">Tes amis touchent le lien et arrivent directement ici. Ils peuvent aussi taper le code dans En ligne.</small></div>
  <button class="btn pri" style="width:100%;margin-top:14px;padding:16px;font-size:17px" data-act="ogroup" ${list.length?'':'disabled'}>Lancer une partie pour toute la salle</button>
  <div class="lbl" style="display:flex;align-items:center">En ligne maintenant (${list.length})<button class="btn ghost" style="margin-left:auto;padding:4px 10px;font-size:12px" data-act="orefresh">Actualiser</button></div>
  ${list.length?list.map(p=>`<div class="peer">${p.av?avImg(p.av,'pav'):''}<span class="dot ${p.busy?'busy':''}"></span><div class="pn"><b>${esc(p.nom)}</b><small>${esc(p.ecole||'')}${p.busy?(p.ecole?' · ':'')+'en partie':''}</small></div><button class="btn" data-act="oinvite" data-id="${esc(p.id)}" ${p.busy?'disabled':''}>Défier</button></div>`).join('')
   :`<p class="note">Personne d'autre pour l'instant. Donne le code <b style="color:var(--gold)">${ROOM}</b> à tes amis.</p>`}
  <div class="lbl">Partie</div><div class="opts"><div class="seg">${[5,10,15,20].map(l=>`<button data-act="olen" data-l="${l}" class="${(S.olen||10)===l?'on':''}">${l} q.</button>`).join('')}</div></div>
  <div class="lbl">Ma façon de répondre</div><div class="opts"><div class="seg"><button data-act="omode" data-m="choix" class="${mic?'':'on'}">Choix A B C D</button><button data-act="omode" data-m="micro" class="${mic?'on':''}" ${SR?'':'disabled'}>Au micro</button></div></div>
  <div id="ost" class="note"></div></div>`;
}
// ---------- partie de groupe : l'hôte arbitre, nombre de joueurs illimité ----------
const QDUR=22000;
function packQ(q){const ch=choicesFor(q);return{c:q.c,q:q.clues?q.clues.join(' '):q.q,a:answerOf(q),k:q.k||autoKeys(answerOf(q)),ch,p:10}}
function oClr(){if(!O)return;clearTimeout(O.tm);clearTimeout(O.grace);clearTimeout(O.ltm);clearInterval(O.bi);try{rec&&rec.abort()}catch(e){}rec=null}
function stopOther(){stopTimer();G=null;if(D){dClear();D=null}speechSynthesis.cancel();toasts=[];drawLayer()}
function onNet(m){
  if(m.to&&!(Array.isArray(m.to)?m.to.includes(myId):m.to===myId))return;
  if(m.t==='ginv'){if(O&&!O.over||INV)return;INV=m;beep(990,.1);navigator.vibrate&&navigator.vibrate([80,60,80]);
    say(m.nom+(m.duel?' te défie !':' lance une partie !'));drawLayer();setTimeout(()=>{if(INV&&INV.gid===m.gid){INV=null;drawLayer()}},30000);return}
  if(!O||m.gid!==O.gid)return;
  if(O.isHost&&m.t==='emo'){showEmo(m.from,m.e);return}
  if(O.isHost){
    if(m.t==='gjoin'&&O.phase==='lobby'){O.sc[m.from]=0;O.names[m.from]=m.nom;O.av[m.from]=m.av||0;gList();oRender();if(O.targets&&O.targets.every(id=>id in O.sc))gStart();return}
    if(m.t==='gno'&&O.targets&&O.phase==='lobby'){oAbort((PEERS[m.from]?.nom||'Ton ami')+' a refusé le défi.');return}
    if(m.t==='gquit'){delete O.sc[m.from];gList();if(O.phase==='lobby'&&O.targets)oAbort((O.names[m.from]||'Ton ami')+' a quitté.');else{if(O.phase==='read')hostAllLocked();oRender()}return}
    if(m.t==='ans')hostAns(m.from,m.i,m);
    return}
  if(m.t==='emo'){showEmo(m.from,m.e);return}
  if(m.t==='glist'){O.sc=m.sc;O.names=m.names;O.av=m.av||{};oRender()}
  else if(m.t==='gstart'){O.sc=m.sc;O.names=m.names;O.av=m.av||{};O.phase='wait';stopOther();oRender();say('C\'est parti !')}
  else if(m.t==='q')oShowQ(m.i,m.dur);
  else if(m.t==='miss')oMiss(m.who);
  else if(m.t==='res')oRes(m);
  else if(m.t==='end')oEnd(m.sc);
  else if(m.t==='gcancel')oAbort('La partie a été annulée.');
}
function oLaunch(targets){
  if(O&&!O.over)return;
  const base=pool().filter(q=>!q.spell);
  const deck=shuffle(base.length?base:SHEET.filter(q=>!q.spell)).slice(0,S.olen||10).map(packQ),gid=myId+Date.now();
  toasts=[];drawLayer();
  O={gid,host:myId,isHost:true,deck,sc:{[myId]:0},names:{[myId]:myNom()},av:{[myId]:P?.av||0},phase:'lobby',over:false,i:-1,targets};
  NET.send({t:'ginv',to:targets||undefined,gid,nom:myNom(),av:P?.av||0,deck,duel:!!targets});NET.update();oRender();
  setTimeout(()=>{if(O&&O.gid===gid&&O.phase==='lobby'&&targets)oAbort((PEERS[targets[0]]?.nom||'Ton ami')+' n\'a pas répondu.')},30000);
}
function gList(){NET.send({t:'glist',gid:O.gid,sc:O.sc,names:O.names,av:O.av})}
function gStart(){if(!O||Object.keys(O.sc).length<2)return;O.phase='wait';NET.send({t:'gstart',gid:O.gid,sc:O.sc,names:O.names,av:O.av});say('C\'est parti !');oRender();setTimeout(oNextQ,1800)}
function oNextQ(){if(!O||O.over)return;const i=O.i+1;
  if(i>=O.deck.length){NET.send({t:'end',gid:O.gid,sc:O.sc});oEnd(O.sc);return}
  NET.send({t:'q',gid:O.gid,i,dur:QDUR});oShowQ(i,QDUR)}
function oShowQ(i,dur){
  oClr();Object.assign(O,{i,phase:'read',locked:{},marks:{},mine:null,listening:false,heard:'',res:null,pend:[],shown:performance.now(),end:Date.now()+dur,dur});
  oRender();say(O.deck[i].q);
  O.bi=setInterval(()=>{const b=$('#obar');if(b&&O)b.style.width=Math.max(0,(O.end-Date.now())/O.dur*100)+'%'},250);
  if(O.isHost)O.tm=setTimeout(()=>{if(O&&O.phase==='read'&&O.i===i)hostResolve(null)},dur+600);
}
function oSend(a){const i=O.i;a.rt=performance.now()-O.shown;O.isHost?hostAns(myId,i,a):NET.send({t:'ans',to:O.host,gid:O.gid,i,...a})}
function oTap(idx){if(!O||O.phase!=='read'||O.locked[myId]||O.mine!=null)return;O.mine=idx;navigator.vibrate&&navigator.vibrate(40);speechSynthesis.cancel();oRender();oSend({v:idx})}
function oBuzz(){if(!O||O.phase!=='read'||O.locked[myId]||O.mine!=null||O.listening)return;speechSynthesis.cancel();navigator.vibrate&&navigator.vibrate(50);O.listening=true;O.heard='';oRender();oListen()}
function oListen(){
  const q=O.deck[O.i];let done=false;
  const fin=ok=>{if(done)return;done=true;clearTimeout(O.ltm);try{rec&&rec.abort()}catch(e){}rec=null;if(!O||O.phase!=='read')return;O.listening=false;O.mine=ok?'ok':'x';oRender();oSend({ok})};
  O.fin=fin;O.ltm=setTimeout(()=>fin(false),Math.min(8000,Math.max(1500,O.end-Date.now()-300)));
  const start=lang=>{let r;try{r=new SR()}catch(e){fin(false);return}rec=r;r.lang=lang;r.interimResults=true;r.maxAlternatives=5;r.continuous=true;
    r.onresult=e=>{for(let j=e.resultIndex;j<e.results.length;j++){const alts=[...e.results[j]].map(x=>x.transcript.trim()).filter(Boolean);if(!alts.length)continue;
      O.heard=alts[0];const h=$('#oheard');if(h)h.textContent='« '+O.heard+' »';if(alts.some(v=>voiceRight(q,v))){fin(true);return}}};
    r.onerror=e=>{if(e.error==='language-not-supported'&&lang!=='fr-FR'){start('fr-FR');return}
      if(['not-allowed','service-not-allowed','network'].includes(e.error)){S.omode='choix';save();const h=$('#oheard');if(h)h.textContent='Micro indisponible : choix A B C D à la prochaine question'}};
    r.onend=()=>{if(!done&&rec===r)setTimeout(()=>{if(!done&&rec===r)start(lang)},150)};
    try{r.start()}catch(e){}};
  start('fr-CA');
}
function hostAns(who,i,a){if(!O||O.phase!=='read'||i!==O.i||O.locked[who]||!(who in O.sc))return;O.pend.push({who,a});if(!O.grace)O.grace=setTimeout(hostJudge,350)}
function hostJudge(){
  O.grace=null;O.pend.sort((x,y)=>x.a.rt-y.a.rt);const q=O.deck[O.i];
  while(O.pend.length&&O.phase==='read'){const {who,a}=O.pend.shift();if(O.locked[who])continue;
    const ok=a.ok!==undefined?!!a.ok:q.ch[a.v]===q.a;
    if(ok){hostResolve(who);return}
    NET.send({t:'miss',gid:O.gid,who});oMiss(who)}
  hostAllLocked();
}
function hostAllLocked(){if(O&&O.phase==='read'&&Object.keys(O.sc).every(id=>O.locked[id]))hostResolve(null)}
function hostResolve(win){if(!O||O.phase!=='read')return;if(win)O.sc[win]=(O.sc[win]||0)+O.deck[O.i].p;
  const m={t:'res',gid:O.gid,i:O.i,win,sc:O.sc};NET.send(m);oRes(m);setTimeout(oNextQ,3000)}
function oMiss(who){if(!O)return;O.locked[who]=true;O.marks[who]='x';
  if(who===myId){beep(200,.3);navigator.vibrate&&navigator.vibrate([60,60,60]);O.listening=false;try{rec&&rec.abort()}catch(e){}}
  oRender()}
function oRes(m){if(!O)return;oClr();O.done=(O.done||0)+O.deck[O.i].p;O.phase='show';O.sc=m.sc;O.res=m;if(m.win)O.marks[m.win]='ok';oRender();
  const a=O.deck[O.i].a;if(m.win===myId){beep(1320,.12);setTimeout(()=>beep(1760,.15),130);say('Bravo ! '+a)}else if(m.win)say(O.names[m.win]+' a le point. '+a);else say('La réponse était : '+a)}
function board(){const ids=Object.keys(O.sc).sort((a,b)=>O.sc[b]-O.sc[a]);
  return `<div class="board">${ids.map(id=>`<div class="sb ${id===myId?'self':''} ${O.marks?.[id]||''}">${avImg(O.av?.[id],'sav')}<span>${esc(O.names[id]||'?')}</span><b>${pct(O.sc[id],O.done||0)} %</b>${O.marks?.[id]==='x'?'<i>✗</i>':O.marks?.[id]==='ok'?'<i>✓</i>':''}</div>`).join('')}</div>`}
function oRender(){
  if(!O)return;const n=Object.keys(O.sc).length,hostN=esc(O.names[O.host]||'L\'hôte');
  if(O.phase==='lobby'){
    app.innerHTML=`<div class="room"><div class="top"><button class="x" data-act="oquit" aria-label="Annuler">✕</button><h2 style="font-size:20px">${O.targets?'Défi envoyé':'Partie de salle'}</h2></div>
    <div class="codebox"><small>${O.isHost?(O.targets?'En attente de la réponse…':'Les joueurs s\'inscrivent'):'Tu es inscrit !'}</small><div class="code" style="font-size:40px;letter-spacing:2px;padding:0">${n}</div><small>joueur${n>1?'s':''} · ${O.deck.length} questions</small></div>
    <div class="lbl">Inscrits</div>${Object.keys(O.sc).map(id=>`<div class="peer">${avImg(O.av?.[id],'pav')}<span class="dot"></span><div class="pn"><b>${esc(O.names[id])}${id===O.host?' (hôte)':''}</b></div></div>`).join('')}
    ${O.isHost?(O.targets?'':`<button class="btn pri" style="width:100%;margin-top:16px;padding:16px;font-size:17px" data-act="ostart" ${n<2?'disabled':''}>${n<2?'En attente de joueurs…':'Commencer ('+n+' joueurs)'}</button>`):`<p class="note">En attente que ${hostN} commence…</p>`}</div>`;
    return}
  const q=O.deck[O.i];let z='';
  if(!q)z='<div class="state">Préparez-vous…</div>';
  else if(O.phase==='show'){const r=O.res;z=`<div class="state ${r.win===myId?'win':r.win?'lose':''}">${r.win?avImg(O.av?.[r.win],'wav'):''}<small>${r.win===myId?'Bonne réponse !':r.win?esc(O.names[r.win])+' a eu le point':'Personne n\'a trouvé'}</small><div class="big2">${esc(q.a)}</div></div>`}
  else if(O.locked[myId])z=`<div class="state lose">Raté !<small>La question reste ouverte pour les autres.</small></div>`;
  else if(O.mine!=null)z=`<div class="state">${O.mine==='ok'?'Bonne réponse ! Vérification…':'Réponse envoyée…'}</div>`;
  else if(O.listening)z=`<div class="state talk"><div class="mic"></div><div>Parle ! Les autres ne t'entendent pas.</div><div class="heard" id="oheard">${O.heard?'« '+esc(O.heard)+' »':''}</div><button class="btn ghost" data-act="opass">Je passe</button></div>`;
  else if(S.omode==='micro'&&SR)z=`<button class="buzz obuzz" data-obuzz="1">BUZZ</button>`;
  else z=`<div class="fast">${q.ch.map((c,i)=>`<button class="fbtn" data-ofast="${i}"><b>${'ABCD'[i]}</b><span>${esc(c)}</span></button>`).join('')}</div>`;
  app.innerHTML=`<div class="oplay p0"><div class="top"><button class="x" data-act="oquit" aria-label="Quitter">✕</button><div class="bar"><i id="obar" style="width:${O.phase==='read'?Math.max(0,(O.end-Date.now())/O.dur*100):0}%"></i></div><span class="n">${Math.max(1,O.i+1)} / ${O.deck.length}</span></div>
  ${board()}<div id="emos"></div>${q?`<div class="card ocard"><span class="tag">${esc(q.c)}</span><div class="q">${esc(q.q)}</div>${z}</div>`:z}${emoBar()}</div>`;
}
const EMOS=['👏','🔥','😂','😮','😅','😱','👍','🎉'];
const QUICK=['Bien joué !','Bravo !','Trop fort !','Bonne chance !','On lâche pas !','GG !'];
const emoBar=()=>`<div class="emobar">${EMOS.map((e,i)=>`<button data-act="oemo" data-e="${i}" aria-label="Réaction">${e}</button>`).join('')}</div>
  <div class="quick">${QUICK.map((t,i)=>`<button data-act="oemo" data-e="${100+i}">${t}</button>`).join('')}</div>`;
let lastEmo=0;
function showEmo(id,i){const box=$('#emos'),t=i>=100?QUICK[i-100]:EMOS[i];if(!box||!t)return;const d=document.createElement('div');d.className='emo'+(i>=100?' txt':'');d.innerHTML=`${avImg(O&&O.av?.[id],'eav')}<span>${esc((O&&O.names[id])||'?')}</span>${esc(t)}`;box.appendChild(d);setTimeout(()=>d.remove(),2600)}
function oEnd(sc){
  if(!O)return;oClr();O.over=true;O.sc=sc;NET.update();
  const ids=Object.keys(sc).sort((a,b)=>sc[b]-sc[a]),rank=ids.indexOf(myId)+1,top=sc[ids[0]],win=ids.filter(id=>sc[id]===top);
  say(win.includes(myId)?(win.length>1?'Égalité au premier rang !':'Victoire !'):(O.names[ids[0]]+' gagne la partie.'));
  app.innerHTML=`<div class="card end"><img src="icon-192.webp" alt=""><div class="big">${rank===1?(win.length>1?'Égalité !':'Victoire !'):rank+'e place'}</div>
  <ol class="podium">${ids.map((id,k)=>`<li class="${id===myId?'self':''}"><span>${k<3?['🥇','🥈','🥉'][k]:k+1+'.'}</span>${avImg(O.av?.[id],'pav')}<b>${esc(O.names[id]||'?')}</b><em>${pct(sc[id],O.deck.reduce((t,q)=>t+q.p,0))} %</em></li>`).join('')}</ol>
  <div class="row" style="justify-content:center"><button class="btn pri" data-act="ogroup">Nouvelle partie</button><button class="btn" data-act="oroom">Retour à la salle</button></div>${emoBar()}</div><div id="emos"></div>`;
}
function oAbort(msg){if(!O)return;oClr();O=null;if(NET)NET.update();roomRender(true);oStatus(msg)}
app.addEventListener('pointerdown',e=>{const f=e.target.closest('[data-ofast]');if(f&&!f.disabled){e.preventDefault();oTap(+f.dataset.ofast);return}
  if(e.target.closest('[data-obuzz]')){e.preventDefault();oBuzz()}});
Object.assign(ACT,{
  ocreate(){enterRoom(newCode())},
  orefresh(){rejoin()},
  ojoin(){enterRoom($('#ocode').value)},
  oleave(){leaveRoom();S.stay=false;save();onlineScreen()},
  oshare(){const url=`${location.origin}/s/${ROOM}`,text=`Viens jouer avec moi à Génie en herbe ! Salle ${ROOM}`;
    if(navigator.share)navigator.share({title:'Défie-moi à Génie en herbe !',url}).catch(()=>{});else navigator.clipboard?.writeText(text+'\n'+url).then(()=>oStatus('Lien copié !'),()=>{})},
  olen(b){S.olen=+b.dataset.l;save();roomRender(true)},
  omode(b){if(b.dataset.m!=='micro'){S.omode='choix';save();roomRender(true);return}
    micOK().then(ok=>{S.omode=ok?'micro':'choix';save();roomRender(true);if(!ok)oStatus('Micro refusé ou indisponible : réponses par choix.')})},
  ogroup(){if(O&&O.over)O=null;oLaunch(null)},
  oinvite(b){if(O&&O.over)O=null;oLaunch([b.dataset.id])},
  ostart(){gStart()},
  oacc(){const v=INV;if(!v)return;INV=null;drawLayer();stopOther();if(O&&O.over)O=null;
    O={gid:v.gid,host:v.from,isHost:false,deck:v.deck,sc:{},names:{[v.from]:v.nom},av:{[v.from]:v.av||0},phase:'lobby',over:false,i:-1};
    NET.send({t:'gjoin',to:v.from,gid:v.gid,nom:myNom(),av:P?.av||0});NET.update();oRender()},
  odec(){if(INV)NET.send({t:'gno',to:INV.from,gid:INV.gid});INV=null;drawLayer()},
  opass(){O&&O.fin&&O.fin(false)},
  oemo(b){if(!O||Date.now()-lastEmo<1200)return;lastEmo=Date.now();const e=+b.dataset.e;NET.send({t:'emo',gid:O.gid,e});showEmo(myId,e)},
  oquit(silent){if(!O)return;if(O.isHost)NET.send({t:'gcancel',gid:O.gid});else NET.send({t:'gquit',to:O.host,gid:O.gid});oClr();O=null;NET&&NET.update();if(silent!==true)roomRender(true)},
  oroom(){O=null;NET.update();roomRender(true)},
});

boot();
})();
