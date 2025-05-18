'use client';

import React from 'react';
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
      className={`flex items-center justify-between p-4 mb-2 rounded-lg shadow-sm
                ${transaction.type === 'earned' 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800'}`}
    >
      <div className="flex items-center space-x-4">
        <span className="text-2xl">{getIcon(transaction.category)}</span>
        <div>
          <p className="font-medium text-gray-800 dark:text-gray-200">{transaction.description}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(transaction.timestamp)}</p>
        </div>
      </div>
      <span className={`font-bold ${
        transaction.type === 'earned' 
          ? 'text-green-600 dark:text-green-400' 
          : 'text-red-600 dark:text-red-400'
      }`}>
        {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
      </span>
    </motion.div>
  );
};

// Composant principal de gestion des points
export default function PointsManager() {
  const { points, transactions, getLastDailyReward } = usePoints();
  const lastReward = getLastDailyReward();

  // Calculer le temps restant jusqu'à la prochaine récompense
  const getTimeUntilNextReward = () => {
    if (!lastReward) return 'Disponible maintenant';
    const now = new Date();
    const nextReward = new Date(lastReward.getTime() + 24 * 60 * 60 * 1000);
    const diff = nextReward.getTime() - now.getTime();
    
    if (diff <= 0) return 'Disponible maintenant';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Calculer les statistiques
  const stats = transactions.reduce((acc, transaction) => {
    if (transaction.type === 'earned') {
      acc.totalEarned += transaction.amount;
    } else {
      acc.totalSpent += transaction.amount;
    }
    return acc;
  }, { totalEarned: 0, totalSpent: 0 });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* En-tête avec le total des points */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-2">Mes Points</h2>
        <div className="text-4xl font-bold mb-4">{points}</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-white/80">Points gagnés</p>
            <p className="text-xl font-semibold">+{stats.totalEarned}</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-white/80">Points dépensés</p>
            <p className="text-xl font-semibold">-{stats.totalSpent}</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-white/80">Prochaine récompense</p>
            <p className="text-xl font-semibold">{getTimeUntilNextReward()}</p>
          </div>
        </div>
      </motion.div>

      {/* Guide des coûts */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Guide des coûts</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">✏️</span>
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">Modifier une note</p>
              <p className="text-sm text-violet-600 dark:text-violet-400">5 points</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🤖</span>
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">Génération IA</p>
              <p className="text-sm text-violet-600 dark:text-violet-400">10 points</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🎨</span>
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">Changer de thème</p>
              <p className="text-sm text-violet-600 dark:text-violet-400">5 points</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📚</span>
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">Ajouter un livre</p>
              <p className="text-sm text-violet-600 dark:text-violet-400">10 points</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📝</span>
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">Ajouter une page</p>
              <p className="text-sm text-violet-600 dark:text-violet-400">5 points</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Historique des transactions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Historique des transactions</h3>
        <div className="space-y-2">
          {transactions.map(transaction => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
          {transactions.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              Aucune transaction pour le moment
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 