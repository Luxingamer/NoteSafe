'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { logout as logoutService, updateUserProfile as updateProfileService } from '../../firebase/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  updateUserProfile: async () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    return logoutService();
  };

  const updateUserProfile = async (displayName: string) => {
    await updateProfileService(displayName);
    // Mettre à jour l'état local pour refléter le changement
    if (user) {
      // Créer une copie modifiée de l'utilisateur
      const updatedUser = { ...user, displayName };
      setUser(updatedUser as User);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, updateUserProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 