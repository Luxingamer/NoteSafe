'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNotifications } from './NotificationsContext';
import { useNotes } from './NotesContext';

interface ConnectionContextType {
  isOnline: boolean;
  isPendingSync: boolean;
  lastSynced: Date | null;
  synchronizeNotes: () => Promise<void>;
  pendingChangesCount: number;
  syncMode: 'manual' | 'auto';
  setSyncMode: (mode: 'manual' | 'auto') => void;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export function ConnectionProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isPendingSync, setIsPendingSync] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [pendingChangesCount, setPendingChangesCount] = useState<number>(0);
  const [syncMode, setSyncMode] = useState<'manual' | 'auto'>('auto');
  
  const { addNotification } = useNotifications();
  const { notes, syncNotesToFirebase, loadNotesFromFirebase } = useNotes();

  // Charger les préférences de synchronisation depuis le localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('notesafe_sync_mode');
      if (savedMode && (savedMode === 'manual' || savedMode === 'auto')) {
        setSyncMode(savedMode);
      }
      
      // Charger la date de dernière synchronisation
      const lastSyncedStr = localStorage.getItem('notesafe_last_synced');
      if (lastSyncedStr) {
        setLastSynced(new Date(lastSyncedStr));
      }
      
      // Charger le nombre de changements en attente
      const pendingChanges = localStorage.getItem('notesafe_pending_changes');
      if (pendingChanges) {
        setPendingChangesCount(parseInt(pendingChanges, 10));
      }
    }
  }, []);
  
  // Sauvegarder les préférences de synchronisation dans le localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('notesafe_sync_mode', syncMode);
    }
  }, [syncMode]);
  
  // Sauvegarder la date de dernière synchronisation
  useEffect(() => {
    if (typeof window !== 'undefined' && lastSynced) {
      localStorage.setItem('notesafe_last_synced', lastSynced.toISOString());
    }
  }, [lastSynced]);
  
  // Sauvegarder le nombre de changements en attente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('notesafe_pending_changes', pendingChangesCount.toString());
    }
  }, [pendingChangesCount]);

  // Écouter les changements d'état de connexion
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addNotification({
        type: 'info',
        title: 'Connexion rétablie',
        message: 'Vous êtes maintenant connecté à Internet',
        action: 'connection_status_changed'
      });
      
      // Si en mode auto, synchroniser automatiquement
      if (syncMode === 'auto' && pendingChangesCount > 0) {
        synchronizeNotes();
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      addNotification({
        type: 'warning',
        title: 'Connexion perdue',
        message: 'Vous êtes maintenant en mode hors ligne. Vos modifications seront synchronisées lorsque vous serez reconnecté.',
        action: 'connection_status_changed'
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addNotification, syncMode, pendingChangesCount]);
  
  // Surveiller les changements de notes pour mettre à jour le compteur
  useEffect(() => {
    // Si on a déjà synchronisé au moins une fois et qu'on est offline
    if (lastSynced && !isOnline) {
      // Compter le nombre de notes qui ont été modifiées après la dernière synchronisation
      const changedNotes = notes.filter(note => 
        new Date(note.lastModified) > (lastSynced as Date)
      );
      
      setPendingChangesCount(changedNotes.length);
    }
  }, [notes, lastSynced, isOnline]);
  
  // Fonction de synchronisation
  const synchronizeNotes = async () => {
    if (!isOnline) {
      addNotification({
        type: 'error',
        title: 'Synchronisation impossible',
        message: 'Vous êtes actuellement hors ligne. Veuillez vous connecter à Internet pour synchroniser vos notes.',
        action: 'system_error'
      });
      return;
    }
    
    try {
      setIsPendingSync(true);
      
      // Synchroniser les notes avec Firebase
      await syncNotesToFirebase();
      
      // Mettre à jour l'état de synchronisation
      setLastSynced(new Date());
      setPendingChangesCount(0);
      
      addNotification({
        type: 'success',
        title: 'Synchronisation réussie',
        message: 'Vos notes ont été synchronisées avec succès.',
        action: 'notes_synced'
      });
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      addNotification({
        type: 'error',
        title: 'Erreur de synchronisation',
        message: 'Une erreur est survenue lors de la synchronisation de vos notes. Veuillez réessayer.',
        action: 'system_error'
      });
    } finally {
      setIsPendingSync(false);
    }
  };
  
  return (
    <ConnectionContext.Provider
      value={{
        isOnline,
        isPendingSync,
        lastSynced,
        synchronizeNotes,
        pendingChangesCount,
        syncMode,
        setSyncMode
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
} 