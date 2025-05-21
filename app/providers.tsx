'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { NotesProvider } from './context/NotesContext';
import { SettingsProvider } from './context/SettingsContext';
import { UserProvider } from './context/UserContext';
import { AchievementsProvider } from './context/AchievementsContext';
import { ThemeProvider } from 'next-themes';
import { NotificationsProvider } from './context/NotificationsContext';
import { BookProvider } from './context/BookContext';
import { PointsProvider } from './context/PointsContext';
import { ConnectionProvider } from './context/ConnectionContext';

interface ProvidersProps {
  children: React.ReactNode;
}

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
                    <AchievementsProvider>
                      <PointsProvider>
                        <BookProvider>
                          {children}
                        </BookProvider>
                      </PointsProvider>
                    </AchievementsProvider>
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