'use client';

import React from 'react';
import { usePoints } from '../context/PointsContext';

interface PointCostProps {
  cost: number;
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
}

export default function PointCost({ cost, position = 'bottom-right' }: PointCostProps) {
  const { canAfford } = usePoints();
  const isAffordable = canAfford(cost);

  const positionClasses = {
    'top-right': '-top-2 -right-2',
    'bottom-right': '-bottom-2 -right-2',
    'top-left': '-top-2 -left-2',
    'bottom-left': '-bottom-2 -left-2'
  };

  return (
    <div
      className={`absolute ${positionClasses[position]} px-2 py-1 rounded-full text-xs font-medium
                 ${isAffordable 
                   ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' 
                   : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}
                 shadow-sm border border-violet-200 dark:border-violet-800
                 transform transition-all duration-200 hover:scale-110
                 flex items-center space-x-1`}
    >
      <span>{cost}</span>
      <span className="text-[10px]">✨</span>
    </div>
  );
} 