'use client';

import React, { useState } from 'react';
import { useNotes, NoteCategory } from '../context/NotesContext';

interface TopBarProps {
  activeCategory: NoteCategory | 'toutes';
  onSelectCategory: (category: NoteCategory | 'toutes') => void;
  onOpenSettings: () => void;
  applyFormat: (format: string) => void;
  importNotes: () => void;
  exportNotes: () => void;
  searchNotes: (term: string) => void;
  goHome: () => void;
}

export default function TopBar({ 
  activeCategory, 
  onSelectCategory,
  onOpenSettings,
  applyFormat,
  importNotes,
  exportNotes,
  searchNotes,
  goHome
}: TopBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Fonction pour déclencher les filtres de vue
  const triggerViewFilter = (view: 'all' | 'favorites' | 'archived' | 'recent') => {
    // Créer et déclencher un événement personnalisé avec la vue sélectionnée
    const event = new CustomEvent('filter-view', { 
      detail: { view } 
    });
    window.dispatchEvent(event);
    // Fermer le menu après selection
    setMenuOpen(false);
  };
  
  // Créer une nouvelle note (focus sur le textarea)
  const createNote = () => {
    window.dispatchEvent(new CustomEvent('create-note'));
    setMenuOpen(false);
  };
  
  // Gérer la recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchNotes(searchTerm.trim());
      setMenuOpen(false);
    }
  };
  
  // Liste des catégories disponibles
  const categories: NoteCategory[] = ['mot', 'phrase', 'idée', 'réflexion', 'histoire', 'note'];

  // Traduire les catégories pour l'affichage
  const getCategoryLabel = (cat: NoteCategory): string => {
    const translations: Record<NoteCategory, string> = {
      'mot': 'Mot',
      'phrase': 'Phrase',
      'idée': 'Idée',
      'réflexion': 'Réflexion',
      'histoire': 'Histoire',
      'note': 'Note'
    };
    return translations[cat];
  };

  return (
    <>
      {/* Overlay pour mobile quand le menu est ouvert */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
    
      {/* Barre supérieure fixe */}
      <div className="fixed top-0 left-0 w-full bg-white dark:bg-gray-800 shadow-md z-20 py-2 px-4 transition-all duration-300">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center">
            {/* Logo et titre */}
            <button 
              onClick={goHome}
              className="flex items-center mr-4"
              title="Accueil"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-blue-600 dark:text-blue-400">
                <path d="M4,2H20A2,2 0 0,1 22,4V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V4A2,2 0 0,1 4,2M4,4V20H20V4H4M8,9H16V11H8V9M8,12H16V14H8V12M8,15H16V17H8V15M8,6H16V8H8V6Z" />
              </svg>
              <span className="font-bold text-gray-800 dark:text-gray-200 ml-2 hidden sm:inline">Notes App</span>
            </button>
            
            {/* Menu hamburger (mobile) */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 md:hidden"
              title="Menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />
              </svg>
            </button>
            
            {/* Menu catégories (bureau) */}
            <div className="hidden md:flex md:items-center md:ml-4 space-x-2">
              <button
                onClick={() => {
                  onSelectCategory('toutes');
                  triggerViewFilter('all');
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === 'toutes' && 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                } hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                Toutes
              </button>
              
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === cat && 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                  } hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300`}
                >
                  {getCategoryLabel(cat)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Recherche et Actions */}
          <div className="flex items-center space-x-2">
            {/* Formulaire de recherche */}
            <form className="relative hidden md:block" onSubmit={handleSearch}>
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="w-64 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400"
                title="Rechercher"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
                </svg>
              </button>
            </form>
            
            {/* Actions rapides */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => triggerViewFilter('favorites')}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hidden md:block"
                title="Favoris"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
                </svg>
              </button>
              <button
                onClick={() => triggerViewFilter('recent')}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hidden md:block"
                title="Récents"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3" />
                </svg>
              </button>
              <button
                onClick={onOpenSettings}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hidden md:block"
                title="Paramètres"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
                </svg>
              </button>
              <button
                onClick={createNote}
                className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                title="Nouvelle note"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Menu mobile déroulant */}
      {menuOpen && (
        <div className="fixed top-14 inset-x-0 bg-white dark:bg-gray-800 p-4 z-30 shadow-lg md:hidden">
          <div className="flex flex-col space-y-3">
            {/* Recherche mobile */}
            <form onSubmit={handleSearch} className="mb-2">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400"
                  title="Rechercher"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
                  </svg>
                </button>
              </div>
            </form>
            
            {/* Catégories */}
            <div className="px-2 py-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2">
                Catégories
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onSelectCategory('toutes');
                    triggerViewFilter('all');
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === 'toutes' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                  } hover:bg-gray-100 dark:hover:bg-gray-700`}
                >
                  Toutes
                </button>
                
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => onSelectCategory(cat)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeCategory === cat ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                    } hover:bg-gray-100 dark:hover:bg-gray-700`}
                  >
                    {getCategoryLabel(cat)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Filtres */}
            <div className="px-2 py-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2">
                Filtres
              </h3>
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={() => triggerViewFilter('recent')}
                  className="flex items-center px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-3">
                    <path d="M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3" />
                  </svg>
                  Notes récentes
                </button>
                <button 
                  onClick={() => triggerViewFilter('archived')}
                  className="flex items-center px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-3">
                    <path d="M15,5H10V9H15V5M22,3V21H2V3H22M20,5H17V9H20V5M20,11H11V15H20V11M20,17H11V19H20V17M9,17H4V19H9V17M9,11H4V15H9V11M4,9H8V5H4V9Z" />
                  </svg>
                  Notes archivées
                </button>
                <button 
                  onClick={() => triggerViewFilter('favorites')}
                  className="flex items-center px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-3">
                    <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
                  </svg>
                  Favoris
                </button>
              </div>
            </div>
            
            {/* Actions */}
            <div className="px-2 py-2">
              <h3 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2">
                Actions
              </h3>
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={importNotes}
                  className="flex items-center px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-3">
                    <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                  </svg>
                  Importer
                </button>
                <button 
                  onClick={exportNotes}
                  className="flex items-center px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-3">
                    <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                  </svg>
                  Exporter
                </button>
                <button 
                  onClick={onOpenSettings}
                  className="flex items-center px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-3">
                    <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
                  </svg>
                  Paramètres
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 