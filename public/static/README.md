# NoteSafe - Version Statique

Cette version de NoteSafe est une implémentation HTML/CSS/JS statique de l'application de prise de notes. Elle offre toutes les fonctionnalités principales sans nécessiter de serveur ou d'environnement Node.js.

## Fonctionnalités

- Création, édition et suppression de notes
- Organisation par catégories (Mot, Phrase, Idée, Réflexion, Histoire, Note)
- Marquage de notes en favoris
- Épinglage de notes importantes
- Archivage de notes
- Recherche de notes
- Mise en forme du texte (gras, italique, souligné, listes)
- Vue calendrier
- Importation/exportation de notes
- Thème clair/sombre

## Comment utiliser

1. Ouvrez le fichier `index.html` dans un navigateur web moderne
2. L'application s'initialisera avec quelques notes d'exemple
3. Utilisez la barre latérale pour naviguer entre les différentes vues
4. Créez de nouvelles notes avec le formulaire en haut de la page
5. Gérez vos notes avec les boutons d'action disponibles sur chaque note

## Structure des fichiers

- `index.html` - Structure HTML de l'application
- `styles.css` - Styles CSS pour l'interface
- `script.js` - Code JavaScript pour la logique de l'application

## Stockage des données

Toutes les notes sont enregistrées localement dans le stockage de votre navigateur (localStorage). Cela signifie que vos notes seront préservées même si vous fermez le navigateur, mais uniquement sur le même appareil et navigateur.

Pour sauvegarder vos notes entre différents appareils, utilisez les fonctions d'exportation et d'importation.

## Mise en forme du texte

NoteSafe prend en charge une syntaxe de type Markdown simplifiée:

- `**texte**` pour le texte en gras
- `*texte*` pour le texte en italique
- `_texte_` pour le texte souligné
- Les listes à puces et numérotées sont également prises en charge

## Compatibilité

Cette application fonctionne sur tous les navigateurs modernes qui prennent en charge:
- HTML5
- CSS3 (avec variables CSS)
- JavaScript ES6+
- localStorage

## Développement

Cette version statique est une adaptation de l'application complète NoteSafe développée avec React et Next.js. Elle utilise uniquement HTML, CSS et JavaScript vanille pour une portabilité maximale. 