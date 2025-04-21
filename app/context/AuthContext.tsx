'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  loginWithEmail, 
  loginWithGoogle, 
  registerWithEmail, 
  logout, 
  resetPassword, 
  subscribeToAuthChanges 
} from '../../firebase/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  register: (email: string, password: string, name: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // S'abonner aux changements d'état d'authentification Firebase
      const unsubscribe = subscribeToAuthChanges((user) => {
        setUser(user);
        setLoading(false);
      });

      // Se désabonner lorsque le composant est démonté
      return () => unsubscribe();
    } catch (error) {
      // Firebase n'est pas configuré, on initialise directement
      console.warn('Firebase Auth n\'est pas configuré, fonctionnement en mode local');
      setLoading(false);
      return () => {};
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      return await loginWithEmail(email, password);
    } catch (error: any) {
      if (error.message?.includes('n\'est pas configuré')) {
        console.warn('Firebase Auth n\'est pas configuré, fonctionnement en mode local');
        // Simuler un utilisateur en mode développement
        return getMockUser(email);
      }
      throw error;
    }
  };

  const handleGoogleLogin = async () => {
    try {
      return await loginWithGoogle();
    } catch (error: any) {
      if (error.message?.includes('n\'est pas configuré')) {
        console.warn('Firebase Auth n\'est pas configuré, fonctionnement en mode local');
        // Simuler un utilisateur Google en mode développement
        return getMockUser('user@gmail.com', 'Utilisateur Google');
      }
      throw error;
    }
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    try {
      return await registerWithEmail(email, password, name);
    } catch (error: any) {
      if (error.message?.includes('n\'est pas configuré')) {
        console.warn('Firebase Auth n\'est pas configuré, fonctionnement en mode local');
        // Simuler un utilisateur en mode développement
        return getMockUser(email, name);
      }
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } catch (error: any) {
      if (error.message?.includes('n\'est pas configuré')) {
        console.warn('Firebase Auth n\'est pas configuré, déconnexion simulée');
        setUser(null);
        return;
      }
      throw error;
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await resetPassword(email);
    } catch (error: any) {
      if (error.message?.includes('n\'est pas configuré')) {
        console.warn('Firebase Auth n\'est pas configuré, réinitialisation simulée');
        return;
      }
      throw error;
    }
  };

  // Fonction utilitaire pour créer un utilisateur simulé en développement
  const getMockUser = (email: string, displayName: string = 'Utilisateur Test'): any => {
    const mockUser = {
      uid: `mock-${Date.now()}`,
      email,
      displayName,
      emailVerified: true,
      isAnonymous: false,
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString()
      }
    };
    setUser(mockUser as any);
    return mockUser;
  };

  const value = {
    user,
    loading,
    login: handleLogin,
    loginWithGoogle: handleGoogleLogin,
    register: handleRegister,
    logout: handleLogout,
    resetPassword: handleResetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 