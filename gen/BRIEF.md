# Brief : questions de culture générale pour l'app « Génie en herbe »

Public : jeunes du secondaire au Québec (12-17 ans) et familles. Langue : français du Québec, correct et clair.

## Format de sortie (OBLIGATOIRE)
Un fichier JSON (tableau) écrit à l'emplacement indiqué. Chaque élément :
{"c":"<catégorie exacte donnée>","lvl":1|2|3,"q":"<question>","a":"<réponse affichée>","k":["<mot-clé>",...],"d":["<faux 1>","<faux 2>","<faux 3>"]}

- lvl : 1 = facile (connu de la plupart des 12 ans), 2 = moyen, 3 = difficile (amateur de quiz). Viser environ 40 % / 35 % / 25 %.
- q : une seule question claire, qui finit par « ? », style Génie en herbe (indices dans l'énoncé permis). Pas de question dont la réponse figure déjà dans l'énoncé.
- a : réponse courte, avec article si naturel (« Le Brésil », « La mitochondrie »).
- k : 1 à 3 mots-clés qui reconnaissent une réponse TAPÉE au clavier : en minuscules, SANS accents, sans article, sans ponctuation (ex. « Le Caire » → ["caire"] ; « Jacques Cartier » → ["cartier"]). Pour une réponse en deux parties obligatoires, une seule chaîne avec & : ["bleu&rose"]. Les nombres en chiffres (« 206 » → ["206"]).
- d : exactement 3 mauvais choix CRÉDIBLES et du MÊME TYPE que la bonne réponse (un compositeur → 3 autres compositeurs de la même époque ; une capitale → 3 villes du même pays ou de la même région ; une année → 3 années proches ; un nombre → 3 nombres proches). Jamais la bonne réponse, jamais de synonyme de la bonne réponse, jamais deux faux identiques.

## Règles de contenu
- Faits exacts et stables : pas de titulaires actuels de postes, pas de records qui changent souvent, pas d'actualité récente, rien de contesté. En cas de doute sur un fait, choisis une autre question.
- Formulations 100 % originales (n'utilise pas de questions copiées d'un livre, d'un site ou d'une émission).
- Contenu adapté aux jeunes : rien de violent, sexuel ou haineux ; pas de politique partisane.
- Variété : ne pose pas deux fois la même réponse dans ton lot, et évite les réponses déjà présentes dans l'app (liste : /home/claude/genie-en-herbe/gen/existing-answers.txt).
- Inclure une bonne part de contenu québécois et canadien quand le thème s'y prête.

## Vérification avant de terminer
Lance cette commande et corrige tout problème signalé jusqu'à « OK » :
node /home/claude/genie-en-herbe/gen/check.js <ton-fichier.json>
