'use client';

import React, { useState, useEffect } from 'react';
import { useAchievements, Achievement } from '../context/AchievementsContext';
import { categoryColors, rarityColors, CategoryColor, RarityColor, CategoryColors, RarityColors } from '../utils/colors';

// Couleurs pour les raretés des succès avec glow
interface RarityColorWithGlow extends RarityColor {
  glow: string;
}

type RarityColorsWithGlow = {
  [key: string]: RarityColorWithGlow;
};

const rarityColorsWithGlow: RarityColorsWithGlow = {
  'commun': {
    ...rarityColors['commun'],
    glow: 'shadow-blue-200 dark:shadow-blue-900/40'
  },
  'rare': {
    ...rarityColors['rare'],
    glow: 'shadow-purple-200 dark:shadow-purple-900/40'
  },
  'epique': {
    ...rarityColors['epique'],
    glow: 'shadow-pink-200 dark:shadow-pink-900/40'
  },
  'legendaire': {
    ...rarityColors['legendaire'],
    glow: 'shadow-amber-200 dark:shadow-amber-900/40'
  }
};

// Couleurs pour les catégories de succès
const categoryColorsLocal = {
  'écriture': {
    bg: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-800 dark:text-green-300',
    icon: '✍️'
  },
  'ecriture': {
    bg: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-800 dark:text-green-300',
    icon: '✍️'
  },
  'exploration': {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-800 dark:text-blue-300',
    icon: '🔍'
  },
  'collection': {
    bg: 'bg-violet-100 dark:bg-violet-900/20',
    text: 'text-violet-800 dark:text-violet-300',
    icon: '🗃️'
  },
  'maîtrise': {
    bg: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-800 dark:text-red-300',
    icon: '🏆'
  },
  'maitrise': {
    bg: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-800 dark:text-red-300',
    icon: '🏆'
  },
  'social': {
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    text: 'text-yellow-800 dark:text-yellow-300',
    icon: '👥'
  },
  'innovation': {
    bg: 'bg-cyan-100 dark:bg-cyan-900/20',
    text: 'text-cyan-800 dark:text-cyan-300',
    icon: '💡'
  },
  'lecture': {
    bg: 'bg-amber-100 dark:bg-amber-900/20',
    text: 'text-amber-800 dark:text-amber-300',
    icon: '📚'
  },
  'ia': {
    bg: 'bg-indigo-100 dark:bg-indigo-900/20',
    text: 'text-indigo-800 dark:text-indigo-300',
    icon: '🤖'
  },
  'personnalisation': {
    bg: 'bg-rose-100 dark:bg-rose-900/20',
    text: 'text-rose-800 dark:text-rose-300',
    icon: '🎨'
  },
  'memoire': {
    bg: 'bg-violet-100 dark:bg-violet-900/20',
    text: 'text-violet-800 dark:text-violet-300',
    icon: '🔐'
  }
};

