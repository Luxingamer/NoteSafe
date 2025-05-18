'use client';

import React, { useMemo } from 'react';
import { usePoints, PointTransaction } from '../context/PointsContext';
import { motion } from 'framer-motion';

// Composant pour afficher une transaction
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center justify-between p-4 rounded-lg ${
        transaction.type === 'earned'
          ? 'bg-green-50 dark:bg-green-900/20'
          : 'bg-red-50 dark:bg-red-900/20'
      }`}
    >
      <div className="flex items-center space-x-4">
        <span className="text-2xl">{getIcon(transaction.category)}</span>
        <div>
          <p className="font-medium text-gray-800 dark:text-gray-200">
            {transaction.description}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(transaction.timestamp)}
          </p>
        </div>
      </div>
      <span
        className={`font-bold ${
          transaction.type === 'earned'
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        }`}
      >
        {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
      </span>
    </motion.div>
  );
};

// Composant statistiques
const StatsCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) => {
  // Convertir la valeur en nombre pour la comparaison
  const numericValue = typeof value === 'string' ? parseInt(value, 10) : value;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
        scale: {
          type: "spring",
          damping: 15,
          stiffness: 100
        }
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all overflow-hidden min-h-[200px] flex flex-col justify-between"
    >
      {/* Cercle décoratif en arrière-plan */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full ${color} opacity-20 blur-2xl`} />
      <div className={`absolute -left-8 -bottom-8 w-24 h-24 rounded-full ${color} opacity-10 blur-xl`} />

      <div className="relative">
        <div className={`inline-flex p-4 rounded-2xl ${color} backdrop-blur-sm mb-4`}>
          <span className="text-4xl">{icon}</span>
        </div>
        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</h3>
        <div className="flex items-baseline gap-2">
          <p className="text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{value}</p>
          <p className="text-base font-medium text-gray-500 dark:text-gray-400">points</p>
        </div>
      </div>

      {/* Indicateur de tendance (à personnaliser selon vos besoins) */}
      <div className="mt-4 flex items-center gap-2">
        <div className={`flex items-center text-sm ${
          numericValue > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
        }`}>
          {numericValue > 0 ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          )}
          <span className="ml-1">depuis hier</span>
        </div>
      </div>
    </motion.div>
  );
};

export default function PointsManager() {
  const { points, transactions, getLastDailyReward } = usePoints();

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
    <div className="w-full max-w-6xl mx-auto p-8 space-y-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Gestion des Points</h1>
          <p className="text-gray-600 dark:text-gray-400">Suivez vos points et vos récompenses</p>
        </div>
        <motion.div 
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            damping: 10,
            stiffness: 100
          }}
          className="flex items-center gap-4 bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-4 rounded-2xl shadow-lg"
        >
          <span className="text-4xl">💎</span>
          <div className="flex flex-col">
            <span className="text-sm text-white/80">Total des points</span>
            <span className="text-3xl font-bold text-white">{points}</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatsCard
          title="Points aujourd'hui"
          value={stats.pointsToday}
          icon="📅"
          color="bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-400/20 dark:to-blue-500/20"
        />
        <StatsCard
          title="Total gagné"
          value={stats.totalEarned}
          icon="⭐"
          color="bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-400/20 dark:to-green-500/20"
        />
        <StatsCard
          title="Total dépensé"
          value={stats.totalSpent}
          icon="💸"
          color="bg-gradient-to-br from-red-500/10 to-red-600/10 dark:from-red-400/20 dark:to-red-500/20"
        />
        <StatsCard
          title="Transactions"
          value={stats.transactionCount}
          icon="📊"
          color="bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-400/20 dark:to-purple-500/20"
        />
      </div>

      {/* Guide des coûts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.2
        }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
      >
        <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Guide des coûts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <span className="text-3xl">✏️</span>
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">Modifier une note</p>
              <p className="text-lg font-semibold text-violet-600 dark:text-violet-400">5 points</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <span className="text-3xl">🤖</span>
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">Génération IA</p>
              <p className="text-lg font-semibold text-violet-600 dark:text-violet-400">10 points</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <span className="text-3xl">🎨</span>
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">Changer de thème</p>
              <p className="text-lg font-semibold text-violet-600 dark:text-violet-400">5 points</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <span className="text-3xl">📚</span>
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">Ajouter un livre</p>
              <p className="text-lg font-semibold text-violet-600 dark:text-violet-400">10 points</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <span className="text-3xl">📝</span>
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">Ajouter une page</p>
              <p className="text-lg font-semibold text-violet-600 dark:text-violet-400">5 points</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Historique des transactions */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Historique des transactions</h3>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          {groupedTransactions.map(([date, dayTransactions]) => (
            <div key={date} className="space-y-4 mb-8 last:mb-0">
              <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-2">{date}</h4>
              <div className="space-y-3">
                {dayTransactions.map(transaction => (
                  <TransactionCard key={transaction.id} transaction={transaction} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 