'use client';

import React, { useState } from 'react';
import { useNotifications, NotificationType } from '../context/NotificationsContext';

// Types pour les notifications
type NotificationAction = 'note_created' | 'note_updated' | 'note_deleted' | 'settings_changed' | 'bookmark_added' | 'achievement_unlocked' | 'login' | 'logout' | 'sync_completed' | 'export_completed' | 'import_completed';

interface NotificationItem {
  id: string;
  type: NotificationType;
  action: NotificationAction;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export default function Notifications() {
  // État pour les filtres actifs
  const [activeFilter, setActiveFilter] = useState<NotificationType | 'all'>('all');
  const [isShowingUnreadOnly, setIsShowingUnreadOnly] = useState(false);
  
  // Utiliser le contexte de notifications
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  } = useNotifications();

  // Filtrer les notifications
  const filteredNotifications = notifications.filter(notification => {
    if (isShowingUnreadOnly && notification.read) {
      return false;
    }
    
    if (activeFilter !== 'all' && notification.type !== activeFilter) {
      return false;
    }
    
    return true;
  });

  // Obtenir la couleur de la notification en fonction du type
  const getNotificationColor = (type: NotificationType): string => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-700';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-700';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-400 dark:border-amber-700';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-700';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700';
    }
  };

  // Obtenir l'icône de la notification en fonction du type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center text-green-500 dark:text-green-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
            </svg>
          </div>
        );
      case 'info':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-500 dark:text-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center text-amber-500 dark:text-amber-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center text-red-500 dark:text-red-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  // Formatter les dates pour l'affichage
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (60 * 1000));
    
    if (diffMinutes < 1) {
      return 'À l\'instant';
    }
    
    if (diffMinutes < 60) {
      return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    }
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    }
    
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Compter les notifications non lues
  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-[fadeIn_0.4s_ease-out_forwards]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Centre de notifications</h1>
            <p className="text-gray-600 dark:text-gray-300">
              {unreadCount > 0 
                ? `Vous avez ${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}.` 
                : 'Aucune nouvelle notification.'}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={markAllAsRead}
              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              disabled={unreadCount === 0}
            >
              Tout marquer comme lu
            </button>
            <button 
              onClick={clearAllNotifications}
              className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              disabled={notifications.length === 0}
            >
              Effacer tout
            </button>
          </div>
        </div>
        
        {/* Filtres */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex space-x-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeFilter === 'all'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-800 dark:text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setActiveFilter('info')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeFilter === 'info'
                  ? 'bg-blue-100 dark:bg-blue-600 shadow-sm text-blue-800 dark:text-blue-100'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
            >
              Informations
            </button>
            <button
              onClick={() => setActiveFilter('success')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeFilter === 'success'
                  ? 'bg-green-100 dark:bg-green-600 shadow-sm text-green-800 dark:text-green-100'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20'
              }`}
            >
              Succès
            </button>
            <button
              onClick={() => setActiveFilter('warning')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeFilter === 'warning'
                  ? 'bg-amber-100 dark:bg-amber-600 shadow-sm text-amber-800 dark:text-amber-100'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/20'
              }`}
            >
              Avertissements
            </button>
            <button
              onClick={() => setActiveFilter('error')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeFilter === 'error'
                  ? 'bg-red-100 dark:bg-red-600 shadow-sm text-red-800 dark:text-red-100'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
            >
              Erreurs
            </button>
          </div>
          
          <div className="mt-3 md:mt-0">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                checked={isShowingUnreadOnly}
                onChange={() => setIsShowingUnreadOnly(!isShowingUnreadOnly)}
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Afficher uniquement les non lues</span>
            </label>
          </div>
        </div>
        
        {/* Liste des notifications */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-500 dark:text-gray-400">
              {activeFilter === 'all' 
                ? 'Aucune notification à afficher.' 
                : `Aucune notification de type "${activeFilter}" à afficher.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification, index) => (
              <div 
                key={notification.id}
                className={`p-4 border-l-4 rounded-lg shadow-sm relative transition hover:shadow-md ${getNotificationColor(notification.type)} ${notification.read ? 'opacity-80' : ''}`}
                style={{ 
                  animation: `slideInFromRight 0.3s ease-out forwards ${index * 0.08}s`,
                  opacity: 0
                }}
              >
                {!notification.read && (
                  <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                )}
                
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="text-md font-semibold text-gray-800 dark:text-white">
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(notification.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      {notification.message}
                    </p>
                    
                    <div className="mt-3 flex space-x-2">
                      {!notification.read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          Marquer comme lu
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(notification.id)}
                        className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 