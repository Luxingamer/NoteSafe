import { 
  ref,
  set,
  push,
  remove,
  get,
  query,
  orderByChild,
  equalTo,
  update,
  Database
} from 'firebase/database';
import { db } from './config';
import { Note, NoteCategory } from '../app/context/NotesContext';

// Référence à la collection de notes dans Realtime Database
const NOTES_PATH = 'notes';

// Interface pour les notes dans la base de données
interface DatabaseNote {
  content: string;
  category: NoteCategory;
  userId: string;
  favorite: boolean;
  inTrash: boolean;
  isPinned: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  trashedAt: string | null;
  synced: boolean;
}

// Type pour une note sans ID
export type NoteWithoutId = Omit<Note, 'id'>;

// Fonction utilitaire pour convertir une note en format base de données
const noteToDatabase = (note: Note | NoteWithoutId, userId: string): DatabaseNote => ({
  content: note.content,
  category: note.category || 'note',
  userId,
  favorite: note.favorite || false,
  inTrash: note.inTrash || false,
  isPinned: note.isPinned || false,
  archived: note.archived || false,
  createdAt: note.createdAt.toISOString(),
  updatedAt: note.updatedAt.toISOString(),
  trashedAt: note.trashedAt ? note.trashedAt.toISOString() : null,
  synced: true
});

// Fonction utilitaire pour convertir une note de la base de données en note application
const databaseToNote = (id: string, dbNote: DatabaseNote): Note => ({
  id,
  content: dbNote.content,
  category: dbNote.category,
  favorite: dbNote.favorite,
  inTrash: dbNote.inTrash,
  isPinned: dbNote.isPinned,
  archived: dbNote.archived,
  createdAt: new Date(dbNote.createdAt),
  updatedAt: new Date(dbNote.updatedAt),
  trashedAt: dbNote.trashedAt ? new Date(dbNote.trashedAt) : undefined,
  synced: dbNote.synced
});

// Fonction utilitaire pour vérifier si la base de données est configurée
const checkDb = () => {
  if (!db) {
    throw new Error('La base de données n\'est pas configurée');
  }
};

// Obtenir toutes les notes d'un utilisateur
export const getNotes = async (userId: string): Promise<Note[]> => {
  try {
    checkDb();
    
    const notesRef = ref(db as Database, NOTES_PATH);
    const snapshot = await get(notesRef);
    const notes: Note[] = [];
    
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const dbNote = childSnapshot.val() as DatabaseNote;
        if (dbNote.userId === userId) {
          notes.push(databaseToNote(childSnapshot.key as string, dbNote));
        }
      });
    }
    
    return notes;
  } catch (error) {
    console.error('Erreur lors de la récupération des notes:', error);
    throw error;
  }
};

// Ajouter une nouvelle note
export const addNote = async (userId: string, noteData: NoteWithoutId): Promise<Note> => {
  try {
    checkDb();
    
    const notesRef = ref(db as Database, NOTES_PATH);
    const newNoteRef = push(notesRef);
    const cleanNote = noteToDatabase(noteData, userId);
    
    await set(newNoteRef, cleanNote);
    
    return databaseToNote(newNoteRef.key as string, cleanNote);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la note:', error);
    throw error;
  }
};

// Mettre à jour une note existante
export const updateNote = async (noteId: string, updates: Partial<Note>): Promise<void> => {
  try {
    checkDb();
    
    const noteRef = ref(db as Database, `${NOTES_PATH}/${noteId}`);
    
    // Convertir les dates en chaînes ISO et nettoyer les undefined
    const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
      if (value === undefined) {
        acc[key] = null;
      } else if (value instanceof Date) {
        acc[key] = value.toISOString();
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    await update(noteRef, cleanUpdates);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la note:', error);
    throw error;
  }
};

// Supprimer une note
export const deleteNote = async (noteId: string): Promise<void> => {
  try {
    checkDb();
    
    const noteRef = ref(db as Database, `${NOTES_PATH}/${noteId}`);
    await remove(noteRef);
  } catch (error) {
    console.error('Erreur lors de la suppression de la note:', error);
    throw error;
  }
};

// Synchroniser des notes locales vers la base de données
export const syncNotes = async (userId: string, notes: Note[]): Promise<boolean> => {
  try {
    // Si Firebase n'est pas configuré, indiquer que la synchronisation a échoué
    if (!db) {
      console.warn('La base de données n\'est pas configurée. La synchronisation est impossible.');
      return false;
    }
    
    // 1. Récupérer toutes les notes actuelles de la base de données
    const existingNotes = await getNotes(userId);
    const existingNoteIds = new Set(existingNotes.map(note => note.id));
    
    // 2. Pour chaque note locale
    for (const note of notes) {
      const cleanNote = noteToDatabase(note, userId);

      if (note.id && existingNoteIds.has(note.id)) {
        // La note existe déjà dans la base de données, mise à jour
        const noteRef = ref(db as Database, `${NOTES_PATH}/${note.id}`);
        await update(noteRef, cleanNote);
      } else {
        // Nouvelle note à ajouter
        const noteRef = ref(db as Database, `${NOTES_PATH}/${note.id || push(ref(db as Database, NOTES_PATH)).key}`);
        await set(noteRef, cleanNote);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la synchronisation des notes:', error);
    return false;
  }
}; 