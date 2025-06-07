'use client';

import React, { createContext, useContext, useState } from 'react';
import { useNotifications } from './NotificationsContext';
import { useAuth } from './AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBooks,
  addBook as addFirebaseBook,
  updateBook as updateFirebaseBook,
  deleteBook as deleteFirebaseBook
} from '../../firebase/bookService';
import AccountModal from '../components/AccountModal';

// Types pour la gestion des livres
export interface Page {
  id: string;
  content: string;
  pageNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Book {
  id: string;
  title: string;
  description: string;
  coverColor: string;
  pages: Page[];
  createdAt: Date;
  updatedAt: Date;
  totalPages: number;
  currentPage: number;
  bookType: 'text' | 'pdf';
  pdfUrl?: string;
  coverUrl?: string;
  pdfData?: string;
  synced?: boolean;
  inTrash?: boolean;
  trashedAt?: Date;
}

interface BookContextProps {
  books: Book[];
  currentBook: Book | null;
  addBook: (title: string, description: string, coverColor: string) => void;
  addPdfBook: (title: string, description: string, coverUrl: string | null, pdfData: string) => void;
  deleteBook: (id: string) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  addPage: (bookId: string, content: string) => void;
  updatePage: (bookId: string, pageId: string, content: string) => void;
  deletePage: (bookId: string, pageId: string) => void;
  setCurrentBook: (book: Book | null) => void;
  goToPage: (pageNumber: number) => void;
  restoreFromTrash: (id: string) => void;
  permanentlyDeleteBook: (id: string) => void;
  emptyTrash: () => void;
}

const BookContext = createContext<BookContextProps>({
  books: [],
  currentBook: null,
  addBook: () => {},
  addPdfBook: () => {},
  deleteBook: () => {},
  updateBook: () => {},
  addPage: () => {},
  updatePage: () => {},
  deletePage: () => {},
  setCurrentBook: () => {},
  goToPage: () => {},
  restoreFromTrash: () => {},
  permanentlyDeleteBook: () => {},
  emptyTrash: () => {},
});

export const useBooks = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBooks doit être utilisé à l\'intérieur d\'un BookProvider');
  }
  return context;
};

