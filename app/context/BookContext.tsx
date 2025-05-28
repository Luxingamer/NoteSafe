'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotifications } from './NotificationsContext';
import { useAuth } from './AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBooks,
  addBook as addFirebaseBook,
  updateBook as updateFirebaseBook,
  deleteBook as deleteFirebaseBook,
  syncBooks
} from '../../firebase/bookService';

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
  syncBooksToStorage: () => Promise<boolean>;
  loadBooksFromStorage: () => Promise<boolean>;
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
  syncBooksToStorage: async () => false,
  loadBooksFromStorage: async () => false,
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
  const [localBooks, setLocalBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Récupérer les livres de Firebase
  const { 
    data: firebaseBooks = [], 
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

  // Charger les livres depuis le localStorage pour les utilisateurs non connectés
  useEffect(() => {
    if (!user) {
      loadBooksFromStorage();
    }
  }, [user]);

  // Sauvegarder les livres dans le localStorage pour les utilisateurs non connectés
  useEffect(() => {
    if (!user && localBooks.length > 0) {
      localStorage.setItem('books', JSON.stringify(localBooks));
    }
  }, [localBooks, user]);

  // Gérer la transition entre le mode local et le mode cloud
  useEffect(() => {
    if (user) {
      // L'utilisateur vient de se connecter
      const syncLocalToCloud = async () => {
        try {
          // Récupérer les livres locaux
          const localBooks = localStorage.getItem('books');
          if (localBooks) {
            const parsedBooks = JSON.parse(localBooks);
            // Convertir les dates
            const booksWithDates = parsedBooks.map((book: any) => ({
              ...book,
              createdAt: new Date(book.createdAt),
              updatedAt: new Date(book.updatedAt),
              pages: book.pages?.map((page: any) => ({
                ...page,
                createdAt: new Date(page.createdAt),
                updatedAt: new Date(page.updatedAt)
              })) || []
            }));

            // Synchroniser avec Firebase
            await syncBooks(user.uid, booksWithDates);
            
            // Vider le localStorage après la synchronisation
            localStorage.removeItem('books');
          }
        } catch (error) {
          console.error('Erreur lors de la synchronisation des livres locaux vers le cloud:', error);
        }
      };

      syncLocalToCloud();
    }
  }, [user]);

  // Gérer la déconnexion
  useEffect(() => {
    const handleLogout = async () => {
      if (user) {
        try {
          // Sauvegarder les livres actuels dans le localStorage avant la déconnexion
          const currentBooks = queryClient.getQueryData<Book[]>(['books', user.uid]) || [];
          localStorage.setItem('books', JSON.stringify(currentBooks));
        } catch (error) {
          console.error('Erreur lors de la sauvegarde des livres avant déconnexion:', error);
        }
      }
    };

    window.addEventListener('logout', handleLogout);
    return () => window.removeEventListener('logout', handleLogout);
  }, [user, queryClient]);

  const addBook = (title: string, description: string, coverColor: string) => {
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

    if (user) {
      // Utiliser la mutation pour les utilisateurs connectés
      addBookMutation.mutate(newBook);
    } else {
      // Utiliser le localStorage pour les utilisateurs non connectés
      const id = crypto.randomUUID();
      setLocalBooks(prev => [...prev, { id, ...newBook }]);
    }

    addNotification({
      type: 'success',
      title: 'Livre créé',
      message: `Le livre "${title}" a été créé avec succès.`,
      action: 'book_created'
    });
  };

  const addPdfBook = (title: string, description: string, coverUrl: string | null, pdfData: string) => {
    const newBook: Omit<Book, 'id'> = {
      title,
      description,
      coverColor: '#6366f1',
      coverUrl: coverUrl || undefined,
      pages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      totalPages: 0,
      currentPage: 1,
      bookType: 'pdf',
      pdfData,
      synced: false
    };

    if (user) {
      // Utiliser la mutation pour les utilisateurs connectés
      addBookMutation.mutate(newBook);
    } else {
      // Utiliser le localStorage pour les utilisateurs non connectés
      const id = crypto.randomUUID();
      setLocalBooks(prev => [...prev, { id, ...newBook }]);
    }

    addNotification({
      type: 'success',
      title: 'Livre PDF importé',
      message: `Le livre PDF "${title}" a été importé avec succès.`,
      action: 'book_created'
    });
  };

  const deleteBook = (id: string) => {
    const book = (user ? firebaseBooks : localBooks).find(b => b.id === id);
    if (book) {
      const updates = {
        inTrash: true,
        trashedAt: new Date()
      };

      if (user) {
        // Utiliser la mutation pour les utilisateurs connectés
        updateBookMutation.mutate({ id, updates });
      } else {
        // Utiliser le localStorage pour les utilisateurs non connectés
        setLocalBooks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
      }

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
    const updatedData = {
      ...updates,
      updatedAt: new Date(),
      synced: false
    };

    if (user) {
      // Utiliser la mutation pour les utilisateurs connectés
      updateBookMutation.mutate({ id, updates: updatedData });
    } else {
      // Utiliser le localStorage pour les utilisateurs non connectés
      setLocalBooks(prev => prev.map(book => {
        if (book.id === id) {
          const updatedBook = { ...book, ...updatedData };
          if (currentBook?.id === id) {
            setCurrentBook(updatedBook);
          }
          return updatedBook;
        }
        return book;
      }));
    }
  };

  const addPage = (bookId: string, content: string) => {
    const newPage: Page = {
      id: crypto.randomUUID(),
      content,
      pageNumber: 0, // Sera mis à jour dans updateBook
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const books = user ? firebaseBooks : localBooks;
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
    const books = user ? firebaseBooks : localBooks;
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
    const books = user ? firebaseBooks : localBooks;
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
    if (currentBook) {
      updateBook(currentBook.id, {
        currentPage: Math.max(1, Math.min(pageNumber, currentBook.totalPages))
      });
    }
  };

  // Synchroniser les livres avec le stockage
  const syncBooksToStorage = async (): Promise<boolean> => {
    try {
      if (user) {
        // Synchroniser avec Firebase
        const success = await syncBooks(user.uid, firebaseBooks);
        if (success) {
          queryClient.invalidateQueries({ queryKey: ['books', user.uid] });
        }
        return success;
      } else {
        // Synchroniser avec le localStorage
        localStorage.setItem('books', JSON.stringify(localBooks.map(book => ({
          ...book,
          synced: true
        }))));
        setLocalBooks(prev => prev.map(book => ({ ...book, synced: true })));
        return true;
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation des livres:', error);
      return false;
    }
  };

  // Charger les livres depuis le stockage
  const loadBooksFromStorage = async (): Promise<boolean> => {
    try {
      const storedBooks = localStorage.getItem('books');
      if (storedBooks) {
        const parsedBooks = JSON.parse(storedBooks);
        // Convertir les dates de string en Date
        const booksWithDates = parsedBooks.map((book: Book) => ({
          ...book,
          createdAt: new Date(book.createdAt),
          updatedAt: new Date(book.updatedAt),
          pages: book.pages?.map(page => ({
            ...page,
            createdAt: new Date(page.createdAt),
            updatedAt: new Date(page.updatedAt)
          })) || []
        }));
        setLocalBooks(booksWithDates);
      }
      return true;
    } catch (error) {
      console.error('Erreur lors du chargement des livres:', error);
      return false;
    }
  };

  const restoreFromTrash = (id: string) => {
    const book = (user ? firebaseBooks : localBooks).find(b => b.id === id);
    if (book) {
      const updates = {
        inTrash: false,
        trashedAt: undefined
      };

      if (user) {
        // Utiliser la mutation pour les utilisateurs connectés
        updateBookMutation.mutate({ id, updates });
      } else {
        // Utiliser le localStorage pour les utilisateurs non connectés
        setLocalBooks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
      }

      addNotification({
        type: 'success',
        title: 'Livre restauré',
        message: `Le livre "${book.title}" a été restauré de la corbeille.`,
        action: 'book_restored'
      });
    }
  };

  const permanentlyDeleteBook = (id: string) => {
    const book = (user ? firebaseBooks : localBooks).find(b => b.id === id);
    if (book) {
      if (user) {
        // Utiliser la mutation pour les utilisateurs connectés
        deleteBookMutation.mutate(id);
      } else {
        // Utiliser le localStorage pour les utilisateurs non connectés
        setLocalBooks(prev => prev.filter(b => b.id !== id));
      }

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
    const booksInTrash = (user ? firebaseBooks : localBooks).filter(b => b.inTrash);
    booksInTrash.forEach(book => {
      permanentlyDeleteBook(book.id);
    });
  };

  // Utiliser les données appropriées selon que l'utilisateur est connecté ou non
  const books = user ? firebaseBooks : localBooks;

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
        syncBooksToStorage,
        loadBooksFromStorage,
        restoreFromTrash,
        permanentlyDeleteBook,
        emptyTrash
      }}
    >
      {children}
    </BookContext.Provider>
  );
} 