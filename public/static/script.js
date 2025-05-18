// Types et interfaces
/**
 * @typedef {Object} Note
 * @property {string} id - Identifiant unique de la note
 * @property {string} content - Contenu de la note
 * @property {string} category - Catégorie de la note
 * @property {Date} createdAt - Date de création
 * @property {Date} updatedAt - Date de modification
 * @property {boolean} favorite - Si la note est en favoris
 * @property {boolean} isPinned - Si la note est épinglée
 * @property {boolean} archived - Si la note est archivée
 */

/**
 * @typedef {Object} Achievement
 * @property {string} id - Identifiant unique du succès
 * @property {string} title - Titre du succès
 * @property {string} description - Description du succès
 * @property {string} icon - Emoji représentant le succès
 * @property {function} condition - Fonction qui vérifie si le succès est débloqué
 * @property {Date} [unlockedAt] - Date de déblocage du succès (undefined si non débloqué)
 * @property {'commun'|'rare'|'épique'|'légendaire'} rarity - Rareté du succès
 * @property {'écriture'|'exploration'|'collection'|'maîtrise'} category - Catégorie du succès
 * @property {number} points - Points attribués pour le succès
 */

/**
 * @typedef {Object} AchievementData
 * @property {number} totalNotes - Nombre total de notes
 * @property {Object.<string, number>} notesByCategory - Nombre de notes par catégorie
 * @property {number} consecutiveDays - Nombre de jours consécutifs d'écriture
 * @property {number} totalWords - Nombre total de mots
 * @property {number} totalCharacters - Nombre total de caractères
 * @property {number} favorites - Nombre de notes en favoris
 * @property {number} archived - Nombre de notes archivées
 * @property {number} streakDays - Nombre de jours consécutifs
 * @property {number} userDays - Nombre de jours depuis l'inscription
 */

// État de l'application
const appState = {
  notes: [],
  activeCategory: 'toutes',
  activeView: 'all',
  searchTerm: '',
  currentTheme: 'system',
  isDarkMode: false,
  achievements: [], // Liste des succès
  unlockedAchievements: [], // Liste des succès débloqués
  user: {
    name: 'Luxin Enow',
    email: 'luxin5268@gmail.com',
    joined: new Date('2023-01-15')
  }
};

// ===============================
// Chargement initial et utilitaires
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  // Initialisation
  initializeApp();
  
  // Écouter les événements
  setupEventListeners();
  
  // Charger les données
  loadData();
  
  // Afficher l'écran de démarrage puis masquer après 2 secondes
  setTimeout(() => {
    document.getElementById('splash-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
  }, 2000);
});

function initializeApp() {
  // Vérifier la préférence de thème
  const savedTheme = localStorage.getItem('theme') || 'system';
  appState.currentTheme = savedTheme;
  
  // Appliquer le thème
  applyTheme(savedTheme);
  
  // Initialiser les succès
  initializeAchievements();
  
  // Mettre à jour le titre de la vue active
  updateViewTitle();
}

function applyTheme(theme) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (theme === 'system') {
    appState.isDarkMode = prefersDark;
    document.documentElement.removeAttribute('data-theme');
  } else {
    appState.isDarkMode = theme === 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }
  
  // Mettre à jour l'icône du bouton de thème
  const themeToggleIcon = document.querySelector('#theme-toggle i');
  themeToggleIcon.className = appState.isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
  
  // Mettre à jour les boutons de thème dans les paramètres
  const themeButtons = document.querySelectorAll('.theme-btn');
  themeButtons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
  });
}

function setupEventListeners() {
  // Écouteurs d'événements pour la barre latérale
  setupSidebarListeners();
  
  // Écouteurs d'événements pour les notes
  setupNoteInputListeners();
  
  // Écouteurs d'événements pour les paramètres
  setupSettingsListeners();
  
  // Écouteurs d'événements pour la recherche
  setupSearchListeners();
  
  // Écouteurs d'événements pour les succès
  setupAchievementsListeners();
  
  // Écouteurs d'événements pour les boutons d'action
  setupActionListeners();
}

function setupSidebarListeners() {
  // Sélectionner une vue
  document.querySelectorAll('.sidebar nav ul li[data-view]').forEach(item => {
    item.addEventListener('click', (e) => {
      const view = e.currentTarget.getAttribute('data-view');
      changeView(view);
    });
  });
  
  // Sélectionner une catégorie
  document.querySelectorAll('.categories ul li[data-category]').forEach(item => {
    item.addEventListener('click', (e) => {
      const category = e.currentTarget.getAttribute('data-category');
      changeCategory(category);
    });
  });
  
  // Boutons d'importation/exportation
  document.getElementById('import-button').addEventListener('click', importNotes);
  document.getElementById('export-button').addEventListener('click', exportNotes);
}

function setupNoteInputListeners() {
  // Bouton d'enregistrement de note
  document.getElementById('save-note').addEventListener('click', saveNote);
  
  // Boutons de mise en forme
  document.querySelectorAll('.format-buttons button').forEach(button => {
    button.addEventListener('click', (e) => {
      const format = e.currentTarget.getAttribute('data-format');
      applyFormat(format);
    });
  });
}

function setupSettingsListeners() {
  // Bouton de paramètres
  document.getElementById('settings-button').addEventListener('click', () => {
    changeView('settings');
  });
  
  // Bouton de thème
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  
  // Boutons de thème dans les paramètres
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const theme = e.currentTarget.getAttribute('data-theme');
      appState.currentTheme = theme;
      localStorage.setItem('theme', theme);
      applyTheme(theme);
    });
  });
  
  // Bouton de suppression de toutes les notes
  document.getElementById('clear-notes-button').addEventListener('click', () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les notes ? Cette action est irréversible.')) {
      appState.notes = [];
      saveToLocalStorage();
      renderNotes();
      showNotification('Toutes les notes ont été supprimées.');
    }
  });
  
  // Bouton de sauvegarde
  document.getElementById('backup-button').addEventListener('click', exportNotes);
}

function setupSearchListeners() {
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  
  searchInput.addEventListener('input', (e) => {
    appState.searchTerm = e.target.value.trim().toLowerCase();
    if (appState.searchTerm === '') {
      renderNotes();
    }
  });
  
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      searchNotes();
    }
  });
  
  searchButton.addEventListener('click', searchNotes);
}

