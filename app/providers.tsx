'use client';

import React, { useState, Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { NotesProvider } from './context/NotesContext';
import { SettingsProvider } from './context/SettingsContext';
import { UserProvider } from './context/UserContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { ConnectionProvider } from './context/ConnectionContext';
import { ThemeProvider } from 'next-themes';

interface ProvidersProps {
  children: React.ReactNode;
}

// Lazy load non-critical providers
const LazyAchievementsProvider = lazy(() => import('./context/AchievementsContext').then(module => ({ default: module.AchievementsProvider })));
const LazyPointsProvider = lazy(() => import('./context/PointsContext').then(module => ({ default: module.PointsProvider })));
const LazyBookProvider = lazy(() => import('./context/BookContext').then(module => ({ default: module.BookProvider })));

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <UserProvider>
            <NotificationsProvider>
              <SettingsProvider>
                <NotesProvider>
                  <ConnectionProvider>
                    <Suspense fallback={null}>
                      <LazyAchievementsProvider>
                        <LazyPointsProvider>
                          <LazyBookProvider>
                            {children}
                          </LazyBookProvider>
                        </LazyPointsProvider>
                      </LazyAchievementsProvider>
                    </Suspense>
                  </ConnectionProvider>
                </NotesProvider>
              </SettingsProvider>
            </NotificationsProvider>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
} 