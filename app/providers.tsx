'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { NotesProvider } from './context/NotesContext';
import { ThemeProvider } from 'next-themes';

// Création du client React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class">
        <AuthProvider>
          <NotesProvider>
            {children}
          </NotesProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
} 