'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotes } from './NotesContext';
import { useUser } from './UserContext';
import { useNotifications } from './NotificationsContext';

// Type pour un succès
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (data: AchievementData) => boolean;
  unlockedAt?: Date;
  rarity: 'commun' | 'rare' | 'épique' | 'légendaire';
  category: 'écriture' | 'exploration' | 'collection' | 'maîtrise' | 'social' | 'innovation' | 'lecture' | 'personnalisation' | 'mémoire';
  points: number;
  requiresAuth: boolean;
}

// Types pour les données des succès
export interface AchievementData {
  totalNotes: number;
  notesByCategory: Record<string, number>;
  consecutiveDays: number;
  totalWords: number;
  totalCharacters: number;
  favorites: number;
  archived: number;
  streakDays: number;
  userDays: number;
  newFeaturesTried: number;
  customWorkflows: number;
  featureContributions: number;
  totalBookPages: number;
  totalBooks: number;
  dailyPagesRead: number;
  customThemes: number;
  categoriesCustomized: number;
  totalCustomizations: number;
  isAuthenticated: boolean;
  collaborativeProjects: number;
  usersHelped: number;
  thanksReceived: number;
  // Nouvelles propriétés pour la mémoire
  memoryItems: number;
  encryptedItems: number;
  memoryCategories: number;
  uniqueTags: number;
  memoryStreak: number;
}

// Type pour le contexte des succès
interface AchievementsContextType {
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  checkAchievements: () => void;
  getProgress: (achievementId: string) => number;
  getNextMilestone: (achievementId: string) => number;
  totalPoints: number;
}

// Création du contexte
const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined);

// Hook pour utiliser le contexte
export const useAchievements = (): AchievementsContextType => {
  const context = useContext(AchievementsContext);
  if (!context) {
    throw new Error('useAchievements doit être utilisé à l\'intérieur d\'un AchievementsProvider');
  }
  return context;
};

