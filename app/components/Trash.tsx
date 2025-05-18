'use client';

import React, { useState } from 'react';
import { useNotes } from '../context/NotesContext';

export default function Trash() {
  const { notes, restoreFromTrash, permanentlyDeleteNote, emptyTrash } = useNotes();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);

  // Filtrer les notes dans la corbeille
  const trashNotes = notes.filter(note => note.inTrash);

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

  // Calculer depuis combien de temps la note est dans la corbeille
  const getTimeInTrash = (trashedAt: Date | string | undefined) => {
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

  // Gérer la restauration d'une note
  const handleRestore = (id: string) => {
    restoreFromTrash(id);
  };

  // Gérer la suppression permanente d'une note
  const handleDelete = (id: string) => {
    setNoteToDelete(id);
    setShowConfirmDialog(true);
  };

  // Confirmer la suppression permanente
  const confirmDelete = () => {
    if (noteToDelete) {
      permanentlyDeleteNote(noteToDelete);
      setNoteToDelete(null);
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

  // Obtenir un court extrait du contenu
  const getContentPreview = (content: string, maxLength: number = 80) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--primary)' }}>
          Corbeille
        </h2>
        
        {trashNotes.length > 0 && (
          <button
            onClick={handleEmptyTrash}
            className="px-3 py-1.5 rounded-lg text-sm flex items-center transition-colors"
            style={{ 
              backgroundColor: 'var(--error-light)', 
              color: 'var(--error)' 
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Vider la corbeille
          </button>
        )}
      </div>
      
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
        Les éléments dans la corbeille seront automatiquement supprimés après 30 jours.
      </p>
      
      {trashNotes.length === 0 ? (
        <div 
          className="p-8 rounded-lg text-center"
          style={{ backgroundColor: 'var(--background-lighter)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor" style={{ color: 'var(--text-tertiary)' }}>
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p style={{ color: 'var(--text-secondary)' }}>
            La corbeille est vide
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {trashNotes.map(note => (
            <div 
              key={note.id} 
              className="p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
              style={{ 
                backgroundColor: 'var(--background-lighter)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span 
                    className="px-2 py-0.5 text-xs rounded-full"
                    style={{
                      backgroundColor: `color-mix(in srgb, var(--${note.category === 'idée' ? 'green' : 
                                            note.category === 'phrase' ? 'blue' : 
                                            note.category === 'mot' ? 'purple' : 
                                            note.category === 'histoire' ? 'red' : 
                                            note.category === 'réflexion' ? 'amber' : 'gray'
                                          }-500) 20%, transparent)`,
                      color: `var(--${note.category === 'idée' ? 'green' : 
                             note.category === 'phrase' ? 'blue' : 
                             note.category === 'mot' ? 'purple' : 
                             note.category === 'histoire' ? 'red' : 
                             note.category === 'réflexion' ? 'amber' : 'gray'
                            }-700)`
                    }}
                  >
                    {note.category.charAt(0).toUpperCase() + note.category.slice(1)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    Supprimé {getTimeInTrash(note.trashedAt)}
                  </span>
                </div>
                <p className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                  {getContentPreview(note.content)}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Créé le {formatDate(note.createdAt)}
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleRestore(note.id)}
                  className="px-3 py-1.5 rounded-lg text-sm flex items-center transition-colors"
                  style={{ 
                    backgroundColor: 'var(--primary-light)', 
                    color: 'var(--primary-dark)' 
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Restaurer
                </button>
                
                <button
                  onClick={() => handleDelete(note.id)}
                  className="px-3 py-1.5 rounded-lg text-sm flex items-center transition-colors"
                  style={{ 
                    backgroundColor: 'var(--error-light)', 
                    color: 'var(--error)' 
                  }}
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
      
      {/* Boîte de dialogue de confirmation pour la suppression d'une note */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="relative p-6 rounded-lg max-w-md w-full mx-4"
            style={{ backgroundColor: 'var(--background)' }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Supprimer définitivement ?
            </h3>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Cette action est irréversible. La note sera définitivement supprimée.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ 
                  backgroundColor: 'var(--background-lighter)', 
                  color: 'var(--text-secondary)' 
                }}
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ 
                  backgroundColor: 'var(--error)', 
                  color: 'white' 
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Boîte de dialogue de confirmation pour vider la corbeille */}
      {showEmptyConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="relative p-6 rounded-lg max-w-md w-full mx-4"
            style={{ backgroundColor: 'var(--background)' }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Vider la corbeille ?
            </h3>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Cette action est irréversible. Toutes les notes dans la corbeille ({trashNotes.length}) seront définitivement supprimées.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowEmptyConfirm(false)}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ 
                  backgroundColor: 'var(--background-lighter)', 
                  color: 'var(--text-secondary)' 
                }}
              >
                Annuler
              </button>
              <button
                onClick={confirmEmptyTrash}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ 
                  backgroundColor: 'var(--error)', 
                  color: 'white' 
                }}
              >
                Vider la corbeille
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 