export function BookProvider({ children }: { children: React.ReactNode }) {
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Récupérer les livres de Firebase
  const { 
    data: books = [], 
    isLoading: isLoadingBooks 
  } = useQuery({
    queryKey: ['books', user?.uid],
    queryFn: () => user ? getBooks(user.uid) : Promise.resolve([]),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutations Firebase
  const addBookMutation = useMutation({
    mutationFn: async (newBook: Omit<Book, 'id'>) => {
      if (!user) throw new Error('Utilisateur non connecté');
      return await addFirebaseBook(user.uid, newBook);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['books', user?.uid], (oldData: Book[] | undefined) => {
        return oldData ? [data, ...oldData] : [data];
      });
    }
  });

  const updateBookMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Book> }) => {
      if (!user) throw new Error('Utilisateur non connecté');
      await updateFirebaseBook(id, updates);
      return { id, updates };
    },
    onSuccess: ({ id, updates }) => {
      queryClient.setQueryData(['books', user?.uid], (oldData: Book[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(book => book.id === id ? { ...book, ...updates } : book);
      });
    }
  });

  const deleteBookMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Utilisateur non connecté');
      await deleteFirebaseBook(id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(['books', user?.uid], (oldData: Book[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(book => book.id !== id);
      });
    }
  });

  const addBook = (title: string, description: string, coverColor: string) => {
    if (!user) {
      addNotification({
        type: 'error',
        title: 'Connexion requise',
        message: 'Vous devez être connecté pour créer un livre.',
        action: 'auth_login'
      });
      return;
    }

    const newBook: Omit<Book, 'id'> = {
      title,
      description,
      coverColor,
      pages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      totalPages: 0,
      currentPage: 1,
      bookType: 'text',
      synced: false
    };

    addBookMutation.mutate(newBook);

    addNotification({
      type: 'success',
      title: 'Livre créé',
      message: `Le livre "${title}" a été créé avec succès.`,
      action: 'book_created'
    });
  };

  const addPdfBook = (title: string, description: string, coverUrl: string | null, pdfData: string) => {
    if (!user) {
      addNotification({
        type: 'error',
        title: 'Connexion requise',
        message: 'Vous devez être connecté pour importer un livre PDF.',
        action: 'auth_login'
      });
      return;
    }

    const newBook: Omit<Book, 'id'> = {
      title,
      description,
      coverColor: '#6366f1',
      coverUrl: coverUrl || '',
      pages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      totalPages: 0,
      currentPage: 1,
      bookType: 'pdf',
      pdfData,
      synced: false
    };

    addBookMutation.mutate(newBook);

    addNotification({
      type: 'success',
      title: 'Livre PDF importé',
      message: `Le livre PDF "${title}" a été importé avec succès.`,
      action: 'book_created'
    });
  };

  const deleteBook = (id: string) => {
    if (!user) {
      addNotification({
        type: 'error',
        title: 'Connexion requise',
        message: 'Vous devez être connecté pour supprimer un livre.',
        action: 'auth_login'
      });
      return;
    }

    const book = books.find(b => b.id === id);
    if (book) {
      const updates = {
        inTrash: true,
        trashedAt: new Date()
      };

      updateBookMutation.mutate({ id, updates });

      if (currentBook?.id === id) {
        setCurrentBook(null);
      }

      addNotification({
        type: 'warning',
        title: 'Livre déplacé dans la corbeille',
        message: `Le livre "${book.title}" a été déplacé dans la corbeille.`,
        action: 'book_moved_to_trash'
      });
    }
  };

  const updateBook = (id: string, updates: Partial<Book>) => {
    if (!user) {
      addNotification({
        type: 'error',
        title: 'Connexion requise',
        message: 'Vous devez être connecté pour modifier un livre.',
        action: 'auth_login'
      });
      return;
    }

    const updatedData = {
      ...updates,
      updatedAt: new Date(),
      synced: false
    };

    updateBookMutation.mutate({ id, updates: updatedData });
  };

  const addPage = (bookId: string, content: string) => {
    if (!user) {
      addNotification({
        type: 'error',
        title: 'Connexion requise',
        message: 'Vous devez être connecté pour ajouter une page.',
        action: 'auth_login'
      });
      return;
    }

    const newPage: Page = {
      id: crypto.randomUUID(),
      content,
      pageNumber: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const book = books.find(b => b.id === bookId);
    if (book) {
      const updatedPages = [...book.pages, { ...newPage, pageNumber: book.pages.length + 1 }];
      updateBook(bookId, {
        pages: updatedPages,
        totalPages: updatedPages.length,
        updatedAt: new Date()
      });
    }
  };

  const updatePage = (bookId: string, pageId: string, content: string) => {
    if (!user) {
      addNotification({
        type: 'error',
        title: 'Connexion requise',
        message: 'Vous devez être connecté pour modifier une page.',
        action: 'auth_login'
      });
      return;
    }

    const book = books.find(b => b.id === bookId);
    if (book) {
      const updatedPages = book.pages.map(page => {
        if (page.id === pageId) {
          return {
            ...page,
            content,
            updatedAt: new Date()
          };
        }
        return page;
      });

      updateBook(bookId, {
        pages: updatedPages,
        updatedAt: new Date()
      });
    }
  };

  const deletePage = (bookId: string, pageId: string) => {
    if (!user) {
      addNotification({
        type: 'error',
        title: 'Connexion requise',
        message: 'Vous devez être connecté pour supprimer une page.',
        action: 'auth_login'
      });
      return;
    }

    const book = books.find(b => b.id === bookId);
    if (book) {
      const updatedPages = book.pages
        .filter(page => page.id !== pageId)
        .map((page, index) => ({
          ...page,
          pageNumber: index + 1
        }));

      updateBook(bookId, {
        pages: updatedPages,
        totalPages: updatedPages.length,
        currentPage: Math.min(book.currentPage, updatedPages.length),
        updatedAt: new Date()
      });
    }
  };

  const goToPage = (pageNumber: number) => {
    if (!user) {
      addNotification({
        type: 'error',
        title: 'Connexion requise',
        message: 'Vous devez être connecté pour naviguer dans un livre.',
        action: 'auth_login'
      });
      return;
    }

    if (currentBook) {
      updateBook(currentBook.id, {
        currentPage: Math.max(1, Math.min(pageNumber, currentBook.totalPages))
      });
    }
  };

  const restoreFromTrash = (id: string) => {
    if (!user) {
      addNotification({
        type: 'error',
        title: 'Connexion requise',
        message: 'Vous devez être connecté pour restaurer un livre.',
        action: 'auth_login'
      });
      return;
    }

    const book = books.find(b => b.id === id);
    if (book) {
      const updates = {
        inTrash: false,
        trashedAt: undefined
      };

      updateBookMutation.mutate({ id, updates });

      addNotification({
        type: 'success',
        title: 'Livre restauré',
        message: `Le livre "${book.title}" a été restauré de la corbeille.`,
        action: 'book_restored'
      });
    }
  };

  const permanentlyDeleteBook = (id: string) => {
    if (!user) {
      addNotification({
        type: 'error',
        title: 'Connexion requise',
        message: 'Vous devez être connecté pour supprimer définitivement un livre.',
        action: 'auth_login'
      });
      return;
    }

    const book = books.find(b => b.id === id);
    if (book) {
      deleteBookMutation.mutate(id);

      if (currentBook?.id === id) {
        setCurrentBook(null);
      }

      addNotification({
        type: 'error',
        title: 'Livre supprimé définitivement',
        message: `Le livre "${book.title}" a été supprimé définitivement.`,
        action: 'book_deleted'
      });
    }
  };

  const emptyTrash = () => {
    if (!user) {
      addNotification({
        type: 'error',
        title: 'Connexion requise',
        message: 'Vous devez être connecté pour vider la corbeille.',
        action: 'auth_login'
      });
      return;
    }

    const booksInTrash = books.filter(b => b.inTrash);
    booksInTrash.forEach(book => {
      permanentlyDeleteBook(book.id);
    });
  };

  return (
    <BookContext.Provider
      value={{
        books,
        currentBook,
        addBook,
        addPdfBook,
        deleteBook,
        updateBook,
        addPage,
        updatePage,
        deletePage,
        setCurrentBook,
        goToPage,
        restoreFromTrash,
        permanentlyDeleteBook,
        emptyTrash
      }}
    >
      {!user ? (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Connexion requise
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Vous devez être connecté pour accéder à vos livres.
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center mx-auto"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Se connecter
            </button>
          </div>
        </div>
      ) : (
        children
      )}
      
      <AccountModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </BookContext.Provider>
  );
} 