'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  getNotes, 
  addNote, 
  updateNote as updateFirestoreNote, 
  deleteNote as deleteFirestoreNote,
  syncNotes
} from '../../firebase/noteService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types de catégories disponibles
export type NoteCategory = 'mot' | 'phrase' | 'idée' | 'réflexion' | 'histoire' | 'note';

// Définir le type pour une note
export interface Note {
  id: string;
  content: string;
  category: NoteCategory;
  createdAt: Date;
  updatedAt: Date;
  favorite: boolean;
  inTrash: boolean;
  isPinned: boolean;
  archived: boolean;
  synced?: boolean;
  trashedAt?: Date;
  lastModified?: Date; // Ajouté pour le suivi des modifications
}

// Interface pour le contexte
interface NotesContextProps {
  notes: Note[];
  addNote: (content: string, category: NoteCategory) => void;
  updateNote: (id: string, data: Partial<Omit<Note, 'id'>>) => void;
  deleteNote: (id: string) => void;
  permanentlyDeleteNote: (id: string) => void;
  restoreFromTrash: (id: string) => void;
  emptyTrash: () => void;
  toggleFavorite: (id: string) => void;
  isLoading: boolean;
  syncNotes: () => Promise<boolean>;
  syncNotesToFirebase: () => Promise<boolean>; // Nouvelle méthode pour la synchronisation
  loadNotesFromFirebase: () => Promise<void>; // Nouvelle méthode pour charger depuis Firebase
  hasPendingChanges: boolean;
  searchNotes: (searchTerm: string) => void;
  searchResults: Note[] | null;
  searchTerm: string;
}

// Créer le contexte
const NotesContext = createContext<NotesContextProps>({
  notes: [],
  addNote: () => {},
  updateNote: () => {},
  deleteNote: () => {},
  permanentlyDeleteNote: () => {},
  restoreFromTrash: () => {},
  emptyTrash: () => {},
  toggleFavorite: () => {},
  isLoading: false,
  syncNotes: async () => false,
  syncNotesToFirebase: async () => false,
  loadNotesFromFirebase: async () => {},
  hasPendingChanges: false,
  searchNotes: () => {},
  searchResults: null,
  searchTerm: '',
});

// Hook personnalisé pour utiliser le contexte
export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes doit être utilisé à l\'intérieur d\'un NotesProvider');
  }
  return context;
};

