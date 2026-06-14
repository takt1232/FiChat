import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';
import { Category } from '@/types';

export function useCategories() {
  const db = useSQLiteContext();

  const list = useCallback(async (type?: 'income' | 'expense'): Promise<Category[]> => {
    if (type) {
      return db.getAllAsync<Category>(
        'SELECT * FROM categories WHERE type = ? ORDER BY name', type,
      );
    }
    return db.getAllAsync<Category>('SELECT * FROM categories ORDER BY type, name');
  }, [db]);

  return { list };
}
