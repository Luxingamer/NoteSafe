'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  getMemoryItems, 
  addMemoryItem, 
  updateMemoryItem, 
  deleteMemoryItem,
  syncMemoryItems
} from '../../firebase/memoryService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MemoryItemType, MemoryItem, DatabaseMemoryItem } from '../types/memory';

// Interface pour le contexte
interface MemoryContextProps {
  items: MemoryItem[];
  addItem: (item: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt' | 'synced'>) => void;
  updateItem: (id: string, data: Partial<Omit<MemoryItem, 'id'>>) => void;
  deleteItem: (id: string) => void;
  toggleFavorite: (id: string) => void;
  isLoading: boolean;
  syncItems: () => Promise<boolean>;
  syncItemsToFirebase: () => Promise<boolean>;
  loadItemsFromFirebase: () => Promise<void>;
  hasPendingChanges: boolean;
  searchItems: (searchTerm: string) => void;
  searchResults: MemoryItem[] | null;
  searchTerm: string;
}

// Créer le contexte avec une valeur par défaut
const defaultContextValue: MemoryContextProps = {
  items: [],
  addItem: () => {},
  updateItem: () => {},
  deleteItem: () => {},
  toggleFavorite: () => {},
  isLoading: false,
  syncItems: async () => false,
  syncItemsToFirebase: async () => false,
  loadItemsFromFirebase: async () => {},
  hasPendingChanges: false,
  searchItems: () => {},
  searchResults: null,
  searchTerm: ''
};

const MemoryContext = createContext<MemoryContextProps>(defaultContextValue);

// Hook personnalisé pour utiliser le contexte
export const useMemory = () => {
  const context = useContext(MemoryContext);
  if (!context) {
    throw new Error('useMemory doit être utilisé à l\'intérieur d\'un MemoryProvider');
  }
  return context;
};

// Provider du contexte
export function MemoryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [localItems, setLocalItems] = useState<MemoryItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<MemoryItem[] | null>(null);

