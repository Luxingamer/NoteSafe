# NoteSafe

Une application de prise de notes sécurisée et moderne.

## Configuration Firebase

### Informations de connexion
- Console Firebase : https://console.firebase.google.com/
- Projet : NoteSafe
- Base de données : Realtime Database

### Configuration sur un nouveau système
1. Clonez le projet
2. Installez les dépendances avec `npm install`
3. Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :
```env
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=votre_database_url
```
4. Lancez l'application avec `npm run dev`
5. Connectez-vous avec le même compte que sur votre autre système
6. Vos notes seront automatiquement synchronisées

### Développement avec Firebase
- Vous pouvez continuer à modifier et développer l'application normalement
- Les modifications locales sont possibles et n'affectent pas la synchronisation
- Les notes sont automatiquement synchronisées quand :
  - Vous créez une nouvelle note
  - Vous modifiez une note existante
  - Vous supprimez une note
  - Vous vous connectez sur un autre appareil

## Installation

```bash
npm install
```

## Lancement de l'application

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) avec votre navigateur pour voir le résultat.

## Documentation intégrée

L'application dispose d'une documentation intégrée qui vous guide à travers ses fonctionnalités. Vous pouvez y accéder depuis le menu principal.

## Système de succès

Débloquez des succès en utilisant les différentes fonctionnalités de l'application :
- Création de notes
- Utilisation des catégories
- Personnalisation du profil
- Et plus encore...

## Fonctionnalités

- Prise de notes simple et intuitive
- Organisation par catégories
- Mode sombre/clair
- Système de notifications toast
- Sauvegarde automatique
- Interface responsive
- Corbeille avec restauration
- Confirmation de suppression personnalisable
- Synchronisation multi-appareils avec Firebase
- Authentification sécurisée

## Sécurité

- Authentification Firebase sécurisée
- Synchronisation en temps réel
- Protection des données par utilisateur
- Validation des entrées
- Sessions sécurisées

## Technologies utilisées

- Next.js 13
- React
- TypeScript
- Tailwind CSS
- Firebase (Authentification + Realtime Database)
- LocalStorage (mode hors ligne)

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## Licence

MIT

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


echo "Pour nettoyer le localStorage, ouvrez les outils de développement (F12), allez dans l'onglet 'Application' > 'Local Storage', et cliquez sur 'Clear All' ou supprimez manuellement la clé 'notes'"
