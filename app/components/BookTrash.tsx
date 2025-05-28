'use client';

import React, { useState } from 'react';
import { useBooks, Book } from '../context/BookContext';
import DeleteConfirmation from './DeleteConfirmation';

export default function BookTrash() {
  const { books, restoreFromTrash, permanentlyDeleteBook, emptyTrash } = useBooks();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);

  // Filtrer les livres dans la corbeille
  const trashBooks = books.filter(book => book.inTrash);

  // Formater la date pour l'affichage
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Date inconnue';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculer depuis combien de temps le livre est dans la corbeille
  const getTimeInTrash = (trashedAt: Date | undefined) => {
    if (!trashedAt) return 'Date inconnue';
    
    const trashedDate = new Date(trashedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - trashedDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Moins d'un jour, afficher en heures
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        // Moins d'une heure, afficher en minutes
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
      }
      return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    }
    
    return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  };

  // Gérer la restauration d'un livre
  const handleRestore = (id: string) => {
    restoreFromTrash(id);
  };

  // Gérer la suppression permanente d'un livre
  const handleDelete = (id: string) => {
    setBookToDelete(id);
    setShowConfirmDialog(true);
  };

  // Confirmer la suppression permanente
  const confirmDelete = () => {
    if (bookToDelete) {
      permanentlyDeleteBook(bookToDelete);
      setBookToDelete(null);
    }
    setShowConfirmDialog(false);
  };

  // Gérer le vidage de la corbeille
  const handleEmptyTrash = () => {
    setShowEmptyConfirm(true);
  };

  // Confirmer le vidage de la corbeille
  const confirmEmptyTrash = () => {
    emptyTrash();
    setShowEmptyConfirm(false);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Corbeille
        </h2>
        
        {trashBooks.length > 0 && (
          <button
            onClick={handleEmptyTrash}
            className="px-3 py-1.5 rounded-lg text-sm flex items-center text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Vider la corbeille
          </button>
        )}
      </div>
      
      <p className="text-sm mb-4 text-gray-600 dark:text-gray-400">
        Les éléments dans la corbeille seront automatiquement supprimés après 30 jours.
      </p>
      
      {trashBooks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">
            La corbeille est vide
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {trashBooks.map((book) => (
            <div 
              key={book.id} 
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                    {book.bookType === 'pdf' ? 'PDF' : 'Livre'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Supprimé {getTimeInTrash(book.trashedAt)}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-1">{book.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{book.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Créé le {formatDate(book.createdAt)}
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleRestore(book.id)}
                  className="px-3 py-1.5 rounded-lg text-sm flex items-center text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Restaurer
                </button>
                
                <button
                  onClick={() => handleDelete(book.id)}
                  className="px-3 py-1.5 rounded-lg text-sm flex items-center text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Confirmation de suppression d'un livre */}
      <DeleteConfirmation
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmDelete}
        title="Supprimer définitivement ?"
        message="Cette action est irréversible. Le livre sera définitivement supprimé."
      />

      {/* Confirmation pour vider la corbeille */}
      <DeleteConfirmation
        isOpen={showEmptyConfirm}
        onClose={() => setShowEmptyConfirm(false)}
        onConfirm={confirmEmptyTrash}
        title="Vider la corbeille ?"
        message={`Cette action est irréversible. Tous les livres dans la corbeille (${trashBooks.length}) seront définitivement supprimés.`}
      />
    </div>
  );
} 