function setupActionListeners() {
  // Modalité de confirmation de suppression
  document.getElementById('cancel-delete').addEventListener('click', () => {
    document.getElementById('delete-confirm').classList.add('hidden');
  });
  
  document.getElementById('confirm-delete').addEventListener('click', () => {
    const noteId = document.getElementById('delete-confirm').getAttribute('data-note-id');
    if (noteId) {
      deleteNote(noteId);
      document.getElementById('delete-confirm').classList.add('hidden');
    }
  });
}

// ===============================
// Gestion de l'état et des données
// ===============================
function loadData() {
  // Charger les notes depuis localStorage
  const savedNotes = localStorage.getItem('notes');
  if (savedNotes) {
    try {
      const parsedNotes = JSON.parse(savedNotes);
      
      // Convertir les chaînes de date en objets Date
      appState.notes = parsedNotes.map(note => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      }));
      
      renderNotes();
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error);
      showNotification('Erreur lors du chargement des notes.', true);
    }
  } else {
    // Créer quelques notes d'exemple pour la démonstration
    createSampleNotes();
  }
}

function createSampleNotes() {
  const sampleNotes = [
    {
      id: generateId(),
      content: "Bienvenue sur NoteSafe ! Ceci est votre première note.",
      category: "note",
      createdAt: new Date(),
      updatedAt: new Date(),
      favorite: false,
      isPinned: true,
      archived: false
    },
    {
      id: generateId(),
      content: "Vous pouvez créer différentes catégories de notes: mots, phrases, idées, réflexions, histoires ou simples notes.",
      category: "idée",
      createdAt: new Date(Date.now() - 86400000), // Hier
      updatedAt: new Date(Date.now() - 86400000),
      favorite: true,
      isPinned: false,
      archived: false
    },
    {
      id: generateId(),
      content: "La vie est ce qui arrive quand on est occupé à faire d'autres projets.",
      category: "phrase",
      createdAt: new Date(Date.now() - 172800000), // Avant-hier
      updatedAt: new Date(Date.now() - 172800000),
      favorite: false,
      isPinned: false,
      archived: false
    }
  ];
  
  appState.notes = sampleNotes;
  saveToLocalStorage();
  renderNotes();
}

function saveToLocalStorage() {
  localStorage.setItem('notes', JSON.stringify(appState.notes));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ===============================
// Actions utilisateur
// ===============================
function changeView(view) {
  // Mettre à jour la vue active
  appState.activeView = view;
  
  // Mettre à jour les classes CSS pour la navigation
  document.querySelectorAll('.sidebar nav ul li[data-view]').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-view') === view);
  });
  
  // Masquer/afficher les vues appropriées
  const noteListContainer = document.querySelector('.note-list-container');
  const calendarView = document.getElementById('calendar-view');
  const settingsView = document.getElementById('settings-view');
  
  if (view === 'calendar') {
    noteListContainer.classList.add('hidden');
    calendarView.classList.remove('hidden');
    settingsView.classList.add('hidden');
    renderCalendar();
  } else if (view === 'settings') {
    noteListContainer.classList.add('hidden');
    calendarView.classList.add('hidden');
    settingsView.classList.remove('hidden');
  } else {
    noteListContainer.classList.remove('hidden');
    calendarView.classList.add('hidden');
    settingsView.classList.add('hidden');
    renderNotes();
  }
  
  updateViewTitle();
}

function changeCategory(category) {
  // Mettre à jour la catégorie active
  appState.activeCategory = category;
  
  // Mettre à jour les classes CSS pour les catégories
  document.querySelectorAll('.categories ul li[data-category]').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-category') === category);
  });
  
  // Revenir à la vue principale
  changeView('all');
  
  // Rendre les notes
  renderNotes();
}

function toggleTheme() {
  const newTheme = appState.isDarkMode ? 'light' : 'dark';
  appState.currentTheme = newTheme;
  localStorage.setItem('theme', newTheme);
  applyTheme(newTheme);
}

function saveNote() {
  const noteInput = document.getElementById('note-input');
  const categorySelect = document.getElementById('note-category');
  
  const content = noteInput.value.trim();
  const category = categorySelect.value;
  
  if (content === '') {
    showNotification('Veuillez saisir du contenu pour votre note.', true);
    return;
  }
  
  const now = new Date();
  const newNote = {
    id: generateId(),
    content,
    category,
    createdAt: now,
    updatedAt: now,
    favorite: false,
    isPinned: false,
    archived: false
  };
  
  appState.notes.unshift(newNote);
  noteInput.value = '';
  
  saveToLocalStorage();
  renderNotes();
  
  showNotification('Note enregistrée avec succès.');
  
  // Vérifier les succès
  checkAchievements();
}

function deleteNote(id) {
  appState.notes = appState.notes.filter(note => note.id !== id);
  saveToLocalStorage();
  renderNotes();
  showNotification('Note supprimée avec succès.');
}

function confirmDeleteNote(id) {
  const modal = document.getElementById('delete-confirm');
  modal.setAttribute('data-note-id', id);
  modal.classList.remove('hidden');
}

function editNote(id, content) {
  const note = appState.notes.find(note => note.id === id);
  if (note) {
    note.content = content;
    note.updatedAt = new Date();
    saveToLocalStorage();
    renderNotes();
    showNotification('Note modifiée avec succès.');
  }
}

function togglePin(id) {
  const note = appState.notes.find(note => note.id === id);
  if (note) {
    note.isPinned = !note.isPinned;
    saveToLocalStorage();
    renderNotes();
    
    const action = note.isPinned ? 'épinglée' : 'désépinglée';
    showNotification(`Note ${action} avec succès.`);
  }
}

function toggleFavorite(id) {
  const note = appState.notes.find(note => note.id === id);
  if (note) {
    note.favorite = !note.favorite;
    saveToLocalStorage();
    renderNotes();
    
    const action = note.favorite ? 'ajoutée aux favoris' : 'retirée des favoris';
    showNotification(`Note ${action} avec succès.`);
  }
}

function toggleArchive(id) {
  const note = appState.notes.find(note => note.id === id);
  if (note) {
    note.archived = !note.archived;
    saveToLocalStorage();
    renderNotes();
    
    const action = note.archived ? 'archivée' : 'désarchivée';
    showNotification(`Note ${action} avec succès.`);
  }
}

