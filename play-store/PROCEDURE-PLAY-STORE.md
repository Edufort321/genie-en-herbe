# Génie en herbe — Procédure de dépôt sur le Play Store

Chemin habituel (comme Rouloo et Ohmni) : **Vercel → PWABuilder (.aab) → Play Console**, compte organisation **Commerce Cerdia inc.**

- Site : https://genie-en-herbe.vercel.app
- Package ID : `com.cerdia.genieenherbe`
- Politique de confidentialité : https://genie-en-herbe.vercel.app/confidentialite.html
- Fichiers de la fiche (icône, bannière, captures) : dossier `play-store/` du dépôt

---

## ⚠️ À régler AVANT de publier

1. **Droits sur les 91 questions de la feuille (© MPGHP 2020).** Elles sont protégées par le droit d'auteur. Pour un usage perso, aucun problème ; pour une app publique sur le Play Store, il faut **l'autorisation écrite de MPGHP**, sinon Google peut retirer l'app sur plainte. Option simple : publier une version sans ces questions (onglet Divers + questions perso) — Claude peut le faire avec un simple réglage.
2. **Le nom « Génie en herbe ».** « Génies en herbe » est le nom bien connu de l'émission et des compétitions scolaires. Un nom proche peut être refusé ou contesté. À vérifier (registre des marques de l'OPIC) ou choisir un nom distinct (ex. « Génie Quiz », « Cerveau d'or », « Brainzo »).
3. **Public d'âge.** Les élèves de secondaire 1 ont 12 ans : il faut cocher la tranche 9-12 ans, ce qui applique le **programme Familles** de Google. L'app y est compatible (aucune pub, aucun suivi, politique de confidentialité), mais la vérification est plus stricte.

---

## Étape 1 — Vérifier que le site est prêt (2 min)

Ouvre ces liens dans Chrome, ils doivent tous s'afficher :
- https://genie-en-herbe.vercel.app/manifest.webmanifest
- https://genie-en-herbe.vercel.app/confidentialite.html
- https://genie-en-herbe.vercel.app/icons/icon-512.png
- https://genie-en-herbe.vercel.app/.well-known/assetlinks.json

## Étape 2 — Générer le paquet Android avec PWABuilder (10 min)

1. Va sur **https://www.pwabuilder.com**, colle `https://genie-en-herbe.vercel.app`, puis **Start**.
2. Clique **Package For Stores** → **Android** → **Generate Package** → **Options** (ou *Edit options*).
3. Remplis :
   | Champ | Valeur |
   |---|---|
   | Package ID | `com.cerdia.genieenherbe` |
   | App name | Génie en herbe |
   | Launcher name | Génie en herbe |
   | App version | 1.0.0 |
   | App version code | 1 |
   | Host / Start URL | genie-en-herbe.vercel.app / `/` |
   | Theme, background, nav color | `#070B24` |
   | Display mode | Standalone · Orientation : Portrait |
   | Notification delegation | désactivé |
   | Location delegation | désactivé |
   | Signing key | **Create new** — Organisation : Commerce Cerdia inc., ville Sherbrooke, pays CA |
4. **Download** → tu obtiens un .zip contenant :
   - `app-release-bundle.aab` → le fichier à déposer sur Google Play
   - `signing.keystore` + `signing-key-info.txt` → **À SAUVEGARDER EN LIEU SÛR** (sans eux, impossible de publier une mise à jour)
   - `assetlinks.json`

## Étape 3 — Créer l'app dans Play Console (5 min)

play.google.com/console (compte play.commercecerdia@gmail.com) → **Créer une application** :
- Nom : Génie en herbe (ou le nom retenu)
- Langue par défaut : **Français (Canada) – fr-CA**
- Type : **Application** · Catégorie (à l'étape 5) : **Éducation**
- **Gratuite**
- Coche les déclarations, puis **Créer l'application**.

## Étape 4 — Configurer l'application (tableau de bord → « Configurer votre application »)

| Section | Réponse |
|---|---|
| Politique de confidentialité | https://genie-en-herbe.vercel.app/confidentialite.html |
| Accès à l'application | Toutes les fonctionnalités sont accessibles sans restriction |
| Annonces | **Non**, l'application ne contient pas d'annonces |
| Classification du contenu | Courriel : play@cerdia.ai · Catégorie : *Tous les autres types d'applications* (ou Éducation) · Violence, peur, sexualité, langage, drogues, jeux d'argent : **Non** · Les utilisateurs peuvent-ils interagir ? **Oui** (réactions préréglées seulement, aucun texte libre) · Partage de position : Non · Achats numériques : Non. Résultat attendu : Tout le monde / PEGI 3 |
| Public cible et contenu | Tranches : **9-12, 13-15, 16-17**. L'app n'est pas « conçue pour attirer les enfants » au sens publicitaire : il n'y a aucune pub. Accepte les exigences du programme Familles. |
| Applications d'actualités | Non |
| Applications de santé | Aucune |
| Fonctionnalités financières | Aucune |
| Applications gouvernementales | Non |
| Sécurité des données | voir le tableau ci-dessous |

### Formulaire « Sécurité des données »
- L'application collecte-t-elle ou partage-t-elle des données ? **Oui**
- Données chiffrées en transit ? **Oui** (HTTPS / WSS)
- Moyen de demander la suppression des données ? **Non applicable** : rien n'est conservé sur nos serveurs. Si le champ est obligatoire, indique play@cerdia.ai.
- Données collectées :
  - **Informations personnelles → Nom** (prénom en mode en ligne) : *collectée*, **non partagée**, **traitée de façon éphémère**, **facultative**, finalité **Fonctionnement de l'application**.
  - Rien d'autre. Le profil (âge, école), les scores et les questions perso restent sur l'appareil. Ce qui ne quitte pas l'appareil n'est pas considéré comme collecté.
- Audio : l'app ne collecte pas l'audio, c'est le service vocal du système qui transcrit. Ne pas déclarer d'enregistrement audio, mais garder la mention dans la politique (déjà faite).

## Étape 5 — Fiche du Play Store (Croissance → Présence sur le Play Store → Fiche principale)

- **Nom (30 car. max)** : Génie en herbe – Révision
- **Description courte (80 car. max)** :
  `Révise le quiz du secondaire, passe des examens et défie tes amis en ligne.`
- **Description complète** :

```
Deviens imbattable au Génie en herbe !

Génie en herbe t'aide à réviser les questions de quiz du secondaire, de la 1re à la 5e secondaire, de façon rapide et motivante.

RÉVISION
• Questions en ordre aléatoire, avec 4 choix de réponses crédibles
• Les questions ratées reviennent jusqu'à ce que tu les maîtrises
• Questions à indices (15-10-5 points), questions d'épellation lues à voix haute

EXAMEN
• 10, 20, 30 questions ou toutes, avec chronomètre
• Pointage comme en vrai match et révision de tes erreurs

DUEL À 2 SUR LE MÊME TÉLÉPHONE
• Téléphone à plat entre vous deux, chacun son côté de l'écran
• La question est lue à voix haute, le plus rapide gagne
• Réponse au micro ou par choix, avec droit de réplique

EN LIGNE AVEC TES AMIS
• Salle privée avec un code : seuls tes amis te voient
• Parties de groupe sans limite de joueurs et scores en direct
• Une mauvaise réponse ne ferme pas la question : les autres peuvent encore répondre
• Réactions emoji et petites phrases d'encouragement (aucun clavardage libre)
• Alerte quand un ami arrive dans la salle

TES PROPRES QUESTIONS
• Photographie tes feuilles ou tes notes de classe pour réviser dessus

Sans publicité, sans compte, sans collecte de données : ton profil reste sur ton téléphone.
Catégories : géographie, sciences, histoire, arts, musique, sports, littérature, langue française, mathématiques, divertissement et plus.
```

- **Icône 512×512** : `play-store/icone-play-512.png`
- **Image de présentation 1024×500** : `play-store/banniere-1024x500.png`
- **Captures du téléphone** (2 à 8) : `play-store/capture-1-accueil.png`, `capture-2-revision.png`, `capture-3-examen.png`, `capture-4-duel.png`, `capture-5-salle.png`, `capture-6-en-ligne.png` (et `capture-0-ouverture.png` si tu veux)
- **Catégorie** : Éducation · **Tags** : Quiz, Éducation, Révision
- **Coordonnées** : courriel play@cerdia.ai · site https://cerdia.ai

## Étape 6 — Publier (Tests → Test interne, puis Production)

1. **Test interne** (recommandé d'abord) : Créer une version → téléverse `app-release-bundle.aab`.
   - Nom de version : 1.0.0
   - Notes : « Première version : révision, examen, duel et parties en ligne. »
   - Ajoute ton courriel comme testeur, installe l'app depuis le lien et vérifie.
2. Un compte **organisation** comme Commerce Cerdia n'a pas l'obligation de 12 testeurs pendant 14 jours. Tu peux passer à **Production** → Créer une version → même .aab → **Envoyer pour examen**.
3. Examen de Google : quelques heures à 7 jours, plus long au premier envoi et avec le programme Familles.

## Étape 7 — Lier le site à l'app (enlève la barre d'adresse en haut)

Après le premier téléversement :
1. Play Console → **Tester et publier → Configuration → Intégrité de l'application → Signature de l'application**.
2. Copie l'empreinte **SHA-256** du *certificat de la clé de signature de l'application*.
3. Copie aussi la SHA-256 qui se trouve dans `signing-key-info.txt` (le fichier de PWABuilder).
4. **Envoie les deux à Claude** : il les met dans `/.well-known/assetlinks.json` et pousse. Après le déploiement, l'app s'ouvre en plein écran, sans barre d'adresse.

## Mises à jour par la suite

- **Changements dans l'app** (questions, modes, design) : Claude pousse sur GitHub → Vercel déploie → l'app du Play Store se met à jour toute seule. **Pas besoin d'une nouvelle version Play Store.**
- **Nouvelle version Play Store** seulement si le nom, l'icône, le package ou les couleurs changent : PWABuilder avec le **même keystore** (*Use existing*), version code +1 (2, 3, …).
