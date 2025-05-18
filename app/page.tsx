'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotes } from './context/NotesContext';
import { NoteCategory } from './context/NotesContext';
import NoteInput from './components/NoteInput';
import NoteList from './components/NoteList';
import Settings from './components/Settings';
import TopBar from './components/TopBar';
import SplashScreen from './components/SplashScreen';
import Calendar from './components/Calendar';
import Statistics from './components/Statistics';
import Profile from './components/Profile';
import Achievements from './components/Achievements';
import SideIconBar from './components/SideIconBar';
import Notifications from './components/Notifications';
import Documentation from './components/Documentation';
import AI from './components/AI';
import Book from './components/Book';
import PointsManager from './components/PointsManager';

// Types de vues disponibles
type ViewMode = 'all' | 'favorites' | 'archived' | 'recent' | 'settings' | 'calendar' | 'statistics' | 'profile' | 'achievements' | 'book' | 'ai' | 'notifications' | 'documentation' | 'trash' | 'points';

export default function Home() {
  // États pour les filtres et les vues
  const [activeCategory, setActiveCategory] = useState<NoteCategory | 'toutes'>('toutes');
  const [activeView, setActiveView] = useState<ViewMode>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isViewChanging, setIsViewChanging] = useState(false);
  const { notes, searchResults, searchNotes } = useNotes();
  const inputRef = useRef<HTMLTextAreaElement>(null) as React.RefObject<HTMLTextAreaElement>;

  // Gérer la sélection de catégorie
  const handleSelectCategory = (category: NoteCategory | 'toutes') => {
    setActiveCategory(category);
    // Réinitialiser la vue à 'all' lorsqu'on change de catégorie
    handleViewChange('all');
  };
  
  // Fonction pour gérer le changement de vue avec animation
  const handleViewChange = (view: ViewMode) => {
    if (activeView === view) return;
    
    setIsViewChanging(true);
    setTimeout(() => {
      setActiveView(view);
      setIsViewChanging(false);
    }, 200);
  };

  // Simulation de chargement initial pour afficher le SplashScreen
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Écouteurs d'événements personnalisés pour les filtres et actions
  useEffect(() => {
    // Fonction pour gérer les événements de filtre
    const handleViewFilter = (event: CustomEvent) => {
      const view = event.detail?.view as ViewMode;
      if (view) {
        handleViewChange(view);
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
      a.download = `notesafe-export-${new Date().toISOString().split('T')[0]}.json`;
      
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

    if (activeView === 'settings') {
      return 'Paramètres';
    }

    if (activeView === 'calendar') {
      return 'Calendrier';
    }
    
    if (activeView === 'statistics') {
      return 'Statistiques';
    }
    
    if (activeView === 'profile') {
      return 'Profil';
    }
    
    if (activeView === 'achievements') {
      return 'Succès';
    }
    
    if (activeView === 'book') {
      return 'Mode Livre';
    }
    
    if (activeView === 'ai') {
      return 'Intelligence Artificielle';
    }
    
    if (activeView === 'notifications') {
      return 'Notifications';
    }
    
    if (activeView === 'documentation') {
      return 'Documentation';
    }
    
    return activeCategory === 'toutes' 
      ? 'NoteSafe'
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

    if (activeView === 'settings') {
      return 'Personnalisez votre expérience NoteSafe';
    }

    if (activeView === 'calendar') {
      return 'Visualisez vos notes par date de création';
    }
    
    if (activeView === 'statistics') {
      return 'Analysez vos habitudes d\'écriture et la répartition de vos notes';
    }
    
    if (activeView === 'profile') {
      return 'Gérez votre profil et vos préférences utilisateur';
    }
    
    if (activeView === 'achievements') {
      return 'Suivez votre progression et débloquez des récompenses';
    }
    
    if (activeView === 'book') {
      return 'Lisez vos notes dans un format de livre électronique';
    }
    
    if (activeView === 'ai') {
      return 'Utilisez l\'IA pour générer et améliorer vos notes';
    }
    
    if (activeView === 'notifications') {
      return 'Gérez vos alertes et rappels';
    }
    
    if (activeView === 'documentation') {
      return 'Consultez les guides d\'utilisation et les astuces';
    }
    
    return activeCategory === 'toutes' 
      ? 'Sécurisez et organisez vos pensées en toute simplicité'
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
    handleViewChange('all');
    searchNotes(''); // Réinitialiser la recherche
  };

  // Afficher l'écran de chargement
  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <div className="flex min-h-screen" style={{ 
      background: `linear-gradient(to bottom right, var(--background-gradient-from), var(--background-gradient-to))` 
    }}>
      {/* SideIconBar - barre d'icônes verticale */}
      <SideIconBar />
      
      {/* Contenu principal avec TopBar */}
      <div className="flex-1 flex flex-col">
        {/* TopBar avec z-index plus élevé */}
        <div className="z-20 relative">
      <TopBar 
        activeCategory={activeCategory} 
        onSelectCategory={handleSelectCategory}
        onOpenSettings={() => setActiveView('settings')}
        applyFormat={applyFormat}
        importNotes={importNotes}
        exportNotes={exportNotes}
        searchNotes={searchNotes}
        goHome={goHome}
      />
        </div>
      
        {/* Main Content - ajusté avec un padding supplémentaire à gauche pour la barre d'icônes */}
        <div className="flex-1 flex flex-col items-center p-4 md:p-8 transition-all duration-300 mt-20 ml-14">
        <header className="w-full max-w-4xl mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 gradient-text text-shadow" style={{ 
              color: 'var(--primary)', 
              background: `linear-gradient(to right, var(--primary), var(--secondary))`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {getPageTitle()}
            </h1>
            <p style={{ color: 'var(--primary-dark)' }}>
              {getPageDescription()}
            </p>
          </div>
          
          {/* Bouton de retour à l'accueil - visible seulement en mode recherche ou vues filtrées */}
          {(searchResults || activeView !== 'all') && (
            <button
              onClick={goHome}
              className="p-2 rounded-lg bright-shadow flex items-center"
              style={{ 
                backgroundColor: `color-mix(in srgb, var(--primary) 10%, transparent)`,
                color: `var(--primary-dark)`
              }}
              title="Retour à l'accueil"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />
              </svg>
              <span>Accueil</span>
            </button>
          )}
        </header>
        
          <main className={`w-full flex flex-col items-center gap-4 transition-opacity duration-200 ${isViewChanging ? 'opacity-0' : 'opacity-100'}`}>
          {/* Afficher les composants en fonction de la vue active */}
          {activeView === 'all' && !searchResults && (
              <div className="view-transition-top w-full flex justify-center">
                <div className="w-full max-w-4xl">
            <NoteInput inputRef={inputRef} activeCategory={activeCategory} />
                </div>
              </div>
          )}
          
          {/* Afficher les composants spéciaux */}
          {activeView === 'settings' ? (
              <div className="view-transition-zoom w-full flex justify-center">
                <div className="w-full max-w-4xl">
            <Settings />
                </div>
              </div>
          ) : activeView === 'calendar' ? (
              <div className="view-transition-right w-full flex justify-center">
                <div className="w-full max-w-4xl">
            <Calendar />
                </div>
              </div>
          ) : activeView === 'statistics' ? (
              <div className="view-transition-left w-full flex justify-center">
                <div className="w-full max-w-4xl">
            <Statistics />
                </div>
              </div>
          ) : activeView === 'profile' ? (
              <div className="view-transition-right w-full flex justify-center">
                <div className="w-full max-w-4xl">
            <Profile />
                </div>
              </div>
          ) : activeView === 'achievements' ? (
              <div className="view-transition-zoom w-full flex justify-center">
                <div className="w-full max-w-4xl">
            <Achievements />
                </div>
              </div>
            ) : activeView === 'book' ? (
              <div className="view-transition-right w-full flex justify-center">
                <div className="w-full max-w-4xl">
                  <Book />
                </div>
              </div>
            ) : activeView === 'ai' ? (
              <div className="view-transition-right w-full flex justify-center">
                <div className="w-full max-w-4xl">
                  <AI />
                </div>
              </div>
            ) : activeView === 'notifications' ? (
              <div className="view-transition-bottom w-full flex justify-center">
                <div className="w-full max-w-4xl">
                  <Notifications />
                </div>
              </div>
            ) : activeView === 'documentation' ? (
              <div className="view-transition-left w-full flex justify-center">
                <div className="w-full max-w-4xl">
                  <Documentation />
                </div>
              </div>
          ) : activeView === 'points' ? (
            <div className="view-transition-right w-full flex justify-center">
              <div className="w-full max-w-4xl">
                <PointsManager />
              </div>
            </div>
          ) : (
            /* Liste des notes */
              <div className="view-transition-fade w-full flex justify-center">
                <div className="w-full max-w-4xl">
            <NoteList 
              categoryFilter={activeCategory} 
              viewMode={activeView}
            />
                </div>
              </div>
          )}
        </main>
        </div>
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
