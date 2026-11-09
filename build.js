// Build Vercel : copie l'app dans public/ et écrit config.js à partir des variables d'environnement.
const fs=require('fs'),path=require('path');
fs.rmSync('public',{recursive:true,force:true});fs.mkdirSync('public');
const copy=(src,dst=src)=>{const d=path.join('public',dst);fs.mkdirSync(path.dirname(d),{recursive:true});fs.copyFileSync(src,d)};
for(const f of ['index.html','app.js','i18n.js','culture.js','culture-en.js','sw.js','manifest.webmanifest','icon-192.webp','confidentialite.html','.well-known/assetlinks.json'])copy(f);
for(const dir of ['icons','play-store','avatars'])for(const f of fs.readdirSync(dir))if(/\.(png|webp)$/.test(f))copy(path.join(dir,f));
// Édition : « famille » garde les 91 questions des feuilles (© MPGHP, usage privé) ; « public » (Play Store) les retire.
// Sans variable EDITION, le projet genie-en-herbe reste en famille et tout autre projet (ex. genia) est public.
const prodUrl=(process.env.VERCEL_PROJECT_PRODUCTION_URL||process.env.VERCEL_URL||'');
const edition=(process.env.EDITION||'').trim().toLowerCase()||(/genie-en-herbe/.test(prodUrl)||!process.env.VERCEL?'famille':'public');
let data=fs.readFileSync('data.js','utf8');
if(edition!=='famille'){const a=data.indexOf('window.SHEET = ['),b=data.indexOf('\n];',a);if(a<0||b<0)throw new Error('SHEET introuvable');data=data.slice(0,a)+'window.SHEET = [];'+data.slice(b+3)}
fs.writeFileSync('public/data.js',data);
console.log('édition:',edition);
let u=(process.env.SUPABASE_URL||'').trim();try{if(u)u=new URL(u).origin}catch(e){}
const cfg={edition,supabaseUrl:u,supabaseKey:(process.env.SUPABASE_ANON_KEY||'').trim()};
fs.writeFileSync('public/config.js','window.GEH_CONFIG = '+JSON.stringify(cfg)+';\n');
console.log('config:',cfg.supabaseUrl?'Supabase branché':'mode test (variables absentes)');
