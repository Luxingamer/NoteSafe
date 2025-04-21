'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn?: boolean;
}

export default function Settings({ isOpen, onClose, isLoggedIn = false }: SettingsProps) {
  const { logout } = useAuth();
  const [deleteDelay, setDeleteDelay] = useState(10);
  const [autoSave, setAutoSave] = useState(true);
  const [syncEnabled, setSyncEnabled] = useState(false);
  
  // Charger les paramètres depuis le localStorage
  useEffect(() => {
    if (isOpen) {
      const storedSettings = localStorage.getItem('notesAppSettings');
      if (storedSettings) {
        try {
          const settings = JSON.parse(storedSettings);
          setDeleteDelay(settings.deleteDelay || 10);
          setAutoSave(settings.autoSave !== undefined ? settings.autoSave : true);
          setSyncEnabled(settings.syncEnabled || false);
        } catch (e) {
          console.error('Erreur lors de la lecture des paramètres', e);
        }
      }
    }
  }, [isOpen]);
  
  const handleSaveSettings = () => {
    const settings = {
      deleteDelay,
      autoSave,
      syncEnabled
    };
    
    localStorage.setItem('notesAppSettings', JSON.stringify(settings));
    onClose();
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity">
      <div className="fade-in bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Paramètres
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              aria-label="Fermer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Comportement */}
            <section className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Comportement</h3>
              
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <label htmlFor="deleteDelayRange" className="text-gray-700 dark:text-gray-300">
                    Délai avant suppression (secondes)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      id="deleteDelayRange"
                      type="range"
                      min="3"
                      max="30"
                      value={deleteDelay}
                      onChange={(e) => setDeleteDelay(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      aria-label="Délai avant suppression en secondes"
                      title="Délai avant suppression en secondes"
                    />
                    <span className="text-gray-700 dark:text-gray-300 w-8 text-center">{deleteDelay}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label htmlFor="autoSaveToggle" className="text-gray-700 dark:text-gray-300">Sauvegarde automatique</label>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input 
                      id="autoSaveToggle"
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={autoSave}
                      onChange={() => setAutoSave(!autoSave)}
                      aria-label="Activer la sauvegarde automatique"
                      title="Activer la sauvegarde automatique"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Synchronisation */}
            <section className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Synchronisation</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="syncToggle" className="text-gray-700 dark:text-gray-300">Activer la synchronisation</label>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input 
                      id="syncToggle"
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={syncEnabled}
                      onChange={() => setSyncEnabled(!syncEnabled)}
                      disabled={!isLoggedIn}
                      aria-label="Activer la synchronisation"
                      title="Activer la synchronisation"
                    />
                    <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                  </div>
                </div>
                
                {!isLoggedIn && (
                  <div className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                    Vous devez être connecté pour activer la synchronisation.
                  </div>
                )}
                
                {isLoggedIn && (
                  <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-2 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-500">
                        <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">Connecté</span>
                    </div>
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors focus:outline-none"
                    >
                      Se déconnecter
                    </button>
                  </div>
                )}
                
                {!isLoggedIn && syncEnabled && (
                  <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-2 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-500">
                        <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">Non connecté</span>
                    </div>
                    
                    <button 
                      onClick={onClose}
                      className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors focus:outline-none"
                    >
                      Se connecter ou créer un compte
                    </button>
                  </div>
                )}
              </div>
            </section>
            
            {/* À propos */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">À propos</h3>
              <div className="text-gray-600 dark:text-gray-400">
                <p className="mb-2">Notes App v1.0.0</p>
                <p>Une application moderne pour prendre des notes et organiser vos idées.</p>
              </div>
            </section>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors focus:outline-none"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 