'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getUserData, updateUserData } from '../../firebase/userService';

// Type pour les informations utilisateur
export interface UserInfo {
  id?: string; // ID utilisateur Firebase
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  joined: Date;
  plan: 'basic' | 'premium' | 'pro';
  notificationsEnabled: boolean;
  lastLogin: Date;
  bio: string;
  points?: number; // Points gagnés
  notifications?: number; // Nombre de notifications
}

// Données utilisateur par défaut
const defaultUserInfo: UserInfo = {
  name: 'Invité',
  firstName: 'Invité',
  lastName: '',
  email: '',
  avatar: '',
  joined: new Date(),
  plan: 'basic',
  notificationsEnabled: false,
  lastLogin: new Date(),
  bio: 'Utilisateur non connecté',
  points: 0,
  notifications: 0
};

// Type pour le contexte
interface UserContextType {
  userInfo: UserInfo;
  updateUserInfo: (newInfo: Partial<UserInfo>) => void;
  resetUserInfo: () => void;
}

// Création du contexte
const UserContext = createContext<UserContextType | undefined>(undefined);

// Hook pour utiliser le contexte
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser doit être utilisé à l\'intérieur d\'un UserProvider');
  }
  return context;
};

// Hook sécurisé pour utiliser Auth (qui retourne null si hors contexte)
const useSafeAuth = () => {
  // Vérifier si nous sommes dans un environnement navigateur (côté client)
  const isBrowser = typeof window !== 'undefined';
  
  // Si nous ne sommes pas dans un navigateur, retourner un objet par défaut
  if (!isBrowser) {
    return { user: null, loading: false };
  }
  
  try {
    return useAuth();
  } catch (error) {
    console.warn('Auth context not available yet, will sync later');
    return { user: null, loading: false };
  }
};

// Provider du contexte
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<UserInfo>(defaultUserInfo);
  const [userDataCache, setUserDataCache] = useState<Record<string, UserInfo>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Utiliser notre hook sécurisé
  const auth = useSafeAuth();

  // Mettre à jour les informations utilisateur
  const updateUserInfo = async (newInfo: Partial<UserInfo>) => {
    setUserInfo(prev => {
      // Si firstName ou lastName sont modifiés, mettre à jour le name complet
      const updatedInfo = { ...prev, ...newInfo };
      if (newInfo.firstName || newInfo.lastName) {
        updatedInfo.name = `${updatedInfo.firstName} ${updatedInfo.lastName}`;
      }
      
      // Si l'utilisateur est connecté, mettre à jour dans Firebase et le cache
      if (auth.user && updatedInfo.id) {
        const userId = updatedInfo.id as string;
        
        // Mettre à jour dans Firebase (asynchone, pas besoin d'attendre)
        updateUserData(userId, updatedInfo).catch(error => {
          console.error('Erreur lors de la mise à jour des données utilisateur:', error);
        });
        
        // Mettre à jour le cache local
        setUserDataCache(cache => ({
          ...cache,
          [userId]: updatedInfo
        }));
      }
      
      return updatedInfo;
    });
  };

  // Réinitialiser les informations utilisateur
  const resetUserInfo = () => {
    setUserInfo(defaultUserInfo);
  };

  // Sauvegarder utilisateur dans le localStorage par ID
  const saveUserToLocalStorage = (userId: string, userData: UserInfo) => {
    try {
      localStorage.setItem(`userInfo_${userId}`, JSON.stringify(userData));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des informations utilisateur:', error);
    }
  };

  // Charger utilisateur du localStorage par ID
  const loadUserFromLocalStorage = (userId: string): UserInfo | null => {
    try {
      const savedInfo = localStorage.getItem(`userInfo_${userId}`);
      if (savedInfo) {
        try {
          const parsedInfo = JSON.parse(savedInfo);
          // Convertir les dates
          parsedInfo.joined = new Date(parsedInfo.joined);
          parsedInfo.lastLogin = new Date(parsedInfo.lastLogin);
          return parsedInfo;
        } catch (error) {
          console.error('Erreur lors du chargement des informations utilisateur:', error);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'accès à localStorage:', error);
    }
    return null;
  };

  // Synchroniser avec Firebase Auth si disponible
  useEffect(() => {
    const syncUserData = async () => {
      const { user } = auth;
      
      if (user) {
        const userId = user.uid;
        setIsLoading(true);
        
        try {
          // 1. D'abord essayer de récupérer depuis Firebase
          let userData = await getUserData(userId);
          
          // 2. Si rien dans Firebase, essayer le cache
          if (!userData) {
            userData = userDataCache[userId];
          }
          
          // 3. Si rien dans le cache, essayer localStorage
          if (!userData) {
            userData = loadUserFromLocalStorage(userId);
          }
          
          // 4. Si toujours rien, créer un nouveau profil
          if (!userData) {
            userData = {
              ...defaultUserInfo,
              id: userId,
              name: user.displayName || 'Utilisateur',
              firstName: user.displayName?.split(' ')[0] || 'Utilisateur',
              lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
              email: user.email || '',
              joined: new Date(),
              lastLogin: new Date(),
              notifications: Math.floor(Math.random() * 5), // Valeur aléatoire pour la démo
              points: Math.floor(Math.random() * 100) // Valeur aléatoire pour la démo
            };
            
            // Créer dans Firebase
            await updateUserData(userId, userData);
          }
          
          // Toujours mettre à jour le nom et l'email depuis les données Firebase Auth
          userData = {
            ...userData,
            name: user.displayName || userData.name,
            email: user.email || userData.email,
            lastLogin: new Date()
          };
          
          // Mettre à jour dans Firebase
          await updateUserData(userId, { lastLogin: new Date() });
          
          // Mettre à jour le state et le cache
          setUserInfo(userData);
          setUserDataCache(cache => ({
            ...cache,
            [userId]: userData as UserInfo
          }));
          
          // Sauvegarder dans localStorage comme backup
          saveUserToLocalStorage(userId, userData as UserInfo);
        } catch (error) {
          console.error('Erreur lors de la synchronisation du profil utilisateur:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Si déconnecté, réinitialiser aux valeurs par défaut
        setUserInfo(defaultUserInfo);
      }
    };
    
    syncUserData();
  }, [auth.user]);

  // Sauvegarder les modifications dans Firebase et localStorage
  useEffect(() => {
    if (userInfo.id) {
      const userId = userInfo.id as string;
      
      // Sauvegarder dans Firebase
      updateUserData(userId, userInfo).catch(error => {
        console.error('Erreur lors de la sauvegarde des données dans Firebase:', error);
      });
      
      // Sauvegarder dans localStorage comme backup
      saveUserToLocalStorage(userId, userInfo);
    }
  }, [userInfo]);

  return (
    <UserContext.Provider value={{ userInfo, updateUserInfo, resetUserInfo }}>
      {!isLoading && children}
    </UserContext.Provider>
  );
}; 