function importNotes() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result;
          const importedNotes = JSON.parse(content);
          
          // Vérifier le format
          if (Array.isArray(importedNotes)) {
            appState.notes = importedNotes.map(note => ({
              ...note,
              createdAt: new Date(note.createdAt),
              updatedAt: new Date(note.updatedAt)
            }));
            
            saveToLocalStorage();
            renderNotes();
            showNotification('Notes importées avec succès.');
          } else {
            throw new Error('Format invalide');
          }
        } catch (error) {
          console.error('Erreur lors de l\'importation:', error);
          showNotification('Format de fichier invalide.', true);
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

function exportNotes() {
  const exportData = JSON.stringify(appState.notes, null, 2);
  const blob = new Blob([exportData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `notesafe-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showNotification('Notes exportées avec succès.');
}

function searchNotes() {
  const searchTerm = appState.searchTerm;
  
  if (searchTerm === '') {
    renderNotes();
    return;
  }
  
  renderNotes();
  updateViewTitle(`Recherche: "${searchTerm}"`);
}

// ===============================
// Fonctions de rendu
// ===============================
function renderNotes() {
  const notesListContainer = document.getElementById('notes-list');
  notesListContainer.innerHTML = '';
  
  let filteredNotes = appState.notes;
  
  // Filtrer par vue
  if (appState.activeView === 'favorites') {
    filteredNotes = filteredNotes.filter(note => note.favorite);
  } else if (appState.activeView === 'archived') {
    filteredNotes = filteredNotes.filter(note => note.archived);
  } else if (appState.activeView === 'all' && !appState.archived) {
    filteredNotes = filteredNotes.filter(note => !note.archived);
  }
  
  // Filtrer par catégorie
  if (appState.activeCategory !== 'toutes') {
    filteredNotes = filteredNotes.filter(note => note.category === appState.activeCategory);
  }
  
  // Filtrer par recherche
  if (appState.searchTerm !== '') {
    filteredNotes = filteredNotes.filter(note => 
      note.content.toLowerCase().includes(appState.searchTerm) ||
      note.category.toLowerCase().includes(appState.searchTerm)
    );
  }
  
  // Tri : épinglées d'abord, puis par date de mise à jour
  filteredNotes.sort((a, b) => {
    // D'abord les épinglées
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Puis par date (plus récent en premier)
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });
  
  // Créer les éléments de note
  if (filteredNotes.length === 0) {
    notesListContainer.innerHTML = '<div class="empty-state">Aucune note à afficher.</div>';
  } else {
    for (const note of filteredNotes) {
      const noteElement = createNoteElement(note);
      notesListContainer.appendChild(noteElement);
    }
  }
  
  updateViewTitle();
}

function createNoteElement(note) {
  const template = document.getElementById('note-template');
  const noteElement = document.importNode(template.content, true);
  
  const noteItem = noteElement.querySelector('.note-item');
  const noteCategory = noteElement.querySelector('.note-category');
  const noteContent = noteElement.querySelector('.note-content');
  const noteDate = noteElement.querySelector('.note-date');
  const pinButton = noteElement.querySelector('.pin-note');
  const favoriteButton = noteElement.querySelector('.favorite-note');
  const archiveButton = noteElement.querySelector('.archive-note');
  const editButton = noteElement.querySelector('.edit-note');
  const deleteButton = noteElement.querySelector('.delete-note');
  
  // Définir les attributs et le contenu
  noteItem.setAttribute('data-id', note.id);
  
  if (note.isPinned) {
    noteItem.setAttribute('data-pinned', 'true');
  }
  
  if (note.favorite) {
    noteItem.setAttribute('data-favorite', 'true');
    favoriteButton.innerHTML = '<i class="fas fa-star"></i>';
  }
  
  // Définir la catégorie
  noteCategory.textContent = getCategoryLabel(note.category);
  noteCategory.setAttribute('data-category', note.category);
  
  // Définir le contenu avec Markdown simple
  noteContent.innerHTML = formatText(note.content);
  
  // Définir la date
  noteDate.textContent = formatDate(note.updatedAt);
  
  // Ajouter les écouteurs d'événements
  pinButton.addEventListener('click', () => togglePin(note.id));
  favoriteButton.addEventListener('click', () => toggleFavorite(note.id));
  archiveButton.addEventListener('click', () => toggleArchive(note.id));
  editButton.addEventListener('click', () => {
    const newContent = prompt('Modifier la note:', note.content);
    if (newContent !== null && newContent.trim() !== '') {
      editNote(note.id, newContent.trim());
    }
  });
  deleteButton.addEventListener('click', () => confirmDeleteNote(note.id));
  
  return noteElement.firstElementChild;
}

function renderCalendar() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const calendarTitle = document.getElementById('calendar-title');
  const calendarGrid = document.querySelector('.calendar-grid');
  
  // Définir le titre du calendrier
  calendarTitle.textContent = new Intl.DateTimeFormat('fr-FR', { 
    year: 'numeric', 
    month: 'long' 
  }).format(date);
  
  // Supprimer les jours existants
  const days = calendarGrid.querySelectorAll('.calendar-day');
  days.forEach(day => day.remove());
  
  // Obtenir le jour de la semaine du premier jour (0 = dimanche, 1 = lundi, etc.)
  let dayOfWeek = firstDay.getDay();
  dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Ajuster pour commencer par lundi
  
  // Ajouter les jours du mois précédent
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = dayOfWeek - 1; i >= 0; i--) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day other-month';
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'calendar-day-number';
    dayNumber.textContent = prevMonthLastDay - i;
    
    dayElement.appendChild(dayNumber);
    calendarGrid.appendChild(dayElement);
  }
  
  // Ajouter les jours du mois actuel
  const today = new Date();
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    const currentDate = new Date(year, month, i);
    
    // Vérifier si c'est aujourd'hui
    if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
      dayElement.classList.add('today');
    }
    
    // Vérifier s'il y a des notes pour ce jour
    const hasNotes = appState.notes.some(note => {
      const noteDate = new Date(note.createdAt);
      return noteDate.getFullYear() === year && 
             noteDate.getMonth() === month && 
             noteDate.getDate() === i;
    });
    
    if (hasNotes) {
      dayElement.classList.add('has-notes');
    }
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'calendar-day-number';
    dayNumber.textContent = i;
    
    dayElement.appendChild(dayNumber);
    calendarGrid.appendChild(dayElement);
  }
  
  // Calculer le nombre de jours à ajouter pour le mois suivant
  const totalDays = dayOfWeek + lastDay.getDate();
  const remainingCells = totalDays % 7 === 0 ? 0 : 7 - (totalDays % 7);
  
  // Ajouter les jours du mois suivant
  for (let i = 1; i <= remainingCells; i++) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day other-month';
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'calendar-day-number';
    dayNumber.textContent = i;
    
    dayElement.appendChild(dayNumber);
    calendarGrid.appendChild(dayElement);
  }
}

// ===============================
// Fonctions utilitaires
// ===============================
function updateViewTitle(customTitle) {
  const viewTitleElement = document.getElementById('current-view-title');
  
  if (customTitle) {
    viewTitleElement.textContent = customTitle;
    return;
  }
  
  let title = '';
  
  switch (appState.activeView) {
    case 'all':
      title = appState.activeCategory === 'toutes' 
        ? 'Toutes les notes' 
        : `Notes de type: ${getCategoryLabel(appState.activeCategory)}`;
      break;
    case 'favorites':
      title = 'Notes favorites';
      break;
    case 'archived':
      title = 'Notes archivées';
      break;
    case 'recent':
      title = 'Notes récentes';
      break;
  }
  
  viewTitleElement.textContent = title;
}

function formatDate(date) {
  // Si c'est aujourd'hui, afficher l'heure
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return `Aujourd'hui, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Hier, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }
}

function getCategoryLabel(category) {
  const labels = {
    'mot': 'Mot',
    'phrase': 'Phrase',
    'idée': 'Idée',
    'réflexion': 'Réflexion',
    'histoire': 'Histoire',
    'note': 'Note'
  };
  
  return labels[category] || 'Note';
}

function formatText(text) {
  // Convertir les ** en gras
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convertir les * en italique
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convertir les _ en souligné
  formatted = formatted.replace(/_(.*?)_/g, '<u>$1</u>');
  
  // Convertir les listes à puces
  formatted = formatted.replace(/^•\s+(.*?)$/gm, '<li>$1</li>');
  formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  
  // Convertir les listes numérotées
  formatted = formatted.replace(/^\d+\.\s+(.*?)$/gm, '<li>$1</li>');
  formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>');
  
  // Convertir les sauts de ligne
  formatted = formatted.replace(/\n/g, '<br>');
  
  return formatted;
}

function applyFormat(format) {
  const textarea = document.getElementById('note-input');
  const startPos = textarea.selectionStart;
  const endPos = textarea.selectionEnd;
  const selectedText = textarea.value.substring(startPos, endPos);
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
  
  textarea.value = textarea.value.substring(0, startPos) + formattedText + textarea.value.substring(endPos);
  textarea.focus();
  
  // Placer le curseur après le texte formaté
  textarea.selectionStart = startPos + formattedText.length;
  textarea.selectionEnd = startPos + formattedText.length;
}

function showNotification(message, isError = false, icon = null) {
  // Créer la notification
  const notification = document.createElement('div');
  notification.className = `notification ${isError ? 'error' : 'success'}`;
  
  // Ajouter l'icône si fournie
  let messageContent = message;
  if (icon) {
    messageContent = `<span class="notification-icon">${icon}</span> ${message}`;
  }
  
  notification.innerHTML = messageContent;
  
  // Ajouter au corps de la page
  document.body.appendChild(notification);
  
  // Attendre un peu puis ajouter la classe pour l'animation
  setTimeout(() => notification.classList.add('show'), 10);
  
  // Supprimer après un délai
  setTimeout(() => {
    notification.classList.remove('show');
    notification.addEventListener('transitionend', () => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    });
  }, 3000);
}

// ===============================
// Gestion des succès
// ===============================

// Liste des succès disponibles
const achievementsList = [
  {
    id: 'first-note',
    title: 'Premier pas',
    description: 'Créez votre première note',
    icon: '📝',
    condition: (data) => data.totalNotes >= 1,
    rarity: 'commun',
    category: 'écriture',
    points: 10
  },
  {
    id: 'note-collector',
    title: 'Collectionneur de pensées',
    description: 'Créez 25 notes',
    icon: '📚',
    condition: (data) => data.totalNotes >= 25,
    rarity: 'commun',
    category: 'collection',
    points: 20
  },
  {
    id: 'prolific-writer',
    title: 'Écrivain prolifique',
    description: 'Créez 100 notes',
    icon: '✒️',
    condition: (data) => data.totalNotes >= 100,
    rarity: 'rare',
    category: 'écriture',
    points: 50
  },
  {
    id: 'master-writer',
    title: 'Maître des mots',
    description: 'Créez 250 notes',
    icon: '🏆',
    condition: (data) => data.totalNotes >= 250,
    rarity: 'épique',
    category: 'maîtrise',
    points: 100
  },
  {
    id: 'category-explorer',
    title: 'Explorateur de catégories',
    description: 'Utilisez toutes les catégories de notes au moins une fois',
    icon: '🧭',
    condition: (data) => Object.values(data.notesByCategory).filter(count => count > 0).length >= 6,
    rarity: 'rare',
    category: 'exploration',
    points: 30
  },
  {
    id: 'consistent-writer',
    title: 'Écrivain régulier',
    description: 'Écrivez des notes pendant 7 jours consécutifs',
    icon: '📅',
    condition: (data) => data.consecutiveDays >= 7,
    rarity: 'rare',
    category: 'maîtrise',
    points: 40
  },
  {
    id: 'word-smith',
    title: 'Forgeur de mots',
    description: 'Écrivez plus de 10 000 mots au total',
    icon: '💬',
    condition: (data) => data.totalWords >= 10000,
    rarity: 'épique',
    category: 'écriture',
    points: 75
  },
  {
    id: 'favorite-collector',
    title: 'Collectionneur de favoris',
    description: 'Ajoutez 20 notes à vos favoris',
    icon: '⭐',
    condition: (data) => data.favorites >= 20,
    rarity: 'commun',
    category: 'collection',
    points: 25
  },
  {
    id: 'archivist',
    title: 'Archiviste',
    description: 'Archivez 20 notes',
    icon: '🗃️',
    condition: (data) => data.archived >= 20,
    rarity: 'commun',
    category: 'collection',
    points: 20
  },
  {
    id: 'dedicated-writer',
    title: 'Écrivain dévoué',
    description: 'Écrivez des notes pendant 30 jours consécutifs',
    icon: '🔥',
    condition: (data) => data.consecutiveDays >= 30,
    rarity: 'légendaire',
    category: 'maîtrise',
    points: 150
  },
  {
    id: 'completionist',
    title: 'Complétiste',
    description: 'Débloquez 85% des succès disponibles',
    icon: '🌟',
    condition: (data) => false, // Cette condition est vérifiée séparément
    rarity: 'légendaire',
    category: 'maîtrise',
    points: 200
  },
  {
    id: 'idea-machine',
    title: 'Machine à idées',
    description: 'Créez 35 notes de type "idée"',
    icon: '💡',
    condition: (data) => (data.notesByCategory['idée'] || 0) >= 35,
    rarity: 'rare',
    category: 'collection',
    points: 40
  },
  {
    id: 'storyteller',
    title: 'Conteur',
    description: 'Créez 25 notes de type "histoire"',
    icon: '📖',
    condition: (data) => (data.notesByCategory['histoire'] || 0) >= 25,
    rarity: 'rare',
    category: 'écriture',
    points: 35
  },
  {
    id: 'night-owl',
    title: 'Oiseau de nuit',
    description: 'Créez une note entre minuit et 5h du matin',
    icon: '🦉',
    condition: () => false, // Cette condition est vérifiée lors de la création d'une note
    rarity: 'rare',
    category: 'exploration',
    points: 30
  },
  {
    id: 'longterm-user',
    title: 'Utilisateur fidèle',
    description: 'Utilisez NoteSafe pendant 90 jours',
    icon: '🏅',
    condition: (data) => data.userDays >= 90,
    rarity: 'épique',
    category: 'maîtrise',
    points: 100
  },
  {
    id: 'grand-master',
    title: 'Grand Maître',
    description: 'Créez 500 notes',
    icon: '👑',
    condition: (data) => data.totalNotes >= 500,
    rarity: 'légendaire',
    category: 'maîtrise',
    points: 250
  },
  {
    id: 'iron-will',
    title: 'Volonté de Fer',
    description: 'Écrivez des notes pendant 100 jours consécutifs',
    icon: '⚔️',
    condition: (data) => data.consecutiveDays >= 100,
    rarity: 'légendaire',
    category: 'maîtrise',
    points: 300
  },
  {
    id: 'wordsmith-elite',
    title: 'Élite des Mots',
    description: 'Écrivez plus de 50 000 mots au total',
    icon: '📜',
    condition: (data) => data.totalWords >= 50000,
    rarity: 'légendaire',
    category: 'écriture',
    points: 200
  },
  {
    id: 'category-master',
    title: 'Maître des Catégories',
    description: 'Créez au moins 15 notes dans chaque catégorie',
    icon: '🎭',
    condition: (data) => {
      const categories = ['mot', 'phrase', 'idée', 'réflexion', 'histoire', 'note'];
      return categories.every(cat => (data.notesByCategory[cat] || 0) >= 15);
    },
    rarity: 'épique',
    category: 'exploration',
    points: 150
  },
  {
    id: 'year-long-journey',
    title: 'Voyage d\'une Année',
    description: 'Utilisez NoteSafe pendant 365 jours',
    icon: '🗓️',
    condition: (data) => data.userDays >= 365,
    rarity: 'légendaire',
    category: 'maîtrise',
    points: 300
  },
  {
    id: 'mega-collection',
    title: 'Méga Collection',
    description: 'Ajoutez 50 notes à vos favoris',
    icon: '🌠',
    condition: (data) => data.favorites >= 50,
    rarity: 'épique',
    category: 'collection',
    points: 120
  },
  {
    id: 'philosopher',
    title: 'Philosophe',
    description: 'Créez 50 notes de type "réflexion"',
    icon: '🧠',
    condition: (data) => (data.notesByCategory['réflexion'] || 0) >= 50,
    rarity: 'épique',
    category: 'écriture',
    points: 130
  },
  {
    id: 'polyglot',
    title: 'Polyglotte',
    description: 'Utilisez au moins 5 langues différentes dans vos notes',
    icon: '🌐',
    condition: () => false, // Cette condition nécessiterait une analyse de texte
    rarity: 'épique',
    category: 'exploration',
    points: 140
  },
  {
    id: 'midnight-marathon',
    title: 'Marathon de Minuit',
    description: 'Créez 10 notes entre minuit et 5h du matin',
    icon: '🌃',
    condition: () => false, // Cette condition est vérifiée lors de la création d'une note
    rarity: 'épique',
    category: 'exploration',
    points: 145
  },
  {
    id: 'perfect-streak',
    title: 'Série Parfaite',
    description: 'Écrivez exactement une note par jour pendant 50 jours consécutifs',
    icon: '🎯',
    condition: () => false, // Cette condition nécessiterait un historique détaillé
    rarity: 'légendaire',
    category: 'maîtrise',
    points: 230
  }
];

// Initialiser les succès
function initializeAchievements() {
  try {
    // Charger les succès depuis localStorage
    const savedAchievements = localStorage.getItem('notesafe_achievements');
    if (savedAchievements) {
      const parsedAchievements = JSON.parse(savedAchievements);
      // Convertir les dates de string à Date
      parsedAchievements.forEach(achievement => {
        if (achievement.unlockedAt) {
          achievement.unlockedAt = new Date(achievement.unlockedAt);
        }
      });
      
      appState.unlockedAchievements = parsedAchievements;
      
      // Mettre à jour la liste complète des succès avec les dates de déblocage
      appState.achievements = achievementsList.map(achievement => {
        const unlockedAchievement = parsedAchievements.find(a => a.id === achievement.id);
        if (unlockedAchievement) {
          return {
            ...achievement,
            unlockedAt: unlockedAchievement.unlockedAt
          };
        }
        return achievement;
      });
    } else {
      appState.achievements = [...achievementsList];
    }
    
    // Vérifier les succès après initialisation
    setTimeout(() => checkAchievements(), 1000);
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des succès:', error);
    appState.achievements = [...achievementsList];
  }
}

// Écouteurs d'événements pour les succès
function setupAchievementsListeners() {
  // Filtres de catégorie pour les succès
  document.querySelectorAll('.category-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const category = e.currentTarget.getAttribute('data-tab');
      // Retirer la classe active de tous les onglets
      document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
      // Ajouter la classe active à l'onglet cliqué
      e.currentTarget.classList.add('active');
      
      // Filtrer les succès
      renderAchievements(category, document.getElementById('rarity-select').value);
    });
  });
  
  // Filtre de rareté pour les succès
  document.getElementById('rarity-select').addEventListener('change', (e) => {
    const rarity = e.target.value;
    const activeCategory = document.querySelector('.category-tab.active').getAttribute('data-tab');
    
    // Filtrer les succès
    renderAchievements(activeCategory, rarity);
  });
}