// Composant de carte de succès
const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
  const { getProgress, getNextMilestone } = useAchievements();
  const progress = getProgress(achievement.id);
  const isUnlocked = achievement.unlockedAt !== undefined;
  const milestone = getNextMilestone(achievement.id);
  
  // Normaliser la catégorie et la rareté
  const normalizedCategory = achievement.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normalizedRarity = achievement.rarity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  const rarityColor = rarityColorsWithGlow[normalizedRarity] || rarityColorsWithGlow['commun'];
  const categoryColor = categoryColors[normalizedCategory] || {
    bg: 'bg-gray-100/20',
    text: 'text-gray-600 dark:text-gray-400',
    icon: '📋'
  };
  
  return (
    <div className={`rounded-xl p-6 transition-all duration-300 ${
      isUnlocked 
        ? `${rarityColor.bg} shadow-lg ${rarityColor.glow}`
        : 'bg-gray-100 dark:bg-gray-800/40'
    } border-2 ${
      isUnlocked 
        ? rarityColor.border
        : 'border-gray-300 dark:border-gray-700'
    } hover:shadow-xl hover:scale-[1.02] transform transition-all relative h-full`}>
      {/* Badge de rareté */}
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          isUnlocked 
            ? rarityColor.bg.replace('/20', '/40')
            : 'bg-gray-200 dark:bg-gray-700'
        } ${
          isUnlocked 
            ? rarityColor.text
            : 'text-gray-600 dark:text-gray-400'
        }`}>
          {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
        </span>
      </div>
      
      {/* Indicateur de catégorie */}
      <span className={`inline-block px-3 py-1 rounded-full text-sm ${categoryColor.bg} ${categoryColor.text} mb-4`}>
        {categoryColor.icon} {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
      </span>
      
      {/* Icône et titre */}
      <div className="flex flex-col mb-4">
        <span className="text-5xl mb-3">{achievement.icon}</span>
        <div>
          <h3 className={`text-xl font-bold ${
            isUnlocked 
              ? rarityColor.text
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {achievement.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {achievement.description}
          </p>
        </div>
      </div>
      
      {/* Barre de progression */}
      <div className="mt-6">
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${isUnlocked ? rarityColor.progress : 'bg-gray-400 dark:bg-gray-600'}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className={`${
            isUnlocked 
              ? rarityColor.text
              : 'text-gray-600 dark:text-gray-400'
          } font-medium`}>
            {progress}%
          </span>
          {isUnlocked ? (
            <span className="text-green-600 dark:text-green-400 font-medium">
              Débloqué le {achievement.unlockedAt?.toLocaleDateString()}
            </span>
          ) : (
            <span className="text-gray-600 dark:text-gray-400">
              Objectif: {milestone}
            </span>
          )}
        </div>
      </div>
      
      {/* Points de succès */}
      <div className={`mt-4 font-bold text-sm px-3 py-1.5 rounded-full inline-block ${
        isUnlocked 
          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
      }`}>
        {achievement.points} points
      </div>
    </div>
  );
};

// Type pour les statistiques
interface CategoryStats {
  total: number;
  unlocked: number;
}

// Type pour les statistiques par catégorie
type StatsByCategory = Record<string, CategoryStats>;

