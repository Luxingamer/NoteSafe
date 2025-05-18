'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Note, useNotes, NoteCategory } from '../context/NotesContext';
import DeleteConfirmation from './DeleteConfirmation';
import { useNotifications } from '../context/NotificationsContext';
import { usePoints, POINT_COSTS } from '../context/PointsContext';
import PointCost from './PointCost';

interface NoteItemProps {
  note: Note;
  searchTerm?: string; // Terme de recherche à mettre en évidence
}

export default function NoteItem({ note, searchTerm }: NoteItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [editCategory, setEditCategory] = useState<NoteCategory>(note.category);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { updateNote, deleteNote, toggleFavorite, restoreFromTrash, permanentlyDeleteNote } = useNotes();
  const { addNotification } = useNotifications();
  const { spendPoints } = usePoints();
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
      const isContentChanged = editContent.trim() !== note.content;
      const isCategoryChanged = editCategory !== note.category;

      if (isContentChanged || isCategoryChanged) {
        const canEdit = spendPoints(POINT_COSTS.EDIT_NOTE, 'Modification d\'une note', 'edit');
        
        if (!canEdit) return;
      }

      updateNote(note.id, {
        content: editContent.trim(),
        category: editCategory
      });
      setIsEditing(false);

      // Notification pour le changement de contenu
      if (isContentChanged) {
        addNotification({
          type: 'success',
          action: 'note_updated',
          title: 'Note modifiée',
          message: 'Le contenu de la note a été modifié avec succès.'
        });
      }

      // Notification pour le changement de catégorie
      if (isCategoryChanged) {
        addNotification({
          type: 'info',
          action: 'note_category_changed',
          title: 'Catégorie modifiée',
          message: `La catégorie de la note a été changée en "${getCategoryLabel(editCategory)}".`
        });
      }
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

  const confirmDelete = useCallback(() => {
    deleteNote(note.id);
    setShowDeleteConfirm(false);
    addNotification({
      type: 'warning',
      action: 'note_moved_to_trash',
      title: 'Note déplacée dans la corbeille',
      message: 'La note a été déplacée dans la corbeille. Vous pouvez la restaurer depuis la corbeille.'
    });
  }, [note.id, deleteNote, addNotification]);

  const cancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  const togglePin = () => {
    updateNote(note.id, { isPinned: !note.isPinned });
    addNotification({
      type: 'info',
      action: note.isPinned ? 'note_unpinned' : 'note_pinned',
      title: note.isPinned ? 'Note désépinglée' : 'Note épinglée',
      message: `La note a été ${note.isPinned ? 'désépinglée' : 'épinglée'} avec succès.`
    });
  };

  const handleToggleFavorite = () => {
    toggleFavorite(note.id);
    addNotification({
      type: 'info',
      action: note.favorite ? 'note_favorite_removed' : 'note_favorite_added',
      title: note.favorite ? 'Note retirée des favoris' : 'Note ajoutée aux favoris',
      message: `La note a été ${note.favorite ? 'retirée des' : 'ajoutée aux'} favoris.`
    });
  };

  // Fonction pour épingler/désépingler une note
  const toggleArchive = () => {
    updateNote(note.id, { archived: !note.archived });
    addNotification({
      type: 'info',
      action: note.archived ? 'note_unarchived' : 'note_archived',
      title: note.archived ? 'Note désarchivée' : 'Note archivée',
      message: `La note a été ${note.archived ? 'désarchivée' : 'archivée'} avec succès.`
    });
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

  // Fonction pour formater le markdown en HTML
  const formatMarkdown = (content: string): string => {
    return content
      // Titres
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      // Texte important et italique
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Code
      .replace(/`(.+?)`/g, '<code>$1</code>')
      // Listes
      .replace(/^- (.+)$/gm, '<ul><li>$1</li></ul>')
      .replace(/^(\d+)\. (.+)$/gm, '<ol><li>$2</li></ol>')
      // Citations
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      // Nettoyer les listes imbriquées
      .replace(/<\/ul>\s*<ul>/g, '')
      .replace(/<\/ol>\s*<ol>/g, '')
      // Préserver les sauts de ligne
      .replace(/\n/g, '<br>');
  };

  // Fonction pour mettre en évidence le terme de recherche
  const highlightSearchTerm = (content: string, term: string | undefined): React.ReactElement => {
    if (!term || term.trim() === '') {
      return <div className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">{content}</div>;
    }
    
    // Échapper les caractères spéciaux pour éviter les erreurs dans RegExp
    const escapeRegExp = (string: string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };
    
    const escapedTerm = escapeRegExp(term);
      const parts = content.split(new RegExp(`(${escapedTerm})`, 'gi'));
      
      return (
      <div className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
          {parts.map((part, i) => 
          part.toLowerCase() === term.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 dark:bg-yellow-700/50 rounded px-1">{part}</mark>
            ) : (
              part
            )
          )}
      </div>
      );
  };

  // Fonction pour restaurer une note de la corbeille
  const handleRestore = () => {
    restoreFromTrash(note.id);
    addNotification({
      type: 'success',
      action: 'note_restored',
      title: 'Note restaurée',
      message: 'La note a été restaurée avec succès.'
    });
  };

  // Calculer depuis combien de temps la note est dans la corbeille
  const getTimeInTrash = (trashedAt: Date | string | undefined) => {
    if (!trashedAt) return '';
    
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

  // Fonction pour supprimer définitivement une note
  const handlePermanentDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer définitivement cette note ? Cette action est irréversible.')) {
      permanentlyDeleteNote(note.id);
      addNotification({
        type: 'error',
        action: 'note_deleted',
        title: 'Note supprimée définitivement',
        message: 'La note a été supprimée définitivement.'
      });
    }
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-all duration-300
                 ${!note.inTrash && note.isPinned ? 'border-l-4 border-amber-500' : ''}
                 ${!note.inTrash && note.favorite ? 'bg-violet-50/50 dark:bg-violet-900/10' : ''}
                 ${note.inTrash ? 'border border-red-200 dark:border-red-900/20' : ''}
                 ${!note.archived ? 'hover:shadow-xl hover:scale-[1.02] transform' : ''}`}
    >
      <div className="p-4">
        {/* Contenu de la note */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditing && !note.inTrash ? (
              <div className="space-y-2">
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
                  placeholder={`Saisissez votre ${getCategoryLabel(editCategory)} ici...`}
                  className={`w-full resize-y overflow-y-auto bg-transparent
                    outline-none text-gray-800 dark:text-gray-200
                    placeholder-gray-400 dark:placeholder-gray-500
                    min-h-[100px] max-h-[500px] py-3 px-3 rounded-lg
                    border border-gray-200 dark:border-gray-700 focus:border-violet-400 dark:focus:border-violet-600
                    transition-colors duration-200
                    whitespace-pre-wrap`}
                  rows={3}
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <p>Formatage disponible:</p>
                  <ul className="list-disc list-inside">
                    <li># Titre principal</li>
                    <li>## Sous-titre</li>
                    <li>### Petit titre</li>
                    <li>**texte important**</li>
                    <li>*texte en italique*</li>
                    <li>`code`</li>
                    <li>- Liste à puces</li>
                    <li>1. Liste numérotée</li>
                    <li>{'>'} Citation</li>
                  </ul>
                </div>
                <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancel}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600
                             text-gray-600 dark:text-gray-300 rounded-lg transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                    className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
              >
                Enregistrer
              </button>
            </div>
          </div>
        ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none opacity-transition
                            prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                            prose-strong:text-violet-700 dark:prose-strong:text-violet-300
                            prose-em:text-blue-600 dark:prose-em:text-blue-300
                            prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded
                            prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-600
                            prose-blockquote:pl-4 prose-blockquote:italic
                            prose-ul:list-disc prose-ol:list-decimal">
                {searchTerm 
                  ? highlightSearchTerm(formatMarkdown(note.content), searchTerm)
                  : <div dangerouslySetInnerHTML={{ __html: formatMarkdown(note.content) }} />
                }
              </div>
            )}
          </div>

          {/* Actions de la note */}
          <div className="flex items-center space-x-1 ml-4">
            {note.inTrash ? (
              <>
                {/* Actions pour les notes dans la corbeille */}
                <button
                  onClick={handleRestore}
                  className="p-1.5 rounded-lg text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400
                           hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                  title="Restaurer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M13,3A9,9 0 0,0 4,12H1L4.89,15.89L8.78,12H5A7,7 0 0,1 12,5A7,7 0 0,1 19,12A7,7 0 0,1 12,19C10.5,19 9.09,18.5 7.94,17.7L6.5,19.14C8.04,20.3 9.94,21 12,21A9,9 0 0,0 21,12A9,9 0 0,0 12,3M14,12A2,2 0 0,0 12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12Z" />
                  </svg>
                </button>
                <button
                  onClick={handlePermanentDelete}
                  className="p-1.5 rounded-lg text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400
                           hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                  title="Supprimer définitivement"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                {/* Actions normales pour les notes hors corbeille */}
                <button
                  onClick={togglePin}
                  className={`p-1.5 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700
                           ${note.isPinned ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400'}`}
                  title={note.isPinned ? "Désépingler" : "Épingler"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
                  </svg>
                </button>
                
                <button
                  onClick={handleToggleFavorite}
                  className={`p-1.5 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700
                           ${note.favorite ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400'}`}
                  title={note.favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
                  </svg>
                </button>
                
                <button
                  onClick={toggleArchive}
                  className={`p-1.5 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700
                           ${note.archived ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400'}`}
                  title={note.archived ? "Désarchiver" : "Archiver"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M3,3H21V7H3V3M4,8H20V21H4V8M9.5,11A0.5,0.5 0 0,0 9,11.5V13H15V11.5A0.5,0.5 0 0,0 14.5,11H9.5Z" />
                  </svg>
                </button>

                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400
                           hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                  title="Supprimer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                  </svg>
                </button>
              </>
            )}
              </div>
            </div>

        {/* Pied de la note */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getCategoryColor(note.category)}`}>
              {getCategoryLabel(note.category)}
            </span>
            <span>•</span>
            <span>{formatDate(note.createdAt)}</span>
            {note.inTrash && note.trashedAt && (
              <>
                <span>•</span>
                <span className="text-red-500 dark:text-red-400">
                  Supprimé {getTimeInTrash(note.trashedAt)}
                </span>
          </>
        )}
          </div>
          {!note.inTrash && (
            <button
              onClick={() => setIsEditing(true)}
              className="relative flex items-center space-x-1 text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
              </svg>
              <span>Modifier</span>
              <PointCost cost={POINT_COSTS.EDIT_NOTE} />
            </button>
          )}
        </div>
      </div>

      {/* Confirmation de suppression */}
      <DeleteConfirmation
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onClose={cancelDelete}
      />
    </div>
  );
} 