// Fonction Vercel : lit une ou plusieurs captures de feuilles de questions avec Claude
// et renvoie les questions prêtes pour l'app (réponse, mots-clés, 3 mauvais choix crédibles, niveau).
// Variables d'environnement : ANTHROPIC_API_KEY (obligatoire), IMPORT_CODE (facultatif : code d'accès),
// ANTHROPIC_MODEL (facultatif, par défaut claude-sonnet-5-5).

const CONSIGNE = `Tu reçois des photos ou captures d'écran de feuilles de questions de quiz (style compétition de quiz scolaire), en français ou en anglais.
Extrais CHAQUE question visible et renvoie UNIQUEMENT un tableau JSON, sans texte autour, de la forme :
[{"c":"Catégorie courte","lvl":1,"q":"Question complète ?","a":"Réponse","k":["motcle"],"d":["faux 1","faux 2","faux 3"]}]

Règles :
- Langue : écris la question, la catégorie, la réponse et les mauvais choix dans la langue de la feuille (français ou anglais). S'il n'y a pas de feuille, utilise la langue du texte collé.
- N'invente aucune question qui n'est pas sur l'image. Recopie fidèlement la question (corrige seulement les fautes de lecture évidentes).
- Si la feuille donne la réponse (souvent après « R: »), utilise-la. Sinon, donne la bonne réponse seulement si tu en es certain ; sinon mets "a":"" .
- Questions à indices (15-10-5 points, 40-30-20-10…) : réunis les indices dans une seule question, du plus difficile au plus facile.
- Mots à épeler : question « Comment épelle-t-on le mot … ? » (en anglais : « How do you spell the word … ? ») avec la phrase, réponse = le mot.
- "c" : catégorie courte (ex. Géographie, Sciences, Histoire, Musique, Sports, Langue française). Reprends le titre de section de la feuille s'il y en a un.
- "lvl" : 1 facile, 2 moyen, 3 difficile (ton estimation pour un élève du secondaire).
- "k" : 1 à 3 mots-clés pour reconnaître une réponse tapée : minuscules, sans accents, sans article (« Le Caire » -> ["caire"]). Deux éléments obligatoires : "bleu&rose".
- "d" : exactement 3 mauvais choix CRÉDIBLES et du MÊME TYPE que la bonne réponse (un compositeur -> 3 compositeurs de la même époque ; une ville -> 3 villes de la même région ; une année -> 3 années proches). Jamais la bonne réponse ni un synonyme.`;

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non permise' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: "Le remplissage IA n'est pas encore configuré (clé ANTHROPIC_API_KEY manquante dans Vercel)." });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};
  const code = (process.env.IMPORT_CODE || '').trim();
  if (code && String(body.code || '').trim() !== code) return res.status(401).json({ error: 'Code d\'accès requis', needCode: true });

  const images = Array.isArray(body.images) ? body.images.slice(0, 4) : [];
  const texte = String(body.texte || '').slice(0, 20000);
  if (!images.length && !texte.trim()) return res.status(400).json({ error: 'Aucune image ni texte reçu.' });
  for (const im of images) {
    if (!/^image\/(jpeg|png|webp)$/.test(im.type || '') || typeof im.data !== 'string' || im.data.length > 3_000_000)
      return res.status(400).json({ error: 'Image invalide ou trop lourde.' });
  }

  const content = [
    ...images.map(im => ({ type: 'image', source: { type: 'base64', media_type: im.type, data: im.data } })),
    { type: 'text', text: CONSIGNE + (texte.trim() ? `\n\nTexte collé par l'utilisateur :\n${texte}` : '') },
  ];

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5', max_tokens: 8000, messages: [{ role: 'user', content }] }),
    });
    const j = await r.json();
    if (!r.ok) return res.status(502).json({ error: 'Le service IA a refusé la demande : ' + (j?.error?.message || r.status) });
    const txt = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    const m = txt.match(/\[[\s\S]*\]/);
    let qs = [];
    try { qs = JSON.parse(m ? m[0] : txt); } catch { return res.status(502).json({ error: 'Réponse de l\'IA illisible, réessaie avec une image plus nette.' }); }
    qs = (Array.isArray(qs) ? qs : []).filter(q => q && q.q).map(q => ({
      c: String(q.c || 'Feuille importée').slice(0, 40),
      lvl: [1, 2, 3].includes(q.lvl) ? q.lvl : 2,
      q: String(q.q).slice(0, 600),
      a: String(q.a || '').slice(0, 160),
      k: (Array.isArray(q.k) ? q.k : []).map(String).filter(Boolean).slice(0, 4),
      d: (Array.isArray(q.d) ? q.d : []).map(String).filter(Boolean).slice(0, 3),
    }));
    return res.status(200).json({ questions: qs });
  } catch (e) {
    return res.status(500).json({ error: 'Erreur réseau avec le service IA.' });
  }
};
