// Types pour les catégories
export type Category = 
  | 'ecriture'
  | 'exploration'
  | 'collection'
  | 'maitrise'
  | 'social'
  | 'innovation'
  | 'lecture'
  | 'personnalisation'
  | 'memoire';

// Types pour les raretés
export type Rarity = 'commun' | 'rare' | 'epique' | 'legendaire';

// Interface pour une note
export interface Note {
  id: string;
  title: string;
  content: string;
  category: Category;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  isFavorite: boolean;
  isEncrypted: boolean;
}

// Catégories disponibles avec leurs descriptions
export const categories: Record<Category, { title: string; description: string; icon: string }> = {
  'ecriture': {
    title: 'Écriture',
    description: 'Notes de texte, idées et créations écrites',
    icon: '✍️'
  },
  'exploration': {
    title: 'Exploration',
    description: 'Découvertes, recherches et expérimentations',
    icon: '🔍'
  },
  'collection': {
    title: 'Collection',
    description: 'Collections, listes et compilations',
    icon: '📚'
  },
  'maitrise': {
    title: 'Maîtrise',
    description: 'Compétences, apprentissages et expertises',
    icon: '🎯'
  },
  'social': {
    title: 'Social',
    description: 'Interactions, collaborations et partages',
    icon: '👥'
  },
  'innovation': {
    title: 'Innovation',
    description: 'Nouvelles idées et améliorations',
    icon: '💡'
  },
  'lecture': {
    title: 'Lecture',
    description: 'Notes de lecture et résumés',
    icon: '📖'
  },
  'personnalisation': {
    title: 'Personnalisation',
    description: 'Thèmes et personnalisations',
    icon: '🎨'
  },
  'memoire': {
    title: 'Mémoire',
    description: 'Notes sécurisées et cryptées',
    icon: '🔐'
  }
};

// Raretés disponibles avec leurs descriptions
export const rarities: Record<Rarity, { title: string; description: string; minPoints: number }> = {
  'commun': {
    title: 'Commun',
    description: 'Succès faciles à obtenir',
    minPoints: 10
  },
  'rare': {
    title: 'Rare',
    description: 'Succès demandant de la persévérance',
    minPoints: 50
  },
  'epique': {
    title: 'Épique',
    description: 'Succès difficiles à obtenir',
    minPoints: 100
  },
  'legendaire': {
    title: 'Légendaire',
    description: 'Succès exceptionnels',
    minPoints: 200
  }
};

// Statistiques initiales
export const initialStats = {
  totalNotes: 0,
  notesByCategory: {} as Record<Category, number>,
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
  collaborativeProjects: 0,
  usersHelped: 0,
  thanksReceived: 0,
  memoryItems: 0,
  encryptedItems: 0,
  memoryCategories: 0,
  uniqueTags: 0,
  memoryStreak: 0
}; 