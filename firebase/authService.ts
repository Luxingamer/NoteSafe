import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from './config';

// Fonction utilitaire pour vérifier si Firebase Auth est configuré
const checkAuth = () => {
  if (!auth) {
    throw new Error('Firebase Auth n\'est pas configuré. Veuillez configurer vos identifiants Firebase dans le fichier .env.local');
  }
};

// Créer un nouveau compte
export const registerWithEmail = async (email: string, password: string, displayName: string): Promise<User> => {
  try {
    checkAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Mettre à jour le profil avec le nom d'utilisateur
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    return userCredential.user;
  } catch (error: any) {
    let errorMessage = "Une erreur s'est produite lors de l'inscription";
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Cet email est déjà utilisé';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Adresse email invalide';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Le mot de passe est trop faible';
    }
    
    throw new Error(errorMessage);
  }
};

// Se connecter avec email et mot de passe
export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    checkAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    let errorMessage = "Une erreur s'est produite lors de la connexion";
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      errorMessage = 'Email ou mot de passe incorrect';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Adresse email invalide';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'Ce compte a été désactivé';
    }
    
    throw new Error(errorMessage);
  }
};

// Se connecter avec Google
export const loginWithGoogle = async (): Promise<User> => {
  try {
    checkAuth();
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Erreur lors de la connexion avec Google', error);
    throw new Error('La connexion avec Google a échoué');
  }
};

// Se déconnecter
export const logout = async (): Promise<void> => {
  try {
    checkAuth();
    await signOut(auth);
  } catch (error) {
    console.error('Erreur lors de la déconnexion', error);
    throw new Error('La déconnexion a échoué');
  }
};

// Réinitialiser le mot de passe
export const resetPassword = async (email: string): Promise<void> => {
  try {
    checkAuth();
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    let errorMessage = "Une erreur s'est produite lors de la réinitialisation du mot de passe";
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Aucun utilisateur trouvé avec cet email';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Adresse email invalide';
    }
    
    throw new Error(errorMessage);
  }
};

// Observer les changements d'état d'authentification
export const subscribeToAuthChanges = (callback: (user: User | null) => void): () => void => {
  if (!auth) {
    console.warn('Firebase Auth n\'est pas configuré, aucun abonnement aux changements d\'authentification');
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}; 