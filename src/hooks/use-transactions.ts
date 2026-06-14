import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';
import { Transaction, TransactionType } from '@/types';

export interface TransactionRow extends Transaction {
  category_name?: string;
  category_icon?: string;
  from_account_name?: string;
  to_account_name?: string;
}

export function useTransactions() {
  const db = useSQLiteContext();

  const list = useCallback(async (): Promise<TransactionRow[]> => {
    return db.getAllAsync<TransactionRow>(`
      SELECT t.*, c.name as category_name, c.icon as category_icon,
             fa.name as from_account_name, ta.name as to_account_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN accounts fa ON t.from_account_id = fa.id
      LEFT JOIN accounts ta ON t.to_account_id = ta.id
      ORDER BY t.date DESC, t.created_at DESC
    `);
  }, [db]);

  const getById = useCallback(async (id: number): Promise<TransactionRow | null> => {
    return db.getFirstAsync<TransactionRow>(`
      SELECT t.*, c.name as category_name, c.icon as category_icon,
             fa.name as from_account_name, ta.name as to_account_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN accounts fa ON t.from_account_id = fa.id
      LEFT JOIN accounts ta ON t.to_account_id = ta.id
      WHERE t.id = ?
    `, id);
  }, [db]);

  const listByAccount = useCallback(async (accountId: number): Promise<TransactionRow[]> => {
    return db.getAllAsync<TransactionRow>(`
      SELECT t.*, c.name as category_name, c.icon as category_icon,
             fa.name as from_account_name, ta.name as to_account_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN accounts fa ON t.from_account_id = fa.id
      LEFT JOIN accounts ta ON t.to_account_id = ta.id
      WHERE t.from_account_id = ? OR t.to_account_id = ?
      ORDER BY t.date DESC, t.created_at DESC
    `, accountId, accountId);
  }, [db]);

  const listRecent = useCallback(async (limit = 5): Promise<TransactionRow[]> => {
    return db.getAllAsync<TransactionRow>(`
      SELECT t.*, c.name as category_name, c.icon as category_icon,
             fa.name as from_account_name, ta.name as to_account_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN accounts fa ON t.from_account_id = fa.id
      LEFT JOIN accounts ta ON t.to_account_id = ta.id
      ORDER BY t.date DESC, t.created_at DESC
      LIMIT ?
    `, limit);
  }, [db]);

  const create = useCallback(
    async (data: {
      type: TransactionType;
      amount: number;
      category_id?: number | null;
      note?: string;
      date?: string;
      from_account_id?: number | null;
      to_account_id?: number | null;
    }): Promise<number> => {
      let insertedId = 0;
      await db.withTransactionAsync(async () => {
        const result = await db.runAsync(
          `INSERT INTO transactions (type, amount, category_id, note, date, from_account_id, to_account_id)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          data.type,
          data.amount,
          data.category_id ?? null,
          data.note ?? '',
          data.date ?? new Date().toISOString().split('T')[0],
          data.from_account_id ?? null,
          data.to_account_id ?? null,
        );
        insertedId = result.lastInsertRowId;

        if (data.type === 'income' && data.to_account_id) {
          const acc = await db.getFirstAsync<{ balance: number }>(
            'SELECT balance FROM accounts WHERE id = ?', data.to_account_id,
          );
          if (acc) {
            await db.runAsync('UPDATE accounts SET balance = ? WHERE id = ?',
              acc.balance + data.amount, data.to_account_id);
          }
        } else if (data.type === 'expense' && data.from_account_id) {
          const acc = await db.getFirstAsync<{ balance: number }>(
            'SELECT balance FROM accounts WHERE id = ?', data.from_account_id,
          );
          if (acc) {
            await db.runAsync('UPDATE accounts SET balance = ? WHERE id = ?',
              acc.balance - data.amount, data.from_account_id);
          }
        } else if (data.type === 'transfer') {
          if (data.from_account_id) {
            const fromAcc = await db.getFirstAsync<{ balance: number }>(
              'SELECT balance FROM accounts WHERE id = ?', data.from_account_id,
            );
            if (fromAcc) {
              await db.runAsync('UPDATE accounts SET balance = ? WHERE id = ?',
                fromAcc.balance - data.amount, data.from_account_id);
            }
          }
          if (data.to_account_id) {
            const toAcc = await db.getFirstAsync<{ balance: number }>(
              'SELECT balance FROM accounts WHERE id = ?', data.to_account_id,
            );
            if (toAcc) {
              await db.runAsync('UPDATE accounts SET balance = ? WHERE id = ?',
                toAcc.balance + data.amount, data.to_account_id);
            }
          }
        }
      });
      return insertedId;
    },
    [db],
  );

  const remove = useCallback(async (id: number): Promise<void> => {
    await db.runAsync('DELETE FROM transactions WHERE id = ?', id);
  }, [db]);

  return { list, getById, listByAccount, listRecent, create, remove };
}
