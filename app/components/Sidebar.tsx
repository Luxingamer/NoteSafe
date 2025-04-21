'use client';

import React, { useState } from 'react';
import { useNotes, NoteCategory } from '../context/NotesContext';

interface SidebarProps {
  activeCategory: NoteCategory | 'toutes';
  onSelectCategory: (category: NoteCategory | 'toutes') => void;
  onOpenSettings: () => void;
}

export default function Sidebar({ 
  activeCategory, 
  onSelectCategory, 
  onOpenSettings
}: SidebarProps) {
  // État de la barre latérale (ouverte/fermée)
  const [isOpen, setIsOpen] = useState(true);
  
  // Fonction pour déclencher les filtres de vue
  const triggerViewFilter = (view: 'all' | 'favorites' | 'archived' | 'recent') => {
    // Créer et déclencher un événement personnalisé avec la vue sélectionnée
    const event = new CustomEvent('filter-view', { 
      detail: { view } 
    });
    window.dispatchEvent(event);
  };
  
  // Fonction pour retourner à la page principale/accueil
  const goHome = () => {
    onSelectCategory('toutes');
    triggerViewFilter('all');
    
    // Notification de succès
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out';
    notification.textContent = 'Retour à l\'accueil';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 2000);
  };

  return (
    <>
      {/* Barre latérale */}
      <div className={`h-screen fixed top-0 left-0 bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 z-10 flex ${isOpen ? 'w-60' : 'w-16'}`}>
        <div className="flex flex-col w-full h-full">
          {/* Entête de la barre latérale */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            {isOpen && <h2 className="font-bold text-gray-800 dark:text-gray-200">Notes App</h2>}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              aria-label={isOpen ? "Réduire" : "Agrandir"}
            >
              {isOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
                </svg>
              )}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            {/* Menu principal */}
            <div className="px-3 mb-6">
              {/* Bouton Accueil */}
              <div 
                className={`flex items-center mb-2 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300`}
                onClick={goHome}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />
                </svg>
                {isOpen && <span className="ml-3">Accueil</span>}
              </div>
              
              {/* Section des filtres */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className={`text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2 ${!isOpen && 'hidden'}`}>
                  Filtres
                </h3>
                
                {/* Note récentes */}
                <div 
                  onClick={() => triggerViewFilter('recent')}
                  className="flex items-center mb-2 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M13 19C13 19.7 13.13 20.37 13.35 21H6.5C4.57 21 3 19.43 3 17.5V5C3 3.07 4.57 1.5 6.5 1.5H17.5C19.43 1.5 21 3.07 21 5V12.35C20.37 12.13 19.7 12 19 12V5C19 4.17 18.33 3.5 17.5 3.5H6.5C5.67 3.5 5 4.17 5 5V17.5C5 18.33 5.67 19 6.5 19H13M12 10L14.5 5H17L13.5 12H11V10H12M7 5H9.5V7H7V5M7 8H12V10H7V8M7 11H11V13H7V11M17 14H19V17H22V19H19V22H17V19H14V17H17V14Z" />
                  </svg>
                  {isOpen && <span className="ml-3">Notes récentes</span>}
                </div>
                
                {/* Notes archivées */}
                <div 
                  onClick={() => triggerViewFilter('archived')}
                  className="flex items-center mb-2 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M15,5H10V9H15V5M22,3V21H2V3H22M20,5H17V9H20V5M20,11H11V15H20V11M20,17H11V19H20V17M9,17H4V19H9V17M9,11H4V15H9V11M4,9H8V5H4V9Z" />
                  </svg>
                  {isOpen && <span className="ml-3">Notes archivées</span>}
                </div>
                
                {/* Notes favorites */}
                <div 
                  onClick={() => triggerViewFilter('favorites')}
                  className="flex items-center mb-2 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
                  </svg>
                  {isOpen && <span className="ml-3">Favoris</span>}
                </div>
              </div>
            </div>
          </div>
          
          {/* Pied de la barre latérale avec actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-col space-y-2">
              {/* Bouton de paramètres */}
              <button 
                onClick={onOpenSettings}
                className={`flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300`}
                aria-label="Paramètres"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
                </svg>
                {isOpen && <span className="ml-3">Paramètres</span>}
              </button>
              
              {/* Bouton d'importation */}
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('import-notes'))}
                className={`flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300`}
                aria-label="Importer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                </svg>
                {isOpen && <span className="ml-3">Importer</span>}
              </button>
              
              {/* Bouton d'exportation */}
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('export-notes'))}
                className={`flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300`}
                aria-label="Exporter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                </svg>
                {isOpen && <span className="ml-3">Exporter</span>}
              </button>
              
              {/* Bouton d'aide */}
              <button 
                className={`flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300`}
                aria-label="Aide"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" />
                </svg>
                {isOpen && <span className="ml-3">Aide</span>}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Barre supérieure fixe pour la recherche */}
      <div className="fixed top-0 left-0 w-full bg-white dark:bg-gray-800 shadow-md z-20 py-2 px-4 ml-16 md:ml-60 transition-all duration-300">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Recherche */}
          <form className="relative w-full max-w-lg">
            <input 
              type="text" 
              placeholder="Rechercher dans vos notes..." 
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                if (e.target.value.trim() && e.key === 'Enter') {
                  window.dispatchEvent(new CustomEvent('search-notes', { 
                    detail: { term: e.target.value.trim() } 
                  }));
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const target = e.target as HTMLInputElement;
                  if (target.value.trim()) {
                    window.dispatchEvent(new CustomEvent('search-notes', { 
                      detail: { term: target.value.trim() } 
                    }));
                  }
                }
              }}
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400"
              aria-label="Rechercher"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
              </svg>
            </button>
          </form>
          
          {/* Actions rapides */}
          <div className="flex items-center space-x-4">
            <button
              onClick={goHome}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              title="Accueil"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />
              </svg>
            </button>
            <button
              onClick={() => triggerViewFilter('favorites')}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              title="Favoris"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
              </svg>
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('create-note'))}
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
    </>
  );
} 