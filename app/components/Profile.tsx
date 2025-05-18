'use client';

import React, { useState, useEffect } from 'react';
import { useNotes } from '../context/NotesContext';
import { useSettings } from '../context/SettingsContext';
import { useUser, UserInfo } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import Auth from './Auth';

export default function Profile() {
  const { notes } = useNotes();
  const { settings } = useSettings();
  const { userInfo, updateUserInfo } = useUser();
  const { user, logout } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [tempUser, setTempUser] = useState<UserInfo>(userInfo);
  
  useEffect(() => {
    setTempUser(userInfo);
  }, [userInfo]);
  
  // Statistiques utilisateur
  const totalNotes = notes.length;
  const favoriteNotes = notes.filter(note => note.favorite).length;
  const archivedNotes = notes.filter(note => note.archived).length;
  const accountAge = userInfo.joined ? Math.floor((new Date().getTime() - userInfo.joined.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  
  // Générer les initiales
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Redirection ou mise à jour de l'interface si nécessaire
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };
  
  // Si l'utilisateur n'est pas connecté, afficher le composant d'authentification
  if (!user) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8">
        <Auth />
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-4xl space-y-6 animate-[fadeIn_0.4s_ease-out_forwards]">
      {/* Carte de profil principale */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transform hover:scale-[1.01] transition-all duration-300">
        <div className="relative h-32 bg-gradient-to-r from-violet-500 to-purple-500">
          <div className="absolute -bottom-12 left-8 flex items-end">
            {userInfo.avatar ? (
              <img 
                src={userInfo.avatar} 
                alt={userInfo.name} 
                className="w-24 h-24 rounded-xl border-4 border-white dark:border-gray-800 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white dark:border-gray-800 shadow-lg">
                {getInitials(userInfo.name)}
              </div>
            )}
          </div>
          <div className="absolute top-4 right-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors duration-200"
            >
              Se déconnecter
            </button>
          </div>
        </div>
        
        <div className="pt-16 px-8 pb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {userInfo.name}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Membre depuis {accountAge} jours
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Notes totales */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Notes totales</p>
              <h3 className="text-3xl font-bold mt-1">{totalNotes}</h3>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,10H19.5L14,4.5V10M5,3H15L21,9V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3M5,5V19H19V12H12V5H5Z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Notes favorites */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Favoris</p>
              <h3 className="text-3xl font-bold mt-1">{favoriteNotes}</h3>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Notes archivées */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100">Archives</p>
              <h3 className="text-3xl font-bold mt-1">{archivedNotes}</h3>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,3H21V7H3V3M4,8H20V21H4V8M9.5,11A0.5,0.5 0 0,0 9,11.5V13H15V11.5A0.5,0.5 0 0,0 14.5,11H9.5Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Carte des statistiques détaillées */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transform hover:scale-[1.01] transition-all duration-300">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Statistiques détaillées
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Distribution des catégories */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
              Distribution des catégories
            </h4>
            <div className="space-y-4">
              {Object.entries(
                notes.reduce((acc, note) => {
                  acc[note.category] = (acc[note.category] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([category, count]) => (
                <div key={category} className="relative">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-300">{category}</span>
                    <span className="text-gray-900 dark:text-white font-medium">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
                      style={{ width: `${(count / totalNotes) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activité récente */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
              Activité récente
            </h4>
            <div className="space-y-3">
              {notes
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5)
                .map(note => (
                  <div key={note.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className={`w-2 h-2 rounded-full ${
                      note.favorite ? 'bg-purple-500' : 
                      note.archived ? 'bg-amber-500' : 
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white truncate">
                        {note.content}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fonction pour déclencher la vue des paramètres
const triggerViewFilter = (view: string) => {
  const event = new CustomEvent('filter-view', { 
    detail: { view } 
  });
  window.dispatchEvent(event);
}; 