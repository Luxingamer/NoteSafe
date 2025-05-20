'use client';

import React, { useState } from 'react';
import { useNotes, NoteCategory } from '../context/NotesContext';
import { useUser } from '../context/UserContext';

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
  const { userInfo } = useUser();
  
  // Obtenir les initiales de l'utilisateur
  const getInitials = (name: string) => {
    if (!name) return ""; // Retourner une chaîne vide si name est undefined ou null
    return name.split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };
  
  // Fonction pour déclencher les filtres de vue
  const triggerViewFilter = (view: 'all' | 'favorites' | 'archived' | 'recent' | 'settings' | 'calendar' | 'statistics' | 'profile' | 'achievements') => {
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
    } else {
      // Si le champ est vide, réinitialiser la recherche
      searchNotes('');
    }
    setMenuOpen(false);
  };
  
  // Gérer la fermeture de la recherche
  const handleClearSearch = () => {
    setSearchTerm('');
    searchNotes('');
  };

  // Gérer le changement dans le champ de recherche
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Si le champ est vide, réinitialiser la recherche
    if (!value.trim()) {
      searchNotes('');
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

  // Couleurs pour les catégories
  const getCategoryColor = (cat: NoteCategory | 'toutes'): string => {
    const colors: Record<NoteCategory | 'toutes', string> = {
      'mot': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      'phrase': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      'idée': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      'réflexion': 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
      'histoire': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      'note': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300',
      'toutes': 'bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300'
    };
    return colors[cat];
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
      <div className="fixed top-0 left-0 w-full shadow-md z-20 py-2 px-4 transition-all duration-300"
           style={{ 
             background: `linear-gradient(to right, var(--topbar-gradient-from), var(--topbar-gradient-to))` 
           }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center">
            {/* Logo et titre */}
            <button 
              onClick={goHome}
              className="flex items-center mr-4"
              title="Accueil"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-yellow-300 dark:text-yellow-200">
                <path d="M4,2H20A2,2 0 0,1 22,4V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V4A2,2 0 0,1 4,2M4,4V20H20V4H4M8,9H16V11H8V9M8,12H16V14H8V12M8,15H16V17H8V15M8,6H16V8H8V6Z" />
              </svg>
              <span className="font-bold text-white ml-2 hidden sm:inline">NoteSafe</span>
            </button>
            
            {/* Menu hamburger (mobile) */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-md bg-white/20 hover:bg-white/30 text-white md:hidden"
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
                  activeCategory === 'toutes' 
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-white/80 hover:bg-white/10'
                }`}
              >
                Toutes
              </button>
              
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === cat 
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-white/80 hover:bg-white/10'
                  }`}
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
                className="w-64 bg-white/20 text-white rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/70"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <button 
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-8 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                  title="Effacer la recherche"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                  </svg>
                </button>
              )}
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white"
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
                className="p-2 rounded-full hover:bg-white/10 text-yellow-300 hidden md:block"
                title="Favoris"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
                </svg>
              </button>
              <button
                onClick={() => triggerViewFilter('recent')}
                className="p-2 rounded-full hover:bg-white/10 text-cyan-300 hidden md:block"
                title="Récents"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3" />
                </svg>
              </button>
              <button
                onClick={() => triggerViewFilter('calendar')}
                className="p-2 rounded-full hover:bg-white/10 text-orange-300 hidden md:block"
                title="Calendrier"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z" />
                </svg>
              </button>
              <button
                onClick={() => triggerViewFilter('statistics')}
                className="p-2 rounded-full hover:bg-white/10 text-pink-300 hidden md:block"
                title="Statistiques"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M19,3H5C3.9,3 3,3.9 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.9 20.1,3 19,3M9,17H7V10H9V17M13,17H11V7H13V17M17,17H15V13H17V17Z" />
                </svg>
              </button>

              <button
                onClick={() => triggerViewFilter('settings')}
                className="p-2 rounded-full hover:bg-white/10 text-green-300 hidden md:block"
                title="Paramètres"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
                </svg>
              </button>
              {/* Profil utilisateur réduit - remplace le bouton Nouvelle note */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center rounded-full bg-white/10 hover:bg-white/20 px-2 py-1 transition-all duration-200"
                  title="Profil utilisateur"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs mr-2">
                    {getInitials(userInfo.name)}
                  </div>
                  <span className="text-white text-sm hidden sm:inline font-medium mr-1">{userInfo.firstName} {userInfo.lastName && userInfo.lastName.charAt(0)}.</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white/70">
                    <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                  </svg>
                </button>

                {/* Menu déroulant du profil */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50">
                    {/* En-tête du profil */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {getInitials(userInfo.name)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{userInfo.firstName} {userInfo.lastName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{userInfo.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Options du menu */}
                    <div className="py-1">
                      <button
                        onClick={() => triggerViewFilter('profile')}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-3 text-blue-500">
                          <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                        </svg>
                        Mon Profil
                      </button>
                      <button
                        onClick={() => triggerViewFilter('achievements')}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-3 text-yellow-500">
                          <path d="M20,2H4V4L9.81,8.36C6.81,8.23 4,10.82 4,14A6,6 0 0,0 10,20C13.18,20 15.77,17.19 15.64,14.19L20,10V12H22V2H20M10,18A4,4 0 0,1 6,14C6,12.5 6.62,11.1 7.64,10.1L9.64,12.1C9.89,12.35 10.09,12.64 10.25,12.95C10.5,13.45 10.63,14 10.63,14.57C10.62,15.79 10,16.89 9,17.5V18H10Z" />
                        </svg>
                        Mes Succès
                      </button>
                      <button
                        onClick={() => triggerViewFilter('statistics')}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-3 text-green-500">
                          <path d="M19,3H5C3.9,3 3,3.9 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.9 20.1,3 19,3M9,17H7V10H9V17M13,17H11V7H13V17M17,17H15V13H17V17Z" />
                        </svg>
                        Statistiques
                      </button>
                      <button
                        onClick={() => triggerViewFilter('settings')}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-3 text-gray-500">
                          <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
                        </svg>
                        Paramètres
                      </button>
                    </div>

                    {/* Séparateur */}
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                    {/* Actions */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          // Déconnexion
                          window.dispatchEvent(new CustomEvent('logout'));
                          setMenuOpen(false);
                        }}
                        className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-3">
                          <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
                        </svg>
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Menu mobile déroulant */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full md:hidden bg-white dark:bg-gray-800 shadow-lg rounded-b-lg z-40">
          {/* Formulaire de recherche pour mobile */}
          <form className="p-4 border-b border-gray-200 dark:border-gray-700" onSubmit={handleSearch}>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={handleSearchChange}
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
              </div>
            </form>
            
          {/* Options du menu */}
          <div className="p-4">
            {/* Catégories */}
            <div className="mb-4">
              <h3 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2">Catégories</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onSelectCategory('toutes');
                    triggerViewFilter('all');
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    activeCategory === 'toutes' 
                    ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Toutes
                </button>
                
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => onSelectCategory(cat)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      activeCategory === cat 
                      ? getCategoryColor(cat)
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {getCategoryLabel(cat)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Actions principales */}
            <div className="mb-4">
              <h3 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2">Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => triggerViewFilter('favorites')}
                  className="flex items-center px-3 py-2 rounded-lg text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 w-full hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-3 text-yellow-500">
                    <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
                  </svg>
                  Favoris
                </button>
                <button 
                  onClick={() => triggerViewFilter('recent')}
                  className="flex items-center px-3 py-2 rounded-lg text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 w-full hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-3 text-cyan-500">
                    <path d="M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3" />
                  </svg>
                  Récents
                </button>
                <button 
                  onClick={() => triggerViewFilter('archived')}
                  className="flex items-center px-3 py-2 rounded-lg text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 w-full hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-3 text-amber-500">
                    <path d="M3,3H21V7H3V3M4,8H20V21H4V8M9.5,11A0.5,0.5 0 0,0 9,11.5V13H15V11.5A0.5,0.5 0 0,0 14.5,11H9.5Z" />
                  </svg>
                  Archives
                </button>
                <button 
                  onClick={createNote}
                  className="flex items-center px-3 py-2 rounded-lg text-white bg-blue-500 hover:bg-blue-600 w-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-3">
                    <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                  </svg>
                  Nouvelle note
                </button>
              </div>
            </div>
            
            {/* Sections secondaires */}
            <div>
              <h3 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2">Sections</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => triggerViewFilter('calendar')}
                  className="flex items-center px-3 py-2 rounded-lg text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 w-full hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-3 text-orange-500">
                    <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z" />
                  </svg>
                  Calendrier
                </button>
                <button 
                  onClick={() => triggerViewFilter('statistics')}
                  className="flex items-center px-3 py-2 rounded-lg text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 w-full hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-3 text-pink-500">
                    <path d="M19,3H5C3.9,3 3,3.9 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.9 20.1,3 19,3M9,17H7V10H9V17M13,17H11V7H13V17M17,17H15V13H17V17Z" />
                  </svg>
                  Statistiques
                </button>

                <button 
                  onClick={() => triggerViewFilter('profile')}
                  className="flex items-center px-3 py-2 rounded-lg text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 w-full hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-3 text-blue-500">
                    <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                  </svg>
                  Profil
                </button>
                <button 
                  onClick={() => triggerViewFilter('settings')}
                  className="flex items-center px-3 py-2 rounded-lg text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 w-full hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-3 text-green-500">
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