// Liste des succès disponibles
const achievementsList: Achievement[] = [
  // Succès d'écriture
  {
    id: 'first-note',
    title: 'Premier Pas',
    description: 'Créez votre première note',
    icon: '✍️',
    condition: (data) => data.totalNotes >= 1,
    rarity: 'commun',
    category: 'écriture',
    points: 10,
    requiresAuth: true
  },
  {
    id: 'note-master',
    title: 'Maître des Notes',
    description: 'Créez 500 notes',
    icon: '📝',
    condition: (data) => data.totalNotes >= 500,
    rarity: 'légendaire',
    category: 'écriture',
    points: 200,
    requiresAuth: true
  },
  
  // Succès d'exploration
  {
    id: 'category-explorer',
    title: 'Explorateur de Catégories',
    description: 'Utilisez toutes les catégories disponibles',
    icon: '🔍',
    condition: (data) => Object.keys(data.notesByCategory).length >= 5,
    rarity: 'rare',
    category: 'exploration',
    points: 50,
    requiresAuth: true
  },
  {
    id: 'feature-master',
    title: 'Maître des Fonctionnalités',
    description: 'Utilisez toutes les fonctionnalités avancées de l\'application',
    icon: '🎯',
    condition: (data) => data.newFeaturesTried >= 10,
    rarity: 'légendaire',
    category: 'exploration',
    points: 150,
    requiresAuth: true
  },

  // Succès de collection
  {
    id: 'collector-beginner',
    title: 'Collectionneur Débutant',
    description: 'Ajoutez 10 notes à vos favoris',
    icon: '⭐',
    condition: (data) => data.favorites >= 10,
    rarity: 'commun',
    category: 'collection',
    points: 20,
    requiresAuth: true
  },
  {
    id: 'master-collector',
    title: 'Collectionneur Suprême',
    description: 'Ajoutez 100 notes à vos favoris',
    icon: '🌟',
    condition: (data) => data.favorites >= 100,
    rarity: 'légendaire',
    category: 'collection',
    points: 180,
    requiresAuth: true
  },

  // Succès de maîtrise
  {
    id: 'word-count-master',
    title: 'Maître des Mots',
    description: 'Écrivez plus de 100 000 mots au total',
    icon: '📚',
    condition: (data) => data.totalWords >= 100000,
    rarity: 'légendaire',
    category: 'maîtrise',
    points: 250,
    requiresAuth: true
  },
  {
    id: 'daily-writer',
    title: 'Écrivain Quotidien',
    description: 'Écrivez des notes pendant 30 jours consécutifs',
    icon: '📅',
    condition: (data) => data.streakDays >= 30,
    rarity: 'épique',
    category: 'maîtrise',
    points: 150,
    requiresAuth: true
  },

  // Succès sociaux
  {
    id: 'first-login',
    title: 'Bienvenue !',
    description: 'Connectez-vous pour la première fois',
    icon: '👋',
    condition: (data) => data.isAuthenticated,
    rarity: 'commun',
    category: 'social',
    points: 10,
    requiresAuth: true
  },
  {
    id: 'community-leader',
    title: 'Leader Communautaire',
    description: 'Aidez 50 autres utilisateurs',
    icon: '👑',
    condition: (data) => data.usersHelped >= 50,
    rarity: 'légendaire',
    category: 'social',
    points: 300,
    requiresAuth: true
  },

  // Succès d'innovation
  {
    id: 'workflow-creator',
    title: 'Créateur de Workflow',
    description: 'Créez votre premier workflow personnalisé',
    icon: '⚡',
    condition: (data) => data.customWorkflows >= 1,
    rarity: 'rare',
    category: 'innovation',
    points: 80,
    requiresAuth: true
  },
  {
    id: 'innovation-master',
    title: 'Maître de l\'Innovation',
    description: 'Contribuez à 10 nouvelles fonctionnalités',
    icon: '🚀',
    condition: (data) => data.featureContributions >= 10,
    rarity: 'légendaire',
    category: 'innovation',
    points: 400,
    requiresAuth: true
  },

  // Succès de lecture
  {
    id: 'first-book',
    title: 'Premier Livre',
    description: 'Lisez votre premier livre en entier',
    icon: '📖',
    condition: (data) => data.totalBookPages >= 1,
    rarity: 'commun',
    category: 'lecture',
    points: 30,
    requiresAuth: true
  },
  {
    id: 'library-master',
    title: 'Maître de la Bibliothèque',
    description: 'Lisez 50 livres complets',
    icon: '📚',
    condition: (data) => data.totalBooks >= 50,
    rarity: 'légendaire',
    category: 'lecture',
    points: 500,
    requiresAuth: true
  },
  {
    id: 'speed-reader',
    title: 'Lecteur Rapide',
    description: 'Lisez 200 pages en une journée',
    icon: '⚡',
    condition: (data) => data.dailyPagesRead >= 200,
    rarity: 'épique',
    category: 'lecture',
    points: 150,
    requiresAuth: true
  },
  {
    id: 'book-worm',
    title: 'Dévoreur de Livres',
    description: 'Lisez 1000 pages au total',
    icon: '🐛',
    condition: (data) => data.totalBookPages >= 1000,
    rarity: 'légendaire',
    category: 'lecture',
    points: 300,
    requiresAuth: true
  },

  // Succès de personnalisation
  {
    id: 'theme-creator',
    title: 'Créateur de Thèmes',
    description: 'Créez votre premier thème personnalisé',
    icon: '🎨',
    condition: (data) => data.customThemes >= 1,
    rarity: 'commun',
    category: 'personnalisation',
    points: 40,
    requiresAuth: true
  },
  {
    id: 'customization-master',
    title: 'Maître de la Personnalisation',
    description: 'Créez 20 thèmes personnalisés et personnalisez toutes les catégories',
    icon: '🎭',
    condition: (data) => data.customThemes >= 20 && data.categoriesCustomized >= 10,
    rarity: 'légendaire',
    category: 'personnalisation',
    points: 350,
    requiresAuth: true
  },
  {
    id: 'style-master',
    title: 'Maître du Style',
    description: 'Créez 5 thèmes personnalisés',
    icon: '🎨',
    condition: (data) => data.customThemes >= 5,
    rarity: 'rare',
    category: 'personnalisation',
    points: 100,
    requiresAuth: true
  },
  {
    id: 'ultimate-customizer',
    title: 'Personnalisateur Ultime',
    description: 'Effectuez 100 personnalisations différentes',
    icon: '✨',
    condition: (data) => data.totalCustomizations >= 100,
    rarity: 'légendaire',
    category: 'personnalisation',
    points: 200,
    requiresAuth: true
  },

  // Succès de mémoire
  {
    id: 'memory-beginner',
    title: 'Gardien de Secrets',
    description: 'Ajoutez votre premier élément en mémoire',
    icon: '🔐',
    condition: (data) => data.memoryItems >= 1,
    rarity: 'commun',
    category: 'mémoire',
    points: 20,
    requiresAuth: true
  },
  {
    id: 'memory-collector',
    title: 'Collectionneur de Secrets',
    description: 'Stockez 50 éléments en mémoire',
    icon: '🗝️',
    condition: (data) => data.memoryItems >= 50,
    rarity: 'rare',
    category: 'mémoire',
    points: 100,
    requiresAuth: true
  },
  {
    id: 'memory-master',
    title: 'Maître de la Mémoire',
    description: 'Stockez 200 éléments en mémoire',
    icon: '🏆',
    condition: (data) => data.memoryItems >= 200,
    rarity: 'légendaire',
    category: 'mémoire',
    points: 300,
    requiresAuth: true
  },
  {
    id: 'encryption-expert',
    title: 'Expert en Chiffrement',
    description: 'Chiffrez 100 éléments en mémoire',
    icon: '🔒',
    condition: (data) => data.encryptedItems >= 100,
    rarity: 'épique',
    category: 'mémoire',
    points: 200,
    requiresAuth: true
  },
  {
    id: 'memory-organizer',
    title: 'Organisateur',
    description: 'Utilisez tous les types de mémoire disponibles',
    icon: '📋',
    condition: (data) => data.memoryCategories >= 7,
    rarity: 'rare',
    category: 'mémoire',
    points: 150,
    requiresAuth: true
  },
  {
    id: 'tag-master',
    title: 'Maître des Tags',
    description: 'Utilisez 50 tags différents pour organiser vos éléments',
    icon: '🏷️',
    condition: (data) => data.uniqueTags >= 50,
    rarity: 'épique',
    category: 'mémoire',
    points: 180,
    requiresAuth: true
  },
  {
    id: 'memory-streak',
    title: 'Mémoire Fidèle',
    description: 'Ajoutez des éléments en mémoire pendant 30 jours consécutifs',
    icon: '📅',
    condition: (data) => data.memoryStreak >= 30,
    rarity: 'légendaire',
    category: 'mémoire',
    points: 250,
    requiresAuth: true
  }
];

