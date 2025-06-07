'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePoints, POINT_COSTS } from '../context/PointsContext';
import { useNotifications } from '../context/NotificationsContext';
import { useMemory } from '../context/MemoryContext';
import { encrypt, decrypt } from '../utils/encryption';
import DeleteConfirmation from './DeleteConfirmation';
import { MemoryItemType, MemoryItem } from '../types/memory';

export default function Memory() {
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [activeType, setActiveType] = useState<MemoryItemType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<MemoryItem>>({
    type: 'password',
    title: '',
    content: '',
    tags: [],
    isEncrypted: true
  });
  const { addPoints } = usePoints();
  const { addNotification } = useNotifications();
  const { 
    items: memoryItems = [],
    addItem, 
    updateItem, 
    deleteItem, 
    toggleFavorite, 
    isLoading,
    searchItems,
    searchResults,
    searchTerm
  } = useMemory();

  // Ensure memoryItems is always an array
  const safeMemoryItems = Array.isArray(memoryItems) ? memoryItems : [];

  // Charger les éléments depuis le localStorage
  useEffect(() => {
    const savedItems = localStorage.getItem('memory_items');
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems).map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        }));
        setItems(parsedItems);
      } catch (error) {
        console.error('Erreur lors du chargement des éléments:', error);
      }
    }
  }, []);

  // Sauvegarder les éléments dans le localStorage
  useEffect(() => {
    localStorage.setItem('memory_items', JSON.stringify(items));
  }, [items]);

  // Filtrer les éléments
  const filteredItems = safeMemoryItems.filter(item => {
    if (activeType !== 'all' && item.type !== activeType) return false;
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchLower) ||
      (item.tags || []).some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  // Ajouter un nouvel élément
  const handleAddItem = () => {
    if (!newItem.title || !newItem.content) return;

    const content = newItem.isEncrypted ? encrypt(newItem.content) : newItem.content;

    addItem({
      type: newItem.type as MemoryItemType,
      title: newItem.title,
      content,
      tags: newItem.tags || [],
      isFavorite: false,
      isEncrypted: newItem.isEncrypted || false
    });

    setIsAddingNew(false);
    setNewItem({
      type: 'password',
      title: '',
      content: '',
      tags: [],
      isEncrypted: true
    });

    // Ajouter des points
    addPoints(POINT_COSTS.MEMORY_ITEM_ADDED, 'Nouvel élément mémorisé', 'memory');
    
    addNotification({
      type: 'success',
      title: 'Élément ajouté',
      message: 'Votre élément a été mémorisé avec succès.',
      action: 'memory_item_added'
    });
  };

  // Supprimer un élément
  const handleDeleteItem = (id: string) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  };

  // Confirmer la suppression
  const confirmDelete = useCallback(() => {
    if (itemToDelete) {
      deleteItem(itemToDelete);
      addNotification({
        type: 'warning',
        title: 'Élément supprimé',
        message: 'L\'élément a été supprimé définitivement.',
        action: 'memory_item_deleted'
      });
    }
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  }, [itemToDelete, deleteItem, addNotification]);

  // Annuler la suppression
  const cancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  }, []);

  // Obtenir l'icône pour un type
  const getTypeIcon = (type: MemoryItemType): string => {
    switch (type) {
      case 'password': return '🔑';
      case 'number': return '🔢';
      case 'code': return '📟';
      case 'project': return '📋';
      case 'card': return '💳';
      default: return '📎';
    }
  };

  // Traduire les types en français
  const getTypeLabel = (type: MemoryItemType): string => {
    switch (type) {
      case 'password': return 'Mot de passe';
      case 'number': return 'Numéro confidentiel';
      case 'code': return 'Code de sécurité';
      case 'project': return 'Projet confidentiel';
      case 'card': return 'Carte bancaire';
      default: return type;
    }
  };

  // Fonction pour révéler le contenu chiffré
  const revealContent = (content: string) => {
    try {
      return decrypt(content);
    } catch (error) {
      console.error('Erreur lors du déchiffrement:', error);
      addNotification({
        type: 'error',
        title: 'Erreur de déchiffrement',
        message: 'Impossible de déchiffrer le contenu.',
        action: 'memory_item_decrypted'
      });
      return 'Erreur de déchiffrement';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Mémoire Sécurisée
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gardez vos informations importantes en sécurité
          </p>
        </div>

        <button
          onClick={() => setIsAddingNew(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
        >
          <span>+</span>
          Nouveau
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveType('all')}
            className={`px-3 py-1.5 rounded-full transition-all duration-200 ${
              activeType === 'all'
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Tout
          </button>
          {(['password', 'number', 'code', 'project', 'card'] as MemoryItemType[]).map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-2 ${
                activeType === type
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span>{getTypeIcon(type)}</span>
              {getTypeLabel(type)}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-700 outline-none transition-all duration-200"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </span>
        </div>
      </div>

      {/* Liste des éléments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredItems.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getTypeIcon(item.type)}</span>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFavorite(item.id)}
                      className={`p-1 rounded-full transition-colors ${
                        item.isFavorite
                          ? 'text-yellow-500 hover:text-yellow-600'
                          : 'text-gray-400 hover:text-gray-500'
                      }`}
                    >
                      {item.isFavorite ? '⭐' : '☆'}
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 rounded-full text-red-500 hover:text-red-600 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg mt-3">
                    {item.isEncrypted ? (
                      <div>
                        <button
                          onClick={() => {
                            const decryptedContent = revealContent(item.content);
                            updateItem(item.id, {
                              content: decryptedContent,
                              isEncrypted: false
                            });
                            // Réencrypter après 30 secondes
                            setTimeout(() => {
                              updateItem(item.id, {
                                content: item.content,
                                isEncrypted: true
                              });
                            }, 30000);
                            // Notification
                            addNotification({
                              type: 'info',
                              title: 'Contenu révélé',
                              message: 'Le contenu sera à nouveau masqué dans 30 secondes.',
                              action: 'memory_item_decrypted'
                            });
                          }}
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors flex items-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M12,4.5C17,4.5 21.27,7.61 23,12C21.27,16.39 17,19.5 12,19.5C7,19.5 2.73,16.39 1,12C2.73,7.61 7,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C15.76,17.5 19.17,15.36 20.82,12C19.17,8.64 15.76,6.5 12,6.5C8.24,6.5 4.83,8.64 3.18,12Z" />
                          </svg>
                          Cliquer pour révéler (visible 30 secondes)
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-800 dark:text-gray-200 break-words">{item.content}</p>
                    )}
                  </div>

                  {(item.tags || []).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(item.tags || []).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Modifié le {item.updatedAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal d'ajout */}
      <AnimatePresence>
        {isAddingNew && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-lg"
            >
              <h2 className="text-2xl font-bold mb-4">Nouvel élément</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={newItem.type}
                    onChange={(e) => setNewItem(prev => ({ ...prev, type: e.target.value as MemoryItemType }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  >
                    <option value="password">Mot de passe</option>
                    <option value="number">Numéro confidentiel</option>
                    <option value="code">Code de sécurité</option>
                    <option value="project">Projet confidentiel</option>
                    <option value="card">Carte bancaire</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Titre</label>
                  <input
                    type="text"
                    value={newItem.title}
                    onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                    placeholder="Titre de l'élément"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Contenu</label>
                  <textarea
                    value={newItem.content}
                    onChange={(e) => setNewItem(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 min-h-[100px]"
                    placeholder="Contenu à mémoriser"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tags (séparés par des virgules)</label>
                  <input
                    type="text"
                    value={(newItem.tags || []).join(', ')}
                    onChange={(e) => setNewItem(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="encrypt"
                    checked={newItem.isEncrypted}
                    onChange={(e) => setNewItem(prev => ({ ...prev, isEncrypted: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="encrypt" className="text-sm">Chiffrer le contenu</label>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => setIsAddingNew(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddItem}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow hover:shadow-lg transition-all duration-200"
                    disabled={!newItem.title || !newItem.content}
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation de suppression */}
      <DeleteConfirmation
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onClose={cancelDelete}
        title="Supprimer l'élément ?"
        message="Cette action est irréversible. L'élément sera définitivement supprimé."
      />
    </div>
  );
} 