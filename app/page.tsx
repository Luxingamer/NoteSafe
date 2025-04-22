'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotes } from './context/NotesContext';
import { NoteCategory } from './context/NotesContext';
import NoteInput from './components/NoteInput';
import NoteList from './components/NoteList';
import Settings from './components/Settings';
import TopBar from './components/TopBar';

// Types de vues disponibles
type ViewMode = 'all' | 'favorites' | 'archived' | 'recent';

export default function Home() {
  // États pour les filtres et les vues
  const [activeCategory, setActiveCategory] = useState<NoteCategory | 'toutes'>('toutes');
  const [activeView, setActiveView] = useState<ViewMode>('all');
  const [showSettings, setShowSettings] = useState(false);
  const { notes, isLoading, searchResults, searchNotes } = useNotes();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Gérer la sélection de catégorie
  const handleSelectCategory = (category: NoteCategory | 'toutes') => {
    setActiveCategory(category);
    // Réinitialiser la vue à 'all' lorsqu'on change de catégorie
    setActiveView('all');
  };

  // Écouteurs d'événements personnalisés pour les filtres et actions
  useEffect(() => {
    // Fonction pour gérer les événements de filtre
    const handleViewFilter = (event: CustomEvent) => {
      const view = event.detail?.view as ViewMode;
      if (view) {
        setActiveView(view);
      }
    };
    
    // Fonction pour gérer les événements d'importation/exportation
    const importHandler = () => importNotes();
    const exportHandler = () => exportNotes();
    
    // Fonction pour gérer les événements de recherche
    const searchHandler = (event: CustomEvent) => {
      if (event.detail?.term) {
        searchNotes(event.detail.term);
      }
    };
    
    // Fonction pour gérer la création de notes
    const createNoteHandler = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    
    // Ajouter les écouteurs
    window.addEventListener('filter-view', handleViewFilter as EventListener);
    window.addEventListener('import-notes', importHandler);
    window.addEventListener('export-notes', exportHandler);
    window.addEventListener('search-notes', searchHandler as EventListener);
    window.addEventListener('create-note', createNoteHandler);
    
    // Nettoyer les écouteurs à la fin
    return () => {
      window.removeEventListener('filter-view', handleViewFilter as EventListener);
      window.removeEventListener('import-notes', importHandler);
      window.removeEventListener('export-notes', exportHandler);
      window.removeEventListener('search-notes', searchHandler as EventListener);
      window.removeEventListener('create-note', createNoteHandler);
    };
  }, [notes, searchNotes]);

  // Fonctions pour le formattage du texte
  const applyFormat = (format: string) => {
    if (!inputRef.current) return;

    const input = inputRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selectedText = input.value.substring(start, end);
    let formattedText = '';
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `_${selectedText}_`;
        break;
      case 'bullet-list':
        formattedText = selectedText.split('\n').map(line => `• ${line}`).join('\n');
        break;
      case 'numbered-list':
        formattedText = selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n');
        break;
      default:
        formattedText = selectedText;
    }
    
    const newValue = input.value.substring(0, start) + formattedText + input.value.substring(end);
    input.value = newValue;
    
    // Mettre à jour la valeur du textarea
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);
    
    // Notification de succès
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out';
    notification.textContent = `Mise en forme "${format}" appliquée`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 2000);
  };

  // Fonctions pour l'importation/exportation
  const importNotes = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            // Lecture du fichier et traitement réel
            const content = event.target?.result as string;
            const importedNotes = JSON.parse(content);
            
            // En situation réelle, vous importeriez ces notes dans votre état
            console.log('Notes importées:', importedNotes);
            
            // Notification
            const notification = document.createElement('div');
            notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out';
            notification.textContent = 'Notes importées avec succès';
            document.body.appendChild(notification);
            
            setTimeout(() => {
              document.body.removeChild(notification);
            }, 2000);
            
          } catch (error) {
            console.error('Erreur lors de l\'importation:', error);
            
            // Notification d'erreur
            const notification = document.createElement('div');
            notification.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out';
            notification.textContent = 'Erreur lors de l\'importation du fichier';
            document.body.appendChild(notification);
            
            setTimeout(() => {
              document.body.removeChild(notification);
            }, 2000);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const exportNotes = () => {
    try {
      // Préparation des données pour l'export
      const exportData = JSON.stringify(notes, null, 2);
      
      // Création d'un blob et d'un lien pour le téléchargement
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notes-export-${new Date().toISOString().split('T')[0]}.json`;
      
      // Simuler le clic et nettoyer
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Notification
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out';
      notification.textContent = 'Notes exportées avec succès';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de l\'exportation:', error);
      
      // Notification d'erreur
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out';
      notification.textContent = 'Erreur lors de l\'exportation des notes';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 2000);
    }
  };

  // Titre dynamique basé sur la vue actuelle
  const getPageTitle = () => {
    if (searchResults) {
      return 'Résultats de recherche';
    }
    
    if (activeView === 'recent') {
      return 'Notes récentes';
    } 
    
    if (activeView === 'archived') {
      return 'Archives';
    }
    
    if (activeView === 'favorites') {
      return 'Favoris';
    }
    
    return activeCategory === 'toutes' 
      ? 'Notes App'
      : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1) + 's';
  };

  // Description dynamique basée sur la vue actuelle
  const getPageDescription = () => {
    if (searchResults) {
      return `${searchResults.length} résultat(s) trouvé(s)`;
    }
    
    if (activeView === 'recent') {
      return 'Les notes des 7 derniers jours';
    }
    
    if (activeView === 'archived') {
      return 'Notes archivées pour référence ultérieure';
    }
    
    if (activeView === 'favorites') {
      return 'Vos notes préférées';
    }
    
    return activeCategory === 'toutes' 
      ? 'Organisez vos pensées et idées'
      : activeCategory === 'mot' 
        ? 'Conservez les mots qui vous inspirent'
        : activeCategory === 'phrase' 
          ? 'Notez les expressions qui vous marquent'
          : activeCategory === 'idée' 
            ? 'Capturez vos idées avant qu\'elles ne s\'envolent'
            : activeCategory === 'réflexion' 
              ? 'Développez vos pensées et réflexions'
              : activeCategory === 'histoire' 
                ? 'Racontez vos histoires et anecdotes'
                : 'Notez tout ce qui vous passe par la tête';
  };

  // Fonction pour revenir à l'accueil
  const goHome = () => {
    setActiveCategory('toutes');
    setActiveView('all');
    searchNotes(''); // Réinitialiser la recherche
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* TopBar au lieu de Sidebar */}
      <TopBar 
        activeCategory={activeCategory} 
        onSelectCategory={handleSelectCategory}
        onOpenSettings={() => setShowSettings(true)}
        applyFormat={applyFormat}
        importNotes={importNotes}
        exportNotes={exportNotes}
        searchNotes={searchNotes}
        goHome={goHome}
      />
      
      {/* Main Content - ajusté sans la barre latérale */}
      <div className="flex-1 flex flex-col items-center p-4 md:p-8 transition-all duration-300 mt-20">
        <header className="w-full max-w-4xl mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              {getPageTitle()}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {getPageDescription()}
            </p>
          </div>
          
          {/* Bouton de retour à l'accueil - visible seulement en mode recherche ou vues filtrées */}
          {(searchResults || activeView !== 'all') && (
            <button
              onClick={goHome}
              className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300"
              title="Retour à l'accueil"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                  <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />
                </svg>
                <span>Accueil</span>
              </div>
            </button>
          )}
        </header>
        
        {/* Barre d'outils - masquée pour les vues d'archives ou de recherche */}
        {activeView !== 'archived' && !searchResults && (
          <div className="w-full max-w-4xl mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 flex flex-wrap items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => applyFormat('bold')}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" 
                title="Gras"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M13.5,15.5H10V12.5H13.5A1.5,1.5 0 0,1 15,14A1.5,1.5 0 0,1 13.5,15.5M10,6.5H13A1.5,1.5 0 0,1 14.5,8A1.5,1.5 0 0,1 13,9.5H10M15.6,10.79C16.57,10.11 17.25,9 17.25,8C17.25,5.74 15.5,4 13.25,4H7V18H14.04C16.14,18 17.75,16.3 17.75,14.21C17.75,12.69 16.89,11.39 15.6,10.79Z" />
                </svg>
              </button>
              <button 
                onClick={() => applyFormat('italic')}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" 
                title="Italique"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M10,4V7H12.21L8.79,15H6V18H14V15H11.79L15.21,7H18V4H10Z" />
                </svg>
              </button>
              <button 
                onClick={() => applyFormat('underline')}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" 
                title="Souligné"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M5,21H19V19H5V21M12,17A6,6 0 0,0 18,11V3H15.5V11A3.5,3.5 0 0,1 12,14.5A3.5,3.5 0 0,1 8.5,11V3H6V11A6,6 0 0,0 12,17Z" />
                </svg>
              </button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
              <button 
                onClick={() => applyFormat('bullet-list')}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" 
                title="Liste à puces"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M7,5H21V7H7V5M7,13V11H21V13H7M4,4.5A1.5,1.5 0 0,1 5.5,6A1.5,1.5 0 0,1 4,7.5A1.5,1.5 0 0,1 2.5,6A1.5,1.5 0 0,1 4,4.5M4,10.5A1.5,1.5 0 0,1 5.5,12A1.5,1.5 0 0,1 4,13.5A1.5,1.5 0 0,1 2.5,12A1.5,1.5 0 0,1 4,10.5M7,19V17H21V19H7M4,16.5A1.5,1.5 0 0,1 5.5,18A1.5,1.5 0 0,1 4,19.5A1.5,1.5 0 0,1 2.5,18A1.5,1.5 0 0,1 4,16.5Z" />
                </svg>
              </button>
              <button 
                onClick={() => applyFormat('numbered-list')}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" 
                title="Liste numérotée"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M7,13H21V11H7M7,19H21V17H7M7,7H21V5H7M2,11H3.8L2,13.1V14H5V13H3.2L5,10.9V10H2M3,8H4V4H2V5H3M2,17H4V17.5H3V18.5H4V19H2V20H5V16H2V17Z" />
                </svg>
              </button>
            </div>
            <div className="flex space-x-2 mt-2 sm:mt-0">
              <button 
                onClick={importNotes}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" 
                title="Importer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                </svg>
              </button>
              <button 
                onClick={exportNotes}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" 
                title="Exporter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        <main className="w-full flex flex-col items-center gap-4">
          {/* N'afficher le formulaire de saisie que dans la vue normale */}
          {activeView === 'all' && !searchResults && (
            <NoteInput inputRef={inputRef} />
          )}
          
          {/* Liste des notes */}
          <NoteList 
            categoryFilter={activeCategory} 
            viewMode={activeView}
          />
        </main>

        {/* Indicateur de chargement */}
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-20">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-800 dark:text-gray-200 font-medium">Chargement des notes...</span>
            </div>
          </div>
        )}
        
        {/* Modal Paramètres */}
        <Settings 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)} 
        />
      </div>
      
      {/* Styles pour l'animation des notifications */}
      <style jsx global>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(20px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
        .animate-fade-in-out {
          animation: fadeInOut 2s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}
