# QuoteGo — Commercial V1

Version commerciale statique, mobile-first, sans API payante.

## Ce qui est déjà prêt
- Design premium mobile + desktop
- FR / NL / EN / AR réel
- Calcul instantané configurable
- Véhicules, formules, état et options
- Résumé client
- Message WhatsApp structuré dans la langue choisie
- Branding configurable
- Aucun backend obligatoire
- Aucun abonnement
- Aucun coût d'hébergement obligatoire

## Personnaliser un client
Ouvre `config.js`.

Les éléments les plus importants sont dans :

```js
business: {
  name: "QuoteGo Auto Demo",
  shortName: "QuoteGo Auto",
  whatsapp: "32470000000",
  city: "Bruxelles"
}
```

Le numéro WhatsApp doit être au format international sans `+` ni espaces.

Exemple :
`+32 470 12 34 56` -> `32470123456`

Les prix et services sont aussi dans `config.js`.
Tu peux créer une copie du dossier par client et ne modifier que ce fichier.

## Tester
Ouvre `index.html`.

## Mettre en ligne gratuitement
Cette version est compatible avec :
- GitHub Pages
- Cloudflare Pages
- Netlify statique

## Étape suivante
Avant la première prospection :
1. Mettre un vrai numéro de démonstration
2. Déployer gratuitement
3. Tester sur iPhone + ordinateur
4. Créer une courte page/presentation commerciale


## Mode démo public
Cette version n'affiche ni n'utilise aucun numéro personnel. Le bouton final montre le message WhatsApp généré dans une fenêtre de démonstration.
