// Types pour les éléments en mémoire
export type MemoryItemType = 'password' | 'number' | 'code' | 'project' | 'card';

// Interface pour les éléments de mémoire dans la base de données
export interface DatabaseMemoryItem {
  id?: string;
  type: MemoryItemType;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  isEncrypted: boolean;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
  userId?: string;
}

// Interface pour les éléments de mémoire dans l'application
export interface MemoryItem {
  id: string;
  type: MemoryItemType;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  isEncrypted: boolean;
  createdAt: Date;
  updatedAt: Date;
  synced: boolean;
} 