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

  // Définir les couleurs et les styles en fonction du type de transaction
  const cardStyles = transaction.type === 'earned'
    ? 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/20 border-l-4 border-emerald-400'
    : 'bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-900/30 dark:to-red-900/20 border-l-4 border-rose-400';

  const amountColor = transaction.type === 'earned'
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-rose-600 dark:text-rose-400';

  // Animation plus fluide pour les cartes
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)"
      }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      className={`flex items-center justify-between p-4 rounded-lg backdrop-blur-sm ${cardStyles} shadow-sm hover:shadow-md transition-all`}
    >
      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-inner">
          <span className="text-2xl">{getIcon(transaction.category)}</span>
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
      <span
        className={`font-bold text-lg ${amountColor} flex items-center`}
      >
        {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
        </svg>
      </span>
    </motion.div>
  );
};

// Composant statistiques avec animations améliorées
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
        scale: 1.05, 
        transition: { duration: 0.2 }
      }}
      className="relative bg-white dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all overflow-hidden min-h-[220px] flex flex-col justify-between group"
    >
      {/* Cercles décoratifs avec animations */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full ${color} opacity-20 blur-2xl group-hover:opacity-30 group-hover:w-36 group-hover:h-36 transition-all duration-300`} />
      <motion.div 
        className={`absolute -left-8 -bottom-8 w-24 h-24 rounded-full ${color} opacity-10 blur-xl`}
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ 
          repeat: Infinity,
          duration: 5,
          ease: "easeInOut" 
        }}
      />

      <div className="relative">
        <motion.div 
          whileHover={{ rotate: 10, scale: 1.1 }}
          className={`inline-flex p-5 rounded-2xl ${color} backdrop-blur-sm mb-6 shadow-inner`}
        >
          <span className="text-4xl">{icon}</span>
        </motion.div>
        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-3">{title}</h3>
        <div className="flex items-baseline gap-2">
          <motion.p 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
            className="text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight"
          >
            {value}
          </motion.p>
          <p className="text-base font-medium text-gray-500 dark:text-gray-400">points</p>
        </div>
      </div>

      {/* Indicateur de tendance avec animations */}
      <div className="mt-4 flex items-center gap-2">
        <div className={`flex items-center text-sm ${
          numericValue > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
        }`}>
          {numericValue > 0 ? (
            <motion.svg 
              animate={{ y: [0, -3, 0] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </motion.svg>
          ) : (
            <motion.svg 
              animate={{ y: [0, 3, 0] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </motion.svg>
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

  // Animation des éléments de la page
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-6xl mx-auto p-8 space-y-12"
    >
      <motion.div 
        variants={itemVariants}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Gestion des Points</h1>
          <p className="text-gray-600 dark:text-gray-400">Suivez vos points et vos récompenses</p>
        </div>
        <motion.div 
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          transition={{
            type: "spring",
            damping: 10,
            stiffness: 100
          }}
          className="flex items-center gap-4 bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6 rounded-2xl shadow-lg relative overflow-hidden group"
        >
          {/* Effet de particules scintillantes */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <motion.span 
            className="text-5xl"
            animate={{ 
              rotateY: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotateY: { repeat: Infinity, duration: 5 },
              scale: { repeat: Infinity, duration: 3 }
            }}
          >
            💎
          </motion.span>
          <div className="flex flex-col">
            <span className="text-sm text-white/80 font-medium">Total des points</span>
            <span className="text-4xl font-bold text-white drop-shadow-md">{points}</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Statistiques avec grille responsive et animations améliorées */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatsCard
          title="Points aujourd'hui"
          value={stats.pointsToday}
          icon="📅"
          color="bg-gradient-to-br from-blue-500/20 to-blue-600/10 dark:from-blue-400/30 dark:to-blue-500/20"
        />
        <StatsCard
          title="Total gagné"
          value={stats.totalEarned}
          icon="⭐"
          color="bg-gradient-to-br from-green-500/20 to-green-600/10 dark:from-green-400/30 dark:to-green-500/20"
        />
        <StatsCard
          title="Total dépensé"
          value={stats.totalSpent}
          icon="💸"
          color="bg-gradient-to-br from-red-500/20 to-red-600/10 dark:from-red-400/30 dark:to-red-500/20"
        />
        <StatsCard
          title="Transactions"
          value={stats.transactionCount}
          icon="📊"
          color="bg-gradient-to-br from-purple-500/20 to-purple-600/10 dark:from-purple-400/30 dark:to-purple-500/20"
        />
      </motion.div>

      {/* Guide des coûts avec design modernisé */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Guide des coûts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { emoji: "✏️", title: "Modifier une note", cost: 5 },
            { emoji: "🤖", title: "Génération IA", cost: 10 },
            { emoji: "🎨", title: "Changer de thème", cost: 5 },
            { emoji: "📚", title: "Ajouter un livre", cost: 10 },
            { emoji: "📝", title: "Ajouter une page", cost: 5 }
          ].map((item, index) => (
            <motion.div 
              key={index}
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-700 shadow">
                <motion.span 
                  className="text-3xl"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2,
                    delay: index * 0.5
                  }}
                >
                  {item.emoji}
                </motion.span>
              </div>
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">{item.title}</p>
                <p className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{item.cost} points</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Historique des transactions avec animations améliorées */}
      <motion.div variants={itemVariants} className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Historique des transactions
        </h3>
        <motion.div 
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {groupedTransactions.length > 0 ? (
            groupedTransactions.map(([date, dayTransactions], index) => (
              <motion.div 
                key={date}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-4 mb-8 last:mb-0"
              >
                <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {date}
                </h4>
                <div className="space-y-3">
                  {dayTransactions.map((transaction, i) => (
                    <TransactionCard key={transaction.id} transaction={transaction} />
                  ))}
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-10">Aucune transaction disponible pour le moment.</p>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
} 