// Provider du contexte
export const AchievementsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { notes } = useNotes();
  const { userInfo } = useUser();
  const { addNotification } = useNotifications();
  const [achievements, setAchievements] = useState<Achievement[]>(achievementsList);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Charger les succès débloqués depuis localStorage
  useEffect(() => {
    try {
      const savedAchievements = localStorage.getItem('notesafe_achievements');
      if (savedAchievements) {
        const parsedAchievements = JSON.parse(savedAchievements);
        // Convertir les dates de string à Date
        parsedAchievements.forEach((achievement: Achievement) => {
          if (achievement.unlockedAt) {
            achievement.unlockedAt = new Date(achievement.unlockedAt);
          }
        });
        
        // Mettre à jour l'état local avec les succès débloqués
        setUnlockedAchievements(parsedAchievements);
        
        // Mettre à jour la liste complète des succès avec les dates de déblocage
        setAchievements(prev => {
          return prev.map(achievement => {
            const unlockedAchievement = parsedAchievements.find((a: Achievement) => a.id === achievement.id);
            if (unlockedAchievement) {
              return {
                ...achievement,
                unlockedAt: unlockedAchievement.unlockedAt
              };
            }
            return achievement;
          });
        });
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Erreur lors du chargement des succès:', error);
      setIsInitialized(true);
    }
  }, []);
  
  // Calculer les données pour vérifier les succès
  const calculateAchievementData = (): AchievementData => {
    return {
      totalNotes: 0,
      notesByCategory: {},
      consecutiveDays: 0,
      totalWords: 0,
      totalCharacters: 0,
      favorites: 0,
      archived: 0,
      streakDays: 0,
      userDays: 0,
      newFeaturesTried: 0,
      customWorkflows: 0,
      featureContributions: 0,
      totalBookPages: 0,
      totalBooks: 0,
      dailyPagesRead: 0,
      customThemes: 0,
      categoriesCustomized: 0,
      totalCustomizations: 0,
      isAuthenticated: false,
      collaborativeProjects: 0,
      usersHelped: 0,
      thanksReceived: 0,
      memoryItems: 0,
      encryptedItems: 0,
      memoryCategories: 0,
      uniqueTags: 0,
      memoryStreak: 0
    };
  };
  
  // Vérifier les succès
  const checkAchievements = () => {
    if (!isInitialized) return;
    
    const data = calculateAchievementData();
    
    // Vérifier chaque succès
    const newUnlockedAchievements: Achievement[] = [];
    
    achievements.forEach(achievement => {
      // Ne pas revérifier les succès déjà débloqués
      if (achievement.unlockedAt) return;
      
      // Cas spécial pour "Complétiste"
      if (achievement.id === 'completionist') {
        const unlockedCount = unlockedAchievements.length;
        const totalCount = achievements.length;
        const percentage = (unlockedCount / totalCount) * 100;
        
        if (percentage >= 85) {
          const updatedAchievement = {
            ...achievement,
            unlockedAt: new Date()
          };
          newUnlockedAchievements.push(updatedAchievement);
        }
        return;
      }
      
      // Vérifier la condition du succès
      if (achievement.condition(data)) {
        const updatedAchievement = {
          ...achievement,
          unlockedAt: new Date()
        };
        newUnlockedAchievements.push(updatedAchievement);
      }
    });
    
    // Mettre à jour la liste des succès débloqués
    if (newUnlockedAchievements.length > 0) {
      const updatedUnlockedAchievements = [...unlockedAchievements, ...newUnlockedAchievements];
      setUnlockedAchievements(updatedUnlockedAchievements);
      
      // Mettre à jour la liste complète des succès
      setAchievements(prev => {
        return prev.map(achievement => {
          const newlyUnlocked = newUnlockedAchievements.find(a => a.id === achievement.id);
          if (newlyUnlocked) {
            return {
              ...achievement,
              unlockedAt: newlyUnlocked.unlockedAt
            };
          }
          return achievement;
        });
      });
      
      // Sauvegarder dans localStorage
      localStorage.setItem('notesafe_achievements', JSON.stringify(updatedUnlockedAchievements));
      
      // Afficher une notification pour chaque succès débloqué
      newUnlockedAchievements.forEach(achievement => {
        addNotification({
          type: 'success',
          action: 'achievement_unlocked',
          title: achievement.title,
          message: achievement.description,
        });
      });
    }
  };
  
  // Calculer la progression pour un succès
  const getProgress = (achievementId: string): number => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return 0;
    
    const data = calculateAchievementData();
    
    // Cas spéciaux par type de succès
    switch (achievementId) {
      case 'first-note':
      case 'note-collector':
      case 'prolific-writer':
      case 'master-writer':
        const totalRequired = 
          achievementId === 'first-note' ? 1 :
          achievementId === 'note-collector' ? 25 :
          achievementId === 'prolific-writer' ? 100 : 250;
        return Math.min(100, Math.floor((data.totalNotes / totalRequired) * 100));
      
      case 'category-explorer':
        const categoriesUsed = Object.values(data.notesByCategory).filter(count => count > 0).length;
        return Math.min(100, Math.floor((categoriesUsed / 6) * 100));
      
      case 'consistent-writer':
      case 'dedicated-writer':
        const daysRequired = achievementId === 'consistent-writer' ? 7 : 30;
        return Math.min(100, Math.floor((data.consecutiveDays / daysRequired) * 100));
      
      case 'word-smith':
        return Math.min(100, Math.floor((data.totalWords / 10000) * 100));
      
      case 'favorite-collector':
        return Math.min(100, Math.floor((data.favorites / 20) * 100));
      
      case 'archivist':
        return Math.min(100, Math.floor((data.archived / 20) * 100));
      
      case 'completionist':
        const unlockedCount = unlockedAchievements.length;
        const totalCount = achievements.length;
        return Math.min(100, Math.floor((unlockedCount / totalCount) * 100));
      
      case 'idea-machine':
        return Math.min(100, Math.floor(((data.notesByCategory['idée'] || 0) / 35) * 100));
      
      case 'storyteller':
        return Math.min(100, Math.floor(((data.notesByCategory['histoire'] || 0) / 25) * 100));
      
      case 'night-owl':
        // Ce succès est binaire (0% ou 100%)
        return achievement.unlockedAt ? 100 : 0;
      
      case 'longterm-user':
        return Math.min(100, Math.floor((data.userDays / 90) * 100));
      
      case 'grand-master':
        return Math.min(100, Math.floor((data.totalNotes / 500) * 100));
      
      case 'iron-will':
        return Math.min(100, Math.floor((data.consecutiveDays / 100) * 100));
      
      case 'wordsmith-elite':
        return Math.min(100, Math.floor((data.totalWords / 50000) * 100));
      
      case 'category-master':
        const categories = ['mot', 'phrase', 'idée', 'réflexion', 'histoire', 'note'];
        const categoryCount = categories.filter(cat => data.notesByCategory[cat] && data.notesByCategory[cat] >= 15).length;
        return Math.min(100, Math.floor((categoryCount / 6) * 100));
      
      case 'year-long-journey':
        return Math.min(100, Math.floor((data.userDays / 365) * 100));
      
      case 'philosopher':
        return Math.min(100, Math.floor((data.notesByCategory['réflexion'] || 0) / 50 * 100));
      
      case 'polyglot':
        const languagesUsed = Object.keys(data.notesByCategory).filter(cat => cat.includes('langue')).length;
        return Math.min(100, Math.floor((languagesUsed / 5) * 100));
      
      case 'midnight-marathon':
        const midnightNotes = notes.filter(note => {
          const noteTime = new Date(note.createdAt).getTime();
          const midnight = new Date().setHours(0, 0, 0, 0);
          const morning = new Date().setHours(5, 0, 0, 0);
          return noteTime >= midnight && noteTime < morning;
        }).length;
        return Math.min(100, Math.floor((midnightNotes / 10) * 100));
      
      case 'perfect-streak':
        const streakDays = data.consecutiveDays;
        return Math.min(100, Math.floor((streakDays / 50) * 100));
      
      default:
        return 0;
    }
  };
  
  // Obtenir la prochaine étape pour un succès
  const getNextMilestone = (achievementId: string): number => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return 0;
    
    const data = calculateAchievementData();
    
    // Cas spéciaux par type de succès
    switch (achievementId) {
      case 'first-note':
        return 1;
      case 'note-collector':
        return 25;
      case 'prolific-writer':
        return 100;
      case 'master-writer':
        return 250;
      case 'grand-master':
        return 500;
      case 'category-explorer':
        return 6;
      case 'category-master':
        return 15;
      case 'consistent-writer':
        return 7;
      case 'dedicated-writer':
        return 30;
      case 'iron-will':
        return 100;
      case 'word-smith':
        return 10000;
      case 'wordsmith-elite':
        return 50000;
      case 'favorite-collector':
        return 20;
      case 'mega-collection':
        return 50;
      case 'archivist':
        return 20;
      case 'completionist':
        return Math.ceil(achievements.length * 0.85);
      case 'idea-machine':
        return 35;
      case 'storyteller':
        return 25;
      case 'philosopher':
        return 50;
      case 'night-owl':
        return 1;
      case 'midnight-marathon':
        return 10;
      case 'longterm-user':
        return 90;
      case 'year-long-journey':
        return 365;
      case 'polyglot':
        return 5;
      case 'perfect-streak':
        return 50;
      default:
        return 0;
    }
  };
  
  // Calculer le total des points
  const totalPoints = unlockedAchievements.reduce((acc, achievement) => acc + achievement.points, 0);
  
  // Débogage initial pour s'assurer que tout est chargé correctement
  useEffect(() => {
    if (isInitialized) {
      console.log('AchievementsContext initialisé:', {
        achievementsCount: achievements.length,
        unlockedCount: unlockedAchievements.length,
        notesCount: notes.length
      });
      checkAchievements();
    }
  }, [isInitialized]);
  
  // Vérifier les succès lorsque les notes changent ou les infos utilisateur changent
  useEffect(() => {
    if (isInitialized) {
      checkAchievements();
    }
  }, [notes, unlockedAchievements.length, userInfo, isInitialized]);
  
  return (
    <AchievementsContext.Provider
      value={{
        achievements,
        unlockedAchievements,
        checkAchievements,
        getProgress,
        getNextMilestone,
        totalPoints
      }}
    >
      {children}
    </AchievementsContext.Provider>
  );
}; 