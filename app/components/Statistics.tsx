'use client';

import React, { useMemo } from 'react';
import { useNotes, NoteCategory } from '../context/NotesContext';
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
  Filler
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

  // Couleurs pour les catégories
  const categoryColors: Record<NoteCategory, string> = {
    'mot': '#8b5cf6', // Violet
    'phrase': '#06b6d4', // Cyan
    'idée': '#10b981', // Vert
    'réflexion': '#f59e0b', // Ambre
    'histoire': '#ec4899', // Rose
    'note': '#6b7280', // Gris
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
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      days.push({
        key: dateKey,
        label: i === 0 ? "Aujourd'hui" : i === 1 ? "Hier" : date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        count: statistics.notesPerDay[dateKey] || 0
      });
    }
    
    return days;
  }, [statistics]);

  // Configuration des graphiques
  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'var(--text-color)',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: false
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(var(--text-color-rgb), 0.1)'
        },
        ticks: {
          color: 'var(--text-color)'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'var(--text-color)'
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(var(--text-color-rgb), 0.1)'
        },
        ticks: {
          color: 'var(--text-color)'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'var(--text-color)'
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

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

  // Données pour le graphique en barres de l'activité quotidienne
  const dailyActivityData = {
    labels: lastDays.map(day => day.label),
    datasets: [
      {
        data: lastDays.map(day => day.count),
        backgroundColor: 'var(--primary)',
        borderColor: 'var(--primary)',
        borderWidth: 1,
        borderRadius: 4,
      },
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

  return (
    <div className="w-full max-w-4xl space-y-8 p-6">
      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Résumé général */}
        <div className="rounded-lg p-5 shadow-sm transition-all hover:shadow-md" 
             style={{ 
               background: 'linear-gradient(135deg, var(--background-gradient-from), var(--background-gradient-to))',
               borderLeft: '4px solid var(--primary)'
             }}>
          <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--primary)' }}>
            Activité globale
          </h4>
          
          <ul className="space-y-3">
            <li className="flex justify-between">
              <span style={{ color: 'var(--primary-dark)' }}>Total de notes</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">{statistics?.totalNotes || 0}</span>
            </li>
            <li className="flex justify-between">
              <span style={{ color: 'var(--primary-dark)' }}>Notes favorites</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {statistics?.favoritesCount || 0} ({statistics?.favoritesPercentage ? statistics.favoritesPercentage.toFixed(1) : '0.0'}%)
              </span>
            </li>
            <li className="flex justify-between">
              <span style={{ color: 'var(--primary-dark)' }}>Total de mots écrits</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">{statistics?.totalWordsWritten || 0}</span>
            </li>
            <li className="flex justify-between">
              <span style={{ color: 'var(--primary-dark)' }}>Mots par note (moyenne)</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">{statistics?.averageWordCount ? statistics.averageWordCount.toFixed(1) : '0.0'}</span>
            </li>
          </ul>
        </div>
        
        {/* Records */}
        <div className="rounded-lg p-5 shadow-sm transition-all hover:shadow-md" 
             style={{ 
               background: 'linear-gradient(135deg, var(--background-gradient-from), var(--background-gradient-to))',
               borderLeft: '4px solid var(--secondary)'
             }}>
          <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--secondary)' }}>
            Records
          </h4>
          
          <ul className="space-y-3">
            <li className="flex justify-between">
              <span style={{ color: 'var(--secondary)' }}>Note la plus longue</span>
              <div className="text-right">
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {statistics.longestNote && statistics.longestNote.wordCount ? statistics.longestNote.wordCount : 0} mots
                </span>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {statistics.longestNote && statistics.longestNote.category ? categoryLabels[statistics.longestNote.category] : '-'}
                </div>
              </div>
            </li>
            <li className="flex justify-between">
              <span style={{ color: 'var(--secondary)' }}>Note la plus courte</span>
              <div className="text-right">
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {statistics.shortestNote && statistics.shortestNote.wordCount ? statistics.shortestNote.wordCount : 0} mots
                </span>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {statistics.shortestNote && statistics.shortestNote.category ? categoryLabels[statistics.shortestNote.category] : '-'}
                </div>
              </div>
            </li>
            <li className="flex justify-between">
              <span style={{ color: 'var(--secondary)' }}>Jour le plus actif</span>
              <div className="text-right">
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {statistics.mostActiveDay && statistics.mostActiveDay.count ? statistics.mostActiveDay.count : 0} notes
                </span>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {statistics.mostActiveDay && statistics.mostActiveDay.date ? new Date(statistics.mostActiveDay.date).toLocaleDateString('fr-FR') : '-'}
                </div>
              </div>
            </li>
          </ul>
        </div>
        
        {/* Dates clés */}
        <div className="rounded-lg p-5 shadow-sm transition-all hover:shadow-md" 
             style={{ 
               background: 'linear-gradient(135deg, var(--background-gradient-from), var(--background-gradient-to))',
               borderLeft: '4px solid var(--accent)'
             }}>
          <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--accent)' }}>
            Chronologie
          </h4>
          
          <ul className="space-y-3">
            <li className="flex justify-between">
              <span style={{ color: 'var(--accent)' }}>Première note</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {statistics.oldestNoteDate 
                  ? statistics.oldestNoteDate.toLocaleDateString('fr-FR') 
                  : 'Aucune'}
              </span>
            </li>
            <li className="flex justify-between">
              <span style={{ color: 'var(--accent)' }}>Dernière note</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {statistics.newestNoteDate 
                  ? statistics.newestNoteDate.toLocaleDateString('fr-FR') 
                  : 'Aucune'}
              </span>
            </li>
            <li className="flex justify-between">
              <span style={{ color: 'var(--accent)' }}>Jours d'activité</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {statistics?.notesPerDay ? Object.keys(statistics.notesPerDay).length : 0}
              </span>
            </li>
            <li className="flex justify-between">
              <span style={{ color: 'var(--accent)' }}>Mois d'activité</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {statistics?.notesPerMonth ? Object.keys(statistics.notesPerMonth).length : 0}
              </span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Répartition par catégorie avec graphique en donut */}
      <div className="rounded-lg p-6 shadow-sm" 
           style={{ 
             background: 'linear-gradient(135deg, var(--background-gradient-from), var(--background-gradient-to))',
             borderTop: '4px solid var(--primary)'
           }}>
        <h4 className="text-lg font-semibold mb-6" style={{ color: 'var(--primary)' }}>
          Répartition par catégorie
        </h4>
        <div className="w-full max-w-md mx-auto">
          <Doughnut data={categoryData} options={doughnutOptions} />
        </div>
      </div>

      {/* Activité quotidienne avec graphique en barres */}
      <div className="rounded-lg p-6 shadow-sm"
           style={{ 
             background: 'linear-gradient(135deg, var(--background-gradient-from), var(--background-gradient-to))',
             borderTop: '4px solid var(--primary-dark)'
           }}>
        <h4 className="text-lg font-semibold mb-6" style={{ color: 'var(--primary-dark)' }}>
          Activité des 7 derniers jours
        </h4>
        <div className="w-full h-64">
          <Bar data={dailyActivityData} options={barOptions} />
        </div>
      </div>

      {/* Activité mensuelle avec graphique en ligne */}
      <div className="rounded-lg p-6 shadow-sm"
           style={{ 
             background: 'linear-gradient(135deg, var(--background-gradient-from), var(--background-gradient-to))',
             borderTop: '4px solid var(--secondary)'
           }}>
        <h4 className="text-lg font-semibold mb-6" style={{ color: 'var(--secondary)' }}>
          Activité des derniers mois
        </h4>
        <div className="w-full h-64">
          <Line data={monthlyActivityData} options={lineOptions} />
        </div>
      </div>

      {/* Statistiques détaillées par catégorie */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2"
            style={{ color: 'var(--primary)' }}>
          Détails par catégorie
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statistics && statistics.categoriesStats ? 
            Object.entries(statistics.categoriesStats).map(([category, stats]) => {
              const cat = category as NoteCategory;
              return (
                <div 
                  key={category}
                  className="rounded-lg p-5 shadow-sm transition-all hover:shadow-md border-l-4"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--background-gradient-from), var(--background-gradient-to))',
                    borderLeftColor: stats.color 
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold capitalize"
                        style={{ color: stats.color }}>
                      {categoryLabels[cat]}
                    </h4>
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                      style={{ 
                        background: `linear-gradient(135deg, ${stats.color}, ${stats.color}bb)`,
                        boxShadow: `0 0 8px ${stats.color}80`
                      }}
                    >
                      {stats.count}
                    </div>
                  </div>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span style={{ color: stats.color }}>Moyenne de mots</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {stats.avgWordCount > 0 ? stats.avgWordCount.toFixed(1) : 0}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span style={{ color: stats.color }}>Note la plus longue</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {stats.longestNote} mots
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span style={{ color: stats.color }}>Note la plus courte</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {stats.shortestNote} mots
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span style={{ color: stats.color }}>Dernière mise à jour</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {stats.lastUpdate 
                          ? stats.lastUpdate.toLocaleDateString('fr-FR') 
                          : '-'}
                      </span>
                    </li>
                  </ul>
                  
                  {/* Indicateur visuel de proportion */}
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: stats.color }}>Proportion</span>
                      <span className="text-gray-600 dark:text-gray-400">{stats.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${stats.percentage}%`,
                          background: `linear-gradient(to right, ${stats.color}99, ${stats.color})`,
                          boxShadow: `0 0 4px ${stats.color}80`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })
          : <p className="text-gray-500 dark:text-gray-400 text-center py-4 col-span-3">Aucune donnée disponible</p>
          }
        </div>
      </div>
    </div>
  );
} 