'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '../context/NotificationsContext';

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
  const { addNotification } = useNotifications();
  
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
  const [isConfirming, setIsConfirming] = useState(false);
  
  const handleConfirm = useCallback(() => {
    if (!isConfirming) {
      setIsConfirming(true);
      onConfirm();
      addNotification({
        type: 'success',
        action: 'note_deleted',
        title: 'Note supprimée',
        message: 'La note a été supprimée avec succès.'
      });
    }
  }, [onConfirm, addNotification, isConfirming]);
  
  useEffect(() => {
    if (!isOpen) {
      setIsConfirming(false);
      setCountdown(countdownDuration);
      return;
    }
    
    // Lancer le compte à rebours
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!isConfirming) {
            handleConfirm();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Nettoyer le timer
    return () => {
      clearInterval(timer);
    };
  }, [isOpen, countdownDuration, handleConfirm, isConfirming]);
  
  // Calculer le pourcentage pour la barre de progression
  const progressPercentage = (countdown / countdownDuration) * 100;

  if (!isOpen) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-96 overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            <span className="text-xs text-red-600 dark:text-red-400">
              {countdown}s
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mb-3">
            <div 
              className="bg-red-600 dark:bg-red-500 h-1 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded transition-colors focus:outline-none"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors focus:outline-none"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 