// Build Vercel : copie l'app dans public/ et écrit config.js à partir des variables d'environnement.
const fs=require('fs');
fs.rmSync('public',{recursive:true,force:true});fs.mkdirSync('public');
for(const f of ['index.html','app.js','data.js','sw.js','manifest.webmanifest','icon-192.webp'])fs.copyFileSync(f,'public/'+f);
const cfg={supabaseUrl:process.env.SUPABASE_URL||'',supabaseKey:process.env.SUPABASE_ANON_KEY||''};
fs.writeFileSync('public/config.js','window.GEH_CONFIG = '+JSON.stringify(cfg)+';\n');
console.log('config:',cfg.supabaseUrl?'Supabase branché':'mode test (variables absentes)');
