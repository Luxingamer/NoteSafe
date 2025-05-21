'use client';

import React, { useState, useRef, useEffect, RefObject } from 'react';
import { useNotes, NoteCategory } from '../context/NotesContext';
import { motion } from 'framer-motion';

interface NoteInputProps {
  inputRef?: RefObject<HTMLTextAreaElement>;
  activeCategory?: NoteCategory | 'toutes';
}

export default function NoteInput({ inputRef, activeCategory = 'toutes' }: NoteInputProps) {
  const [input, setInput] = useState('');
  const [category, setCategory] = useState<NoteCategory>('note');
  const [isFocused, setIsFocused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const localInputRef = useRef<HTMLTextAreaElement>(null);
  const { addNote } = useNotes();
  
  // Référence finale (utiliser la référence passée en prop ou la référence locale)
  const finalInputRef = inputRef || localInputRef;
  
  // Effet pour mettre à jour la catégorie lorsque la catégorie active change
  useEffect(() => {
    if (activeCategory !== 'toutes') {
      setCategory(activeCategory as NoteCategory);
    }
  }, [activeCategory]);

  // Arrêter l'animation de pulsation après quelques secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  // Ajuster automatiquement la hauteur du textarea
  useEffect(() => {
    if (finalInputRef.current) {
      finalInputRef.current.style.height = 'auto';
      finalInputRef.current.style.height = `${finalInputRef.current.scrollHeight}px`;
    }
  }, [input, finalInputRef]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      addNote(input.trim(), category);
      setInput('');
      
      // Réinitialiser la hauteur
      if (finalInputRef.current) {
        finalInputRef.current.style.height = 'auto';
      }
    }
  };

  // Liste des catégories disponibles
  const categories: NoteCategory[] = ['mot', 'phrase', 'idée', 'réflexion', 'histoire', 'note'];

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
      'mot': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700',
      'phrase': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700',
      'idée': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700',
      'réflexion': 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700',
      'histoire': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700',
      'note': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700'
    };
    return colors[cat];
  };

  // Vérifier si la sélection de catégorie doit être verrouillée
  const isCategoryLocked = activeCategory !== 'toutes';

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`w-full max-w-4xl transition-all duration-300 ease-in-out
                 ${isFocused ? 'scale-102 shadow-xl' : 'shadow-lg'}
                 ${isAnimating ? 'pulse' : ''}
                 bg-white dark:bg-gray-800 rounded-xl p-5 mb-8 fade-in
                 border-2 border-violet-200 dark:border-violet-900`}
    >
      <div className="mb-3">
        <h2 className="text-lg font-bold text-violet-800 dark:text-violet-300 mb-2">
          {isCategoryLocked 
            ? `Créer une nouvelle note de type "${getCategoryLabel(category)}"` 
            : "Créer une nouvelle note"}
        </h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => !isCategoryLocked && setCategory(cat)}
              disabled={isCategoryLocked && cat !== category}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all border-2 
                ${category === cat
                  ? getCategoryColor(cat) + ' ring-2 ring-offset-1 ring-violet-300 dark:ring-violet-700'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600'
                }
                ${isCategoryLocked && cat !== category ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {getCategoryLabel(cat)}
              {isCategoryLocked && cat === category && (
                <span className="ml-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      <div className="relative">
        <textarea
          ref={finalInputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={`Saisissez votre ${category} ici...`}
          className={`w-full resize-y overflow-y-auto bg-transparent
                    outline-none text-gray-800 dark:text-gray-200
                    placeholder-gray-400 dark:placeholder-gray-500
                    min-h-[100px] max-h-[500px] py-3 px-3 rounded-lg
                    border border-gray-200 dark:border-gray-700 focus:border-violet-400 dark:focus:border-violet-600
                    transition-colors duration-200
                    whitespace-pre-wrap`}
          rows={3}
        />
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center">
          <div className="text-sm text-indigo-600 dark:text-indigo-400">
            Catégorie: <span className={`inline-block px-2 py-0.5 rounded-full font-medium ${getCategoryColor(category)}`}>
              {getCategoryLabel(category)}
              {isCategoryLocked && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              )}
            </span>
          </div>
        </div>
        <button
          type="submit"
          disabled={!input.trim()}
          className={`px-6 py-2 rounded-lg font-medium transition-all 
                    ${input.trim() 
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg' 
                      : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'}
                    transform active:scale-95 duration-150`}
        >
          Ajouter
        </button>
      </div>
    </form>
  );
} 