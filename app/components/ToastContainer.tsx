'use client';

import React from 'react';
import Toast from './Toast';
import { NotificationItem } from '../context/NotificationsContext';

interface ToastContainerProps {
  toasts: NotificationItem[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 pointer-events-none
                    sm:p-6 md:max-w-[420px] w-full">
      <div className="flex flex-col items-end space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto w-full transform transition-all duration-300 ease-in-out"
          >
            <Toast
              id={toast.id}
              type={toast.type}
              title={toast.title}
              message={toast.message}
              onClose={() => onRemove(toast.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 