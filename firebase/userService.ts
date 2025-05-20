import { Database, ref, get, set, update } from 'firebase/database';
import { db } from './config';
import { UserInfo } from '../app/context/UserContext';

// Chemin dans la base de données pour les utilisateurs
const USERS_PATH = 'users';

// Vérifier si Firebase Realtime Database est configuré
const checkDb = () => {
  if (!db) {
    throw new Error('Firebase Realtime Database n\'est pas configuré. Veuillez configurer vos identifiants Firebase dans le fichier .env.local');
  }
};

// Récupérer les données d'un utilisateur
export const getUserData = async (userId: string): Promise<UserInfo | null> => {
  try {
    checkDb();
    
    const userRef = ref(db as Database, `${USERS_PATH}/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      
      // Convertir les dates en objets Date
      if (userData.joined) userData.joined = new Date(userData.joined);
      if (userData.lastLogin) userData.lastLogin = new Date(userData.lastLogin);
      
      return userData as UserInfo;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération des données utilisateur:', error);
    return null;
  }
};

// Créer ou mettre à jour un utilisateur
export const updateUserData = async (userId: string, userData: Partial<UserInfo>): Promise<void> => {
  try {
    checkDb();
    
    const userRef = ref(db as Database, `${USERS_PATH}/${userId}`);
    
    // Formater les dates
    const dataToUpdate: Record<string, any> = { ...userData };
    
    if (dataToUpdate.joined instanceof Date) {
      dataToUpdate.joined = dataToUpdate.joined.toISOString();
    }
    
    if (dataToUpdate.lastLogin instanceof Date) {
      dataToUpdate.lastLogin = dataToUpdate.lastLogin.toISOString();
    }
    
    // Vérifier si l'utilisateur existe déjà
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      // Mettre à jour les champs existants
      await update(userRef, dataToUpdate);
    } else {
      // Créer un nouvel utilisateur
      await set(userRef, {
        id: userId,
        name: dataToUpdate.name || 'Utilisateur',
        firstName: dataToUpdate.firstName || '',
        lastName: dataToUpdate.lastName || '',
        email: dataToUpdate.email || '',
        avatar: dataToUpdate.avatar || '',
        joined: dataToUpdate.joined || new Date().toISOString(),
        plan: dataToUpdate.plan || 'basic',
        notificationsEnabled: dataToUpdate.notificationsEnabled !== undefined ? dataToUpdate.notificationsEnabled : false,
        lastLogin: dataToUpdate.lastLogin || new Date().toISOString(),
        bio: dataToUpdate.bio || '',
        points: dataToUpdate.points || 0,
        notifications: dataToUpdate.notifications || 0
      });
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour des données utilisateur:', error);
    throw error;
  }
};

// Mettre à jour le compteur de points
export const updateUserPoints = async (userId: string, points: number): Promise<void> => {
  try {
    checkDb();
    
    const userRef = ref(db as Database, `${USERS_PATH}/${userId}/points`);
    await set(userRef, points);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des points:', error);
    throw error;
  }
};

// Mettre à jour le compteur de notifications
export const updateUserNotifications = async (userId: string, notifications: number): Promise<void> => {
  try {
    checkDb();
    
    const userRef = ref(db as Database, `${USERS_PATH}/${userId}/notifications`);
    await set(userRef, notifications);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des notifications:', error);
    throw error;
  }
}; 