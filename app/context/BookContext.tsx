'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotifications } from './NotificationsContext';

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
}

interface BookContextProps {
  books: Book[];
  currentBook: Book | null;
  addBook: (title: string, description: string, coverColor: string) => void;
  deleteBook: (id: string) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  addPage: (bookId: string, content: string) => void;
  updatePage: (bookId: string, pageId: string, content: string) => void;
  deletePage: (bookId: string, pageId: string) => void;
  setCurrentBook: (book: Book | null) => void;
  goToPage: (pageNumber: number) => void;
}

const BookContext = createContext<BookContextProps | undefined>(undefined);

export function useBooks() {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBooks doit être utilisé à l\'intérieur d\'un BookProvider');
  }
  return context;
}

export function BookProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const { addNotification } = useNotifications();

  // Charger les livres depuis le localStorage
  useEffect(() => {
    const storedBooks = localStorage.getItem('books');
    if (storedBooks) {
      const parsedBooks = JSON.parse(storedBooks);
      // Convertir les dates de string en Date
      const booksWithDates = parsedBooks.map((book: Book) => ({
        ...book,
        createdAt: new Date(book.createdAt),
        updatedAt: new Date(book.updatedAt),
        pages: book.pages.map(page => ({
          ...page,
          createdAt: new Date(page.createdAt),
          updatedAt: new Date(page.updatedAt)
        }))
      }));
      setBooks(booksWithDates);
    }
  }, []);

  // Sauvegarder les livres dans le localStorage
  useEffect(() => {
    localStorage.setItem('books', JSON.stringify(books));
  }, [books]);

  const addBook = (title: string, description: string, coverColor: string) => {
    const newBook: Book = {
      id: crypto.randomUUID(),
      title,
      description,
      coverColor,
      pages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      totalPages: 0,
      currentPage: 1
    };

    setBooks(prev => [...prev, newBook]);
    addNotification({
      type: 'success',
      title: 'Livre créé',
      message: `Le livre "${title}" a été créé avec succès.`,
      action: 'book_created'
    });
  };

  const deleteBook = (id: string) => {
    const book = books.find(b => b.id === id);
    if (book) {
      setBooks(prev => prev.filter(b => b.id !== id));
      if (currentBook?.id === id) {
        setCurrentBook(null);
      }
      addNotification({
        type: 'warning',
        title: 'Livre supprimé',
        message: `Le livre "${book.title}" a été supprimé.`,
        action: 'book_deleted'
      });
    }
  };

  const updateBook = (id: string, updates: Partial<Book>) => {
    setBooks(prev => prev.map(book => {
      if (book.id === id) {
        const updatedBook = {
          ...book,
          ...updates,
          updatedAt: new Date()
        };
        if (currentBook?.id === id) {
          setCurrentBook(updatedBook);
        }
        return updatedBook;
      }
      return book;
    }));
  };

  const addPage = (bookId: string, content: string) => {
    setBooks(prev => prev.map(book => {
      if (book.id === bookId) {
        const newPage: Page = {
          id: crypto.randomUUID(),
          content,
          pageNumber: book.pages.length + 1,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const updatedBook = {
          ...book,
          pages: [...book.pages, newPage],
          totalPages: book.pages.length + 1,
          updatedAt: new Date()
        };
        if (currentBook?.id === bookId) {
          setCurrentBook(updatedBook);
        }
        return updatedBook;
      }
      return book;
    }));
  };

  const updatePage = (bookId: string, pageId: string, content: string) => {
    setBooks(prev => prev.map(book => {
      if (book.id === bookId) {
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
        const updatedBook = {
          ...book,
          pages: updatedPages,
          updatedAt: new Date()
        };
        if (currentBook?.id === bookId) {
          setCurrentBook(updatedBook);
        }
        return updatedBook;
      }
      return book;
    }));
  };

  const deletePage = (bookId: string, pageId: string) => {
    setBooks(prev => prev.map(book => {
      if (book.id === bookId) {
        const updatedPages = book.pages
          .filter(page => page.id !== pageId)
          .map((page, index) => ({
            ...page,
            pageNumber: index + 1
          }));
        const updatedBook = {
          ...book,
          pages: updatedPages,
          totalPages: updatedPages.length,
          currentPage: Math.min(book.currentPage, updatedPages.length),
          updatedAt: new Date()
        };
        if (currentBook?.id === bookId) {
          setCurrentBook(updatedBook);
        }
        return updatedBook;
      }
      return book;
    }));
  };

  const goToPage = (pageNumber: number) => {
    if (currentBook) {
      setCurrentBook({
        ...currentBook,
        currentPage: Math.max(1, Math.min(pageNumber, currentBook.totalPages))
      });
    }
  };

  return (
    <BookContext.Provider
      value={{
        books,
        currentBook,
        addBook,
        deleteBook,
        updateBook,
        addPage,
        updatePage,
        deletePage,
        setCurrentBook,
        goToPage
      }}
    >
      {children}
    </BookContext.Provider>
  );
} 