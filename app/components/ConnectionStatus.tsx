'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useConnection } from '../context/ConnectionContext';

export default function ConnectionStatus() {
  const { 
    isOnline, 
    isPendingSync, 
    synchronizeNotes, 
    pendingChangesCount,
    syncMode,
    setSyncMode
  } = useConnection();
  
  return (
    <div className="flex items-center">
      {/* Indicateur de statut de connexion */}
      <div className="flex items-center">
        <motion.div 
          className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
          animate={isOnline ? 
            { scale: [1, 1.2, 1], opacity: [1, 0.8, 1] } : 
            { scale: 1, opacity: 0.8 }
          }
          transition={isOnline ? { 
            duration: 2, 
            repeat: Infinity,
            repeatType: 'loop',
          } : { duration: 0.5 }}
        />
        <span className="ml-1.5 text-xs text-white/80 hidden md:inline">
          {isOnline ? 'En ligne' : 'Hors ligne'}
        </span>
      </div>
      
      {/* Badge pour indiquer le nombre de changements en attente */}
      {pendingChangesCount > 0 && (
        <div className="ml-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 
                      text-xs px-1 py-0.5 rounded-full font-medium">
          {pendingChangesCount}
        </div>
      )}
      
      {/* Bouton pour synchroniser manuellement */}
      {isOnline && pendingChangesCount > 0 && (
        <motion.button
          onClick={synchronizeNotes}
          disabled={isPendingSync}
          className={`ml-1.5 flex items-center text-xs p-1 rounded-md ${
            isPendingSync ? 
            'bg-gray-100/30 text-white/60' : 
            'bg-blue-500/40 text-white hover:bg-blue-500/60'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={!isPendingSync ? { scale: 1.05 } : {}}
          whileTap={!isPendingSync ? { scale: 0.95 } : {}}
        >
          {isPendingSync ? (
            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
        </motion.button>
      )}
      
      {/* Sélecteur de mode de synchronisation - simplifié en icône seulement */}
      <div className="relative ml-1.5 group">
        <button 
          className="text-white/80 hover:text-white focus:outline-none"
          title={syncMode === 'auto' ? 'Synchronisation automatique' : 'Synchronisation manuelle'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
          </svg>
        </button>
        
        <div className="absolute right-0 mt-2 py-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
          <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            Mode de synchronisation
          </div>
          <button
            onClick={() => setSyncMode('auto')}
            className={`flex items-center w-full px-4 py-2 text-sm ${
              syncMode === 'auto' 
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${syncMode === 'auto' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Automatique
          </button>
          <button
            onClick={() => setSyncMode('manual')}
            className={`flex items-center w-full px-4 py-2 text-sm ${
              syncMode === 'manual' 
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${syncMode === 'manual' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v7l4 4M12 5a8 8 0 100 16 8 8 0 000-16z" />
            </svg>
            Manuel
          </button>
        </div>
      </div>
    </div>
  );
} 