function renderAchievements(category, rarity) {
  // Implémentation de la mise à jour de la liste des succès
}

// Calculer les données pour la vérification des succès
function calculateAchievementData() {
  // Compter les notes par catégorie
  const notesByCategory = {};
  appState.notes.forEach(note => {
    if (note.category) {
      notesByCategory[note.category] = (notesByCategory[note.category] || 0) + 1;
    }
  });
  
  // Calculer le nombre total de mots et de caractères
  const totalWords = appState.notes.reduce((acc, note) => {
    return acc + note.content.split(/\s+/).filter(Boolean).length;
  }, 0);
  
  const totalCharacters = appState.notes.reduce((acc, note) => {
    return acc + note.content.length;
  }, 0);
  
  // Calculer le nombre de jours consécutifs (simulé pour cette démo)
  // Dans une vraie implémentation, cela nécessiterait un algorithme plus complexe
  const consecutiveDays = calculateConsecutiveDays();
  
  // Compter les notes favorites et archivées
  const favorites = appState.notes.filter(note => note.favorite).length;
  const archived = appState.notes.filter(note => note.archived).length;
  
  // Calculer le nombre de jours d'utilisation
  const userDays = Math.floor((new Date().getTime() - appState.user.joined.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    totalNotes: appState.notes.length,
    notesByCategory,
    consecutiveDays,
    totalWords,
    totalCharacters,
    favorites,
    archived,
    streakDays: consecutiveDays,
    userDays
  };
}

// Calculer le nombre de jours consécutifs (simulé)
function calculateConsecutiveDays() {
  // Dans une vraie implémentation, nous analyserions les dates des notes
  // Pour simplifier, nous allons utiliser une formule basée sur le nombre de notes
  const noteCount = appState.notes.length;
  return Math.min(Math.floor(noteCount / 3), 120); // Maximum 120 jours
}

// Vérifier les succès
function checkAchievements() {
  const data = calculateAchievementData();
  
  // Vérifier chaque succès
  const newUnlockedAchievements = [];
  
  appState.achievements.forEach(achievement => {
    // Ne pas revérifier les succès déjà débloqués
    if (achievement.unlockedAt) return;
    
    // Cas spécial pour "Complétiste"
    if (achievement.id === 'completionist') {
      const unlockedCount = appState.unlockedAchievements.length;
      const totalCount = appState.achievements.length;
      const percentage = (unlockedCount / totalCount) * 100;
      
      if (percentage >= 85) {
        const updatedAchievement = {
          ...achievement,
          unlockedAt: new Date()
        };
        newUnlockedAchievements.push(updatedAchievement);
      }
      return;
    }
    
    // Vérifier la condition du succès
    if (achievement.condition(data)) {
      const updatedAchievement = {
        ...achievement,
        unlockedAt: new Date()
      };
      newUnlockedAchievements.push(updatedAchievement);
    }
  });
  
  // Mettre à jour la liste des succès débloqués
  if (newUnlockedAchievements.length > 0) {
    const updatedUnlockedAchievements = [...appState.unlockedAchievements, ...newUnlockedAchievements];
    appState.unlockedAchievements = updatedUnlockedAchievements;
    
    // Mettre à jour la liste complète des succès
    appState.achievements = appState.achievements.map(achievement => {
      const newlyUnlocked = newUnlockedAchievements.find(a => a.id === achievement.id);
      if (newlyUnlocked) {
        return {
          ...achievement,
          unlockedAt: newlyUnlocked.unlockedAt
        };
      }
      return achievement;
    });
    
    // Sauvegarder dans localStorage
    localStorage.setItem('notesafe_achievements', JSON.stringify(updatedUnlockedAchievements));
    
    // Afficher une notification pour chaque succès débloqué
    newUnlockedAchievements.forEach(achievement => {
      showNotification(
        `Succès débloqué : ${achievement.title} (${achievement.points} points)`,
        false,
        achievement.icon
      );
    });
    
    // Mettre à jour l'affichage des succès si la vue est active
    if (appState.activeView === 'achievements') {
      renderAchievements();
      renderAchievementStats();
    }
    
    // Mettre à jour le profil si la vue est active
    if (appState.activeView === 'profile') {
      updateProfileStats();
    }
  }
}

// Calculer la progression pour un succès
function getAchievementProgress(achievementId) {
  const achievement = appState.achievements.find(a => a.id === achievementId);
  if (!achievement) return 0;
  
  const data = calculateAchievementData();
  
  // Cas spéciaux par type de succès
  switch (achievementId) {
    case 'first-note':
    case 'note-collector':
    case 'prolific-writer':
    case 'master-writer':
      const totalRequired = 
        achievementId === 'first-note' ? 1 :
        achievementId === 'note-collector' ? 25 :
        achievementId === 'prolific-writer' ? 100 : 250;
      return Math.min(100, Math.floor((data.totalNotes / totalRequired) * 100));
    
    case 'category-explorer':
      const categoriesUsed = Object.values(data.notesByCategory).filter(count => count > 0).length;
      return Math.min(100, Math.floor((categoriesUsed / 6) * 100));
    
    case 'consistent-writer':
    case 'dedicated-writer':
      const daysRequired = achievementId === 'consistent-writer' ? 7 : 30;
      return Math.min(100, Math.floor((data.consecutiveDays / daysRequired) * 100));
    
    case 'word-smith':
      return Math.min(100, Math.floor((data.totalWords / 10000) * 100));
    
    case 'favorite-collector':
      return Math.min(100, Math.floor((data.favorites / 20) * 100));
    
    case 'archivist':
      return Math.min(100, Math.floor((data.archived / 20) * 100));
    
    case 'completionist':
      const unlockedCount = appState.unlockedAchievements.length;
      const totalCount = appState.achievements.length;
      return Math.min(100, Math.floor((unlockedCount / totalCount) * 100));
    
    case 'idea-machine':
      return Math.min(100, Math.floor(((data.notesByCategory['idée'] || 0) / 35) * 100));
    
    case 'storyteller':
      return Math.min(100, Math.floor(((data.notesByCategory['histoire'] || 0) / 25) * 100));
    
    case 'night-owl':
      // Ce succès est binaire (0% ou 100%)
      return achievement.unlockedAt ? 100 : 0;
    
    case 'longterm-user':
      return Math.min(100, Math.floor((data.userDays / 90) * 100));
    
    case 'grand-master':
      return Math.min(100, Math.floor((data.totalNotes / 500) * 100));
    
    case 'iron-will':
      return Math.min(100, Math.floor((data.consecutiveDays / 100) * 100));
    
    case 'wordsmith-elite':
      return Math.min(100, Math.floor((data.totalWords / 50000) * 100));
    
    case 'category-master':
      const categories = ['mot', 'phrase', 'idée', 'réflexion', 'histoire', 'note'];
      const categoryCount = categories.filter(cat => data.notesByCategory[cat] && data.notesByCategory[cat] >= 15).length;
      return Math.min(100, Math.floor((categoryCount / 6) * 100));
    
    case 'year-long-journey':
      return Math.min(100, Math.floor((data.userDays / 365) * 100));
    
    case 'mega-collection':
      return Math.min(100, Math.floor((data.favorites / 50) * 100));
    
    case 'philosopher':
      return Math.min(100, Math.floor((data.notesByCategory['réflexion'] || 0) / 50 * 100));
    
    // Cas par défaut pour les succès complexes
    default:
      return achievement.unlockedAt ? 100 : 0;
  }
}

// Obtenir la prochaine étape pour un succès
function getAchievementNextMilestone(achievementId) {
  const achievement = appState.achievements.find(a => a.id === achievementId);
  if (!achievement) return 0;
  
  // Retourner des valeurs spécifiques en fonction du type de succès
  switch (achievementId) {
    case 'first-note': return 1;
    case 'note-collector': return 25;
    case 'prolific-writer': return 100;
    case 'master-writer': return 250;
    case 'grand-master': return 500;
    case 'category-explorer': return 6;
    case 'category-master': return 15;
    case 'consistent-writer': return 7;
    case 'dedicated-writer': return 30;
    case 'iron-will': return 100;
    case 'word-smith': return 10000;
    case 'wordsmith-elite': return 50000;
    case 'favorite-collector': return 20;
    case 'mega-collection': return 50;
    case 'archivist': return 20;
    case 'completionist': return Math.ceil(appState.achievements.length * 0.85);
    case 'idea-machine': return 35;
    case 'storyteller': return 25;
    case 'philosopher': return 50;
    case 'night-owl': return 1;
    case 'midnight-marathon': return 10;
    case 'longterm-user': return 90;
    case 'year-long-journey': return 365;
    case 'polyglot': return 5;
    case 'perfect-streak': return 50;
    default: return 0;
  }
}

// Afficher la page des succès
function renderAchievements(categoryFilter = 'all', rarityFilter = 'all') {
  const achievementsContainer = document.getElementById('achievements-list');
  achievementsContainer.innerHTML = '';
  
  // Filtrer les succès en fonction des filtres actifs
  const filteredAchievements = appState.achievements.filter(achievement => {
    if (categoryFilter !== 'all' && achievement.category !== categoryFilter) return false;
    if (rarityFilter !== 'all' && achievement.rarity !== rarityFilter) return false;
    return true;
  });
  
  if (filteredAchievements.length === 0) {
    achievementsContainer.innerHTML = `
      <div class="empty-achievements">
        <i class="fas fa-trophy"></i>
        <h3>Aucun succès trouvé</h3>
        <p>Aucun succès ne correspond aux filtres sélectionnés.</p>
      </div>
    `;
    return;
  }
  
  // Créer un élément pour chaque succès
  filteredAchievements.forEach(achievement => {
    const achievementElement = createAchievementElement(achievement);
    achievementsContainer.appendChild(achievementElement);
  });
  
  // Mettre à jour les statistiques des succès
  renderAchievementStats();
}

// Créer un élément HTML pour un succès
function createAchievementElement(achievement) {
  const template = document.getElementById('achievement-template');
  const achievementClone = document.importNode(template.content, true);
  const achievementCard = achievementClone.querySelector('.achievement-card');
  
  // Mettre à jour les attributs et classes
  achievementCard.setAttribute('data-id', achievement.id);
  achievementCard.classList.add(achievement.rarity);
  achievementCard.setAttribute('data-category', achievement.category);
  
  if (achievement.unlockedAt) {
    achievementCard.classList.add('unlocked');
  }
  
  // Remplir les informations
  achievementCard.querySelector('.achievement-rarity').textContent = 
    achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1);
  
  achievementCard.querySelector('.achievement-category').textContent = 
    (getCategoryIcon(achievement.category) + ' ' + 
    achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1));
  
  achievementCard.querySelector('.achievement-icon').textContent = achievement.icon;
  achievementCard.querySelector('.achievement-title').textContent = achievement.title;
  achievementCard.querySelector('.achievement-description').textContent = achievement.description;
  
  // Progression
  const progress = getAchievementProgress(achievement.id);
  achievementCard.querySelector('.progress-value').style.width = `${progress}%`;
  achievementCard.querySelector('.progress-percentage').textContent = `${progress}%`;
  
  // Statut de déblocage
  if (achievement.unlockedAt) {
    achievementCard.querySelector('.progress-status').textContent = 
      `Débloqué le ${formatDate(achievement.unlockedAt)}`;
  } else {
    const milestone = getAchievementNextMilestone(achievement.id);
    achievementCard.querySelector('.progress-status').textContent = 
      `Objectif: ${milestone}`;
  }
  
  // Points
  achievementCard.querySelector('.achievement-points').textContent = `${achievement.points} points`;
  
  return achievementCard;
}

