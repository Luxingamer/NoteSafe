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
  const { user, logout, updateUserProfile } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [tempUser, setTempUser] = useState<UserInfo>(userInfo);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  useEffect(() => {
    setTempUser(userInfo);
    setNewDisplayName(user?.displayName || userInfo.name);
  }, [userInfo, user]);
  
  // Statistiques utilisateur
  const totalNotes = notes.length;
  const favoriteNotes = notes.filter(note => note.favorite).length;
  const archivedNotes = notes.filter(note => note.archived).length;
  const accountAge = userInfo.joined ? Math.floor((new Date().getTime() - userInfo.joined.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const userPoints = userInfo.points || 0;
  const userNotifications = userInfo.notifications || 0;
  
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
  
  const handleEditName = () => {
    setIsEditMode(true);
  };
  
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setNewDisplayName(user?.displayName || userInfo.name);
    setUpdateError(null);
  };
  
  const handleSaveName = async () => {
    if (!newDisplayName.trim()) {
      setUpdateError('Le nom ne peut pas être vide');
      return;
    }
    
    setIsUpdating(true);
    setUpdateError(null);
    
    try {
      await updateUserProfile(newDisplayName);
      // Mettre à jour également les infos utilisateur dans UserContext
      updateUserInfo({ 
        name: newDisplayName,
        firstName: newDisplayName.split(' ')[0] || newDisplayName,
        lastName: newDisplayName.split(' ').slice(1).join(' ') || ''
      });
      setIsEditMode(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du nom:', error);
      setUpdateError('Échec de la mise à jour du nom');
    } finally {
      setIsUpdating(false);
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
          <div className="flex justify-between items-start mb-2">
            <div>
              {isEditMode ? (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={newDisplayName}
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      className="text-lg font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 mr-2"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveName}
                        disabled={isUpdating}
                        className="text-sm bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-lg disabled:opacity-50"
                      >
                        {isUpdating ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                        className="text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-lg disabled:opacity-50"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                  {updateError && (
                    <p className="text-red-500 text-sm">{updateError}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mr-2">
                    {userInfo.name}
                  </h2>
                  <button
                    onClick={handleEditName}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                    </svg>
                  </button>
                </div>
              )}
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
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-[1.02] transition-all duration-300 hover:shadow-xl">
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

        {/* Points gagnés */}
        <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-[1.02] transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Points gagnés</p>
              <h3 className="text-3xl font-bold mt-1">{userPoints}</h3>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,8L10.67,8.09C9.81,7.07 7.4,4.5 5,4.5C5,4.5 3.03,7.46 4.96,11.41C4.19,12.5 4,14.15 4,16C4,20 9.97,20.16 12,20.16C14.03,20.16 20,20 20,16C20,14.15 19.81,12.5 19.04,11.41C20.97,7.46 19,4.5 19,4.5C16.6,4.5 14.19,7.07 13.33,8.09L12,8M6.13,13.22L6.16,12.5L5.64,11.97C5.02,10.97 4.53,8.14 9.97,7.46C12.95,7.12 15.09,11.79 11.71,11.82C9.55,11.85 8.54,10.24 7.83,8.77C6.91,11.01 11.16,14.53 10.41,16C10.24,16.37 9.55,16.76 9.46,17C8.34,17 7.56,14.71 9.13,14.62C10.94,14.5 11.95,17.39 12.11,17.97C12.33,17.97 12.63,17.97 13,18C13.15,17.67 14.08,14.6 15.86,14.62C17.5,14.62 16.5,17 15.38,17C15.38,16.71 14.5,16.24 14.5,16C14.07,15.06 17.31,11.24 17,8.74C16.41,10.04 15.41,11.83 13.21,11.83C9.7,11.83 12.09,7.11 15.11,7.42C20.43,8 20.15,10.97 19.54,11.98L19.03,12.5L19.13,13.22C21.2,18.85 11.6,18.85 6.13,13.22Z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-[1.02] transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100">Notifications</p>
              <h3 className="text-3xl font-bold mt-1">{userNotifications}</h3>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10,21H14A2,2 0 0,1 12,23A2,2 0 0,1 10,21M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M17,11A5,5 0 0,0 12,6A5,5 0 0,0 7,11V18H17V11M19.75,3.19L18.33,4.61C20.04,6.3 21,8.6 21,11H23C23,8.07 21.84,5.25 19.75,3.19M1,11H3C3,8.6 3.96,6.3 5.67,4.61L4.25,3.19C2.16,5.25 1,8.07 1,11Z" />
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