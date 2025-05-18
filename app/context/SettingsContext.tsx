'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { NoteCategory } from './NotesContext';
import { useNotifications } from './NotificationsContext';

// Type pour les paramètres de l'application
export interface AppSettings {
  deleteDelay: number;
  autoSave: boolean;
  fontFamily: string;
  fontSize: string;
  categoryLabels: Record<NoteCategory, string>;
  exportFormat: string;
  confirmDelete: boolean;
  theme: string;
}

// Paramètres par défaut
const defaultSettings: AppSettings = {
  deleteDelay: 10,
  autoSave: true,
  fontFamily: 'system-ui',
  fontSize: 'normal',
  exportFormat: 'json',
  confirmDelete: true,
  theme: 'violet',
  categoryLabels: {
    'mot': 'Mot',
    'phrase': 'Phrase',
    'idée': 'Idée',
    'réflexion': 'Réflexion',
    'histoire': 'Histoire',
    'note': 'Note'
  }
};

// Interface pour le contexte
interface SettingsContextProps {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
  getCategoryLabel: (category: NoteCategory) => string;
}

// Créer le contexte
const SettingsContext = createContext<SettingsContextProps>({
  settings: defaultSettings,
  updateSettings: () => {},
  resetSettings: () => {},
  getCategoryLabel: () => '',
});

// Hook personnalisé pour utiliser le contexte
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings doit être utilisé à l\'intérieur d\'un SettingsProvider');
  }
  return context;
};

// Provider component
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const { addNotification } = useNotifications();

  // Charger les paramètres depuis le localStorage
  useEffect(() => {
    if (!isInitialized) {
      try {
        const storedSettings = localStorage.getItem('notesAppSettings');
        if (storedSettings) {
          console.log("Chargement des paramètres depuis localStorage:", storedSettings);
          const parsedSettings = JSON.parse(storedSettings);
          setSettings(prev => ({
            ...prev,
            ...parsedSettings
          }));
        } else {
          console.log("Aucun paramètre trouvé dans localStorage, utilisation des valeurs par défaut");
        }
      } catch (e) {
        console.error('Erreur lors de la lecture des paramètres', e);
      }
      
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Mettre à jour le localStorage quand les paramètres changent
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('notesAppSettings', JSON.stringify(settings));
        
        // Appliquer les paramètres de style
        document.documentElement.style.setProperty('--font-family', settings.fontFamily);
        
        // Appliquer la taille de police
        document.body.classList.remove('text-sm', 'text-base', 'text-lg');
        if (settings.fontSize === 'small') {
          document.body.classList.add('text-sm');
        } else if (settings.fontSize === 'large') {
          document.body.classList.add('text-lg');
        } else {
          document.body.classList.add('text-base');
        }
        
        // Appliquer le thème de couleur
        document.documentElement.setAttribute('data-theme', settings.theme);
        
        // Enregistrer l'heure de la dernière mise à jour pour le débogage
        setLastUpdate(new Date().toLocaleTimeString());
        console.log("Paramètres mis à jour:", settings);
      } catch (e) {
        console.error('Erreur lors de la sauvegarde des paramètres', e);
      }
    }
  }, [settings, isInitialized]);

  // Mettre à jour les paramètres
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    console.log("Mise à jour des paramètres:", newSettings);
    
    // Notifications pour chaque type de changement
    Object.entries(newSettings).forEach(([key, value]) => {
      switch (key) {
        case 'theme':
          if (value !== settings.theme) {
            document.documentElement.classList.add('theme-transition');
            setTimeout(() => {
              document.documentElement.classList.remove('theme-transition');
            }, 500);
            
            addNotification({
              type: 'info',
              action: 'settings_theme_changed',
              title: 'Thème modifié',
              message: `Le thème a été changé en "${value}".`
            });
          }
          break;

        case 'deleteDelay':
          addNotification({
            type: 'info',
            action: 'settings_delete_delay_changed',
            title: 'Délai de suppression modifié',
            message: `Le délai de suppression a été défini à ${value} secondes.`
          });
          break;

        case 'autoSave':
          addNotification({
            type: 'info',
            action: 'settings_notifications_changed',
            title: 'Sauvegarde automatique',
            message: value ? 'La sauvegarde automatique a été activée.' : 'La sauvegarde automatique a été désactivée.'
          });
          break;

        case 'fontFamily':
          addNotification({
            type: 'info',
            action: 'settings_theme_changed',
            title: 'Police modifiée',
            message: `La police a été changée en "${value}".`
          });
          break;

        case 'fontSize':
          addNotification({
            type: 'info',
            action: 'settings_theme_changed',
            title: 'Taille de police modifiée',
            message: `La taille de police a été définie sur "${value}".`
          });
          break;

        case 'confirmDelete':
          addNotification({
            type: 'info',
            action: 'settings_security_changed',
            title: 'Confirmation de suppression',
            message: value ? 'La confirmation de suppression a été activée.' : 'La confirmation de suppression a été désactivée.'
          });
          break;
      }
    });
    
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  // Réinitialiser les paramètres
  const resetSettings = () => {
    console.log("Réinitialisation des paramètres aux valeurs par défaut");
    
    setSettings(defaultSettings);
    
    addNotification({
      type: 'warning',
      action: 'settings_security_changed',
      title: 'Paramètres réinitialisés',
      message: 'Tous les paramètres ont été réinitialisés aux valeurs par défaut.'
    });
  };
  
  // Récupérer le label d'une catégorie
  const getCategoryLabel = (category: NoteCategory): string => {
    if (!settings.categoryLabels || !settings.categoryLabels[category]) {
      console.warn(`Label pour la catégorie "${category}" non trouvé, utilisation du nom de la catégorie`);
      return category;
    }
    return settings.categoryLabels[category];
  };

  // Pour le débogage - vérifie si le localStorage fonctionne
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('settingsTest', 'test');
        localStorage.removeItem('settingsTest');
        console.log("localStorage fonctionne correctement");
      } catch (e) {
        console.error("Problème avec localStorage:", e);
      }
    }
  }, [isInitialized]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        getCategoryLabel
      }}
    >
      {/* Indicateur caché pour le débogage */}
      <div style={{ display: 'none' }} data-last-update={lastUpdate}></div>
      {children}
    </SettingsContext.Provider>
  );
} 