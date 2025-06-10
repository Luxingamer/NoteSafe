'use client';

import React, { useMemo } from 'react';
import { useNotes, NoteCategory } from '../context/NotesContext';
import { useBooks } from '../context/BookContext';
import { useMemory } from '../context/MemoryContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  ChartOptions
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

// Définir une interface pour les statistiques
interface CategoryStats {
  count: number;
  percentage: number;
  color: string;
  avgWordCount: number;
  lastUpdate: Date | null;
  longestNote: number;
  shortestNote: number;
}

interface NotesStatistics {
  totalNotes: number;
  categoriesStats: Record<NoteCategory, CategoryStats>;
  favoritesCount: number;
  favoritesPercentage: number;
  averageWordCount: number;
  oldestNoteDate: Date | null;
  newestNoteDate: Date | null;
  notesPerDay: Record<string, number>;
  notesPerMonth: Record<string, number>;
  longestNote: {
    id: string;
    wordCount: number;
    category: NoteCategory;
  };
  shortestNote: {
    id: string;
    wordCount: number;
    category: NoteCategory;
  };
  mostActiveDay: {
    date: string;
    count: number;
  };
  leastActiveDay: {
    date: string;
    count: number;
  };
  totalWordsWritten: number;
}

export default function Statistics() {
  const { notes } = useNotes();
  const { books } = useBooks();
  const { items: memoryItems } = useMemory();

  // Couleurs pour les catégories
  const categoryColors: Record<NoteCategory, string> = {
    'mot': '#8b5cf6', // Violet
    'phrase': '#06b6d4', // Cyan
    'idée': '#10b981', // Vert
    'réflexion': '#f59e0b', // Ambre
    'histoire': '#ec4899', // Rose
    'note': '#6b7280', // Gris
  };

  // Couleurs pour les graphiques
  const chartColors = {
    primary: '#8b5cf6', // Violet
    secondary: '#06b6d4', // Cyan
    tertiary: '#10b981', // Vert
    quaternary: '#f59e0b', // Ambre
    background: 'rgba(139, 92, 246, 0.1)', // Violet transparent
  };

  // Traduction des catégories
  const categoryLabels: Record<NoteCategory, string> = {
    'mot': 'Mots',
    'phrase': 'Phrases',
    'idée': 'Idées',
    'réflexion': 'Réflexions',
    'histoire': 'Histoires',
    'note': 'Notes'
  };

  // Calculer les statistiques
  const statistics: NotesStatistics = useMemo(() => {
    // Statistiques de base
    const totalNotes = notes.length;
    const categoryCounts: Record<NoteCategory, number> = {
      'mot': 0,
      'phrase': 0,
      'idée': 0,
      'réflexion': 0,
      'histoire': 0,
      'note': 0,
    };
    
    // Statistiques détaillées par catégorie
    const categoryDetails: Record<NoteCategory, {
      totalWords: number,
      lastUpdate: Date | null,
      longestNote: number,
      shortestNote: number
    }> = {
      'mot': { totalWords: 0, lastUpdate: null, longestNote: 0, shortestNote: Infinity },
      'phrase': { totalWords: 0, lastUpdate: null, longestNote: 0, shortestNote: Infinity },
      'idée': { totalWords: 0, lastUpdate: null, longestNote: 0, shortestNote: Infinity },
      'réflexion': { totalWords: 0, lastUpdate: null, longestNote: 0, shortestNote: Infinity },
      'histoire': { totalWords: 0, lastUpdate: null, longestNote: 0, shortestNote: Infinity },
      'note': { totalWords: 0, lastUpdate: null, longestNote: 0, shortestNote: Infinity },
    };
    
    let favoritesCount = 0;
    let totalWords = 0;
    let oldestDate: Date | null = null;
    let newestDate: Date | null = null;
    
    const notesPerDay: Record<string, number> = {};
    const notesPerMonth: Record<string, number> = {};

    // Pour les records
    let longestNote = { id: '', wordCount: 0, category: 'note' as NoteCategory };
    let shortestNote = { id: '', wordCount: Infinity, category: 'note' as NoteCategory };
    
    // Initialiser mostActiveDay et leastActiveDay
    let mostActiveDay = { date: '', count: 0 };
    let leastActiveDay = { date: '', count: Infinity };
    
    // Fonction pour s'assurer que la catégorie est valide
    const getValidCategory = (category: any): NoteCategory => {
      if (category && categoryCounts.hasOwnProperty(category)) {
        return category as NoteCategory;
      }
      return 'note'; // Catégorie par défaut si invalide
    };
    
    // Parcourir les notes pour calculer les statistiques
    notes.forEach(note => {
      // S'assurer que la catégorie est valide
      const category = getValidCategory(note.category);
      
      // Compter par catégorie
      categoryCounts[category]++;
      
      // Compter les favoris
      if (note.favorite) {
        favoritesCount++;
      }
      
      // Calculer le nombre de mots
      const wordCount = note.content.split(/\s+/).filter(word => word.length > 0).length;
      totalWords += wordCount;
      
      // Ajouter aux statistiques par catégorie
      categoryDetails[category].totalWords += wordCount;
      
      // Mettre à jour la plus longue/courte note
      if (wordCount > categoryDetails[category].longestNote) {
        categoryDetails[category].longestNote = wordCount;
      }
      if (wordCount < categoryDetails[category].shortestNote) {
        categoryDetails[category].shortestNote = wordCount;
      }
      
      // Mettre à jour le record global de longueur de note
      if (wordCount > longestNote.wordCount) {
        longestNote = { id: note.id, wordCount, category };
      }
      if (wordCount < shortestNote.wordCount && wordCount > 0) {
        shortestNote = { id: note.id, wordCount, category };
      }
      
      // Traquer les dates
      const createdAt = new Date(note.createdAt);
      if (!oldestDate || createdAt < oldestDate) {
        oldestDate = createdAt;
      }
      if (!newestDate || createdAt > newestDate) {
        newestDate = createdAt;
      }
      
      // Vérifier la dernière mise à jour pour chaque catégorie
      const updatedAt = new Date(note.updatedAt);
      if (!categoryDetails[category].lastUpdate || 
          updatedAt > categoryDetails[category].lastUpdate!) {
        categoryDetails[category].lastUpdate = updatedAt;
      }
      
      // Traquer les notes par jour
      const dateKey = createdAt.toISOString().split('T')[0];
      notesPerDay[dateKey] = (notesPerDay[dateKey] || 0) + 1;
      
      // Traquer les notes par mois
      const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
      notesPerMonth[monthKey] = (notesPerMonth[monthKey] || 0) + 1;
    });
    
    // Trouver le jour le plus actif et le moins actif
    Object.entries(notesPerDay).forEach(([date, count]) => {
      if (count > mostActiveDay.count) {
        mostActiveDay = { date, count };
      }
      if (count < leastActiveDay.count) {
        leastActiveDay = { date, count };
      }
    });
    
    // Si aucune note n'est trouvée, mettre une valeur par défaut pour shortestNote
    if (shortestNote.wordCount === Infinity) {
      shortestNote = { id: '', wordCount: 0, category: 'note' };
    }
    
    // Si aucun jour d'activité n'est trouvé, initialiser leastActiveDay avec des valeurs par défaut
    if (leastActiveDay.count === Infinity) {
      leastActiveDay = { date: '', count: 0 };
    }
    
    // Calculer les pourcentages et statistiques par catégorie
    const categoriesStats: Record<NoteCategory, CategoryStats> = {} as Record<NoteCategory, CategoryStats>;
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      const cat = category as NoteCategory;
      categoriesStats[cat] = {
        count,
        percentage: totalNotes > 0 ? (count / totalNotes) * 100 : 0,
        color: categoryColors[cat],
        avgWordCount: count > 0 ? categoryDetails[cat].totalWords / count : 0,
        lastUpdate: categoryDetails[cat].lastUpdate,
        longestNote: categoryDetails[cat].longestNote,
        shortestNote: categoryDetails[cat].shortestNote === Infinity ? 0 : categoryDetails[cat].shortestNote
      };
    });
    
    return {
      totalNotes,
      categoriesStats,
      favoritesCount,
      favoritesPercentage: totalNotes > 0 ? (favoritesCount / totalNotes) * 100 : 0,
      averageWordCount: totalNotes > 0 ? totalWords / totalNotes : 0,
      oldestNoteDate: oldestDate,
      newestNoteDate: newestDate,
      notesPerDay,
      notesPerMonth,
      longestNote,
      shortestNote,
      mostActiveDay,
      leastActiveDay,
      totalWordsWritten: totalWords
    };
  }, [notes, categoryColors]);

  // Récupérer les 5 derniers mois pour le graphique d'activité
  const lastMonths = useMemo(() => {
    if (!statistics || !statistics.notesPerMonth) {
      return [];
    }
    
    const months = Object.keys(statistics.notesPerMonth).sort().slice(-5);
    return months.map(month => {
      const [year, monthNum] = month.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      return {
        key: month,
        label: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        count: statistics.notesPerMonth[month] || 0
      };
    });
  }, [statistics]);

  // Récupérer les 7 derniers jours pour le graphique d'activité récente
  const lastDays = useMemo(() => {
    if (!statistics || !statistics.notesPerDay) {
      return [];
    }
    
    const today = new Date();
    const days = [];
    
    // Créer un objet pour stocker toutes les activités par jour
    const allActivities: Record<string, { notes: number; books: number; memory: number }> = {};
    
    // Ajouter les notes
    Object.entries(statistics.notesPerDay).forEach(([date, count]) => {
      if (!allActivities[date]) {
        allActivities[date] = { notes: 0, books: 0, memory: 0 };
      }
      allActivities[date].notes = count;
    });
    
    // Ajouter les activités des livres
    books.forEach(book => {
      const dateKey = new Date(book.createdAt).toISOString().split('T')[0];
      if (!allActivities[dateKey]) {
        allActivities[dateKey] = { notes: 0, books: 0, memory: 0 };
      }
      allActivities[dateKey].books++;
    });
    
    // Ajouter les activités de la mémoire
    memoryItems.forEach(item => {
      const dateKey = new Date(item.createdAt).toISOString().split('T')[0];
      if (!allActivities[dateKey]) {
        allActivities[dateKey] = { notes: 0, books: 0, memory: 0 };
      }
      allActivities[dateKey].memory++;
    });
    
    // Récupérer les 7 derniers jours
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      days.push({
        key: dateKey,
        label: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        notes: allActivities[dateKey]?.notes || 0,
        books: allActivities[dateKey]?.books || 0,
        memory: allActivities[dateKey]?.memory || 0,
        total: (allActivities[dateKey]?.notes || 0) + 
               (allActivities[dateKey]?.books || 0) + 
               (allActivities[dateKey]?.memory || 0)
      });
    }
    
    return days;
  }, [statistics, books, memoryItems]);

  // Configuration des graphiques
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      }
    }
  };

  // Options spécifiques pour les graphiques en barres
  const barOptions = {
    ...baseOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      }
    },
    plugins: {
      ...baseOptions.plugins,
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: 'rgb(156, 163, 175)'
        }
      }
    }
  } as const;

  // Options spécifiques pour les graphiques en ligne
  const lineOptions = {
    ...baseOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      }
    }
  } as const;

  // Options spécifiques pour les graphiques en donut
  const doughnutOptions = {
    ...baseOptions,
    cutout: '80%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgb(156, 163, 175)',
          font: {
            size: 12
          }
        }
      }
    }
  } as const;

  // Données pour le graphique en donut des catégories
  const categoryData = {
    labels: Object.entries(statistics.categoriesStats).map(([cat]) => categoryLabels[cat as NoteCategory]),
    datasets: [
      {
        data: Object.values(statistics.categoriesStats).map(stats => stats.count),
        backgroundColor: Object.entries(statistics.categoriesStats).map(([cat]) => categoryColors[cat as NoteCategory]),
        borderColor: Object.entries(statistics.categoriesStats).map(([cat]) => categoryColors[cat as NoteCategory]),
        borderWidth: 1,
      },
    ],
  };

  // Données pour le graphique en barres de l'activité récente
  const recentActivityData = {
    labels: lastDays.map(day => day.label),
    datasets: [
      {
        label: 'Notes',
        data: lastDays.map(day => day.notes),
        backgroundColor: chartColors.primary,
        borderRadius: 4,
      },
      {
        label: 'Livres',
        data: lastDays.map(day => day.books),
        backgroundColor: chartColors.secondary,
        borderRadius: 4,
      },
      {
        label: 'Mémoire',
        data: lastDays.map(day => day.memory),
        backgroundColor: chartColors.tertiary,
        borderRadius: 4,
      }
    ],
  };

  // Données pour le graphique en ligne de l'activité mensuelle
  const monthlyActivityData = {
    labels: lastMonths.map(month => month.label),
    datasets: [
      {
        data: lastMonths.map(month => month.count),
        borderColor: 'var(--secondary)',
        backgroundColor: 'var(--secondary-transparent)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Statistiques des livres
  const bookStats = useMemo(() => {
    const totalBooks = books.length;
    const totalPages = books.reduce((acc, book) => {
      if (book.bookType === 'pdf') {
        return acc + (book.totalPages || 0);
      }
      return acc + book.pages.length;
    }, 0);
    const totalPdfBooks = books.filter(book => book.bookType === 'pdf').length;
    const totalTextBooks = books.filter(book => book.bookType === 'text').length;

    return {
      totalBooks,
      totalPages,
      totalPdfBooks,
      totalTextBooks,
      averagePagesPerBook: totalBooks > 0 ? Math.round(totalPages / totalBooks) : 0
    };
  }, [books]);

  // Statistiques de la mémoire
  const memoryStats = useMemo(() => {
    const totalItems = memoryItems.length;
    const encryptedItems = memoryItems.filter(item => item.isEncrypted).length;
    const categoriesCount = new Set(memoryItems.map(item => item.type)).size;
    const tagsCount = new Set(memoryItems.flatMap(item => item.tags || [])).size;

    return {
      totalItems,
      encryptedItems,
      categoriesCount,
      tagsCount,
      encryptedPercentage: totalItems > 0 ? (encryptedItems / totalItems) * 100 : 0
    };
  }, [memoryItems]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Statistiques générales */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Vue d'ensemble
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-violet-50 dark:bg-violet-900/20 p-4 rounded-lg">
            <div className="text-sm text-violet-600 dark:text-violet-400">Notes</div>
            <div className="text-2xl font-bold text-violet-700 dark:text-violet-300">{statistics.totalNotes}</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-sm text-blue-600 dark:text-blue-400">Livres</div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{bookStats.totalBooks}</div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
            <div className="text-sm text-emerald-600 dark:text-emerald-400">Mémoire</div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{memoryStats.totalItems}</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
            <div className="text-sm text-amber-600 dark:text-amber-400">Mots écrits</div>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{statistics.totalWordsWritten}</div>
          </div>
        </div>
      </div>

      {/* Statistiques des livres */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Statistiques des livres
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-sm text-blue-600 dark:text-blue-400">Total des pages</div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{bookStats.totalPages}</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-sm text-blue-600 dark:text-blue-400">Moyenne pages/livre</div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{bookStats.averagePagesPerBook}</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-sm text-blue-600 dark:text-blue-400">Livres PDF</div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{bookStats.totalPdfBooks}</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-sm text-blue-600 dark:text-blue-400">Livres texte</div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{bookStats.totalTextBooks}</div>
          </div>
        </div>
      </div>

      {/* Statistiques de la mémoire */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Statistiques de la mémoire
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
            <div className="text-sm text-emerald-600 dark:text-emerald-400">Éléments chiffrés</div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{memoryStats.encryptedItems}</div>
            <div className="text-sm text-emerald-500 dark:text-emerald-400">
              {Math.round(memoryStats.encryptedPercentage)}% du total
            </div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
            <div className="text-sm text-emerald-600 dark:text-emerald-400">Catégories utilisées</div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{memoryStats.categoriesCount}</div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
            <div className="text-sm text-emerald-600 dark:text-emerald-400">Tags uniques</div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{memoryStats.tagsCount}</div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
            <div className="text-sm text-emerald-600 dark:text-emerald-400">Total des éléments</div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{memoryStats.totalItems}</div>
          </div>
        </div>
      </div>

      {/* Distribution des catégories */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Distribution des catégories
        </h4>
        <div className="w-full max-w-md mx-auto">
          <Doughnut data={categoryData} options={doughnutOptions} />
        </div>
      </div>

      {/* Activité récente */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Activité des 7 derniers jours
        </h4>
        <div className="w-full h-64">
          <Bar data={recentActivityData} options={barOptions} />
        </div>
      </div>

      {/* Activité mensuelle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Activité mensuelle
        </h4>
        <div className="w-full h-64">
          <Line 
            data={{
              labels: lastMonths.map(month => month.label),
              datasets: [{
                data: lastMonths.map(month => month.count),
                borderColor: chartColors.primary,
                backgroundColor: chartColors.background,
                fill: true,
                tension: 0.4
              }]
            }}
            options={lineOptions}
          />
        </div>
      </div>
    </div>
  );
} 