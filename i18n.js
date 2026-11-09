// Genia : bilingue FR/EN. L'app est écrite en français ; en anglais, les textes affichés
// et lus à voix haute sont traduits ici (dictionnaire exact + règles pour les textes variables).
(function(){
let lang;try{lang=localStorage.getItem('geh-lang')}catch(e){}
if(lang!=='fr'&&lang!=='en'){let old=null;try{old=localStorage.getItem('geh-profil')}catch(e){}lang=old||/^fr/i.test(navigator.language||'fr')?'fr':'en'}
window.LANG=lang;
window.setLang=l=>{try{localStorage.setItem('geh-lang',l)}catch(e){}location.reload()};
document.documentElement.lang=lang;

const D={
// accueil / profil
'Révise, teste-toi, deviens imbattable.':'Study, test yourself, become unbeatable.',
'Mes questions':'My questions','Culture G':'General','Divers':'Mixed','Catégories':'Categories','Tout':'All',
'Niveau':'Level','Difficulté':'Difficulty','Facile':'Easy','Moyen':'Medium','Difficile':'Hard','Tous les niveaux':'All levels','Sec 1 à 5':'Sec 1 to 5',
'Révision':'Review','Examen':'Exam','Me tester':'Test me','Affronter':'Face off','Jouer en ligne':'Play online','En ligne':'Online',
'Révision intelligente':'Smart review','Les questions les moins réussies d\'abord':'Weakest questions first',
'Les questions les moins réussies d\'abord. Les ratées reviennent.':'Weakest questions first. Missed ones come back.',
'Inclure les questions déjà acquises':'Include questions already mastered',
'Nombre de questions':'Number of questions','Toutes':'All','Toutes les':'All','Choix multiples':'Multiple choice','Réponse écrite':'Typed answer',
'Ma façon de répondre':'How I answer','Choix A B C D':'Choices A B C D','Au micro':'By voice',
'Chrono de l\'examen':'Exam timer','Aucun':'None','Temps par question':'Time per question',
'Lecture à voix haute':'Read aloud','Muette':'Off','Lente':'Slow','Normale':'Normal','Rapide':'Fast',
'Réglages':'Settings','Mes statistiques':'My stats','Confidentialité':'Privacy','Installer l\'app':'Install the app',
'Mes questions perso':'My own questions','Mes questions perso (sur ce téléphone)':'My own questions (on this phone)',
'Le format habituel, à ton rythme.':'The usual format, at your own pace.',
'Tu écris ta réponse, on calcule ton pointage comme en vrai match.':'Type your answer, we score it like a real match.',
'2 joueurs face à face sur le même téléphone.':'2 players face to face on the same phone.',
'Joue contre tes amis avec un code de salle.':'Play your friends with a room code.',
'Bienvenue !':'Welcome!','Mon profil':'My profile','Modifie tes infos.':'Edit your info.','Présente-toi avant de commencer.':'Introduce yourself before you start.',
'Prénom':'First name','Âge':'Age','École':'School','Ton prénom':'Your first name','Nom de ton école':'Your school name',
'Ces infos restent seulement sur ton appareil.':'This info stays on your device only.',
'Enregistrer':'Save','Go':'Go','Langue':'Language',
'Ton avatar':'Your avatar','Nouveau : ton avatar !':'New: your avatar!','Choisis le personnage qui te représente. Tes amis le verront en ligne.':'Pick the character that represents you. Your friends will see it online.',
'Plus tard':'Later','Fermer':'Close','Choisir':'Choose','Annuler':'Cancel','Retour':'Back','Quitter':'Quit','Retour au jeu':'Back to the game',
// jeu solo
'Je ne sais pas':'I don\'t know','Voir la réponse':'Show answer','Suivante':'Next','Question suivante':'Next question','Valider':'Submit',
'La bonne réponse':'The right answer','Bravo !':'Well done!','Bonne réponse !':'Correct!','Pas tout à fait':'Not quite','Temps écoulé ou passé':'Time\'s up or skipped',
'J\'avais raison':'I was right','Réviser mes erreurs':'Review my mistakes','Voir mon résultat':'See my result','Nouvelle partie':'New game','Relire':'Read again',
'Indice suivant':'Next clue','Ta réponse…':'Your answer…','Réponse':'Answer','Raté !':'Missed!',
'1 à 4 : choisir · Entrée : suivante':'1 to 4: choose · Enter: next','Espace : réponse · 1 : à revoir · 2 : je savais':'Space: answer · 1: review again · 2: I knew it',
'Entrée : valider / continuer':'Enter: submit / continue','Comment épelle-t-on le mot manquant ?':'How do you spell the missing word?',
'Niveau finale provinciale.':'Provincial final level.','Solide. Ton équipe compte sur toi.':'Solid. Your team is counting on you.',
'Bon départ, encore un peu de révision.':'Good start, a bit more review.','On révise et on revient plus fort.':'Review and come back stronger.',
'Lecture lente.':'Slow reading.','Lecture normale.':'Normal reading.','Lecture rapide.':'Fast reading.',
// stats
'Questions acquises (sélection actuelle)':'Mastered questions (current selection)','Par catégorie (de la moins bonne à la meilleure)':'By category (weakest to strongest)',
'Tes questions les plus difficiles':'Your hardest questions','Joue quelques parties : tes questions difficiles apparaîtront ici.':'Play a few games: your hardest questions will show up here.',
'Remettre mes statistiques à zéro':'Reset my stats','Touche encore pour confirmer':'Tap again to confirm',
'Rapidité (bonnes réponses)':'Speed (correct answers)','Rapidité en ligne (quand plusieurs ont la bonne réponse)':'Online speed (when several get it right)',
'Gagnés au clic':'Won on speed','Perdus':'Lost','Meilleur':'Best','Moy.':'Avg.','Joueur':'Player','temps moyen':'average time','meilleur temps':'best time',
'acquises':'mastered','à revoir':'to review',
// duel
'Lancer le duel':'Start the duel','Posez le téléphone à plat entre vous deux.':'Lay the phone flat between you.','Préparez-vous…':'Get ready…',
'RÉPLIQUE !':'COMEBACK!','Personne':'Nobody','Égalité':'Tie','Égalité !':'Tie!','Victoire !':'Victory!','remporte le duel':'wins the duel','Match nul, revanche ?':'Draw, rematch?',
'Micro ouvert, parle !':'Mic on, speak!','J\'écoute…':'Listening…','Je n\'entends rien… parle plus fort':'I can\'t hear you… speak up','Autorisation du micro…':'Mic permission…',
'Micro indisponible':'Mic unavailable','Micro refusé : on passe aux choix':'Mic denied: switching to choices','Micro refusé ou indisponible : réponses par choix.':'Mic denied or unavailable: answer with choices.',
'Micro indisponible : choix A B C D à la prochaine question':'Mic unavailable: choices A B C D next question',
'Pas d\'internet pour la voix : on passe aux choix':'No internet for voice: switching to choices',
'Ce navigateur ne permet pas la reconnaissance vocale : réponses par choix.':'This browser has no speech recognition: answer with choices.',
'Micro refusé ou indisponible : le duel se jouera avec les choix A B C D. Appuie de nouveau sur Lancer, ou autorise le micro dans les réglages de Chrome (icône à gauche de l\'adresse).':'Mic denied or unavailable: the duel will use choices A B C D. Tap Start again, or allow the mic in Chrome settings (icon left of the address).',
// en ligne
'Code de la salle':'Room code','CODE':'CODE','Entrer':'Enter','Créer une salle':'Create a room','ou rejoindre une salle':'or join a room','Dernière salle :':'Last room:','oublier ce code':'forget this code',
'Entre dans une salle avec un code, vois qui est là et lance un défi.':'Enter a room with a code, see who\'s there and send a challenge.',
'Seuls ton prénom et ton école sont visibles par les joueurs de la salle. Rien n\'est conservé.':'Only your first name and school are visible to players in the room. Nothing is stored.',
'Le code doit avoir 5 caractères.':'The code must have 5 characters.','Salle':'Room','Connecté':'Connected','Reconnexion…':'Reconnecting…','Connexion…':'Connecting…',
'Inviter des amis (lien)':'Invite friends (link)','Lien copié !':'Link copied!','Tes amis touchent le lien et arrivent directement ici. Ils peuvent aussi taper le code dans En ligne.':'Your friends tap the link and land right here. They can also type the code in Online.',
'Personne d\'autre pour l\'instant. Donne le code':'Nobody else yet. Give the code','à tes amis.':'to your friends.','personne pour l\'instant':'nobody yet',
'Je suis prêt à jouer':'I\'m ready to play','✓ Je suis prêt · en attente d\'une partie':'✓ I\'m ready · waiting for a game','Touche encore pour ne plus être prêt.':'Tap again to stop being ready.',
'Seuls les joueurs prêts participent. Les autres peuvent regarder.':'Only ready players take part. Others can watch.',
'Lancer une partie pour toute la salle':'Start a game for the whole room','ou touche des joueurs ci-dessous pour en défier quelques-uns':'or tap players below to challenge a few',
'Annuler la sélection':'Clear selection','Format':'Format','Classique':'Classic','Blitz':'Blitz','Tournoi':'Tournament','Révision de groupe':'Group review',
'Questions rapides, enchaînement sans pause.':'Quick questions, no pause between them.','Manches de 5 questions : le dernier de chaque manche est éliminé, jusqu\'au champion.':'Rounds of 5 questions: the last player in each round is out, until a champion remains.',
'Les questions que le groupe réussit le moins. Celles que tout le monde a acquises sont sautées.':'The questions the group gets wrong most. Ones everyone has mastered are skipped.',
'Quitter la salle':'Leave the room','Créer un nouveau code':'Create a new code','Quitter et effacer ce code':'Leave and forget this code',
'Tu peux retourner jouer : tu restes connecté et une alerte s\'affiche quand un ami arrive ou lance une partie.':'You can go back to playing: you stay connected and an alert pops up when a friend arrives or starts a game.',
'Mode test : le serveur en ligne n\'est pas encore branché. La salle fonctionne seulement entre onglets de cet appareil.':'Test mode: the online server isn\'t connected yet. The room only works between tabs on this device.',
'Rejoindre':'Join','Revenir':'Go back in','Regarder':'Watch','Regarder seulement':'Just watch','Je participe':'I\'m in','Non merci':'No thanks','Démarrer':'Start','Commencer':'Start',
'En attente de joueurs…':'Waiting for players…','Les joueurs prêts s\'inscrivent':'Ready players are signing up','Tu es inscrit !':'You\'re in!','Inscrits':'Signed up',
'Défi envoyé':'Challenge sent','Défi envoyé, en attente des réponses':'Challenge sent, waiting for answers','Partie de salle':'Room game','Partie en cours':'Game in progress','Défi privé':'Private challenge',
'Départ dans':'Starts in','Tu regardes · la partie commence dans':'You\'re watching · game starts in','Tu regardes la partie':'You\'re watching the game','Tu regardes la suite du tournoi.':'You\'re watching the rest of the tournament.',
'Il faut être prêt pour participer. Sinon, tu peux regarder.':'You must be ready to take part. Otherwise you can watch.',
'Coche « Prêt » dans la salle pour jouer la prochaine.':'Check "Ready" in the room to play the next one.','Je suis prêt, je joue !':'I\'m ready, let me play!',
'Partie annulée : il faut au moins 2 joueurs prêts.':'Game cancelled: at least 2 ready players are needed.','La partie a été annulée.':'The game was cancelled.',
'Personne n\'a accepté le défi.':'Nobody accepted the challenge.','Impossible de rejoindre la partie.':'Couldn\'t join the game.',
'Réponse envoyée…':'Answer sent…','Bonne réponse ! Vérification…':'Correct! Checking…','Personne n\'a trouvé':'Nobody got it',
'La question reste ouverte pour les autres.':'The question stays open for the others.','délai dépassé':'time\'s up',
'Tu es éliminé·e':'You\'re out','Éliminé·e':'Out','Tu peux regarder la suite du tournoi.':'You can watch the rest of the tournament.',
'Égalité : personne n\'est éliminé':'Tie: nobody is out','Fin de la manche. Tu es éliminé.':'End of round. You\'re out.','Fin de la manche. Égalité, personne n\'est éliminé.':'End of round. Tie, nobody is out.',
'Égalité au premier rang !':'Tie for first place!','Ça commence…':'Here we go…','C\'est parti !':'Let\'s go!',
'M\'attendre':'Wait for me','✓ Il sait que tu attends':'✓ They know you\'re waiting','Ils t\'attendent :':'They\'re waiting for you:',
'Prêt':'Ready','en partie':'in a game','L\'hôte':'The host','Ton ami':'Your friend','Toi':'You','Réaction':'Reaction','Actualiser':'Refresh',
'Bien joué !':'Nice one!','Bonne chance !':'Good luck!','On lâche pas !':'Keep it up!','Trop fort !':'Too good!','GG !':'GG!','Défie-moi à Genia !':'Challenge me at Genia!',
'Aucune':'None','librairie Supabase non chargée':'Supabase library not loaded','élimination par manches':'elimination rounds','pour toute la salle':'for the whole room',
'gagnés ·':'won ·','duels de vitesse':'speed duels','même clic':'same tap','plus vite ·':'faster ·','moins vite':'slower',
// import
'Captures d\'écran ou photos de feuilles':'Screenshots or photos of quiz sheets',
'L\'IA lit chaque question, trouve la réponse et prépare 3 mauvais choix crédibles. Tu vérifies avant d\'ajouter.':'The AI reads each question, finds the answer and writes 3 believable wrong choices. You check before adding.',
'Choisir des captures':'Choose screenshots','Ou coller du texte':'Or paste text','Remplir avec l\'IA':'Fill with AI','Colle ici des questions (avec ou sans réponses)…':'Paste questions here (with or without answers)…',
'Code d\'accès à l\'IA':'AI access code','Entre le code d\'accès à l\'IA, puis touche OK.':'Enter the AI access code, then tap OK.','Préparation des images…':'Preparing images…',
'L\'IA lit ta feuille… (environ 20 s)':'The AI is reading your sheet… (about 20 s)','Aucune question trouvée. Essaie une image plus nette ou plus rapprochée.':'No questions found. Try a sharper or closer image.',
'Mauvais choix (séparés par ;)':'Wrong choices (separated by ;)','Réponse à compléter':'Answer to fill in','Catégorie':'Category','Retirer':'Remove','Tout annuler':'Cancel all',
'Complète au moins une réponse avant d\'ajouter.':'Fill in at least one answer before adding.','Sans IA (texte ou fichier)':'Without AI (text or file)','question | réponse':'question | answer',
'Fichiers .txt, .csv ou .json, ou photo lue sans IA. Format : une question par ligne,':'.txt, .csv or .json files, or a photo read without AI. Format: one question per line,',
'Choisir des fichiers':'Choose files','Ajouter':'Add','Exporter (.json)':'Export (.json)','Tout effacer':'Delete all','Questions perso enregistrées sur cet appareil :':'Own questions saved on this device:',
'Feuille importée':'Imported sheet','Texte extrait. Corrige au besoin, puis ajoute.':'Text extracted. Fix it if needed, then add.','Aucune ligne au format « question | réponse ».':'No lines in the "question | answer" format.',
'Effacer toutes tes questions importées ?':'Delete all your imported questions?','Lecture d\'image indisponible hors ligne':'Image reading unavailable offline','image illisible':'unreadable image',
'Photographie une feuille ou tes notes de classe pour réviser dessus. Elles restent seulement sur ce téléphone.':'Take a photo of a quiz sheet or class notes to study from. They stay on this phone only.',
'Méthode non permise':'Method not allowed',"Le remplissage IA n'est pas encore configuré (clé ANTHROPIC_API_KEY manquante dans Vercel).":'AI fill is not set up yet (ANTHROPIC_API_KEY missing in Vercel).','Code d\'accès requis':'Access code required','Aucune image ni texte reçu.':'No image or text received.','Image invalide ou trop lourde.':'Invalid or too large image.','Réponse de l\'IA illisible, réessaie avec une image plus nette.':'Unreadable AI response, try again with a sharper image.','Erreur réseau avec le service IA.':'Network error with the AI service.',
'Accueil':'Home','Ajouter des documents':'Add documents','Aucun document pour l\'instant':'No documents yet','Avatar du joueur 2':'Player 2 avatar','BUZZ':'BUZZ','Duel 2 joueurs':'2-player duel',
'Glisse des photos de feuilles de questions, ou un fichier .txt / .csv / .json.':'Drop photos of quiz sheets, or a .txt / .csv / .json file.','Je passe':'Skip','Je savais':'I knew it','À revoir':'Review again',
'Meilleur examen ici :':'Best exam here:','Nouvel examen':'New exam','Parle ! Les autres ne t\'entendent pas.':'Speak! The others can\'t hear you.','Parle maintenant !':'Speak now!','Passer':'Skip',
'Recommencer':'Start over','Relancer le micro':'Restart the mic','Revanche':'Rematch','Écouter le mot et la phrase':'Hear the word and the sentence','La réponse était :':'The answer was:','Épeler :':'Spell:',
'Déterminant':'Determiner','Préposition':'Preposition','Ta partie en cours sera quittée.':'You will leave your current game.','Fin de la manche.':'End of round.','· pour toute la salle':'· for the whole room',
'question ajoutée':'question added','questions ajoutées':'questions added','éliminé·e':'out',
'Ajoute tes propres questions':'Add your own questions','Prends une photo ou une capture de ta feuille : l\'IA trouve les réponses et prépare les choix.':'Take a photo or screenshot of your quiz sheet: AI finds the answers and writes the choices.','Ajouter mes questions':'Add my questions',
'Dépose tes documents ici':'Drop your files here','Retour à la salle':'Back to the room','Duel':'Duel','Genia':'Genia',
};
const R=[
[/^Meilleur examen ici : (.+)$/,'Best exam here: $1'],[/^Non\. Réplique pour$/,'No. Comeback for'],[/^Bonne réponse ! (.+)$/,'Correct! $1'],[/^Bravo ! (.+)$/,'Well done! $1'],[/^(.+) a le point\. (.+)$/,'$1 gets the point. $2'],[/^Duel ! (.+) contre (.+)\. Prêts \?$/,'Duel! $1 versus $2. Ready?'],
[/^(\d+) duels de vitesse$/,'$1 speed duels'],[/^(\d+ )?questions? sélectionnées?$/,(m)=>(m[1]||'')+'question'+(m[1]&&+m[1]===1?'':'s')+' selected'],[/^(.+) · (\d+) en ligne$/,'$1 · $2 online'],
[/^Salut (.+)$/,'Hi $1'],[/^(\d+) questions?$/,'$1 questions'],[/^(\d+) q\.$/,'$1 q.'],[/^Sec (\d)$/,'Sec $1'],
[/^Choix multiples · (.+)$/,m=>'Multiple choice · '+tr(m[1])],[/^Toutes les q\.$/,'All q.'],[/^Réponse écrite · (.+)$/,m=>'Typed answer · '+tr(m[1])],
[/^(\d+) % acquis · (\d+) à revoir$/,'$1% mastered · $2 to review'],[/^(\d+)\/(\d+) acquises( · (\d+) à revoir)?$/,(m)=>`${m[1]}/${m[2]} mastered${m[3]?' · '+m[4]+' to review':''}`],
[/^Acquises (\d+)$/,'Mastered $1'],[/^En progrès (\d+)$/,'In progress $1'],[/^À revoir (\d+)$/,'To review $1'],[/^Jamais vues (\d+)$/,'Never seen $1'],
[/^Réviser mes points faibles \((\d+)\)$/,'Review my weak spots ($1)'],[/^(\d+) erreurs? · (\d+) bonnes?$/,(m)=>`${m[1]} wrong · ${m[2]} right`],
[/^réussies du premier coup \((\d+) sur (\d+)\)$/,'right on the first try ($1 of $2)'],[/^de bonnes réponses$/,'correct answers'],[/^bonnes réponses$/,'correct answers'],
[/^Une question est acquise après (\d+) bonnes réponses de suite\. Une erreur la remet à revoir\.$/,'A question is mastered after $1 correct answers in a row. A mistake puts it back to review.'],
[/^(\d+) questions disponibles avec tes filtres actuels\.$/,'$1 questions available with your current filters.'],[/^(\d+) questions sélectionnées$/,'$1 questions selected'],[/^questions sélectionnées$/,'questions selected'],
[/^Indice : (.+)$/,'Clue: $1'],[/^Indice suivant \((\d+) pts\)$/,'Next clue ($1 pts)'],[/^(\d+) pts · indice (\d+)\/(\d+)$/,'$1 pts · clue $2/$3'],[/^indice (\d+)\/(\d+)$/,'clue $1/$2'],
[/^Ta réponse : (.*)$/,'Your answer: $1'],[/^La réponse était : (.*)$/,'The answer was: $1'],[/^Tu as dit « (.*) »$/,'You said "$1"'],[/^Épeler : (.*)$/,'Spell: $1'],
[/^Question (\d+)\/(\d+)( ·)?$/,'Question $1/$2$3'],[/^Question (\d+)\/(\d+) terminée$/,'Question $1/$2 done'],[/^Manche (\d+) · (\d+)\/(\d+)$/,'Round $1 · $2/$3'],[/^Fin de la manche (\d+)$/,'End of round $1'],
[/^Fin de la manche\. (.+) (est|sont) éliminés?\.$/,(m)=>`End of round. ${m[1]} ${m[2]==='est'?'is':'are'} out.`],
[/^(\d+)e place$/,(m)=>m[1]+(m[1]==='2'?'nd':m[1]==='3'?'rd':'th')+' place'],[/^(.+) a eu le point$/,'$1 got the point'],[/^(.+) répond…$/,'$1 is answering…'],
[/^Réplique pour (.+)$/,'Comeback for $1'],[/^Non\. Réplique pour (.+)$/,'No. Comeback for $1'],[/^Victoire de (.+) !$/,'$1 wins!'],
[/^Salle (.+)$/,'Room $1'],[/^Connexion à la salle (.+)…$/,'Connecting to room $1…'],[/^Connexion impossible \((.*)$/,'Connection failed ($1'],[/^\)\. Vérifie internet et réessaie\.$/,'). Check your internet and try again.'],
[/^En ligne maintenant \((\d+)\)$/,'Online now ($1)'],[/^Commencer \((\d+) joueurs\)$/,'Start ($1 players)'],[/^Défier (\d+) joueurs?$/,(m)=>`Challenge ${m[1]} player${m[1]>1?'s':''}`],
[/^Quitter \(garder (.+) pour plus tard\)$/,'Leave (keep $1 for later)'],[/^Quitter la salle (.+) \?$/,'Leave room $1?'],[/^Ta partie en cours sera quittée\. $/,'You will leave your current game. '],[/^Que veux-tu faire avec ce code \?$/,'What do you want to do with this code?'],
[/^Présente-toi, puis tu entres dans la salle (.+)\.$/,'Introduce yourself, then you\'ll enter room $1.'],
[/^(.+) te défie !$/,'$1 challenges you!'],[/^(.+) lance une partie !$/,'$1 is starting a game!'],[/^ te défie !$/,' challenges you!'],[/^ lance une partie !$/,' is starting a game!'],[/^te défie$/,'challenges you'],[/^lance une partie$/,'is starting a game'],
[/^(.*)est en ligne !$/,'$1is online!'],[/^(.*)a quitté\.$/,'$1left.'],[/^(.*)a quitté : partie terminée\.$/,'$1left: game over.'],[/^(.*)a refusé le défi\.$/,'$1declined the challenge.'],
[/^(.*)gagne la partie\.$/,'$1wins the game.'],[/^(.*)t'attend pour la prochaine partie$/,'$1is waiting for the next game'],[/^lance une partie : tu es inscrit !$/,'is starting a game: you\'re in!'],
[/^(.*)est éliminé\.$/,'$1is out.'],[/^(.*)sont éliminés\.$/,'$1are out.'],[/^(.*) éliminés$/,'$1 out'],[/^(.*) éliminé·e$/,'$1 out'],[/^(\d+) joueurs encore en lice$/,'$1 players still in'],
[/^En attente que (.+) commence…$/,'Waiting for $1 to start…'],[/^(.+) \(hôte\)$/,'$1 (host)'],[/^\(hôte\)$/,'(host)'],[/^chez (.+)$/,'hosted by $1'],[/^(.+) chez (.+)$/,(m)=>tr(m[1])+' hosted by '+m[2]],
[/^Départ dans (\d+) s$/,'Starts in $1 s'],[/^(.*)· coche « Prêt » pour jouer$/,'$1· check "Ready" to play'],[/^· minimum 2 joueurs prêts$/,'· at least 2 ready players'],
[/^(\d+) joueurs? · (.+)$/,(m)=>`${m[1]} player${m[1]>1?'s':''} · `+m[2].split(' · ').map(tr).join(' · ')],[/^joueurs? · (.+)$/,(m)=>'player(s) · '+m[1].split(' · ').map(tr).join(' · ')],
[/^(.+) · (.+)$/,(m)=>{const p=m[0].split(' · ');const t=p.map(x=>tr(x));return t.some((x,i)=>x!==p[i])?t.join(' · '):m[0]}],
[/^(\d+) s par question$/,'$1 s per question'],[/^(\d+) questions trouvées\. Vérifie-les, puis touche « Ajouter »\.$/,'$1 questions found. Check them, then tap "Add".'],
[/^L'IA lit le lot (\d+)\/(\d+)… \(environ 20 s\)$/,'The AI is reading batch $1/$2… (about 20 s)'],[/^À vérifier \((\d+) retenues?\)$/,'To check ($1 kept)'],
[/^Ajouter (\d+) questions?$/,(m)=>`Add ${m[1]} question${m[1]>1?'s':''}`],[/^(\d+) questions? ajoutées? dans Mes questions\.(.*)$/,(m)=>`${m[1]} question${m[1]>1?'s':''} added to My questions.`+(m[2]?tr(m[2].trim()).replace(/^/,' '):'')],
[/^(\d+) sans réponse à compléter\.$/,'$1 without an answer to fill in.'],[/^Erreur avec (.*)$/,'Error with $1'],[/^Le service IA a refusé la demande : (.*)$/,'The AI service refused the request: $1'],[/^erreur (\d+)$/,'error $1'],
[/^Toi vs (.+) :$/,'You vs $1:'],[/^vs (.+)$/,'vs $1'],[/^Toi (.+)$/,'You $1'],[/^Toi : (.*)$/,'You: $1'],[/^\((\d+) égal\.\)$/,'($1 tied)'],[/^perdus(.*)$/,(m)=>'lost'+m[1].replace('même clic','same tap')],
[/^(.*)Rapidité en ligne(.*)$/,'$1Online speed$2'],
];
function core0(s){if(D[s]!==undefined)return D[s];for(const [re,to] of R){const m=s.match(re);if(m)return typeof to==='function'?to(m):s.replace(re,to)}return null}
const num=s=>s.replace(/(\d) %/g,'$1%').replace(/(\d),(\d+) s\b/g,'$1.$2 s');
function core(s){const r=core0(s);if(r!=null)return num(r);const n=num(s);return n!==s?n:null}
function tr(s){const k=s.replace(/\s+/g,' ').trim();if(!k)return s;const r=core(k);return r==null?s:r}
window.T=s=>lang==='en'&&typeof s==='string'?tr(s):s;
if(lang!=='en')return;
const ATTR=['placeholder','aria-label','title'];
function node(n){
  if(n.nodeType===3){const v=n.nodeValue,k=v.replace(/\s+/g,' ').trim();if(!k||!/[A-Za-zÀ-ÿ]/.test(k))return;const r=core(k);if(r!=null&&r!==k){const lead=/^\s/.test(v)?' ':'',trail=/\s$/.test(v)?' ':'';n.nodeValue=lead+r+trail}return}
  if(n.nodeType!==1||n.closest&&n.closest('.notr,script,style'))return;
  for(const a of ATTR){const v=n.getAttribute&&n.getAttribute(a);if(v){const r=core(v.trim());if(r!=null&&r!==v)n.setAttribute(a,r)}}
  n.childNodes.forEach(node);
}
function skip(n){const e=n.nodeType===1?n:n.parentElement;return e&&e.closest&&e.closest('.notr,script,style')}
const mo=new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData'){if(!skip(m.target))node(m.target)}else if(m.type==='attributes'){if(!skip(m.target))node(m.target)}else m.addedNodes.forEach(x=>{if(!skip(x))node(x)})}});
const go=()=>{node(document.body);mo.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTR})};
if(document.body)go();else document.addEventListener('DOMContentLoaded',go);
document.title='Genia · Quiz';
})();
