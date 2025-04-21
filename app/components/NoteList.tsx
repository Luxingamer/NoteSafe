'use client';

import React, { useState, useEffect } from 'react';
import { useNotes, NoteCategory } from '../context/NotesContext';
import NoteItem from './NoteItem';

interface NoteListProps {
  categoryFilter?: NoteCategory | 'toutes';
  viewMode?: 'all' | 'favorites' | 'archived' | 'recent';
}

export default function NoteList({ 
  categoryFilter = 'toutes',
  viewMode = 'all' 
}: NoteListProps) {
  const { notes } = useNotes();
  const [filter, setFilter] = useState<'all' | 'favorites' | 'archived' | 'recent'>(viewMode);
  const [internalCategoryFilter, setInternalCategoryFilter] = useState<NoteCategory | 'toutes'>(categoryFilter);
  
  // Mettre à jour les filtres internes lorsque les props changent
  useEffect(() => {
    setInternalCategoryFilter(categoryFilter);
  }, [categoryFilter]);
  
  useEffect(() => {
    setFilter(viewMode);
  }, [viewMode]);

  // Filtrer les notes en fonction des filtres sélectionnés
  const filteredNotes = notes.filter(note => {
    // Filtre par mode de vue
    if (filter === 'favorites' && !note.favorite) {
      return false;
    }
    
    if (filter === 'archived' && !note.archived) {
      return false;
    }
    
    if (filter === 'all' && note.archived) {
      return false; // Ne pas afficher les notes archivées dans la vue normale
    }
    
    // Filtre pour les notes récentes (7 derniers jours)
    if (filter === 'recent') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      if (note.createdAt < sevenDaysAgo) {
        return false;
      }
    }
    
    // Ensuite par catégorie
    if (internalCategoryFilter !== 'toutes' && note.category !== internalCategoryFilter) {
      return false;
    }
    
    return true;
  });

  // Trier les notes (épinglées en premier, puis par date)
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    // Les notes épinglées toujours en premier
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Puis par date de création (la plus récente en premier)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Les catégories disponibles dans l'application
  const categories: NoteCategory[] = ['mot', 'phrase', 'idée', 'réflexion', 'histoire', 'note'];

  // Traduire les catégories pour l'affichage
  const getCategoryLabel = (cat: NoteCategory | 'toutes'): string => {
    if (cat === 'toutes') return 'Toutes les catégories';
    
    const translations: Record<NoteCategory, string> = {
      'mot': 'Mots',
      'phrase': 'Phrases',
      'idée': 'Idées',
      'réflexion': 'Réflexions',
      'histoire': 'Histoires',
      'note': 'Notes'
    };
    return translations[cat];
  };

  // Couleurs pour les catégories
  const getCategoryColor = (cat: NoteCategory): string => {
    const colors: Record<NoteCategory, string> = {
      'mot': 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300',
      'phrase': 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
      'idée': 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
      'réflexion': 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300',
      'histoire': 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300',
      'note': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
    };
    return colors[cat];
  };

  // Obtenir le titre de la section en fonction du mode de vue
  const getViewModeTitle = (): string => {
    switch (filter) {
      case 'favorites':
        return 'Notes favorites';
      case 'archived':
        return 'Notes archivées';
      case 'recent':
        return 'Notes récentes (7 derniers jours)';
      default:
        return internalCategoryFilter === 'toutes' 
          ? 'Toutes les notes' 
          : getCategoryLabel(internalCategoryFilter);
    }
  };

  return (
    <div className="w-full max-w-3xl">
      {/* Filtres principaux */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          {getViewModeTitle()}
        </h2>
        
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-gray-200'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'favorites'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-gray-200'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Favoris
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'archived'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-gray-200'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Archivées
          </button>
          <button
            onClick={() => setFilter('recent')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'recent'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-gray-200'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Récentes
          </button>
        </div>
      </div>

      {/* Filtres par catégorie - seulement affiché si on n'utilise pas la barre latérale */}
      {categoryFilter === 'toutes' && (
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Filtrer par catégorie</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setInternalCategoryFilter('toutes')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                internalCategoryFilter === 'toutes'
                  ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Toutes les catégories
            </button>
            
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setInternalCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  internalCategoryFilter === cat
                    ? getCategoryColor(cat) + ' shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {getCategoryLabel(cat)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Liste des notes */}
      {sortedNotes.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 fade-in bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          
          <p className="text-lg font-medium">Aucune note à afficher</p>
          <p className="mt-1">
            {filter === 'favorites' 
              ? "Marquez des notes comme favorites pour les retrouver ici." 
              : filter === 'archived' 
                ? "Les notes archivées apparaîtront ici."
                : filter === 'recent'
                  ? "Aucune note n'a été créée au cours des 7 derniers jours."
                  : internalCategoryFilter === 'toutes'
                    ? "Commencez par créer une note !"
                    : `Aucune note dans la catégorie "${getCategoryLabel(internalCategoryFilter as NoteCategory)}".`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedNotes.map((note, index) => (
            <div 
              key={note.id} 
              className="hover-lift transition-all" 
              style={{ 
                animationDelay: `${index * 50}ms`,
                animationName: 'fadeIn',
                animationDuration: '300ms',
                animationFillMode: 'forwards'
              }}
            >
              <NoteItem note={note} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 