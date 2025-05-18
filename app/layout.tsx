import './globals.css';
import './styles/animations.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from './providers';
import { NotesProvider } from './context/NotesContext'
import { SettingsProvider } from './context/SettingsContext'
import { NotificationsProvider } from './context/NotificationsContext'
import { AuthProvider } from './context/AuthContext'
import { UserProvider } from './context/UserContext'

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NoteSafe - Application de prise de notes sécurisée',
  description: 'Une application moderne pour organiser et sécuriser vos notes personnelles',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            <SettingsProvider>
              <NotificationsProvider>
                <NotesProvider>
                  <UserProvider>
                    {children}
                  </UserProvider>
                </NotesProvider>
              </NotificationsProvider>
            </SettingsProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
