'use client';

import React, { useState, useEffect } from 'react';
import { useNotes, Note } from '../context/NotesContext';
import { NoteCategory } from '../context/NotesContext';

// Définition des couleurs par catégorie
const categoryColors: Record<NoteCategory, string> = {
  'mot': 'bg-purple-500',
  'phrase': 'bg-blue-500',
  'idée': 'bg-green-500',
  'réflexion': 'bg-amber-500',
  'histoire': 'bg-pink-500',
  'note': 'bg-gray-500'
};

// Définition des couleurs de bordure par catégorie
const categoryBorderColors: Record<NoteCategory, string> = {
  'mot': 'border-purple-500',
  'phrase': 'border-blue-500',
  'idée': 'border-green-500',
  'réflexion': 'border-amber-500',
  'histoire': 'border-pink-500',
  'note': 'border-gray-500'
};

// Composant principal du calendrier
export default function Calendar() {
  // États pour gérer le calendrier
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [notesByDate, setNotesByDate] = useState<Record<string, {count: number, categories: Record<NoteCategory, number>}>>({});
  const [showNoteList, setShowNoteList] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Récupérer les notes depuis le contexte
  const { notes } = useNotes();
  
  // Mettre à jour l'heure actuelle toutes les secondes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Formater une date en chaîne YYYY-MM-DD pour la comparaison
  const formatDateKey = (date: Date): string => {
    const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return d.toISOString().split('T')[0];
  };

  // Compter les notes par jour et par catégorie pour le mois actuel
  useEffect(() => {
    // Objet pour stocker le nombre de notes par jour et par catégorie
    const countByDate: Record<string, {count: number, categories: Record<NoteCategory, number>}> = {};
    
    // Pour chaque note, incrémenter le compteur pour sa date de création
    notes.forEach(note => {
      const noteDate = new Date(note.createdAt);
      const dateKey = formatDateKey(noteDate);
      
      if (!countByDate[dateKey]) {
        countByDate[dateKey] = {
          count: 0,
          categories: {
            'mot': 0,
            'phrase': 0,
            'idée': 0,
            'réflexion': 0,
            'histoire': 0,
            'note': 0
          }
        };
      }
      
      countByDate[dateKey].count += 1;
      
      // Incrémenter le compteur pour cette catégorie
      if (note.category) {
        countByDate[dateKey].categories[note.category as NoteCategory] += 1;
      }
    });
    
    setNotesByDate(countByDate);
  }, [notes]);

  // Obtenir le nombre de jours dans le mois actuel
  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Obtenir le jour de la semaine du premier jour du mois (0 = dimanche, 1 = lundi, etc.)
  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
  };

  // Naviguer au mois précédent
  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
    setSelectedDate(null);
    setShowNoteList(false);
  };

  // Naviguer au mois suivant
  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
    setSelectedDate(null);
    setShowNoteList(false);
  };

  // Sélectionner une date
  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    setShowNoteList(true);
  };

  // Filtrer les notes pour la date sélectionnée
  const getNotesForSelectedDate = (): Note[] => {
    if (!selectedDate) return [];
    
    const dateKey = formatDateKey(selectedDate);
    return notes.filter(note => formatDateKey(note.createdAt) === dateKey);
  };

  // Noms des mois en français
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Noms des jours de la semaine en français (à partir de lundi)
  const weekdayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  
  // Noms des jours complets pour l'affichage de la date actuelle
  const fullWeekdayNames = [
    'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
  ];

  // Calculer les infos du mois actuel
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  
  // Ajuster pour commencer la semaine par lundi (1) au lieu de dimanche (0)
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  const firstDayAdjusted = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // 0 (dimanche) devient 6, les autres jours sont décalés de 1

  // Créer les jours du calendrier
  const calendarDays = [];
  
  // Ajouter les jours vides pour le début du mois
  for (let i = 0; i < firstDayAdjusted; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-10 p-1"></div>);
  }
  
  // Ajouter les jours du mois
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = formatDateKey(date);
    const dateInfo = notesByDate[dateKey];
    const hasNotes = dateInfo && dateInfo.count > 0;
    
    // Comparer avec currentTime au lieu d'une nouvelle instance de Date
    const isToday = day === currentTime.getDate() && 
                  month === currentTime.getMonth() && 
                  year === currentTime.getFullYear();
    
    // Déterminer la couleur dominante si des notes existent
    let dominantCategoryColor = '';
    if (hasNotes) {
      let maxCount = 0;
      let dominantCategory: NoteCategory | null = null;
      
      // Trouver la catégorie avec le plus de notes
      Object.entries(dateInfo.categories).forEach(([category, count]) => {
        if (count > maxCount) {
          maxCount = count;
          dominantCategory = category as NoteCategory;
        }
      });
      
      if (dominantCategory) {
        dominantCategoryColor = categoryBorderColors[dominantCategory];
      }
    }
    
    calendarDays.push(
      <div 
        key={`day-${day}`} 
        className={`h-10 p-1 relative cursor-pointer transition-all border-2
                   ${isToday
                     ? 'bg-blue-100 dark:bg-blue-900/30 rounded-lg border-blue-500'
                     : hasNotes
                       ? `rounded-lg ${dominantCategoryColor}`
                       : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}
        onClick={() => handleDateClick(day)}
      >
        <div className={`flex items-center justify-center h-full 
                        ${isToday ? 'font-bold text-blue-600 dark:text-blue-400' : ''}`}>
          {day}
          {hasNotes && (
            <div className="absolute bottom-0.5 right-0.5 flex space-x-0.5">
              {Object.entries(dateInfo.categories).map(([category, count]) => {
                if (count > 0) {
                  return (
                    <span 
                      key={category} 
                      className={`w-1.5 h-1.5 ${categoryColors[category as NoteCategory]} rounded-full`}
                      title={`${count} note(s) de type ${category}`}
                    ></span>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Les notes pour la date sélectionnée
  const selectedDateNotes = getNotesForSelectedDate();

  return (
    <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 fade-in">
      {/* Date et heure actuelles */}
      <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
        <div className="text-gray-700 dark:text-gray-300">
          <div className="text-2xl font-bold text-gradient bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
            {fullWeekdayNames[currentTime.getDay()]}, {currentTime.getDate()} {monthNames[currentTime.getMonth()]} {currentTime.getFullYear()}
          </div>
          <div className="text-xl text-gray-600 dark:text-gray-400">
            {currentTime.toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Notes ce mois-ci
          </div>
          <div className="flex space-x-1">
            {Object.keys(categoryColors).map(category => (
              <div key={category} className="flex items-center mr-2">
                <span className={`inline-block w-3 h-3 ${categoryColors[category as NoteCategory]} rounded-full mr-1`}></span>
                <span className="text-xs text-gray-600 dark:text-gray-400">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Navigation du calendrier */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={goToPreviousMonth}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
          aria-label="Mois précédent"
          title="Mois précédent"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
          </svg>
        </button>
        
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          {monthNames[month]} {year}
        </h2>
        
        <button 
          onClick={goToNextMonth}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
          aria-label="Mois suivant"
          title="Mois suivant"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
          </svg>
        </button>
      </div>
      
      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdayNames.map(day => (
          <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>
      
      {/* Grille des jours */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {calendarDays}
      </div>
      
      {/* Détails de la date sélectionnée */}
      {selectedDate && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
              {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </h3>
            
            <div className="flex space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedDateNotes.length} note{selectedDateNotes.length !== 1 && 's'}
              </span>
              
              <button
                onClick={() => setShowNoteList(!showNoteList)}
                className="px-3 py-1 text-sm bg-violet-500 hover:bg-violet-600 text-white rounded-lg flex items-center transition-colors"
                disabled={selectedDateNotes.length === 0}
              >
                {showNoteList ? 'Masquer' : 'Voir les notes'}
              </button>
            </div>
          </div>
          
          {/* Liste des notes pour la date sélectionnée */}
          {showNoteList && selectedDateNotes.length > 0 && (
            <div className="space-y-2 mt-2 max-h-60 overflow-y-auto pr-2">
              {selectedDateNotes.map(note => (
                <div 
                  key={note.id}
                  className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex items-start">
                    {/* Indicateur de catégorie */}
                    <div className={`w-2 h-full rounded-full mr-2 self-stretch 
                      ${note.category ? categoryColors[note.category as NoteCategory] : 'bg-gray-500'}`}
                    ></div>
                    
                    <div className="flex-1">
                      {/* Contenu de la note (tronqué) */}
                      <p className="text-gray-800 dark:text-gray-200 text-sm line-clamp-2">
                        {note.content}
                      </p>
                      
                      {/* Informations sur la note */}
                      <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="capitalize">{note.category}</span>
                        <span>
                          {new Date(note.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 