'use client';

import React from 'react';
import { useAchievements } from '../context/AchievementsContext';
import { categoryColors, rarityColors } from '../utils/colors';
import { categories, rarities, Category, Rarity } from '../utils/archivestart';

const AchievementStats: React.FC = () => {
  const { achievements, unlockedAchievements, totalPoints } = useAchievements();
  
  // Initialiser toutes les catégories possibles
  const statsByCategory: Record<Category, { total: number, unlocked: number }> = {
    'ecriture': { total: 0, unlocked: 0 },
    'exploration': { total: 0, unlocked: 0 },
    'collection': { total: 0, unlocked: 0 },
    'maitrise': { total: 0, unlocked: 0 },
    'social': { total: 0, unlocked: 0 },
    'innovation': { total: 0, unlocked: 0 },
    'lecture': { total: 0, unlocked: 0 },
    'personnalisation': { total: 0, unlocked: 0 },
    'memoire': { total: 0, unlocked: 0 }
  };
  
  // Initialiser toutes les raretés possibles
  const statsByRarity: Record<Rarity, { total: number, unlocked: number }> = {
    'commun': { total: 0, unlocked: 0 },
    'rare': { total: 0, unlocked: 0 },
    'epique': { total: 0, unlocked: 0 },
    'legendaire': { total: 0, unlocked: 0 }
  };
  
  // Calculer les statistiques
  achievements.forEach(achievement => {
    // Normaliser la catégorie et la rareté
    const normalizedCategory = achievement.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') as Category;
    const normalizedRarity = achievement.rarity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') as Rarity;
    
    // Mettre à jour les stats de catégorie
    if (statsByCategory[normalizedCategory]) {
      statsByCategory[normalizedCategory].total += 1;
      if (achievement.unlockedAt) {
        statsByCategory[normalizedCategory].unlocked += 1;
      }
    }
    
    // Mettre à jour les stats de rareté
    if (statsByRarity[normalizedRarity]) {
      statsByRarity[normalizedRarity].total += 1;
      if (achievement.unlockedAt) {
        statsByRarity[normalizedRarity].unlocked += 1;
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
        
        {/* Points par rareté */}
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(statsByRarity).map(([rarity, stats]) => {
            const rarityColor = rarityColors[rarity as Rarity];
            const percent = Math.round((stats.unlocked / (stats.total || 1)) * 100) || 0;
            const rarityInfo = rarities[rarity as Rarity];
            
            return (
              <div key={rarity} className={`rounded-lg p-3 ${rarityColor.bg} border ${rarityColor.border}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-medium ${rarityColor.text}`}>
                    {rarityInfo.title}
                  </span>
                  <span className={`text-sm ${rarityColor.text}`}>
                    {stats.unlocked}/{stats.total}
                  </span>
                </div>
                <div className="w-full h-2 bg-white/50 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${rarityColor.progress}`} 
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
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
            // Always use the normalized (non-accented) key for lookup
            const normalizedCategory = category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const catInfo = categories[normalizedCategory as Category];
            const catColor = categoryColors[normalizedCategory as Category];
            if (!catInfo || !catColor) {
              console.warn('Catégorie inconnue ou non mappée:', { category, normalizedCategory, catInfo, catColor });
            }
            // Fallbacks robustes
            const safeCatInfo = catInfo || { icon: '❓', title: category };
            const safeCatColor = catColor || { bg: 'bg-gray-200', text: 'text-gray-500', icon: '❓' };
            
            return (
              <div key={category} className="flex items-center gap-4">
                <div className="w-1/4 flex items-center">
                  <span className={`text-lg mr-2`}>{safeCatInfo.icon}</span>
                  <span className={`${safeCatColor.text} font-medium`}>
                    {safeCatInfo.title}
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

export default AchievementStats; 