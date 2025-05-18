'use client';

import React, { useState, useEffect } from 'react';
import { Note } from '../context/NotesContext';

interface NoteInfoProps {
  note: Note;
  isOpen: boolean;
  onClose: () => void;
}

export default function NoteInfo({ note, isOpen, onClose }: NoteInfoProps) {
  // États pour les statistiques sur la note
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [byteSize, setByteSize] = useState(0);
  
  // Calculer les statistiques quand la note change
  useEffect(() => {
    if (note && isOpen) {
      // Nombre de caractères
      const chars = note.content.length;
      setCharCount(chars);
      
      // Nombre de mots (division par espaces et autres séparateurs)
      const words = note.content
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0).length;
      setWordCount(words);
      
      // Taille approximative en bytes (2 bytes par caractère pour tenir compte des caractères spéciaux)
      const bytes = new Blob([note.content]).size;
      setByteSize(bytes);
    }
  }, [note, isOpen]);
  
  // Formater les dates pour l'affichage
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };
  
  // Traduire les catégories pour l'affichage
  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      'mot': 'Mot',
      'phrase': 'Phrase',
      'idée': 'Idée',
      'réflexion': 'Réflexion',
      'histoire': 'Histoire',
      'note': 'Note'
    };
    return labels[category] || category;
  };
  
  // Formatage de la taille du fichier
  const formatByteSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} octets`;
    return `${(bytes / 1024).toFixed(2)} Ko`;
  };
  
  // Si le modal n'est pas ouvert, ne rien afficher
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity">
      <div className="fade-in bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4 overflow-hidden">
        <div className="flex items-center justify-between bg-violet-500 dark:bg-violet-700 p-4 text-white">
          <h3 className="text-lg font-semibold">
            Informations sur la note
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20"
            aria-label="Fermer"
            title="Fermer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>
        
        <div className="p-5 space-y-6">
          {/* Section Statistiques */}
          <section>
            <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-violet-500 dark:text-violet-400">
                <path d="M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z" />
              </svg>
              Statistiques
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <span className="text-sm text-gray-500 dark:text-gray-400">Caractères</span>
                <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">{charCount}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <span className="text-sm text-gray-500 dark:text-gray-400">Mots</span>
                <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">{wordCount}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <span className="text-sm text-gray-500 dark:text-gray-400">Taille</span>
                <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">{formatByteSize(byteSize)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <span className="text-sm text-gray-500 dark:text-gray-400">Âge</span>
                <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  {Math.floor((new Date().getTime() - new Date(note.createdAt).getTime()) / (1000 * 60 * 60 * 24))} jours
                </p>
              </div>
            </div>
          </section>
          
          {/* Section Métadonnées */}
          <section>
            <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-violet-500 dark:text-violet-400">
                <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,13H13V17H11V13Z" />
              </svg>
              Métadonnées
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Identifiant</span>
                <span className="text-gray-800 dark:text-gray-200 font-mono text-sm">{note.id.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Catégorie</span>
                <span className="text-gray-800 dark:text-gray-200">{getCategoryLabel(note.category)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Créé le</span>
                <span className="text-gray-800 dark:text-gray-200">{formatDate(note.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Modifié le</span>
                <span className="text-gray-800 dark:text-gray-200">{formatDate(note.updatedAt)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Favori</span>
                <span className="text-gray-800 dark:text-gray-200">
                  {note.favorite ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-500">
                      <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
                    </svg>
                  ) : 'Non'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 dark:text-gray-400">Archivé</span>
                <span className="text-gray-800 dark:text-gray-200">
                  {note.archived ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-500">
                      <path d="M3,3H21V7H3V3M4,8H20V21H4V8M9.5,11A0.5,0.5 0 0,0 9,11.5V13H15V11.5A0.5,0.5 0 0,0 14.5,11H9.5Z" />
                    </svg>
                  ) : 'Non'}
                </span>
              </div>
            </div>
          </section>
          
          {/* Section Rappel (placeholder - sera implémenté plus tard) */}
          <section>
            <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-violet-500 dark:text-violet-400">
                <path d="M12,20A7,7 0 0,1 5,13A7,7 0 0,1 12,6A7,7 0 0,1 19,13A7,7 0 0,1 12,20M12,4A9,9 0 0,0 3,13A9,9 0 0,0 12,22A9,9 0 0,0 21,13A9,9 0 0,0 12,4M12.5,8H11V14L15.75,16.85L16.5,15.62L12.5,13.25V8M7.88,3.39L6.6,1.86L2,5.71L3.29,7.24L7.88,3.39M22,5.72L17.4,1.86L16.11,3.39L20.71,7.25L22,5.72Z" />
              </svg>
              Définir un rappel
            </h4>
            <button 
              className="w-full py-2 px-4 bg-violet-500 hover:bg-violet-600 text-white rounded-lg flex items-center justify-center"
              title="Définir un rappel pour cette note"
              aria-label="Définir un rappel pour cette note"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                <path d="M13,9H11V12H8V14H11V17H13V14H16V12H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
              </svg>
              Ajouter un rappel
            </button>
          </section>
        </div>
      </div>
    </div>
  );
} 