'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Note, useNotes, NoteCategory } from '../context/NotesContext';
import DeleteConfirmation from './DeleteConfirmation';

interface NoteItemProps {
  note: Note;
}

export default function NoteItem({ note }: NoteItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [editCategory, setEditCategory] = useState<NoteCategory>(note.category);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { updateNote, deleteNote, toggleFavorite } = useNotes();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Définir les catégories localement
  const categories: NoteCategory[] = ['mot', 'phrase', 'idée', 'réflexion', 'histoire', 'note'];

  useEffect(() => {
    setEditContent(note.content);
    setEditCategory(note.category);
  }, [note]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing, editContent]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editContent.trim()) {
      updateNote(note.id, {
        content: editContent.trim(),
        category: editCategory
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditContent(note.content);
    setEditCategory(note.category);
    setIsEditing(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteNote(note.id);
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Fonction pour épingler/désépingler une note
  const togglePin = () => {
    updateNote(note.id, { isPinned: !note.isPinned });
  };
  
  // Fonction pour archiver/désarchiver une note
  const toggleArchive = () => {
    updateNote(note.id, { archived: !note.archived });
    
    // Afficher une notification
    const action = note.archived ? 'désarchivée' : 'archivée';
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out';
    notification.textContent = `Note ${action} avec succès`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 2000);
  };

  // Formater la date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Traduire les catégories pour l'affichage
  const getCategoryLabel = (cat: NoteCategory): string => {
    const translations: Record<NoteCategory, string> = {
      'mot': 'Mot',
      'phrase': 'Phrase',
      'idée': 'Idée',
      'réflexion': 'Réflexion',
      'histoire': 'Histoire',
      'note': 'Note'
    };
    return translations[cat];
  };

  // Couleurs pour les catégories
  const getCategoryColor = (cat: NoteCategory): string => {
    const colors: Record<NoteCategory, string> = {
      'mot': 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300',
      'phrase': 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
      'idée': 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
      'réflexion': 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300',
      'histoire': 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300',
      'note': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
    };
    return colors[cat];
  };

  return (
    <>
      <div
        className={`w-full bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 
                 transition-all duration-300 ease-in-out transform hover:shadow-md
                 ${note.isPinned ? 'border-l-4 border-yellow-400 dark:border-yellow-600' : ''}
                 ${note.favorite ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                 ${note.archived ? 'opacity-70' : ''}`}
      >
        {isEditing ? (
          <div className="w-full">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Catégorie
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setEditCategory(cat)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      editCategory === cat
                        ? getCategoryColor(cat) + ' ring-2 ring-offset-1 ring-gray-300 dark:ring-gray-600'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {getCategoryLabel(cat)}
                  </button>
                ))}
              </div>
            </div>
            
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              aria-label="Modifier la note"
              className="w-full resize-none overflow-hidden bg-transparent
                     outline-none text-gray-800 dark:text-gray-200
                     min-h-[60px] py-2 px-1 border border-gray-300 dark:border-gray-600 rounded"
            />
            
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 
                        dark:bg-gray-700 dark:hover:bg-gray-600
                        text-gray-600 dark:text-gray-300 font-medium
                        rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 
                        dark:bg-blue-700 dark:hover:bg-blue-600
                        text-white font-medium rounded-lg
                        transition-colors"
                disabled={!editContent.trim()}
              >
                Enregistrer
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div className="flex-grow">
                <div className="flex items-center mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(note.category)}`}>
                    {getCategoryLabel(note.category)}
                  </span>
                  
                  {/* Badge pour les notes archivées */}
                  {note.archived && (
                    <span className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      Archivée
                    </span>
                  )}
                </div>
                <p className="whitespace-pre-wrap break-words text-gray-800 dark:text-gray-200 py-2">
                  {note.content}
                </p>
              </div>
              <div className="flex space-x-1 ml-2">
                {/* Bouton pour épingler */}
                <button
                  onClick={togglePin}
                  className={`p-1.5 rounded-full transition-colors
                           ${note.isPinned 
                             ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' 
                             : 'hover:bg-gray-100 text-gray-500 dark:hover:bg-gray-700 dark:text-gray-400'}`}
                  title={note.isPinned ? "Désépingler" : "Épingler"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
                  </svg>
                </button>
                
                {/* Bouton pour les favoris */}
                <button
                  onClick={() => toggleFavorite(note.id)}
                  className={`p-1.5 rounded-full transition-colors
                           ${note.favorite
                             ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                             : 'hover:bg-gray-100 text-gray-500 dark:hover:bg-gray-700 dark:text-gray-400'}`}
                  title={note.favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
                  </svg>
                </button>
                
                {/* Bouton pour archiver */}
                <button
                  onClick={toggleArchive}
                  className={`p-1.5 rounded-full transition-colors
                           ${note.archived
                             ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
                             : 'hover:bg-gray-100 text-gray-500 dark:hover:bg-gray-700 dark:text-gray-400'}`}
                  title={note.archived ? "Désarchiver" : "Archiver"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M3,3H21V7H3V3M4,8H20V21H4V8M9.5,11A0.5,0.5 0 0,0 9,11.5V13H15V11.5A0.5,0.5 0 0,0 14.5,11H9.5Z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(note.createdAt)}
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 
                           dark:text-gray-400 dark:hover:bg-gray-700
                           transition-colors"
                  title="Modifier la note"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                  </svg>
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600
                           dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400
                           transition-colors"
                  title="Supprimer la note"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <DeleteConfirmation
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        noteContent={note.content}
      />
    </>
  );
} 