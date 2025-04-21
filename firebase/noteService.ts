import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  DocumentReference,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { db } from './config';
import { Note, NoteCategory } from '../app/context/NotesContext';

// Collection Firestore pour les notes
const NOTES_COLLECTION = 'notes';

// Interface pour une note dans Firestore
export interface FirestoreNote extends Omit<Note, 'createdAt' | 'updatedAt'> {
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type NoteWithoutId = Omit<Note, 'id'>;

// Fonction utilitaire pour vérifier si Firestore est configuré
const checkDb = () => {
  if (!db) {
    throw new Error('Firestore n\'est pas configuré. Veuillez configurer vos identifiants Firebase dans le fichier .env.local');
  }
};

// Obtenir toutes les notes d'un utilisateur
export const getNotes = async (userId: string): Promise<Note[]> => {
  try {
    // Si Firebase n'est pas configuré, retourner un tableau vide
    if (!db) {
      console.warn('Firestore n\'est pas configuré. Retour d\'un tableau vide.');
      return [];
    }

    const notesRef = collection(db, NOTES_COLLECTION);
    const q = query(
      notesRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as FirestoreNote;
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Note;
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notes:', error);
    throw error;
  }
};

// Ajouter une nouvelle note
export const addNote = async (userId: string, noteData: NoteWithoutId): Promise<Note> => {
  try {
    checkDb();
    
    const firestoreNote: FirestoreNote = {
      content: noteData.content,
      category: noteData.category || 'note',
      userId,
      isPinned: false,
      isFavorite: false,
      createdAt: Timestamp.fromDate(noteData.createdAt),
      updatedAt: Timestamp.fromDate(noteData.updatedAt),
      synced: true
    };
    
    const docRef = await addDoc(collection(db, NOTES_COLLECTION), firestoreNote);
    
    return {
      id: docRef.id,
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
    
    const noteRef = doc(db, NOTES_COLLECTION, noteId);
    
    const updateData: Partial<FirestoreNote> = {
      ...noteData,
      updatedAt: Timestamp.now()
    };
    
    // Convertir les dates en Timestamp si présentes
    if (noteData.createdAt) {
      updateData.createdAt = Timestamp.fromDate(noteData.createdAt);
    }
    
    // Supprimer l'id du payload de mise à jour
    if ('id' in updateData) {
      delete updateData.id;
    }
    
    await updateDoc(noteRef, updateData);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la note:', error);
    throw error;
  }
};

// Supprimer une note
export const deleteNote = async (noteId: string): Promise<void> => {
  try {
    checkDb();
    
    const noteRef = doc(db, NOTES_COLLECTION, noteId);
    await deleteDoc(noteRef);
  } catch (error) {
    console.error('Erreur lors de la suppression de la note:', error);
    throw error;
  }
};

// Synchroniser des notes locales vers Firestore
export const syncNotes = async (userId: string, notes: Note[]): Promise<boolean> => {
  try {
    // Si Firebase n'est pas configuré, indiquer que la synchronisation a échoué
    if (!db) {
      console.warn('Firestore n\'est pas configuré. La synchronisation est impossible.');
      return false;
    }
    
    // 1. Récupérer toutes les notes actuelles de Firestore
    const firestoreNotes = await getNotes(userId);
    const firestoreNoteIds = new Set(firestoreNotes.map(note => note.id));
    
    // 2. Pour chaque note locale
    for (const note of notes) {
      if (note.id && firestoreNoteIds.has(note.id)) {
        // La note existe déjà dans Firestore, mise à jour
        await updateNote(note.id, note);
      } else {
        // Nouvelle note à ajouter ou note sans ID
        const newNote: NoteWithoutId = {
          content: note.content,
          category: note.category || 'note',
          createdAt: note.createdAt,
          updatedAt: new Date()
        };
        
        // Si la note a un ID mais n'existe pas dans Firestore (peut-être supprimée)
        if (note.id) {
          // Utiliser l'ID existant pour la création
          const noteRef = doc(db, NOTES_COLLECTION, note.id);
          await setDoc(noteRef, {
            ...newNote,
            userId,
            createdAt: Timestamp.fromDate(newNote.createdAt),
            updatedAt: Timestamp.fromDate(newNote.updatedAt),
            synced: true
          });
        } else {
          // Créer une nouvelle note avec un nouvel ID
          await addNote(userId, newNote);
        }
      }
    }
    
    // 3. Vérifier les notes à supprimer (présentes dans Firestore mais pas en local)
    const localNoteIds = new Set(notes.map(note => note.id));
    for (const firestoreNote of firestoreNotes) {
      if (firestoreNote.id && !localNoteIds.has(firestoreNote.id)) {
        // Cette note existe dans Firestore mais pas en local, la supprimer
        await deleteNote(firestoreNote.id);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la synchronisation des notes:', error);
    return false;
  }
}; 