// Provider component
export function NotesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [localNotes, setLocalNotes] = useState<Note[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [searchResults, setSearchResults] = useState<Note[] | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Récupérer les notes
  const { 
    data: firebaseNotes = [], 
    isLoading: isLoadingNotes,
    isError
  } = useQuery({
    queryKey: ['notes', user?.uid],
    queryFn: () => user ? getNotes(user.uid) : Promise.resolve([]),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutations
  const addNoteMutation = useMutation({
    mutationFn: async (newNote: Omit<Note, 'id'>) => {
      if (!user) throw new Error('Utilisateur non connecté');
      return await addNote(user.uid, newNote);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['notes', user?.uid], (oldData: Note[] | undefined) => {
        return oldData ? [data, ...oldData] : [data];
      });
      setHasPendingChanges(true);
    }
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Note> }) => {
      if (!user) throw new Error('Utilisateur non connecté');
      await updateFirestoreNote(id, data);
      return { id, data };
    },
    onSuccess: ({ id, data }) => {
      queryClient.setQueryData(['notes', user?.uid], (oldData: Note[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(note => note.id === id ? { ...note, ...data } : note);
      });
      setHasPendingChanges(true);
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Utilisateur non connecté');
      await deleteFirestoreNote(id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(['notes', user?.uid], (oldData: Note[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(note => note.id !== id);
      });
      setHasPendingChanges(true);
    }
  });

  const syncNotesMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Utilisateur non connecté');
      const notes = queryClient.getQueryData<Note[]>(['notes', user.uid]) || [];
      return await syncNotes(user.uid, notes);
    },
    onSuccess: (success) => {
      if (success) {
        setHasPendingChanges(false);
        queryClient.invalidateQueries({ queryKey: ['notes', user?.uid] });
      }
      return success;
    }
  });

  // Fonction pour valider et convertir une date
  const ensureValidDate = (date: any): Date => {
    if (date instanceof Date) return date;
    if (typeof date === 'string') return new Date(date);
    return new Date();
  };

  // Gestion du localStorage pour les utilisateurs non connectés
  useEffect(() => {
    if (!isInitialized) {
      // Charger les notes du localStorage seulement si l'utilisateur n'est pas connecté
      if (!user) {
        try {
          const savedNotes = localStorage.getItem('notes');
          if (savedNotes) {
            const parsedNotes = JSON.parse(savedNotes);
            // Convertir toutes les dates en objets Date avec validation
            const notesWithDates = parsedNotes.map((note: any) => ({
              ...note,
              createdAt: ensureValidDate(note.createdAt),
              updatedAt: ensureValidDate(note.updatedAt),
              trashedAt: note.trashedAt ? ensureValidDate(note.trashedAt) : undefined
            }));
            setLocalNotes(notesWithDates);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des notes du localStorage:', error);
          // En cas d'erreur, réinitialiser les notes
          setLocalNotes([]);
          localStorage.removeItem('notes');
        }
      }
      setIsInitialized(true);
    }
  }, [isInitialized, user]);

  // Sauvegarder les notes dans le localStorage pour les utilisateurs non connectés
  useEffect(() => {
    if (isInitialized && !user && localNotes.length > 0) {
      // Convertir les dates en chaînes ISO avant la sauvegarde
      const notesToSave = localNotes.map(note => ({
        ...note,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
        trashedAt: note.trashedAt ? note.trashedAt.toISOString() : undefined
      }));
      localStorage.setItem('notes', JSON.stringify(notesToSave));
    }
  }, [localNotes, isInitialized, user]);

  // Gérer la transition entre le mode local et le mode cloud
  useEffect(() => {
    if (user && isInitialized) {
      // L'utilisateur vient de se connecter
      const syncLocalToCloud = async () => {
        try {
          // Récupérer les notes locales
          const localNotes = localStorage.getItem('notes');
          if (localNotes) {
            const parsedLocalNotes = JSON.parse(localNotes);
            // Convertir les dates
            const notesWithDates = parsedLocalNotes.map((note: any) => ({
              ...note,
              createdAt: ensureValidDate(note.createdAt),
              updatedAt: ensureValidDate(note.updatedAt),
              trashedAt: note.trashedAt ? ensureValidDate(note.trashedAt) : undefined
            }));

            // Synchroniser avec Firebase
            await syncNotes(user.uid, notesWithDates);
            
            // Vider le localStorage après la synchronisation
            localStorage.removeItem('notes');
          }
        } catch (error) {
          console.error('Erreur lors de la synchronisation des notes locales vers le cloud:', error);
        }
      };

      syncLocalToCloud();
    }
  }, [user, isInitialized]);

  // Gérer la déconnexion
  useEffect(() => {
    const handleLogout = async () => {
      if (user) {
        try {
          // Sauvegarder les notes actuelles dans le localStorage avant la déconnexion
          const currentNotes = queryClient.getQueryData<Note[]>(['notes', user.uid]) || [];
          const notesToSave = currentNotes.map(note => ({
            ...note,
            createdAt: note.createdAt.toISOString(),
            updatedAt: note.updatedAt.toISOString(),
            trashedAt: note.trashedAt ? note.trashedAt.toISOString() : undefined
          }));
          localStorage.setItem('notes', JSON.stringify(notesToSave));
        } catch (error) {
          console.error('Erreur lors de la sauvegarde des notes avant déconnexion:', error);
        }
      }
    };

    window.addEventListener('logout', handleLogout);
    return () => window.removeEventListener('logout', handleLogout);
  }, [user, queryClient]);

  // Fonction pour ajouter une note
  const handleAddNote = useCallback((content: string, category: NoteCategory) => {
    const newNote = {
      content,
      category,
      favorite: false,
      inTrash: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPinned: false,
      archived: false,
    };

    if (user) {
      // Utiliser la mutation pour les utilisateurs connectés
      addNoteMutation.mutate(newNote);
    } else {
      // Utiliser le localStorage pour les utilisateurs non connectés
      const id = `local_${Date.now()}`;
      setLocalNotes(prev => [{ id, ...newNote }, ...prev]);
    }
  }, [user, addNoteMutation]);

  // Fonction pour mettre à jour une note
  const handleUpdateNote = useCallback((id: string, data: Partial<Omit<Note, 'id'>>) => {
    const updates = {
      ...data,
      updatedAt: new Date()
    };

    if (user) {
      // Utiliser la mutation pour les utilisateurs connectés
      updateNoteMutation.mutate({ id, data: updates });
    } else {
      // Utiliser le localStorage pour les utilisateurs non connectés
      setLocalNotes(prev => 
        prev.map(note => note.id === id ? { ...note, ...updates } : note)
      );
    }
  }, [user, updateNoteMutation]);

  // Fonction pour supprimer une note (déplacer vers la corbeille)
  const handleDeleteNote = useCallback((id: string) => {
    const updates = {
      inTrash: true,
      trashedAt: new Date()
    };

    if (user) {
      // Utiliser la mutation pour les utilisateurs connectés
      updateNoteMutation.mutate({ id, data: updates });
    } else {
      // Utiliser le localStorage pour les utilisateurs non connectés
      setLocalNotes(prev => 
        prev.map(note => note.id === id ? { ...note, ...updates } : note)
      );
    }
  }, [user, updateNoteMutation]);

  // Fonction pour supprimer définitivement une note
  const handlePermanentlyDeleteNote = useCallback((id: string) => {
    if (user) {
      // Utiliser la mutation pour les utilisateurs connectés
      deleteNoteMutation.mutate(id);
    } else {
      // Utiliser le localStorage pour les utilisateurs non connectés
      setLocalNotes(prev => prev.filter(note => note.id !== id));
    }
  }, [user, deleteNoteMutation]);

  // Fonction pour restaurer une note de la corbeille
  const handleRestoreFromTrash = useCallback((id: string) => {
    const updates = {
      inTrash: false,
      trashedAt: undefined
    };

    if (user) {
      // Utiliser la mutation pour les utilisateurs connectés
      updateNoteMutation.mutate({ id, data: updates });
    } else {
      // Utiliser le localStorage pour les utilisateurs non connectés
      setLocalNotes(prev => 
        prev.map(note => note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note)
      );
    }
  }, [user, updateNoteMutation]);

  // Fonction pour vider la corbeille (supprimer définitivement toutes les notes dans la corbeille)
  const handleEmptyTrash = useCallback(() => {
    // Notes à traiter (soit Firebase soit localStorage)
    const notesToProcess = user ? firebaseNotes : localNotes;
    
    // Obtenir les IDs des notes dans la corbeille
    const trashNoteIds = notesToProcess
      .filter(note => note.inTrash)
      .map(note => note.id);
    
    // Supprimer définitivement chaque note
    trashNoteIds.forEach(id => {
      handlePermanentlyDeleteNote(id);
    });
  }, [user, firebaseNotes, localNotes, handlePermanentlyDeleteNote]);

  // Fonction pour marquer une note comme favorite
  const handleToggleFavorite = useCallback((id: string) => {
    if (user) {
      // Pour les utilisateurs connectés, on récupère l'état actuel de la note
      const notes = queryClient.getQueryData<Note[]>(['notes', user.uid]) || [];
      const note = notes.find(n => n.id === id);
      if (note) {
        updateNoteMutation.mutate({ 
          id, 
          data: { favorite: !note.favorite } 
        });
      }
    } else {
      // Pour les utilisateurs non connectés
      setLocalNotes(prev => 
        prev.map(note => 
          note.id === id 
            ? { ...note, favorite: !note.favorite, updatedAt: new Date() } 
            : note
        )
      );
    }
  }, [user, updateNoteMutation, queryClient]);

  // Fonction pour synchroniser les notes
  const handleSyncNotes = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      return await syncNotesMutation.mutateAsync();
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      return false;
    }
  }, [user, syncNotesMutation]);

  // Fonction pour rechercher des notes
  const handleSearchNotes = useCallback((searchTerm: string) => {
    // Si le terme de recherche est vide, réinitialiser les résultats
    if (!searchTerm.trim()) {
      setSearchResults(null);
      setSearchTerm('');
      return;
    }

    // Stocker le terme de recherche
    setSearchTerm(searchTerm);
    
    // Terme de recherche en minuscules pour une recherche insensible à la casse
    const term = searchTerm.toLowerCase();
    
    // Notes à rechercher (soit Firebase soit localStorage)
    const notesToSearch = user ? firebaseNotes : localNotes;
    
    // Filtrer les notes qui contiennent le terme de recherche (et qui ne sont pas dans la corbeille)
    const results = notesToSearch
      .filter(note => 
        !note.inTrash && (
          note.content.toLowerCase().includes(term) || 
          note.category.toLowerCase().includes(term)
        )
      );
    
    setSearchResults(results);
  }, [user, firebaseNotes, localNotes]);

  // Méthode pour synchroniser les notes avec Firebase
  const syncNotesToFirebase = async (): Promise<boolean> => {
    if (!user) {
      console.warn("Impossible de synchroniser les notes: utilisateur non connecté");
      return false;
    }

    try {
      // Utiliser la mutation existante pour synchroniser
      const result = await syncNotesMutation.mutateAsync();
      return result;
    } catch (error) {
      console.error("Erreur lors de la synchronisation des notes:", error);
      return false;
    }
  };

  // Méthode pour charger les notes depuis Firebase
  const loadNotesFromFirebase = async (): Promise<void> => {
    if (!user) {
      console.warn("Impossible de charger les notes: utilisateur non connecté");
      return;
    }

    try {
      // Invalider la requête pour forcer un rechargement
      await queryClient.invalidateQueries({ queryKey: ['notes', user.uid] });
      // Recharger les données
      await queryClient.fetchQuery({ queryKey: ['notes', user.uid] });
    } catch (error) {
      console.error("Erreur lors du chargement des notes depuis Firebase:", error);
    }
  };

  // Utilisez les données appropriées selon que l'utilisateur est connecté ou non
  const notesData = user ? firebaseNotes : localNotes;
  
  // Détermine si l'application est en cours de chargement
  const isLoading = (!!user && isLoadingNotes) || !isInitialized;

  return (
    <NotesContext.Provider
      value={{
        notes: searchResults || notesData,
        addNote: handleAddNote,
        updateNote: handleUpdateNote,
        deleteNote: handleDeleteNote,
        permanentlyDeleteNote: handlePermanentlyDeleteNote,
        restoreFromTrash: handleRestoreFromTrash,
        emptyTrash: handleEmptyTrash,
        toggleFavorite: handleToggleFavorite,
        isLoading,
        syncNotes: handleSyncNotes,
        syncNotesToFirebase,
        loadNotesFromFirebase,
        hasPendingChanges,
        searchNotes: handleSearchNotes,
        searchResults,
        searchTerm,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
} 