'use client';

import React, { useEffect, useState } from 'react';
import { NotificationType } from '../context/NotificationsContext';

interface ToastProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  onClose: () => void;
}

export default function Toast({ id, type, title, message, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Montrer le toast après un court délai pour permettre l'animation d'entrée
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Commencer la séquence de fermeture après 5 secondes
    const hideTimer = setTimeout(() => {
      handleClose();
    }, 5000);

    // Nettoyer les timers si le composant est démonté
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    // Attendre que l'animation de sortie soit terminée avant d'appeler onClose
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  const getBackgroundColor = (type: NotificationType) => {
    switch (type) {
      case 'success': return 'bg-green-50 dark:bg-green-900/20';
      case 'info': return 'bg-blue-50 dark:bg-blue-900/20';
      case 'warning': return 'bg-amber-50 dark:bg-amber-900/20';
      case 'error': return 'bg-red-50 dark:bg-red-900/20';
      default: return 'bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getIcon = (type: NotificationType) => {
    const iconColor = {
      success: 'text-green-500 dark:text-green-300',
      info: 'text-blue-500 dark:text-blue-300',
      warning: 'text-amber-500 dark:text-amber-300',
      error: 'text-red-500 dark:text-red-300',
    }[type];

    const icons = {
      success: 'M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z',
      info: 'M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z',
      warning: 'M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z',
      error: 'M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z',
    };

    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconColor}`}>
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d={icons[type]} />
        </svg>
      </div>
    );
  };

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out
        ${isVisible ? 'notification-enter' : 'translate-y-2 opacity-0'}
        ${isLeaving ? 'notification-exit' : ''}`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-full">
        <div className={`flex items-center justify-between ${getBackgroundColor(type)} p-3 sm:p-4 rounded-lg`}>
          <div className="flex items-center flex-1 min-w-0">
            <div className="flex-shrink-0">
              {getIcon(type)}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {title}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 sm:line-clamp-none">
                {message}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                     transition-colors duration-200 flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 