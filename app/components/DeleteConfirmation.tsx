'use client';

import React, { useEffect, useState } from 'react';

interface DeleteConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
  title?: string;
  message?: string;
}

export default function DeleteConfirmation({ 
  isOpen, 
  onConfirm, 
  onClose,
  title = 'Confirmer la suppression',
  message = 'Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.'
}: DeleteConfirmationProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="relative p-6 rounded-lg max-w-md w-full mx-4 bg-white dark:bg-gray-800"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          {message}
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
} 