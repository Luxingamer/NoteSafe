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
  DAILY_REWARD: 50,  // Augmentation des points quotidiens
  STREAK_BONUS: 20,  // Bonus pour connexion consécutive
  FIRST_NOTE_OF_DAY: 15,  // Bonus pour la première note du jour
  LONG_NOTE_BONUS: 10,  // Bonus pour une note longue
  CATEGORY_BONUS: 5,  // Bonus pour utiliser une nouvelle catégorie
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

// Fonctions utilitaires
const isNewDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() !== date2.getFullYear() ||
    date1.getMonth() !== date2.getMonth() ||
    date1.getDate() !== date2.getDate()
  );
};

const calculateStreak = (): number => {
  const streakData = localStorage.getItem('streak');
  if (!streakData) return 1;

  try {
    const { count, lastLogin } = JSON.parse(streakData);
    const lastLoginDate = new Date(lastLogin);
    const now = new Date();

    // Si c'est un nouveau jour et la dernière connexion était hier
    if (isNewDay(lastLoginDate, now)) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastLoginDate.getDate() === yesterday.getDate()) {
        // Mettre à jour le streak
        const newCount = count + 1;
        localStorage.setItem('streak', JSON.stringify({
          count: newCount,
          lastLogin: now.toISOString()
        }));
        return newCount;
      } else {
        // Réinitialiser le streak si la dernière connexion n'était pas hier
        localStorage.setItem('streak', JSON.stringify({
          count: 1,
          lastLogin: now.toISOString()
        }));
        return 1;
      }
    }
    
    return count;
  } catch (error) {
    console.error('Erreur lors du calcul du streak:', error);
    return 1;
  }
};

const MAX_TRANSACTIONS = 10; // Limite maximale de transactions à conserver

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

  // Ajouter la récompense quotidienne
  useEffect(() => {
    const checkDailyReward = () => {
      const now = new Date();
      const lastReward = getLastDailyReward();
      
      if (!lastReward || isNewDay(lastReward, now)) {
        // Points quotidiens de base
        addPoints(POINT_COSTS.DAILY_REWARD, 'Récompense quotidienne', 'daily');
        
        // Bonus de streak si connexion consécutive
        const streak = calculateStreak();
        if (streak > 1) {
          addPoints(
            POINT_COSTS.STREAK_BONUS,
            `Bonus de connexion consécutive (${streak} jours)`,
            'daily'
          );
        }
        
        setLastDailyReward(now);
      }
    };

    checkDailyReward();
  }, []);  // Exécuter une seule fois au chargement

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
    setTransactions(prev => {
      const newTransactions = [newTransaction, ...prev];
      // Garder seulement les MAX_TRANSACTIONS plus récentes transactions
      return newTransactions.slice(0, MAX_TRANSACTIONS);
    });

    // Ajouter une notification pour tous les types de points SAUF daily
    // (la notification pour les points quotidiens est gérée directement dans le useEffect)
    if (category !== 'daily') {
      addNotification({
        type: 'success',
        title: 'Points gagnés',
        message: `Vous avez gagné ${amount} points pour : ${description}`,
        action: 'points_earned'
      });
    }
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
    setTransactions(prev => {
      const newTransactions = [newTransaction, ...prev];
      // Garder seulement les MAX_TRANSACTIONS plus récentes transactions
      return newTransactions.slice(0, MAX_TRANSACTIONS);
    });
    
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