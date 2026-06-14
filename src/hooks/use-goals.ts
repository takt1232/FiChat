import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';
import { Goal } from '@/types';

export function useGoals() {
  const db = useSQLiteContext();

  const list = useCallback(async (): Promise<Goal[]> => {
    return db.getAllAsync<Goal>('SELECT * FROM goals ORDER BY created_at DESC');
  }, [db]);

  const getById = useCallback(async (id: number): Promise<Goal | null> => {
    return db.getFirstAsync<Goal>('SELECT * FROM goals WHERE id = ?', id);
  }, [db]);

  const create = useCallback(
    async (data: {
      name: string;
      target_amount: number;
      current_amount?: number;
      deadline?: string | null;
      icon?: string;
      color?: string;
    }): Promise<number> => {
      const result = await db.runAsync(
        'INSERT INTO goals (name, target_amount, current_amount, deadline, icon, color) VALUES (?, ?, ?, ?, ?, ?)',
        data.name,
        data.target_amount,
        data.current_amount ?? 0,
        data.deadline ?? null,
        data.icon ?? '🎯',
        data.color ?? '#3498DB',
      );
      return result.lastInsertRowId;
    },
    [db],
  );

  const updateProgress = useCallback(
    async (id: number, amount: number): Promise<void> => {
      await db.runAsync('UPDATE goals SET current_amount = current_amount + ? WHERE id = ?', amount, id);
    },
    [db],
  );

  const remove = useCallback(async (id: number): Promise<void> => {
    await db.runAsync('DELETE FROM goals WHERE id = ?', id);
  }, [db]);

  return { list, getById, create, updateProgress, remove };
}
