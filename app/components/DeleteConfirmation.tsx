'use client';

import React, { useEffect, useState } from 'react';

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export default function DeleteConfirmation({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = "Supprimer ?",
  message = "Cette action est irréversible."
}: DeleteConfirmationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsLeaving(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 200);
  };

  const handleConfirm = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onConfirm();
      setIsVisible(false);
      onClose();
    }, 200);
  };

  if (!isOpen && !isVisible) return null;

  return (
    <div 
      className={`
        fixed bottom-4 right-4 z-50 
        transform transition-all duration-200 ease-in-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        ${isLeaving ? 'translate-y-4 opacity-0' : ''}
      `}
    >
      <div 
        className="
          bg-white dark:bg-gray-800 
          rounded-lg shadow-lg 
          p-4 max-w-sm w-full
          border border-gray-200 dark:border-gray-700
        "
      >
        <div className="flex items-start mb-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3">
            <svg 
              className="w-4 h-4 text-red-600 dark:text-red-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {message}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="
              px-3 py-1.5 text-sm
              text-gray-600 dark:text-gray-300 
              hover:bg-gray-100 dark:hover:bg-gray-700 
              rounded-md transition-colors
            "
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            className="
              px-3 py-1.5 text-sm
              bg-red-600 text-white 
              hover:bg-red-700 
              rounded-md transition-colors
            "
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
} 