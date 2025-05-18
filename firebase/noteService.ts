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

// Interface pour une note dans la base de données
export interface DatabaseNote extends Omit<Note, 'id' | 'createdAt' | 'updatedAt'> {
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type NoteWithoutId = Omit<Note, 'id'>;

// Fonction utilitaire pour vérifier si la base de données est configurée
const checkDb = () => {
  if (!db) {
    throw new Error('La base de données n\'est pas configurée. Veuillez configurer vos identifiants Firebase dans le fichier .env.local');
  }
};

// Obtenir toutes les notes d'un utilisateur
export const getNotes = async (userId: string): Promise<Note[]> => {
  try {
    // Si Firebase n'est pas configuré, retourner un tableau vide
    if (!db) {
      console.warn('La base de données n\'est pas configurée. Retour d\'un tableau vide.');
      return [];
    }

    const notesRef = ref(db, NOTES_PATH);
    const userNotesQuery = query(notesRef, orderByChild('userId'), equalTo(userId));
    const snapshot = await get(userNotesQuery);
    
    if (!snapshot.exists()) {
      return [];
    }

    const notes: Note[] = [];
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val() as DatabaseNote;
      notes.push({
        ...data,
        id: childSnapshot.key as string,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
      });
    });

    return notes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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
    
    const databaseNote: DatabaseNote = {
      content: noteData.content,
      category: noteData.category || 'note',
      userId,
      favorite: noteData.favorite || false,
      inTrash: noteData.inTrash || false,
      isPinned: noteData.isPinned || false,
      archived: noteData.archived || false,
      createdAt: noteData.createdAt.toISOString(),
      updatedAt: noteData.updatedAt.toISOString(),
      synced: true
    };
    
    await set(newNoteRef, databaseNote);
    
    return {
      id: newNoteRef.key as string,
      ...noteData
    };
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la note:', error);
    throw error;
  }
};

// Mettre à jour une note existante
export const updateNote = async (noteId: string, noteData: Partial<Note>): Promise<void> => {
  try {
    checkDb();
    
    const noteRef = ref(db as Database, `${NOTES_PATH}/${noteId}`);
    
    const updateData: Partial<DatabaseNote> = {
      ...noteData,
      updatedAt: new Date().toISOString()
    };
    
    if (noteData.createdAt) {
      updateData.createdAt = noteData.createdAt.toISOString();
    }
    
    // Supprimer l'id du payload de mise à jour
    if ('id' in updateData) {
      delete updateData.id;
    }
    
    await update(noteRef, updateData);
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
      if (note.id && existingNoteIds.has(note.id)) {
        // La note existe déjà dans la base de données, mise à jour
        await updateNote(note.id, note);
      } else {
        // Nouvelle note à ajouter ou note sans ID
        const newNote: NoteWithoutId = {
          content: note.content,
          category: note.category || 'note',
          createdAt: note.createdAt,
          updatedAt: new Date(),
          favorite: note.favorite || false,
          inTrash: note.inTrash || false,
          isPinned: note.isPinned || false,
          archived: note.archived || false
        };
        
        if (note.id) {
          // Utiliser l'ID existant pour la création
          const noteRef = ref(db as Database, `${NOTES_PATH}/${note.id}`);
          await set(noteRef, {
            ...newNote,
            userId,
            createdAt: newNote.createdAt.toISOString(),
            updatedAt: newNote.updatedAt.toISOString(),
            synced: true
          });
        } else {
          // Créer une nouvelle note avec un nouvel ID
          await addNote(userId, newNote);
        }
      }
    }
    
    // 3. Vérifier les notes à supprimer (présentes dans la base de données mais pas en local)
    const localNoteIds = new Set(notes.map(note => note.id));
    for (const existingNote of existingNotes) {
      if (existingNote.id && !localNoteIds.has(existingNote.id)) {
        // Cette note existe dans la base de données mais pas en local, la supprimer
        await deleteNote(existingNote.id);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la synchronisation des notes:', error);
    return false;
  }
}; 