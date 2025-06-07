'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Auth } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  resetPassword as resetPasswordService,
  logout as logoutService, 
  updateUserProfile as updateProfileService 
} from '../../firebase/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  loginWithGoogle: async () => {},
  resetPassword: async () => {},
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
    const authTimeout = setTimeout(() => {
      setLoading(false);
    }, 2000); // Timeout après 2 secondes

    let unsubscribe = () => {};
    
    if (auth) {
      unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
        clearTimeout(authTimeout);
      });
    } else {
      setLoading(false);
    }

    return () => {
      unsubscribe();
      clearTimeout(authTimeout);
    };
  }, []);

  const login = async (email: string, password: string) => {
    await loginWithEmail(email, password);
  };

  const register = async (email: string, password: string, name: string) => {
    await registerWithEmail(email, password, name);
  };

  const googleLogin = async () => {
    await loginWithGoogle();
  };

  const resetPass = async (email: string) => {
    await resetPasswordService(email);
  };

  const logout = async () => {
    await logoutService();
  };

  const updateUserProfile = async (displayName: string) => {
    await updateProfileService(displayName);
    if (user) {
      const updatedUser = { ...user, displayName };
      setUser(updatedUser as User);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login,
      register,
      loginWithGoogle: googleLogin,
      resetPassword: resetPass,
      logout,
      updateUserProfile 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 