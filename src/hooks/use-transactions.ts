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
    await db.withTransactionAsync(async () => {
      const tx = await db.getFirstAsync<Transaction>(
        'SELECT * FROM transactions WHERE id = ?', id,
      );
      if (!tx) return;

      await _revertBalance(tx);

      await db.runAsync('DELETE FROM transactions WHERE id = ?', id);
    });
  }, [db]);

  const update = useCallback(
    async (
      id: number,
      data: {
        amount: number;
        category_id?: number | null;
        note?: string;
        date?: string;
        from_account_id?: number | null;
        to_account_id?: number | null;
      },
    ): Promise<void> => {
      await db.withTransactionAsync(async () => {
        const old = await db.getFirstAsync<Transaction>(
          'SELECT * FROM transactions WHERE id = ?', id,
        );
        if (!old) return;

        await _revertBalance(old);

        const newAmount = data.amount;
        const newFrom = data.from_account_id ?? null;
        const newTo = data.to_account_id ?? null;

        if (old.type === 'income' && newTo) {
          const acc = await db.getFirstAsync<{ balance: number }>(
            'SELECT balance FROM accounts WHERE id = ?', newTo,
          );
          if (acc) {
            await db.runAsync(
              'UPDATE accounts SET balance = ? WHERE id = ?',
              acc.balance + newAmount, newTo,
            );
          }
        } else if (old.type === 'expense' && newFrom) {
          const acc = await db.getFirstAsync<{ balance: number }>(
            'SELECT balance FROM accounts WHERE id = ?', newFrom,
          );
          if (acc) {
            await db.runAsync(
              'UPDATE accounts SET balance = ? WHERE id = ?',
              acc.balance - newAmount, newFrom,
            );
          }
        } else if (old.type === 'transfer') {
          if (newFrom) {
            const fromAcc = await db.getFirstAsync<{ balance: number }>(
              'SELECT balance FROM accounts WHERE id = ?', newFrom,
            );
            if (fromAcc) {
              await db.runAsync(
                'UPDATE accounts SET balance = ? WHERE id = ?',
                fromAcc.balance - newAmount, newFrom,
              );
            }
          }
          if (newTo) {
            const toAcc = await db.getFirstAsync<{ balance: number }>(
              'SELECT balance FROM accounts WHERE id = ?', newTo,
            );
            if (toAcc) {
              await db.runAsync(
                'UPDATE accounts SET balance = ? WHERE id = ?',
                toAcc.balance + newAmount, newTo,
              );
            }
          }
        }

        await db.runAsync(
          `UPDATE transactions SET amount = ?, category_id = ?, note = ?, date = ?,
           from_account_id = ?, to_account_id = ? WHERE id = ?`,
          newAmount,
          data.category_id ?? null,
          data.note ?? '',
          data.date ?? old.date,
          newFrom,
          newTo,
          id,
        );
      });
    },
    [db],
  );

  async function _revertBalance(tx: Transaction) {
    if (tx.type === 'income' && tx.to_account_id) {
      const acc = await db.getFirstAsync<{ balance: number }>(
        'SELECT balance FROM accounts WHERE id = ?', tx.to_account_id,
      );
      if (acc) {
        await db.runAsync(
          'UPDATE accounts SET balance = ? WHERE id = ?',
          acc.balance - tx.amount, tx.to_account_id,
        );
      }
    } else if (tx.type === 'expense' && tx.from_account_id) {
      const acc = await db.getFirstAsync<{ balance: number }>(
        'SELECT balance FROM accounts WHERE id = ?', tx.from_account_id,
      );
      if (acc) {
        await db.runAsync(
          'UPDATE accounts SET balance = ? WHERE id = ?',
          acc.balance + tx.amount, tx.from_account_id,
        );
      }
    } else if (tx.type === 'transfer') {
      if (tx.from_account_id) {
        const fromAcc = await db.getFirstAsync<{ balance: number }>(
          'SELECT balance FROM accounts WHERE id = ?', tx.from_account_id,
        );
        if (fromAcc) {
          await db.runAsync(
            'UPDATE accounts SET balance = ? WHERE id = ?',
            fromAcc.balance + tx.amount, tx.from_account_id,
          );
        }
      }
      if (tx.to_account_id) {
        const toAcc = await db.getFirstAsync<{ balance: number }>(
          'SELECT balance FROM accounts WHERE id = ?', tx.to_account_id,
        );
        if (toAcc) {
          await db.runAsync(
            'UPDATE accounts SET balance = ? WHERE id = ?',
            toAcc.balance - tx.amount, tx.to_account_id,
          );
        }
      }
    }
  }

  const getMonthlySummary = useCallback(async (): Promise<{ income: number; expense: number }> => {
    const rows = await db.getAllAsync<{ type: string; total: number }>(
      `SELECT type, SUM(amount) as total FROM transactions
       WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
       GROUP BY type`
    );
    return {
      income: rows.find(r => r.type === 'income')?.total ?? 0,
      expense: rows.find(r => r.type === 'expense')?.total ?? 0,
    };
  }, [db]);

  return { list, getById, listByAccount, listRecent, create, update, remove, getMonthlySummary };
}
