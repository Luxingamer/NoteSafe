'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useNotes, NoteCategory } from '../context/NotesContext';
import NoteItem from './NoteItem';

interface NoteListProps {
  categoryFilter?: NoteCategory | 'toutes';
  viewMode?: 'all' | 'favorites' | 'archived' | 'recent' | 'book' | 'ai' | 'notifications' | 'documentation' | 'trash';
}

export default function NoteList({ 
  categoryFilter = 'toutes',
  viewMode = 'all' 
}: NoteListProps) {
  const { notes, searchResults, searchTerm } = useNotes();
  const [internalCategoryFilter, setInternalCategoryFilter] = useState<NoteCategory | 'toutes'>(categoryFilter);
  
  // Fonction pour déclencher les filtres de vue
  const triggerViewFilter = (view: 'all' | 'favorites' | 'archived' | 'recent' | 'trash') => {
    // Créer et déclencher un événement personnalisé avec la vue sélectionnée
    const event = new CustomEvent('filter-view', { 
      detail: { view } 
    });
    window.dispatchEvent(event);
  };

  // Mettre à jour le filtre interne lorsque la prop change
  useEffect(() => {
    setInternalCategoryFilter(categoryFilter);
  }, [categoryFilter]);

  // Filtrer les notes en fonction de la catégorie et du mode de vue
  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // Filtrer par catégorie si une catégorie est sélectionnée
    if (internalCategoryFilter !== 'toutes') {
      filtered = filtered.filter(note => note.category === internalCategoryFilter);
    }

    // Filtrer selon le mode de vue
    switch (viewMode) {
      case 'favorites':
        filtered = filtered.filter(note => note.favorite && !note.inTrash);
        break;
      case 'archived':
        filtered = filtered.filter(note => note.archived && !note.inTrash);
        break;
      case 'recent':
        // Filtrer les notes des 7 derniers jours
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        filtered = filtered.filter(note => 
          new Date(note.createdAt) >= sevenDaysAgo && !note.inTrash && !note.archived
        );
        break;
      case 'trash':
        // Afficher uniquement les notes dans la corbeille
        filtered = filtered.filter(note => note.inTrash);
        break;
      default:
        // Par défaut, exclure les notes dans la corbeille et archivées
        filtered = filtered.filter(note => !note.inTrash && !note.archived);
    }

    return filtered;
  }, [notes, internalCategoryFilter, viewMode]);

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
    switch (viewMode) {
      case 'favorites':
        return 'Notes favorites';
      case 'archived':
        return 'Notes archivées';
      case 'recent':
        return 'Notes récentes (7 derniers jours)';
      case 'book':
        return 'Mode Livre';
      case 'ai':
        return 'Intelligence Artificielle';
      case 'notifications':
        return 'Notifications';
      case 'documentation':
        return 'Documentation';
      case 'trash':
        return 'Corbeille';
      default:
        return internalCategoryFilter === 'toutes' 
          ? 'Toutes les notes' 
          : getCategoryLabel(internalCategoryFilter as NoteCategory);
    }
  };

  return (
    <div className="w-full max-w-3xl">
      {/* Filtres principaux */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            {getViewModeTitle()}
          </h2>
          {searchResults && searchTerm && (
            <div className="mt-1 text-sm font-normal text-blue-800 dark:text-blue-300">
              Recherche: <span className="bg-blue-100 dark:bg-blue-900/30 py-0.5 px-2 rounded-full">"{searchTerm}"</span>
              <span className="ml-2">({searchResults.length} résultat{searchResults.length > 1 ? 's' : ''})</span>
            </div>
          )}
        </div>
        
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <button
            onClick={() => triggerViewFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'all'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-gray-200'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => triggerViewFilter('favorites')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'favorites'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-gray-200'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Favoris
          </button>
          <button
            onClick={() => triggerViewFilter('archived')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'archived'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-gray-200'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Archivées
          </button>
          <button
            onClick={() => triggerViewFilter('recent')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'recent'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-gray-200'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Récentes
          </button>
          <button
            onClick={() => triggerViewFilter('trash')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'trash'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-gray-200'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Corbeille
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
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 fade-in bg-gray-50 dark:bg-gray-800/50 rounded-lg view-transition-fade">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          
          <p className="text-lg font-medium">Aucune note à afficher</p>
          <p className="mt-1">
            {viewMode === 'favorites' 
              ? "Marquez des notes comme favorites pour les retrouver ici." 
              : viewMode === 'archived' 
                ? "Les notes archivées apparaîtront ici."
                : viewMode === 'recent'
                  ? "Aucune note n'a été créée au cours des 7 derniers jours."
                  : viewMode === 'trash'
                    ? "Aucune note dans la corbeille."
                    : internalCategoryFilter === 'toutes'
                      ? "Commencez par créer une note !"
                      : `Aucune note dans la catégorie "${getCategoryLabel(internalCategoryFilter as NoteCategory)}".`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4 mt-4">
          {sortedNotes.map((note, index) => (
            <div 
              key={note.id}
              className="note-item-enter scale-transition"
              style={{ 
                animationDelay: `${index * 0.05}s`,
                opacity: 0,
                animation: `noteEnter 0.3s ease-out ${index * 0.05}s forwards`
              }}
            >
              <NoteItem 
                note={note} 
                searchTerm={searchTerm}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 