// Widget de statistiques de succès
const AchievementStats: React.FC = () => {
  const { achievements, unlockedAchievements, totalPoints } = useAchievements();
  
  // Calculer les statistiques par catégorie
  const statsByCategory: StatsByCategory = {
    'ecriture': { total: 0, unlocked: 0 },
    'exploration': { total: 0, unlocked: 0 },
    'collection': { total: 0, unlocked: 0 },
    'maitrise': { total: 0, unlocked: 0 },
    'social': { total: 0, unlocked: 0 },
    'innovation': { total: 0, unlocked: 0 },
    'lecture': { total: 0, unlocked: 0 },
    'ia': { total: 0, unlocked: 0 },
    'personnalisation': { total: 0, unlocked: 0 },
    'memoire': { total: 0, unlocked: 0 }
  };
  
  // Calculer les statistiques
  achievements.forEach(achievement => {
    const normalizedCategory = achievement.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Mettre à jour les stats de catégorie
    if (statsByCategory[normalizedCategory]) {
      statsByCategory[normalizedCategory].total += 1;
      if (achievement.unlockedAt) {
        statsByCategory[normalizedCategory].unlocked += 1;
      }
    }
  });
  
  // Pourcentage global de complétion
  const completionPercentage = Math.round((unlockedAchievements.length / achievements.length) * 100) || 0;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-2xl font-bold text-violet-600 dark:text-violet-400 mb-4">
        Tableau des Succès
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Progression globale */}
        <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-lg p-4 border border-violet-200 dark:border-violet-800">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-lg font-medium text-violet-700 dark:text-violet-300">Progression</h4>
            <span className="text-2xl font-bold text-violet-800 dark:text-violet-200">{completionPercentage}%</span>
          </div>
          
          <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {unlockedAchievements.length} sur {achievements.length} succès
            </span>
            <span className="font-bold text-yellow-600 dark:text-yellow-400 text-lg">
              {totalPoints} points
            </span>
          </div>
        </div>
      </div>
      
      {/* Progression par catégorie */}
      <div>
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
          Progression par catégorie
        </h4>
        
        <div className="space-y-4">
          {Object.entries(statsByCategory).map(([category, stats]) => {
            const percent = Math.round((stats.unlocked / (stats.total || 1)) * 100) || 0;
            // Normalisation robuste
            const normalizedCategory = category.toLowerCase().normalize('NFD').replace(/\u0300-\u036f/g, '');
            const catColor = categoryColorsLocal[category as keyof typeof categoryColorsLocal] || categoryColorsLocal[normalizedCategory as keyof typeof categoryColorsLocal];
            if (!catColor) {
              console.warn('Catégorie inconnue ou non mappée dans categoryColorsLocal:', { category, normalizedCategory });
            }
            const safeCatColor = catColor || { bg: 'bg-gray-200', text: 'text-gray-500', icon: '❓' };
            
            return (
              <div key={category} className="flex items-center gap-4">
                <div className="w-1/4 flex items-center">
                  <span className={`text-lg mr-2`}>{safeCatColor.icon}</span>
                  <span className={`${safeCatColor.text} font-medium`}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                </div>
                
                <div className="w-3/4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      {stats.unlocked}/{stats.total} succès
                    </span>
                    <span className="font-medium">
                      {percent}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${safeCatColor.bg.replace('bg-', 'bg-').replace('/20', '')}`} 
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Composant principal des succès
export default function Achievements() {
  const { achievements, unlockedAchievements, totalPoints } = useAchievements();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [activeRarity, setActiveRarity] = useState<string>('all');
  
  // Débogage - log des données reçues du contexte
  useEffect(() => {
    console.log('Composant Achievements - Données reçues:', { 
      achievementsCount: achievements.length, 
      unlockedCount: unlockedAchievements.length,
      totalPoints
    });
  }, [achievements, unlockedAchievements, totalPoints]);
  
  // Filtrer les succès en fonction des onglets actifs
  const filteredAchievements = achievements.filter(achievement => {
    if (activeTab !== 'all' && achievement.category !== activeTab) return false;
    if (activeRarity !== 'all' && achievement.rarity !== activeRarity) return false;
    return true;
  });
  
  // Liste des catégories pour les onglets
  const categories = ['all', 'écriture', 'exploration', 'collection', 'maîtrise', 'social', 'innovation', 'lecture', 'ia', 'personnalisation'];
  const rarities = ['all', 'commun', 'rare', 'épique', 'légendaire'];
  
  // Traduire les étiquettes des onglets
  const getTabLabel = (tab: string): string => {
    if (tab === 'all') return 'Tous';
    return tab.charAt(0).toUpperCase() + tab.slice(1);
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
          Succès & Récompenses
        </h1>
      </div>
      
      {/* Widget de statistiques */}
      <div className="mb-8">
        <AchievementStats />
      </div>
      
      {/* Filtres */}
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === category
                  ? category === 'all'
                    ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300'
                    : `${categoryColorsLocal[category as keyof typeof categoryColorsLocal]?.bg} ${categoryColorsLocal[category as keyof typeof categoryColorsLocal]?.text}`
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {category !== 'all' && categoryColorsLocal[category as keyof typeof categoryColorsLocal]?.icon} {getTabLabel(category)}
            </button>
          ))}
        </div>
        
        <div className="flex items-center">
          <label htmlFor="rarity-filter" className="mr-2 text-gray-700 dark:text-gray-300">Rareté:</label>
          <select
            id="rarity-filter"
            aria-label="Filtrer par rareté"
            value={activeRarity}
            onChange={(e) => setActiveRarity(e.target.value)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700"
          >
            {rarities.map(rarity => (
              <option key={rarity} value={rarity}>
                {rarity === 'all' ? 'Toutes raretés' : getTabLabel(rarity)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Liste des succès */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredAchievements.map(achievement => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
      
      {filteredAchievements.length === 0 && (
        <div className="text-center p-12 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-medium mb-2">Aucun succès trouvé</h3>
          <p>Aucun succès ne correspond aux filtres sélectionnés.</p>
        </div>
      )}
    </div>
  );
} 