// Rendre les statistiques des succès
function renderAchievementStats() {
  // Calcul du pourcentage global de complétion
  const completionPercentage = Math.round((appState.unlockedAchievements.length / appState.achievements.length) * 100) || 0;
  document.getElementById('completion-percentage').textContent = `${completionPercentage}%`;
  document.getElementById('achievements-progress-bar').style.width = `${completionPercentage}%`;
  document.getElementById('unlocked-count').textContent = 
    `${appState.unlockedAchievements.length} sur ${appState.achievements.length} succès`;
  
  // Calcul des points totaux
  const totalPoints = appState.unlockedAchievements.reduce((sum, achievement) => sum + achievement.points, 0);
  document.getElementById('total-points').textContent = `${totalPoints} points`;
  
  // Statistiques par rareté
  const rarityStats = {
    'commun': { total: 0, unlocked: 0 },
    'rare': { total: 0, unlocked: 0 },
    'épique': { total: 0, unlocked: 0 },
    'légendaire': { total: 0, unlocked: 0 }
  };
  
  appState.achievements.forEach(achievement => {
    rarityStats[achievement.rarity].total += 1;
    if (achievement.unlockedAt) {
      rarityStats[achievement.rarity].unlocked += 1;
    }
  });
  
  // Afficher les statistiques par rareté
  const rarityGrid = document.querySelector('.rarity-grid');
  rarityGrid.innerHTML = '';
  
  Object.entries(rarityStats).forEach(([rarity, stats]) => {
    const percent = Math.round((stats.unlocked / stats.total) * 100) || 0;
    
    const rarityItem = document.createElement('div');
    rarityItem.className = `rarity-item ${rarity}-rarity`;
    rarityItem.innerHTML = `
      <div class="rarity-header">
        <span>${rarity.charAt(0).toUpperCase() + rarity.slice(1)}</span>
        <span>${stats.unlocked}/${stats.total}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-value" style="width: ${percent}%"></div>
      </div>
    `;
    
    rarityGrid.appendChild(rarityItem);
  });
  
  // Statistiques par catégorie
  const categoryStats = {
    'écriture': { total: 0, unlocked: 0 },
    'exploration': { total: 0, unlocked: 0 },
    'collection': { total: 0, unlocked: 0 },
    'maîtrise': { total: 0, unlocked: 0 }
  };
  
  appState.achievements.forEach(achievement => {
    categoryStats[achievement.category].total += 1;
    if (achievement.unlockedAt) {
      categoryStats[achievement.category].unlocked += 1;
    }
  });
  
  // Afficher les statistiques par catégorie
  const categoryProgress = document.getElementById('achievement-categories');
  categoryProgress.innerHTML = '';
  
  Object.entries(categoryStats).forEach(([category, stats]) => {
    const percent = Math.round((stats.unlocked / stats.total) * 100) || 0;
    
    const categoryItem = document.createElement('div');
    categoryItem.className = 'category-progress-item';
    categoryItem.innerHTML = `
      <div class="category-label">
        <span>${getCategoryIcon(category)}</span>
        <span>${category.charAt(0).toUpperCase() + category.slice(1)}</span>
      </div>
      <div class="category-progress-bar">
        <div class="category-progress-info">
          <span>${stats.unlocked}/${stats.total} succès</span>
          <span>${percent}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-value" style="width: ${percent}%; background-color: ${getCategoryColor(category)}"></div>
        </div>
      </div>
    `;
    
    categoryProgress.appendChild(categoryItem);
  });
}

