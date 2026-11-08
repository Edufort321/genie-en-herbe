// Build Vercel : copie l'app dans public/ et écrit config.js à partir des variables d'environnement.
const fs=require('fs'),path=require('path');
fs.rmSync('public',{recursive:true,force:true});fs.mkdirSync('public');
const copy=(src,dst=src)=>{const d=path.join('public',dst);fs.mkdirSync(path.dirname(d),{recursive:true});fs.copyFileSync(src,d)};
for(const f of ['index.html','app.js','data.js','culture.js','sw.js','manifest.webmanifest','icon-192.webp','confidentialite.html','.well-known/assetlinks.json'])copy(f);
for(const dir of ['icons','play-store','avatars'])for(const f of fs.readdirSync(dir))if(/\.(png|webp)$/.test(f))copy(path.join(dir,f));
let u=(process.env.SUPABASE_URL||'').trim();try{if(u)u=new URL(u).origin}catch(e){}
const cfg={supabaseUrl:u,supabaseKey:(process.env.SUPABASE_ANON_KEY||'').trim()};
fs.writeFileSync('public/config.js','window.GEH_CONFIG = '+JSON.stringify(cfg)+';\n');
console.log('config:',cfg.supabaseUrl?'Supabase branché':'mode test (variables absentes)');
