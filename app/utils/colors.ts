// Types pour les couleurs
export interface CategoryColor {
  bg: string;
  text: string;
  icon: string;
}

export interface RarityColor {
  bg: string;
  text: string;
  border: string;
  progress: string;
}

export type CategoryColors = {
  [key: string]: CategoryColor;
};

export type RarityColors = {
  [key: string]: RarityColor;
};

// Définition des couleurs pour les catégories
export const categoryColors: CategoryColors = {
  'ecriture': {
    bg: 'bg-purple-100/20',
    text: 'text-purple-600 dark:text-purple-400',
    icon: '✍️'
  },
  'exploration': {
    bg: 'bg-blue-100/20',
    text: 'text-blue-600 dark:text-blue-400',
    icon: '🔍'
  },
  'collection': {
    bg: 'bg-green-100/20',
    text: 'text-green-600 dark:text-green-400',
    icon: '📚'
  },
  'maitrise': {
    bg: 'bg-yellow-100/20',
    text: 'text-yellow-600 dark:text-yellow-400',
    icon: '🎯'
  },
  'social': {
    bg: 'bg-pink-100/20',
    text: 'text-pink-600 dark:text-pink-400',
    icon: '👥'
  },
  'innovation': {
    bg: 'bg-indigo-100/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    icon: '💡'
  },
  'lecture': {
    bg: 'bg-amber-100/20',
    text: 'text-amber-600 dark:text-amber-400',
    icon: '📖'
  },
  'personnalisation': {
    bg: 'bg-rose-100/20',
    text: 'text-rose-600 dark:text-rose-400',
    icon: '🎨'
  },
  'memoire': {
    bg: 'bg-violet-100/20',
    text: 'text-violet-600 dark:text-violet-400',
    icon: '🔐'
  }
};

// Définition des couleurs pour les raretés
export const rarityColors: RarityColors = {
  'commun': {
    bg: 'bg-gray-100/20',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700',
    progress: 'bg-gray-500'
  },
  'rare': {
    bg: 'bg-blue-100/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-700',
    progress: 'bg-blue-500'
  },
  'epique': {
    bg: 'bg-purple-100/20',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-700',
    progress: 'bg-purple-500'
  },
  'legendaire': {
    bg: 'bg-yellow-100/20',
    text: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-700',
    progress: 'bg-yellow-500'
  }
}; 