  // Charger les éléments depuis Firebase
  const { data: firebaseItems = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ['memory', user?.uid],
    queryFn: () => user ? getMemoryItems(user.uid) : Promise.resolve([]),
    enabled: !!user
  });

  // Mutation pour ajouter un élément
  const addItemMutation = useMutation({
    mutationFn: async (item: Omit<DatabaseMemoryItem, 'userId' | 'id'>) => {
      if (!user) throw new Error('Utilisateur non connecté');
      const newItem = {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return await addMemoryItem(user.uid, newItem);
    },
    onSuccess: (newItem) => {
      queryClient.setQueryData(['memory', user?.uid], (oldData: MemoryItem[] | undefined) => {
        return [...(oldData || []), newItem];
      });
      setHasPendingChanges(true);
    }
  });

  // Mutation pour mettre à jour un élément
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<DatabaseMemoryItem> }) => {
      if (!user) throw new Error('Utilisateur non connecté');
      const updates = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      await updateMemoryItem(id, updates);
      return { id, data };
    },
    onSuccess: ({ id, data }) => {
      queryClient.setQueryData(['memory', user?.uid], (oldData: MemoryItem[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(item => 
          item.id === id ? { ...item, ...data, updatedAt: new Date() } : item
        );
      });
      setHasPendingChanges(true);
    }
  });

  // Mutation pour supprimer un élément
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Utilisateur non connecté');
      await deleteMemoryItem(id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(['memory', user?.uid], (oldData: MemoryItem[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(item => item.id !== id);
      });
      setHasPendingChanges(true);
    }
  });

  // Mutation pour synchroniser les éléments
  const syncItemsMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Utilisateur non connecté');
      const items = queryClient.getQueryData<MemoryItem[]>(['memory', user.uid]) || [];
      return await syncMemoryItems(user.uid, items);
    },
    onSuccess: (success) => {
      if (success) {
        setHasPendingChanges(false);
        queryClient.invalidateQueries({ queryKey: ['memory', user?.uid] });
      }
      return success;
    }
  });

  // Charger les éléments locaux au démarrage
  useEffect(() => {
    const savedItems = localStorage.getItem('memory_items');
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems).map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        }));
        setLocalItems(parsedItems);
      } catch (error) {
        console.error('Erreur lors du chargement des éléments:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Sauvegarder les éléments locaux
  useEffect(() => {
    if (!user && isInitialized) {
      localStorage.setItem('memory_items', JSON.stringify(localItems));
    }
  }, [localItems, user, isInitialized]);

  // Gérer l'ajout d'un élément
  const handleAddItem = useCallback((item: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt' | 'synced'>) => {
    const itemWithSafeTags = {
      ...item,
      tags: item.tags || []
    };

    if (user) {
      addItemMutation.mutate({
        ...itemWithSafeTags,
        synced: true
      });
    } else {
      const newItem: MemoryItem = {
        ...itemWithSafeTags,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        synced: false
      };
      setLocalItems(prev => [newItem, ...prev]);
    }
  }, [user, addItemMutation]);

  // Gérer la mise à jour d'un élément
  const handleUpdateItem = useCallback((id: string, data: Partial<Omit<MemoryItem, 'id'>>) => {
    const dataWithSafeTags = {
      ...data,
      tags: data.tags || undefined // Ne pas écraser les tags existants si undefined
    };

    if (user) {
      updateItemMutation.mutate({ id, data: dataWithSafeTags });
    } else {
      setLocalItems(prev => prev.map(item => 
        item.id === id ? { 
          ...item, 
          ...dataWithSafeTags,
          tags: dataWithSafeTags.tags || item.tags || [],
          updatedAt: new Date()
        } : item
      ));
    }
  }, [user, updateItemMutation]);

  // Gérer la suppression d'un élément
  const handleDeleteItem = useCallback((id: string) => {
    if (user) {
      deleteItemMutation.mutate(id);
    } else {
      setLocalItems(prev => prev.filter(item => item.id !== id));
    }
  }, [user, deleteItemMutation]);

  // Gérer le basculement des favoris
  const handleToggleFavorite = useCallback((id: string) => {
    if (user) {
      const item = (firebaseItems || []).find(item => item.id === id);
      if (item) {
        updateItemMutation.mutate({ 
          id, 
          data: { isFavorite: !item.isFavorite }
        });
      }
    } else {
      setLocalItems(prev => prev.map(item => 
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      ));
    }
  }, [user, firebaseItems, updateItemMutation]);

  // Gérer la recherche
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setSearchResults(null);
      return;
    }

    const results = (user ? firebaseItems : localItems).filter(item => {
      const searchLower = term.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchLower) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    });

    setSearchResults(results);
  }, [user, firebaseItems, localItems]);

  // Synchroniser les éléments avec Firebase
  const handleSyncItems = useCallback(async () => {
    if (!user) return false;
    return await syncItemsMutation.mutateAsync();
  }, [user, syncItemsMutation]);

  // Synchroniser les éléments vers Firebase
  const handleSyncToFirebase = useCallback(async () => {
    if (!user) return false;
    const items = queryClient.getQueryData<MemoryItem[]>(['memory', user.uid]) || [];
    return await syncMemoryItems(user.uid, items);
  }, [user, queryClient]);

  // Charger les éléments depuis Firebase
  const handleLoadFromFirebase = useCallback(async () => {
    if (!user) return;
    await queryClient.invalidateQueries({ queryKey: ['memory', user.uid] });
  }, [user, queryClient]);

  // Valeur du contexte
  const value = {
    items: user ? firebaseItems : localItems,
    addItem: handleAddItem,
    updateItem: handleUpdateItem,
    deleteItem: handleDeleteItem,
    toggleFavorite: handleToggleFavorite,
    isLoading: isLoadingItems,
    syncItems: handleSyncItems,
    syncItemsToFirebase: handleSyncToFirebase,
    loadItemsFromFirebase: handleLoadFromFirebase,
    hasPendingChanges,
    searchItems: handleSearch,
    searchResults,
    searchTerm
  };

  return (
    <MemoryContext.Provider value={value}>
      {children}
    </MemoryContext.Provider>
  );
} 