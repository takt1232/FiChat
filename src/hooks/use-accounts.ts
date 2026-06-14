import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';
import { Account, AccountType } from '@/types';

export function useAccounts() {
  const db = useSQLiteContext();

  const list = useCallback(async (): Promise<Account[]> => {
    return db.getAllAsync<Account>('SELECT * FROM accounts ORDER BY created_at DESC');
  }, [db]);

  const getById = useCallback(async (id: number): Promise<Account | null> => {
    return db.getFirstAsync<Account>('SELECT * FROM accounts WHERE id = ?', id);
  }, [db]);

  const create = useCallback(
    async (data: { name: string; type: AccountType; balance?: number; icon?: string; color?: string }): Promise<number> => {
      const result = await db.runAsync(
        'INSERT INTO accounts (name, type, balance, icon, color) VALUES (?, ?, ?, ?, ?)',
        data.name,
        data.type,
        data.balance ?? 0,
        data.icon ?? '💵',
        data.color ?? '#27AE60',
      );
      return result.lastInsertRowId;
    },
    [db],
  );

  const updateBalance = useCallback(
    async (id: number, newBalance: number): Promise<void> => {
      await db.runAsync('UPDATE accounts SET balance = ? WHERE id = ?', newBalance, id);
    },
    [db],
  );

  const update = useCallback(
    async (id: number, data: { name: string; balance: number }): Promise<void> => {
      await db.runAsync(
        'UPDATE accounts SET name = ?, balance = ? WHERE id = ?',
        data.name,
        data.balance,
        id,
      );
    },
    [db],
  );

  const remove = useCallback(async (id: number): Promise<void> => {
    await db.runAsync('DELETE FROM accounts WHERE id = ?', id);
  }, [db]);

  const totalBalance = useCallback(async (): Promise<number> => {
    const result = await db.getFirstAsync<{ total: number }>('SELECT COALESCE(SUM(balance), 0) as total FROM accounts');
    return result?.total ?? 0;
  }, [db]);

  return { list, getById, create, update, updateBalance, remove, totalBalance };
}
