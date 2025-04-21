'use client';

import React, { useState, useEffect } from 'react';

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  countdownDuration?: number;
}

export default function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmation de suppression",
  message = "Êtes-vous sûr de vouloir supprimer cette note ? Cette action est irréversible.",
  countdownDuration: propCountdownDuration
}: DeleteConfirmationProps) {
  // Essayer de récupérer le délai depuis localStorage, sinon utiliser la prop ou la valeur par défaut (10s)
  const getStoredDeleteDelay = (): number => {
    try {
      const storedSettings = localStorage.getItem('notesAppSettings');
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        if (settings.deleteDelay && typeof settings.deleteDelay === 'number') {
          return settings.deleteDelay;
        }
      }
    } catch (e) {
      console.error('Erreur lors de la lecture du délai de suppression', e);
    }
    return propCountdownDuration || 10;
  };

  const [countdownDuration] = useState(getStoredDeleteDelay());
  const [countdown, setCountdown] = useState(countdownDuration);
  
  useEffect(() => {
    if (!isOpen) return;
    
    // Réinitialiser le compte à rebours
    setCountdown(countdownDuration);
    
    // Lancer le compte à rebours
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onConfirm();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Nettoyer le timer si le composant est démonté ou si la popup est fermée
    return () => clearInterval(timer);
  }, [isOpen, onConfirm, countdownDuration]);
  
  // Calculer le pourcentage pour la barre de progression
  const progressPercentage = (countdown / countdownDuration) * 100;
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity">
      <div className="fade-in bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {message}
          </p>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-red-600 dark:text-red-400 font-medium">
              Suppression automatique dans {countdown} secondes
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
            <div 
              className="bg-red-600 dark:bg-red-500 h-2.5 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors focus:outline-none"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors focus:outline-none"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 