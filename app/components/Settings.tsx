'use client';

import React, { useState } from 'react';
import { NoteCategory } from '../context/NotesContext';
import { useSettings, AppSettings } from '../context/SettingsContext';
import { useNotes } from '../context/NotesContext';
import { usePoints, POINT_COSTS } from '../context/PointsContext';
import PointCost from './PointCost';

export default function Settings() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { notes } = useNotes();
  const { spendPoints, canAfford } = usePoints();
  const [saveIndicator, setSaveIndicator] = useState<string | null>(null);
  
  // Fonction pour montrer un message lorsqu'un paramètre est mis à jour
  const showUpdateFeedback = (message: string) => {
    setSaveIndicator(message);
    setTimeout(() => setSaveIndicator(null), 2000);
  };
  
  // Gestionnaire de mise à jour de paramètres avec feedback visuel
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    // Si le thème est modifié, vérifier les points
    if (newSettings.theme && newSettings.theme !== settings.theme) {
      const canChangeTheme = spendPoints(POINT_COSTS.CHANGE_THEME, 'Changement de thème', 'theme');
      if (!canChangeTheme) return;
    }

    updateSettings(newSettings);
    showUpdateFeedback('Paramètre enregistré');
  };
  
  // Gestionnaire pour réinitialiser tous les paramètres
  const handleResetSettings = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres à leurs valeurs par défaut ?')) {
      resetSettings();
      showUpdateFeedback('Paramètres réinitialisés');
    }
  };
  
  // Liste des catégories disponibles
  const categories: NoteCategory[] = ['mot', 'phrase', 'idée', 'réflexion', 'histoire', 'note'];
  
  // Fonction pour exporter les notes
  const handleExportNotes = () => {
    if (notes.length === 0) {
      alert('Aucune note à exporter.');
      return;
    }
    
    const data = {
      notes,
      exportDate: new Date().toISOString(),
      format: settings.exportFormat
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes_export_${new Date().toISOString().split('T')[0]}.${settings.exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showUpdateFeedback(`${notes.length} notes exportées`);
  };
  
  return (
    <div className="w-full max-w-4xl space-y-8 p-6">
      {/* Indicateur de sauvegarde */}
      {saveIndicator && (
        <div className="fixed top-5 right-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          {saveIndicator}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold gradient-text">Paramètres</h2>
          <button
            onClick={handleResetSettings}
          className="px-4 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
          >
            Réinitialiser
          </button>
      </div>
      
      {/* Section Apparence */}
      <section className="mb-8 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
               style={{ 
                 background: 'linear-gradient(135deg, var(--background-gradient-from), var(--background-gradient-to))',
                 borderLeft: '4px solid var(--primary)'
               }}>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--primary)' }}>
            Apparence
          </h3>
          
          {/* Thème */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--primary-dark)' }}>
              Thème
              </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['violet', 'blue', 'green', 'orange'].map((theme) => (
                  <button
                  key={theme}
                  onClick={() => handleUpdateSettings({ theme })}
                  className={`relative px-4 py-2 rounded-lg text-white font-medium capitalize transition-all duration-200 transform hover:scale-105 ${
                    settings.theme === theme ? 'ring-2 ring-offset-2 ring-opacity-60' : ''
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  style={{
                    background: `var(--${theme}-gradient, linear-gradient(135deg, var(--primary), var(--primary-dark)))`,
                    boxShadow: settings.theme === theme ? '0 0 15px var(--primary-dark)' : 'none'
                  }}
                  disabled={settings.theme === theme || !canAfford(POINT_COSTS.CHANGE_THEME)}
                >
                  {theme}
                  {settings.theme !== theme && <PointCost cost={POINT_COSTS.CHANGE_THEME} />}
                  </button>
                ))}
                  </div>
                </div>
                
          {/* Police */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--primary-dark)' }}>
              Police
              </label>
              <select
                value={settings.fontFamily}
              onChange={(e) => handleUpdateSettings({ fontFamily: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm transition-colors duration-200 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            >
              <option value="system-ui">Système</option>
              <option value="serif">Serif</option>
              <option value="mono">Monospace</option>
              </select>
            </div>
            
          {/* Taille de police */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--primary-dark)' }}>
                Taille du texte
              </label>
            <div className="flex gap-3">
              {['small', 'normal', 'large'].map((size) => (
                <button
                  key={size}
                  onClick={() => handleUpdateSettings({ fontSize: size })}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium capitalize transition-all duration-200 ${
                    settings.fontSize === size 
                      ? 'bg-primary text-white transform scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            </div>
          </div>
        </section>
        
      {/* Section Comportement */}
      <section className="mb-8 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
               style={{ 
                 background: 'linear-gradient(135deg, var(--background-gradient-from), var(--background-gradient-to))',
                 borderLeft: '4px solid var(--secondary)'
               }}>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--secondary)' }}>
            Comportement
          </h3>
          
          {/* Sauvegarde automatique */}
          <div className="flex items-center justify-between mb-6 hover:bg-white/5 p-3 rounded-lg transition-colors duration-200">
            <div>
              <label className="text-sm font-medium" style={{ color: 'var(--secondary)' }}>
                Sauvegarde automatique
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Sauvegarder automatiquement les modifications
              </p>
            </div>
            <button
              onClick={() => handleUpdateSettings({ autoSave: !settings.autoSave })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                settings.autoSave ? 'bg-secondary' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`${
                  settings.autoSave ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`}
              />
            </button>
          </div>
          
          {/* Délai de suppression */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--secondary)' }}>
              Délai de suppression (secondes)
            </label>
                    <input 
              type="range"
              min="0"
              max="60"
              step="5"
              value={settings.deleteDelay}
              onChange={(e) => handleUpdateSettings({ deleteDelay: parseInt(e.target.value) || 0 })}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-secondary"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0s</span>
              <span>{settings.deleteDelay}s</span>
              <span>60s</span>
            </div>
                  </div>
          
          {/* Confirmation de suppression */}
          <div className="flex items-center justify-between hover:bg-white/5 p-3 rounded-lg transition-colors duration-200">
                <div>
              <label className="text-sm font-medium" style={{ color: 'var(--secondary)' }}>
                Confirmation de suppression
                </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Demander confirmation avant de supprimer
              </p>
                  </div>
                <button 
              onClick={() => handleUpdateSettings({ confirmDelete: !settings.confirmDelete })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                settings.confirmDelete ? 'bg-secondary' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`${
                  settings.confirmDelete ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`}
              />
                </button>
          </div>
          </div>
        </section>
            
      {/* Section Exportation */}
      <section className="mb-8 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
               style={{ 
                 background: 'linear-gradient(135deg, var(--background-gradient-from), var(--background-gradient-to))',
                 borderLeft: '4px solid var(--accent)'
               }}>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--accent)' }}>
            Exportation
          </h3>
          
          {/* Format d'exportation */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--accent)' }}>
              Format d'exportation
            </label>
            <select
              value={settings.exportFormat}
              onChange={(e) => handleUpdateSettings({ exportFormat: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm transition-colors duration-200 hover:border-accent focus:border-accent focus:ring-2 focus:ring-accent focus:ring-opacity-50"
            >
              <option value="json">JSON</option>
              <option value="txt">Texte</option>
              <option value="md">Markdown</option>
            </select>
          </div>
          
          <button 
            onClick={handleExportNotes}
            className="w-full px-4 py-3 text-sm font-medium text-white rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-dark, var(--accent)))'
            }}
            disabled={notes.length === 0}
          >
            Exporter les notes ({notes.length})
          </button>
          </div>
        </section>
    </div>
  );
} 