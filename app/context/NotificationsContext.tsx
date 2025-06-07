'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ToastContainer from '../components/ToastContainer';

// Types pour les notifications
export type NotificationType = 'success' | 'info' | 'warning' | 'error';
export type NotificationAction = 
  // Actions liées aux notes
  | 'note_created' 
  | 'note_updated'
  | 'note_deleted'
  | 'note_archived'
  | 'note_unarchived'
  | 'note_pinned'
  | 'note_unpinned'
  | 'note_restored'
  | 'note_category_changed'
  | 'note_moved_to_trash'
  | 'note_favorite_added'
  | 'note_favorite_removed'
  | 'notes_synced'
  | 'notes_exported'
  | 'notes_imported'
  | 'notes_backup_created'
  
  // Actions liées aux paramètres
  | 'settings_theme_changed'
  | 'settings_language_changed'
  | 'settings_notifications_changed'
  | 'settings_security_changed'
  | 'settings_delete_delay_changed'
  | 'settings_backup_changed'
  | 'settings_sync_changed'
  
  // Actions liées à la mémoire
  | 'memory_item_added'
  | 'memory_item_deleted'
  | 'memory_item_updated'
  | 'memory_item_encrypted'
  | 'memory_item_decrypted'
  | 'memory_item_favorite_added'
  | 'memory_item_favorite_removed'
  | 'memory_item_tag_added'
  | 'memory_item_tag_removed'
  
  // Actions liées à l'IA
  | 'ai_text_generated'
  | 'ai_summary_generated'
  | 'ai_translation_completed'
  | 'ai_analysis_completed'
  | 'ai_suggestions_ready'
  
  // Actions liées à l'authentification
  | 'auth_login'
  | 'auth_logout'
  | 'auth_password_changed'
  | 'auth_email_changed'
  | 'auth_profile_updated'
  
  // Actions liées aux succès
  | 'achievement_unlocked'
  | 'milestone_reached'
  | 'streak_continued'
  
  // Actions système
  | 'system_update_available'
  | 'system_maintenance'
  | 'system_error'
  | 'storage_limit_warning'
  | 'connection_status_changed'
  
  // Actions liées aux livres
  | 'book_created'
  | 'book_deleted'
  | 'book_updated'
  | 'book_page_added'
  | 'book_page_updated'
  | 'book_page_deleted'
  | 'book_moved_to_trash'
  | 'book_restored'
  | 'book_category_changed'

  // Actions liées aux points
  | 'daily_points'
  | 'points_earned'
  | 'points_spent'
  | 'insufficient_points'
  | 'daily_reward'
  | 'error';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  action: NotificationAction;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationsContextType {
  notifications: NotificationItem[];
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<NotificationItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Charger les notifications depuis le localStorage au démarrage
  useEffect(() => {
    if (!isInitialized) {
      try {
        const storedNotifications = localStorage.getItem('notesafe_notifications');
        if (storedNotifications) {
          const parsedNotifications = JSON.parse(storedNotifications).map((notification: any) => ({
            ...notification,
            timestamp: new Date(notification.timestamp)
          }));
          setNotifications(parsedNotifications);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Sauvegarder les notifications dans le localStorage à chaque modification
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('notesafe_notifications', JSON.stringify(notifications));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des notifications:', error);
      }
    }
  }, [notifications, isInitialized]);

  // Nettoyer les toasts expirés
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setToasts(prev => prev.filter(toast => {
        const age = now.getTime() - toast.timestamp.getTime();
        return age < 5000; // Supprimer les toasts après 5 secondes
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addNotification = useCallback((notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: uuidv4(),
      timestamp: new Date(),
      read: false,
    };

    // Vérifier si une notification similaire existe déjà dans les dernières 5 secondes
    const now = new Date();
    const recentNotifications = notifications.filter(n => {
      const age = now.getTime() - n.timestamp.getTime();
      return age < 5000;
    });

    const isDuplicate = recentNotifications.some(n => 
      n.type === notification.type && 
      n.action === notification.action && 
      n.title === notification.title && 
      n.message === notification.message
    );

    if (!isDuplicate) {
      setNotifications(prev => [newNotification, ...prev]);
      setToasts(prev => [...prev, newNotification]);
    }
  }, [notifications]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}

// Fonction utilitaire pour obtenir l'icône de notification
function getNotificationIcon(type: NotificationType) {
  const iconColor = {
    success: 'text-green-500 dark:text-green-300',
    info: 'text-blue-500 dark:text-blue-300',
    warning: 'text-amber-500 dark:text-amber-300',
    error: 'text-red-500 dark:text-red-300',
  }[type];

  const icons = {
    success: '<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" /></svg>',
    info: '<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" /></svg>',
    warning: '<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" /></svg>',
    error: '<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" /></svg>',
  };

  return `<div class="w-8 h-8 rounded-full flex items-center justify-center ${iconColor}">${icons[type]}</div>`;
} 