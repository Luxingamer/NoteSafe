'use client';

import React, { useMemo } from 'react';
import { usePoints, PointTransaction } from '../context/PointsContext';
import { motion } from 'framer-motion';

// Composant pour afficher une transaction avec un design amélioré
const TransactionCard = ({ transaction }: { transaction: PointTransaction }) => {
  const getIcon = (category: PointTransaction['category']) => {
    switch (category) {
      case 'daily':
        return '🌟';
      case 'achievement':
        return '🏆';
      case 'edit':
        return '✏️';
      case 'ai':
        return '🤖';
      case 'theme':
        return '🎨';
      case 'book':
        return '📚';
      case 'page':
        return '📝';
      default:
        return '💰';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const cardStyles = transaction.type === 'earned'
    ? 'border-l-4 border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
    : 'border-l-4 border-rose-400 bg-rose-50/50 dark:bg-rose-900/10';

  const amountColor = transaction.type === 'earned'
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-rose-600 dark:text-rose-400';

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg ${cardStyles} hover:shadow-sm transition-shadow duration-200`}>
      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/80 dark:bg-gray-800/80">
          <span className="text-xl">{getIcon(transaction.category)}</span>
        </div>
        <div>
          <p className="font-medium text-gray-800 dark:text-gray-200">
            {transaction.description}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatDate(transaction.timestamp)}
          </p>
        </div>
      </div>
      <span className={`font-bold text-lg ${amountColor}`}>
        {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
      </span>
    </div>
  );
};

// Composant statistiques avec animations améliorées
const StatsCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) => {
  const numericValue = typeof value === 'string' ? parseInt(value, 10) : value;

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className={`absolute inset-0 ${color} opacity-5`} />
      
      <div className="relative z-10">
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${color} mb-4`}>
          <span className="text-2xl">{icon}</span>
        </div>
        
        <h3 className="text-base font-medium text-gray-600 dark:text-gray-300">{title}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">points</p>
        </div>

        <div className={`mt-4 flex items-center text-sm ${
          numericValue > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
        }`}>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span>depuis hier</span>
        </div>
      </div>
    </div>
  );
};

export default function PointsManager() {
  const { points, transactions, addPoints, getLastDailyReward } = usePoints();

  // Fonction pour ajouter des points de test
  const addTestPoints = () => {
    const amount =  20; // Montant fixe pour les tests
    addPoints(amount, '🔧 Points de test (admin)', 'daily');
  };

  // Calcul des statistiques
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return {
      pointsToday: transactions
        .filter(t => new Date(t.timestamp) >= today)
        .reduce((acc, t) => acc + (t.type === 'earned' ? t.amount : -t.amount), 0),
      totalEarned: transactions
        .filter(t => t.type === 'earned')
        .reduce((acc, t) => acc + t.amount, 0),
      totalSpent: transactions
        .filter(t => t.type === 'spent')
        .reduce((acc, t) => acc + t.amount, 0),
      transactionCount: transactions.length
    };
  }, [transactions]);

  // Grouper les transactions par jour
  const groupedTransactions = useMemo(() => {
    const groups = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.timestamp).toLocaleDateString('fr-FR');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    }, {} as Record<string, PointTransaction[]>);

    return Object.entries(groups).sort((a, b) => {
      return new Date(b[0]).getTime() - new Date(a[0]).getTime();
    });
  }, [transactions]);

  return (
    <div className="w-full max-w-6xl mx-auto p-8 space-y-8">
      {/* En-tête avec total des points */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Gestion des Points</h1>
          <p className="text-gray-600 dark:text-gray-400">Suivez vos points et vos récompenses</p>
        </div>
        <div className="flex gap-4">
          {/* Bouton d'administration pour ajouter des points de test */}
          <button
            onClick={addTestPoints}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            + 20 points (Test)
          </button>
          
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-4">
              <span className="text-4xl">💎</span>
              <div className="flex flex-col">
                <span className="text-sm text-white/90 font-medium">Total des points</span>
                <span className="text-3xl font-bold text-white">{points}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Points aujourd'hui"
          value={stats.pointsToday}
          icon="📅"
          color="bg-blue-500"
        />
        <StatsCard
          title="Total gagné"
          value={stats.totalEarned}
          icon="⭐"
          color="bg-green-500"
        />
        <StatsCard
          title="Total dépensé"
          value={stats.totalSpent}
          icon="💸"
          color="bg-red-500"
        />
        <StatsCard
          title="Transactions"
          value={stats.transactionCount}
          icon="📊"
          color="bg-purple-500"
        />
      </div>

      {/* Guide des coûts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
        <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Guide des coûts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { emoji: "✏️", title: "Modifier une note", cost: 5 },
            { emoji: "🤖", title: "Génération IA", cost: 10 },
            { emoji: "🎨", title: "Changer de thème", cost: 5 },
            { emoji: "📚", title: "Ajouter un livre", cost: 10 },
            { emoji: "📝", title: "Ajouter une page", cost: 5 }
          ].map((item, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:shadow-sm transition-shadow duration-200"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-800">
                <span className="text-xl">{item.emoji}</span>
              </div>
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">{item.title}</p>
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{item.cost} points</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historique des transactions */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Historique des transactions
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          {groupedTransactions.length > 0 ? (
            groupedTransactions.map(([date, dayTransactions]) => (
              <div key={date} className="space-y-3 mb-6 last:mb-0">
                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {date}
                </h4>
                <div className="space-y-2">
                  {dayTransactions.map((transaction) => (
                    <TransactionCard key={transaction.id} transaction={transaction} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Aucune transaction disponible pour le moment.</p>
          )}
        </div>
      </div>
    </div>
  );
} 