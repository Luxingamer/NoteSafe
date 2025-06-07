import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getAuth, Auth } from 'firebase/auth';

// Configuration Firebase à partir des variables d'environnement
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
};

// Vérifier si la configuration est complète
const isFirebaseConfigured = Object.values(firebaseConfig).every(value => value !== undefined);

// Initialiser Firebase seulement si les identifiants sont configurés
let app;
let db: Database | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  db = getDatabase(app);
  auth = getAuth(app);
} else {
  console.warn('Firebase n\'est pas configuré. Veuillez ajouter vos identifiants Firebase dans le fichier .env.local');
}

// Collections paths
export const COLLECTIONS = {
  NOTES: 'notes',
  MEMORY: 'memory'
} as const;

export { app, db, auth }; 