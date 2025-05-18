'use client';

import React, { useState } from 'react';
import { Note } from '../context/NotesContext';

interface ReminderModalProps {
  note: Note;
  isOpen: boolean;
  onClose: () => void;
  onSave: (date: Date, noteId: string) => void;
}

export default function ReminderModal({ note, isOpen, onClose, onSave }: ReminderModalProps) {
  // États pour le formulaire de rappel
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    new Date(new Date().getTime() + 60 * 60 * 1000).toTimeString().slice(0, 5)
  );
  const [reminderType, setReminderType] = useState<'once' | 'daily' | 'weekly'>('once');
  
  // Options prédéfinies de rappel
  const reminderPresets = [
    { label: "Dans 1 heure", value: 1, unit: "hour" },
    { label: "Ce soir", value: 20, unit: "hour" },
    { label: "Demain", value: 1, unit: "day" },
    { label: "Dans une semaine", value: 7, unit: "days" }
  ];
  
  // Appliquer un preset
  const applyPreset = (preset: { value: number, unit: string }) => {
    const now = new Date();
    let targetDate = new Date();
    
    if (preset.unit === "hour") {
      targetDate.setHours(now.getHours() + preset.value);
    } else if (preset.unit === "day") {
      targetDate.setDate(now.getDate() + preset.value);
    } else if (preset.unit === "days") {
      targetDate.setDate(now.getDate() + preset.value);
    }
    
    // Pour "Ce soir", définir à 20:00
    if (preset.unit === "hour" && preset.value === 20) {
      targetDate = new Date();
      targetDate.setHours(20, 0, 0, 0);
    }
    
    setSelectedDate(targetDate.toISOString().split('T')[0]);
    setSelectedTime(targetDate.toTimeString().slice(0, 5));
  };
  
  // Enregistrer le rappel
  const handleSaveReminder = () => {
    const reminderDate = new Date(`${selectedDate}T${selectedTime}`);
    onSave(reminderDate, note.id);
    onClose();
    
    // Afficher une notification de confirmation
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out';
    notification.textContent = `Rappel défini pour le ${reminderDate.toLocaleString('fr-FR')}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  };
  
  // Obtenir le contenu court de la note
  const getNotePreview = () => {
    if (note.content.length > 30) {
      return note.content.substring(0, 30) + '...';
    }
    return note.content;
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity">
      <div className="fade-in bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="flex items-center justify-between bg-violet-500 dark:bg-violet-700 p-4 text-white">
          <h3 className="text-lg font-semibold">
            Définir un rappel
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
          {/* Aperçu de la note */}
          <section className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-violet-600 dark:text-violet-400">
                <path d="M4,2H20A2,2 0 0,1 22,4V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V4A2,2 0 0,1 4,2M4,4V20H20V4H4M8,9H16V11H8V9M8,12H16V14H8V12M8,15H16V17H8V15M8,6H16V8H8V6Z" />
              </svg>
              <span className="font-medium text-gray-800 dark:text-gray-200">Note</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getNotePreview()}
            </p>
          </section>
          
          {/* Options prédéfinies */}
          <section>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Options rapides
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {reminderPresets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </section>
          
          {/* Date et heure */}
          <section>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date et heure personnalisées
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="reminder-date" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Date
                </label>
                <input
                  id="reminder-date"
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label htmlFor="reminder-time" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Heure
                </label>
                <input
                  id="reminder-time"
                  type="time"
                  value={selectedTime}
                  onChange={e => setSelectedTime(e.target.value)}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          </section>
          
          {/* Type de répétition */}
          <section>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Répétition
            </h4>
            <div className="flex space-x-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="reminderType"
                  value="once"
                  checked={reminderType === 'once'}
                  onChange={() => setReminderType('once')}
                  className="mr-1.5 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Une fois</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="reminderType"
                  value="daily"
                  checked={reminderType === 'daily'}
                  onChange={() => setReminderType('daily')}
                  className="mr-1.5 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Chaque jour</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="reminderType"
                  value="weekly"
                  checked={reminderType === 'weekly'}
                  onChange={() => setReminderType('weekly')}
                  className="mr-1.5 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Chaque semaine</span>
              </label>
            </div>
          </section>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSaveReminder}
              className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 