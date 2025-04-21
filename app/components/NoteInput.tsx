'use client';

import React, { useState, useRef, useEffect, RefObject } from 'react';
import { useNotes, NoteCategory } from '../context/NotesContext';

interface NoteInputProps {
  inputRef?: RefObject<HTMLTextAreaElement>;
}

export default function NoteInput({ inputRef }: NoteInputProps) {
  const [input, setInput] = useState('');
  const [category, setCategory] = useState<NoteCategory>('note');
  const [isFocused, setIsFocused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const localInputRef = useRef<HTMLTextAreaElement>(null);
  const { addNote } = useNotes();

  // Référence finale (utiliser la référence passée en prop ou la référence locale)
  const finalInputRef = inputRef || localInputRef;

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
    <form 
      onSubmit={handleSubmit} 
      className={`w-full max-w-3xl transition-all duration-300 ease-in-out
                 ${isFocused ? 'scale-102 shadow-lg' : 'shadow-md'}
                 ${isAnimating ? 'pulse' : ''}
                 bg-white dark:bg-gray-800 rounded-xl p-4 mb-8 fade-in`}
    >
      <div className="mb-2">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                category === cat
                  ? getCategoryColor(cat) + ' ring-2 ring-offset-1 ring-gray-300 dark:ring-gray-600'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {getCategoryLabel(cat)}
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
          placeholder="Saisissez votre note ici..."
          className="w-full resize-none overflow-hidden bg-transparent
                    outline-none text-gray-800 dark:text-gray-200
                    placeholder-gray-400 dark:placeholder-gray-500
                    min-h-[60px] max-h-[200px] py-2 px-1"
          rows={1}
        />
      </div>
      <div className="flex justify-between items-center mt-2">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Catégorie sélectionnée: <span className="font-medium">{getCategoryLabel(category)}</span>
        </div>
        <button
          type="submit"
          disabled={!input.trim()}
          className={`px-4 py-2 rounded-lg font-medium transition-all 
                    ${input.trim() 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'}
                    transform active:scale-95 duration-150`}
        >
          Ajouter
        </button>
      </div>
    </form>
  );
} 