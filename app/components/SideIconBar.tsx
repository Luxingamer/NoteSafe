'use client';

import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationsContext';
import { usePoints } from '../context/PointsContext';
import { useRouter } from 'next/navigation';

interface SideIconBarProps {
  // Cette interface pourra être étendue avec d'autres propriétés selon les besoins
}

export default function SideIconBar({}: SideIconBarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { notifications } = useNotifications();
  const { points } = usePoints();
  const router = useRouter();

  // Calculer le nombre de notifications non lues
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Fonction pour déclencher les filtres de vue
  const triggerViewFilter = (view: 'achievements' | 'book' | 'ai' | 'notifications' | 'documentation' | 'points') => {
    // Créer et déclencher un événement personnalisé avec la vue sélectionnée
    const event = new CustomEvent('filter-view', { 
      detail: { view } 
    });
    window.dispatchEvent(event);
  };

  return (
    <div 
      className={`fixed top-0 left-0 h-screen w-12 z-[5] flex flex-col items-center pt-24 pb-8 transition-all duration-300 shadow-lg ${isHovered ? 'w-14' : 'w-12'}`}
      style={{ 
        background: `linear-gradient(to bottom, var(--topbar-gradient-from), var(--topbar-gradient-to))` 
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Section supérieure: icônes principales */}
      <div className="flex flex-col items-center space-y-5 mt-4">
        {/* Icône Mode Livre */}
        <button
          onClick={() => triggerViewFilter('book')}
          className={`p-2 rounded-full hover:bg-white/20 text-orange-300 transition-all duration-200 ${isHovered ? 'scale-110' : ''}`}
          title="Mode Livre"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M21,5C19.89,4.65 18.67,4.5 17.5,4.5C15.55,4.5 13.45,4.9 12,6C10.55,4.9 8.45,4.5 6.5,4.5C4.55,4.5 2.45,4.9 1,6V20.65C1,20.9 1.25,21.15 1.5,21.15C1.6,21.15 1.65,21.1 1.75,21.1C3.1,20.45 5.05,20 6.5,20C8.45,20 10.55,20.4 12,21.5C13.35,20.65 15.8,20 17.5,20C19.15,20 20.85,20.3 22.25,21.05C22.35,21.1 22.4,21.1 22.5,21.1C22.75,21.1 23,20.85 23,20.6V6C22.4,5.55 21.75,5.25 21,5M21,18.5C19.9,18.15 18.7,18 17.5,18C15.8,18 13.35,18.65 12,19.5V8C13.35,7.15 15.8,6.5 17.5,6.5C18.7,6.5 19.9,6.65 21,7V18.5Z" />
          </svg>
        </button>

        {/* Icône Intelligence Artificielle */}
        <button
          onClick={() => triggerViewFilter('ai')}
          className={`p-2 rounded-full hover:bg-white/20 text-cyan-300 transition-all duration-200 ${isHovered ? 'scale-110' : ''}`}
          title="Intelligence Artificielle"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M21,15.61L19.59,17L14.58,12L19.59,7L21,8.39L17.44,12L21,15.61M3,6H16V8H3V6M3,13V11H13V13H3M3,18V16H16V18H3Z" />
          </svg>
        </button>

        {/* Icône Notifications */}
        <button
          onClick={() => triggerViewFilter('notifications')}
          className={`p-2 rounded-full hover:bg-white/20 text-pink-300 transition-all duration-200 relative ${isHovered ? 'scale-110' : ''}`}
          title="Notifications"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Icône Succès */}
        <button
          onClick={() => triggerViewFilter('achievements')}
          className={`p-2 rounded-full hover:bg-white/20 text-amber-300 transition-all duration-200 ${isHovered ? 'scale-110' : ''}`}
          title="Succès"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M20.2,2H19.5H18C17.1,2 16,3 16,4H8C8,3 6.9,2 6,2H4.5H3.8H2V11C2,12 3,13 4,13H6.2C6.6,15 7.9,16.7 11,17V19.1C8.8,19.3 8,20.4 8,21.7V22H16V21.7C16,20.4 15.2,19.3 13,19.1V17C16.1,16.7 17.4,15 17.8,13H20C21,13 22,12 22,11V2H20.2M4,11V4H6V6V11C5.1,11 4.3,11 4,11M20,11C19.7,11 18.9,11 18,11V6V4H20V11Z" />
          </svg>
        </button>

        {/* Icône Points */}
        <button
          onClick={() => triggerViewFilter('points')}
          className={`p-2 rounded-full hover:bg-white/20 text-yellow-300 transition-all duration-200 relative ${isHovered ? 'scale-110' : ''}`}
          title="Points"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,17V16H9V14H13V13H10A1,1 0 0,1 9,12V9A1,1 0 0,1 10,8H11V7H13V8H15V10H11V11H14A1,1 0 0,1 15,12V15A1,1 0 0,1 14,16H13V17H11Z" />
          </svg>
          <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {points}
          </span>
        </button>

        {/* Icône Documentation */}
        <button
          onClick={() => triggerViewFilter('documentation')}
          className={`p-2 rounded-full hover:bg-white/20 text-green-300 transition-all duration-200 ${isHovered ? 'scale-110' : ''}`}
          title="Documentation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M6,2A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6M6,4H13V9H18V20H6V4M8,12V14H16V12H8M8,16V18H13V16H8Z" />
          </svg>
        </button>
      </div>

      {/* Ligne séparatrice */}
      <div className="w-6 h-px bg-white/30 my-6"></div>

      {/* Section inférieure: icônes secondaires (à compléter plus tard) */}
      <div className="flex flex-col items-center space-y-5">
        {/* Espace réservé pour futures icônes */}
        <div className={`w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold transition-all duration-200 hover:bg-white/30 ${isHovered ? 'scale-110' : ''}`} title="Plus d'options à venir">
          +
        </div>
      </div>
    </div>
  );
} 