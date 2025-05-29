import { 
  ref,
  set,
  push,
  remove,
  get,
  update,
  Database
} from 'firebase/database';
import { db } from './config';
import { Book, Page } from '../app/context/BookContext';

// Référence à la collection de livres dans Realtime Database
const BOOKS_PATH = 'books';

// Interface pour les livres dans la base de données
interface DatabaseBook {
  title: string;
  description: string;
  coverColor: string;
  coverUrl?: string;
  pdfUrl?: string;
  pdfData?: string;
  pages?: DatabasePage[];
  createdAt: string;
  updatedAt: string;
  totalPages: number;
  currentPage: number;
  bookType: 'text' | 'pdf';
  userId: string;
  synced: boolean;
  inTrash?: boolean;
  trashedAt?: string | null;
}

// Interface pour les pages dans la base de données
interface DatabasePage {
  id: string;
  content: string;
  pageNumber: number;
  createdAt: string;
  updatedAt: string;
}

// Type pour un livre sans ID
export type BookWithoutId = Omit<Book, 'id'>;

// Fonction utilitaire pour convertir un livre en format base de données
const bookToDatabase = (book: BookWithoutId | Book, userId: string): DatabaseBook => ({
  title: book.title,
  description: book.description,
  coverColor: book.coverColor,
  coverUrl: book.coverUrl || '',
  pdfUrl: book.pdfUrl || '',
  pdfData: book.pdfData || '',
  pages: book.pages?.map(page => ({
    ...page,
    createdAt: page.createdAt.toISOString(),
    updatedAt: page.updatedAt.toISOString()
  })) || [],
  createdAt: book.createdAt.toISOString(),
  updatedAt: book.updatedAt.toISOString(),
  totalPages: book.totalPages,
  currentPage: book.currentPage,
  bookType: book.bookType,
  userId,
  synced: true,
  inTrash: book.inTrash || false,
  trashedAt: book.trashedAt ? book.trashedAt.toISOString() : ''
});

// Fonction utilitaire pour convertir un livre de la base de données en livre application
const databaseToBook = (id: string, dbBook: DatabaseBook): Book => ({
  id,
  title: dbBook.title,
  description: dbBook.description,
  coverColor: dbBook.coverColor,
  coverUrl: dbBook.coverUrl,
  pdfUrl: dbBook.pdfUrl,
  pdfData: dbBook.pdfData,
  pages: dbBook.pages?.map(page => ({
    ...page,
    createdAt: new Date(page.createdAt),
    updatedAt: new Date(page.updatedAt)
  })) || [],
  createdAt: new Date(dbBook.createdAt),
  updatedAt: new Date(dbBook.updatedAt),
  totalPages: dbBook.totalPages,
  currentPage: dbBook.currentPage,
  bookType: dbBook.bookType,
  synced: dbBook.synced,
  inTrash: dbBook.inTrash || false,
  trashedAt: dbBook.trashedAt ? new Date(dbBook.trashedAt) : undefined
});

// Vérifier que la base de données est configurée
const checkDb = () => {
  if (!db) {
    throw new Error('La base de données n\'est pas configurée');
  }
};

// Obtenir tous les livres d'un utilisateur
export const getBooks = async (userId: string): Promise<Book[]> => {
  try {
    checkDb();
    
    const booksRef = ref(db as Database, BOOKS_PATH);
    const snapshot = await get(booksRef);
    const books: Book[] = [];
    
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        try {
          const dbBook = childSnapshot.val();
          // Only process the book if it has valid data and belongs to the user
          if (dbBook && typeof dbBook === 'object' && dbBook.userId === userId) {
            books.push(databaseToBook(childSnapshot.key as string, dbBook));
          }
        } catch (error) {
          console.error('Error processing book:', childSnapshot.key, error);
          // Continue with the next book instead of failing completely
        }
      });
    }
    
    return books;
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error);
    throw error;
  }
};

// Ajouter un nouveau livre
export const addBook = async (userId: string, bookData: BookWithoutId): Promise<Book> => {
  try {
    checkDb();
    
    const booksRef = ref(db as Database, BOOKS_PATH);
    const newBookRef = push(booksRef);
    const cleanBook = bookToDatabase(bookData, userId);
    
    await set(newBookRef, cleanBook);
    
    return databaseToBook(newBookRef.key as string, cleanBook);
  } catch (error) {
    console.error('Erreur lors de l\'ajout du livre:', error);
    throw error;
  }
};

// Mettre à jour un livre existant
export const updateBook = async (bookId: string, updates: Partial<Book>): Promise<void> => {
  try {
    checkDb();
    
    const bookRef = ref(db as Database, `${BOOKS_PATH}/${bookId}`);
    
    // Convertir les dates en chaînes ISO et nettoyer les undefined
    const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
      if (value === undefined) {
        acc[key] = null;
      } else if (value instanceof Date) {
        acc[key] = value.toISOString();
      } else if (key === 'pages' && Array.isArray(value)) {
        acc[key] = value.map(page => ({
          ...page,
          createdAt: page.createdAt.toISOString(),
          updatedAt: page.updatedAt.toISOString()
        }));
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    await update(bookRef, cleanUpdates);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du livre:', error);
    throw error;
  }
};

// Supprimer un livre
export const deleteBook = async (bookId: string): Promise<void> => {
  try {
    checkDb();
    
    const bookRef = ref(db as Database, `${BOOKS_PATH}/${bookId}`);
    await remove(bookRef);
  } catch (error) {
    console.error('Erreur lors de la suppression du livre:', error);
    throw error;
  }
};

// Synchroniser des livres locaux vers la base de données
export const syncBooks = async (userId: string, books: Book[]): Promise<boolean> => {
  try {
    // Si Firebase n'est pas configuré, indiquer que la synchronisation a échoué
    if (!db) {
      console.warn('La base de données n\'est pas configurée. La synchronisation est impossible.');
      return false;
    }
    
    // 1. Récupérer tous les livres actuels de la base de données
    const existingBooks = await getBooks(userId);
    const existingBookIds = new Set(existingBooks.map(book => book.id));
    
    // 2. Pour chaque livre local
    for (const book of books) {
      const cleanBook = bookToDatabase(book, userId);

      if (book.id && existingBookIds.has(book.id)) {
        // Le livre existe déjà dans la base de données, mise à jour
        const bookRef = ref(db as Database, `${BOOKS_PATH}/${book.id}`);
        await update(bookRef, cleanBook);
      } else {
        // Nouveau livre à ajouter
        const bookRef = ref(db as Database, `${BOOKS_PATH}/${book.id || push(ref(db as Database, BOOKS_PATH)).key}`);
        await set(bookRef, cleanBook);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la synchronisation des livres:', error);
    return false;
  }
}; 