'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Type pour les informations utilisateur
export interface UserInfo {
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
}

// Données utilisateur par défaut
const defaultUserInfo: UserInfo = {
  name: 'Luxin Enow',
  firstName: 'Luxin',
  lastName: 'Enow',
  email: 'luxin5268@gmail.com',
  avatar: '',
  joined: new Date('2023-05-15'),
  plan: 'premium',
  notificationsEnabled: true,
  lastLogin: new Date('2023-11-02T10:30:00'),
  bio: 'Écrivain passionné et créateur de contenu. J\'utilise NoteSafe pour organiser mes idées et documenter mes inspirations quotidiennes.'
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
  // Utiliser notre hook sécurisé
  const auth = useSafeAuth();

  // Mettre à jour les informations utilisateur
  const updateUserInfo = (newInfo: Partial<UserInfo>) => {
    setUserInfo(prev => {
      // Si firstName ou lastName sont modifiés, mettre à jour le name complet
      const updatedInfo = { ...prev, ...newInfo };
      if (newInfo.firstName || newInfo.lastName) {
        updatedInfo.name = `${updatedInfo.firstName} ${updatedInfo.lastName}`;
      }
      return updatedInfo;
    });
  };

  // Réinitialiser les informations utilisateur
  const resetUserInfo = () => {
    setUserInfo(defaultUserInfo);
  };

  // Synchroniser avec Firebase Auth si disponible
  useEffect(() => {
    const { user } = auth;
    if (user) {
      // Juste pour le mode démo, nous gardons les infos par défaut mais mettons à jour l'email
      setUserInfo(prev => ({
        ...prev,
        email: user.email || prev.email,
        name: user.displayName || prev.name
      }));
    }
  }, [auth]);

  // Sauvegarder dans localStorage
  useEffect(() => {
    try {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des informations utilisateur:', error);
    }
  }, [userInfo]);

  // Charger depuis localStorage
  useEffect(() => {
    try {
      const savedInfo = localStorage.getItem('userInfo');
      if (savedInfo) {
        try {
          const parsedInfo = JSON.parse(savedInfo);
          // Convertir les dates
          parsedInfo.joined = new Date(parsedInfo.joined);
          parsedInfo.lastLogin = new Date(parsedInfo.lastLogin);
          setUserInfo(parsedInfo);
        } catch (error) {
          console.error('Erreur lors du chargement des informations utilisateur:', error);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'accès à localStorage:', error);
    }
  }, []);

  return (
    <UserContext.Provider value={{ userInfo, updateUserInfo, resetUserInfo }}>
      {children}
    </UserContext.Provider>
  );
}; 