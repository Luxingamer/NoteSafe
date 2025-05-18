'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotifications } from './NotificationsContext';
import { useAchievements } from './AchievementsContext';

// Types pour la gestion des points
export interface PointTransaction {
  id: string;
  amount: number;
  type: 'earned' | 'spent';
  description: string;
  timestamp: Date;
  category: 'daily' | 'achievement' | 'edit' | 'ai' | 'theme' | 'book' | 'page';
}

interface PointsContextType {
  points: number;
  transactions: PointTransaction[];
  addPoints: (amount: number, description: string, category: PointTransaction['category']) => void;
  spendPoints: (amount: number, description: string, category: PointTransaction['category']) => boolean;
  canAfford: (amount: number) => boolean;
  getLastDailyReward: () => Date | null;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

// Coûts des actions
export const POINT_COSTS = {
  EDIT_NOTE: 5,
  AI_GENERATION: 10,
  CHANGE_THEME: 5,
  ADD_BOOK: 10,
  ADD_PAGE: 5,
} as const;

// Hook personnalisé pour utiliser le contexte
export const usePoints = () => {
  const context = useContext(PointsContext);
  if (!context) {
    throw new Error('usePoints doit être utilisé à l\'intérieur d\'un PointsProvider');
  }
  return context;
};

// Clés pour le localStorage
const STORAGE_KEYS = {
  POINTS: 'notesafe_points',
  TRANSACTIONS: 'notesafe_transactions',
  LAST_DAILY_REWARD: 'notesafe_last_daily_reward'
};

export function PointsProvider({ children }: { children: React.ReactNode }) {
  const { addNotification } = useNotifications();
  const { totalPoints: achievementPoints } = useAchievements();

  // Initialiser les états avec les données du localStorage
  const [points, setPoints] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedPoints = localStorage.getItem(STORAGE_KEYS.POINTS);
      // Si pas de points sauvegardés, on commence avec les points des succès
      return savedPoints ? parseInt(savedPoints, 10) : achievementPoints;
    }
    return achievementPoints;
  });

  const [transactions, setTransactions] = useState<PointTransaction[]>(() => {
    if (typeof window !== 'undefined') {
      const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (savedTransactions) {
        return JSON.parse(savedTransactions).map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp)
        }));
      }
    }
    return [];
  });

  const [lastDailyReward, setLastDailyReward] = useState<Date | null>(() => {
    if (typeof window !== 'undefined') {
      const savedDate = localStorage.getItem(STORAGE_KEYS.LAST_DAILY_REWARD);
      return savedDate ? new Date(savedDate) : null;
    }
    return null;
  });

  // Sauvegarder les points dans le localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.POINTS, points.toString());
    }
  }, [points]);

  // Sauvegarder les transactions dans le localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    }
  }, [transactions]);

  // Sauvegarder la date de dernière récompense dans le localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && lastDailyReward) {
      localStorage.setItem(STORAGE_KEYS.LAST_DAILY_REWARD, lastDailyReward.toISOString());
    }
  }, [lastDailyReward]);

  // Mettre à jour les points quand les succès changent
  useEffect(() => {
    const savedPoints = localStorage.getItem(STORAGE_KEYS.POINTS);
    const currentPoints = savedPoints ? parseInt(savedPoints, 10) : 0;
    const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const transactions = savedTransactions ? JSON.parse(savedTransactions) : [];
    
    // Vérifier si nous avons déjà enregistré une transaction pour ces points de succès
    const hasAchievementTransaction = transactions.some(
      (t: PointTransaction) => t.category === 'achievement' && t.amount === achievementPoints
    );

    // Si pas de transaction pour ces points de succès, les ajouter
    if (!hasAchievementTransaction && achievementPoints > 0) {
      const newTransaction: PointTransaction = {
        id: crypto.randomUUID(),
        amount: achievementPoints,
        type: 'earned',
        description: 'Points des succès',
        timestamp: new Date(),
        category: 'achievement'
      };

      setTransactions(prev => [newTransaction, ...prev]);
      setPoints(currentPoints + achievementPoints);
    }
  }, [achievementPoints]);

  // Vérifier la récompense quotidienne
  useEffect(() => {
    const checkDailyReward = () => {
      const now = new Date();
      const last = lastDailyReward;
      
      if (!last || (now.getTime() - last.getTime()) >= 24 * 60 * 60 * 1000) {
        addPoints(10, 'Récompense quotidienne', 'daily');
        setLastDailyReward(now);
        addNotification({
          type: 'success',
          title: 'Points quotidiens',
          message: 'Vous avez reçu 10 points de récompense quotidienne !',
          action: 'daily_points'
        });
      }
    };

    checkDailyReward();
    const interval = setInterval(checkDailyReward, 60 * 60 * 1000); // Vérifier toutes les heures
    return () => clearInterval(interval);
  }, []);

  const addPoints = (amount: number, description: string, category: PointTransaction['category']) => {
    const newTransaction: PointTransaction = {
      id: crypto.randomUUID(),
      amount,
      type: 'earned',
      description,
      timestamp: new Date(),
      category
    };

    setPoints(prev => prev + amount);
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const spendPoints = (amount: number, description: string, category: PointTransaction['category']): boolean => {
    if (points < amount) {
      addNotification({
        type: 'error',
        title: 'Points insuffisants',
        message: `Vous n'avez pas assez de points pour cette action (${amount} points nécessaires)`,
        action: 'insufficient_points'
      });
      return false;
    }

    const newTransaction: PointTransaction = {
      id: crypto.randomUUID(),
      amount,
      type: 'spent',
      description,
      timestamp: new Date(),
      category
    };

    setPoints(prev => prev - amount);
    setTransactions(prev => [newTransaction, ...prev]);
    
    addNotification({
      type: 'info',
      title: 'Points dépensés',
      message: `${amount} points ont été dépensés pour : ${description}`,
      action: 'points_spent'
    });

    return true;
  };

  const canAfford = (amount: number): boolean => {
    return points >= amount;
  };

  const getLastDailyReward = (): Date | null => {
    return lastDailyReward;
  };

  return (
    <PointsContext.Provider
      value={{
        points,
        transactions,
        addPoints,
        spendPoints,
        canAfford,
        getLastDailyReward
      }}
    >
      {children}
    </PointsContext.Provider>
  );
} 