// Obtenir l'icône d'une catégorie
function getCategoryIcon(category) {
  switch (category) {
    case 'écriture': return '✍️';
    case 'exploration': return '🔍';
    case 'collection': return '🗃️';
    case 'maîtrise': return '🏆';
    default: return '';
  }
}

// Obtenir la couleur d'une catégorie
function getCategoryColor(category) {
  switch (category) {
    case 'écriture': return 'rgb(34, 197, 94)';
    case 'exploration': return 'rgb(59, 130, 246)';
    case 'collection': return 'rgb(139, 92, 246)';
    case 'maîtrise': return 'rgb(239, 68, 68)';
    default: return 'var(--primary)';
  }
}

// Mettre à jour les statistiques du profil
function updateProfileStats() {
  const data = calculateAchievementData();
  
  document.getElementById('profile-notes-count').textContent = data.totalNotes;
  document.getElementById('profile-streak').textContent = data.consecutiveDays;
  document.getElementById('profile-achievements').textContent = appState.unlockedAchievements.length;
  document.getElementById('join-date').textContent = formatDate(appState.user.joined, false);
  
  // Nom et email
  document.getElementById('profile-name').textContent = appState.user.name;
  document.getElementById('profile-email').textContent = appState.user.email;
}

// Mettre à jour les statistiques globales
function updateStatistics() {
  const data = calculateAchievementData();
  
  document.getElementById('total-notes-count').textContent = data.totalNotes;
  document.getElementById('total-words-count').textContent = data.totalWords;
  document.getElementById('avg-length').textContent = data.totalNotes > 0 
    ? Math.round(data.totalWords / data.totalNotes) + ' mots' 
    : '0 mot';
  document.getElementById('streak-days').textContent = data.consecutiveDays;
  
  // Statistiques par catégorie
  const categoryStats = document.getElementById('category-stats');
  categoryStats.innerHTML = '';
  
  const categories = [
    { name: 'mot', color: '#3B82F6' },
    { name: 'phrase', color: '#10B981' },
    { name: 'idée', color: '#F59E0B' },
    { name: 'réflexion', color: '#8B5CF6' },
    { name: 'histoire', color: '#EC4899' },
    { name: 'note', color: '#6B7280' }
  ];
  
  categories.forEach(cat => {
    const count = data.notesByCategory[cat.name] || 0;
    const item = document.createElement('div');
    item.className = 'category-stat-item';
    item.innerHTML = `
      <div class="category-color-indicator" style="background-color: ${cat.color}"></div>
      <div class="category-stat-info">
        <span>${cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}</span>
        <span class="category-stat-count">${count}</span>
      </div>
    `;
    categoryStats.appendChild(item);
  });
  
  // Graphique d'activité (simulé pour cette démo)
  const activityChart = document.getElementById('activity-chart');
  activityChart.innerHTML = '';
  
  // Créer des données d'activité simulées pour les 14 derniers jours
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    
    // Simuler un nombre aléatoire de notes pour chaque jour
    // Dans une vraie implémentation, nous utiliserions les vraies données
    const noteCount = Math.floor(Math.random() * 5);
    
    const dayItem = document.createElement('div');
    dayItem.className = 'activity-day';
    dayItem.style.height = `${noteCount * 20 + 5}px`;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'activity-day-tooltip';
    tooltip.textContent = `${formatDate(day, false)}: ${noteCount} note${noteCount !== 1 ? 's' : ''}`;
    
    dayItem.appendChild(tooltip);
    activityChart.appendChild(dayItem);
  }
} 