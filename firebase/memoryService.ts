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
import { db, COLLECTIONS } from './config';
import { MemoryItemType, MemoryItem, DatabaseMemoryItem } from '../app/types/memory';

// Fonction utilitaire pour convertir un élément de mémoire en format base de données
const memoryItemToDatabase = (item: Omit<DatabaseMemoryItem, 'userId'>, userId: string): DatabaseMemoryItem => ({
  type: item.type,
  title: item.title,
  content: item.content,
  tags: item.tags || [],
  userId,
  isFavorite: item.isFavorite || false,
  isEncrypted: item.isEncrypted || false,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  synced: true
});

// Fonction utilitaire pour convertir un élément de la base de données en élément de mémoire
const databaseToMemoryItem = (id: string, dbItem: DatabaseMemoryItem): MemoryItem => ({
  id,
  type: dbItem.type,
  title: dbItem.title,
  content: dbItem.content,
  tags: dbItem.tags,
  isFavorite: dbItem.isFavorite,
  isEncrypted: dbItem.isEncrypted,
  createdAt: new Date(dbItem.createdAt),
  updatedAt: new Date(dbItem.updatedAt),
  synced: dbItem.synced
});

// Vérifier si la base de données est configurée
const checkDb = () => {
  if (!db) throw new Error('La base de données n\'est pas configurée');
};

// Obtenir tous les éléments de mémoire d'un utilisateur
export const getMemoryItems = async (userId: string): Promise<MemoryItem[]> => {
  try {
    checkDb();
    
    const memoryRef = ref(db as Database, COLLECTIONS.MEMORY);
    const snapshot = await get(memoryRef);
    const items: MemoryItem[] = [];
    
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const dbItem = childSnapshot.val() as DatabaseMemoryItem;
        if (dbItem.userId === userId) {
          items.push(databaseToMemoryItem(childSnapshot.key as string, dbItem));
        }
      });
    }
    
    return items;
  } catch (error) {
    console.error('Erreur lors de la récupération des éléments de mémoire:', error);
    throw error;
  }
};

// Ajouter un nouvel élément
export const addMemoryItem = async (userId: string, itemData: Omit<DatabaseMemoryItem, 'userId'>): Promise<MemoryItem> => {
  try {
    checkDb();
    
    const memoryRef = ref(db as Database, COLLECTIONS.MEMORY);
    const newItemRef = push(memoryRef);
    const cleanItem = memoryItemToDatabase(itemData, userId);
    
    await set(newItemRef, cleanItem);
    
    return databaseToMemoryItem(newItemRef.key as string, cleanItem);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'élément de mémoire:', error);
    throw error;
  }
};

// Mettre à jour un élément existant
export const updateMemoryItem = async (itemId: string, updates: Partial<DatabaseMemoryItem>): Promise<void> => {
  try {
    checkDb();
    
    const itemRef = ref(db as Database, `${COLLECTIONS.MEMORY}/${itemId}`);
    
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

    await update(itemRef, cleanUpdates);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'élément de mémoire:', error);
    throw error;
  }
};

// Supprimer un élément
export const deleteMemoryItem = async (itemId: string): Promise<void> => {
  try {
    checkDb();
    
    const itemRef = ref(db as Database, `${COLLECTIONS.MEMORY}/${itemId}`);
    await remove(itemRef);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'élément de mémoire:', error);
    throw error;
  }
};

// Synchroniser les éléments locaux vers la base de données
export const syncMemoryItems = async (userId: string, items: MemoryItem[]): Promise<boolean> => {
  try {
    if (!db) {
      console.warn('La base de données n\'est pas configurée. La synchronisation est impossible.');
      return false;
    }
    
    // 1. Récupérer tous les éléments actuels de la base de données
    const existingItems = await getMemoryItems(userId);
    const existingItemIds = new Set(existingItems.map(item => item.id));
    
    // 2. Pour chaque élément local
    for (const item of items) {
      const cleanItem = memoryItemToDatabase({
        type: item.type,
        title: item.title,
        content: item.content,
        tags: item.tags,
        isFavorite: item.isFavorite,
        isEncrypted: item.isEncrypted,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        synced: true
      }, userId);

      if (item.id && existingItemIds.has(item.id)) {
        // L'élément existe déjà dans la base de données, mise à jour
        const itemRef = ref(db as Database, `${COLLECTIONS.MEMORY}/${item.id}`);
        await update(itemRef, cleanItem);
      } else {
        // Nouvel élément à ajouter
        const itemRef = ref(db as Database, `${COLLECTIONS.MEMORY}/${item.id || push(ref(db as Database, COLLECTIONS.MEMORY)).key}`);
        await set(itemRef, cleanItem);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la synchronisation des éléments de mémoire:', error);
    return false;
  }
}; 