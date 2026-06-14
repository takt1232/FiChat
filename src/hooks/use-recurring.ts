import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';
import { RecurringTransaction, RecurringFrequency } from '@/types';

export interface RecurringRow extends RecurringTransaction {
  category_name?: string;
  category_icon?: string;
  from_account_name?: string;
  to_account_name?: string;
}

export function useRecurring() {
  const db = useSQLiteContext();

  const list = useCallback(async (): Promise<RecurringRow[]> => {
    return db.getAllAsync<RecurringRow>(`
      SELECT r.*, c.name as category_name, c.icon as category_icon,
             fa.name as from_account_name, ta.name as to_account_name
      FROM recurring_transactions r
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN accounts fa ON r.from_account_id = fa.id
      LEFT JOIN accounts ta ON r.to_account_id = ta.id
      ORDER BY r.next_due_date ASC
    `);
  }, [db]);

  const getById = useCallback(async (id: number): Promise<RecurringRow | null> => {
    return db.getFirstAsync<RecurringRow>(`
      SELECT r.*, c.name as category_name, c.icon as category_icon,
             fa.name as from_account_name, ta.name as to_account_name
      FROM recurring_transactions r
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN accounts fa ON r.from_account_id = fa.id
      LEFT JOIN accounts ta ON r.to_account_id = ta.id
      WHERE r.id = ?
    `, id);
  }, [db]);

  const create = useCallback(
    async (data: {
      label: string;
      type: RecurringTransaction['type'];
      amount: number;
      category_id?: number | null;
      from_account_id?: number | null;
      to_account_id?: number | null;
      note?: string;
      frequency: RecurringFrequency;
      interval_count?: number;
      day_of_week?: number | null;
      day_of_month?: number | null;
      next_due_date: string;
      notification_time?: string;
    }): Promise<number> => {
      const result = await db.runAsync(
        `INSERT INTO recurring_transactions
         (label, type, amount, category_id, from_account_id, to_account_id, note,
          frequency, interval_count, day_of_week, day_of_month, next_due_date, notification_time)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        data.label,
        data.type,
        data.amount,
        data.category_id ?? null,
        data.from_account_id ?? null,
        data.to_account_id ?? null,
        data.note ?? '',
        data.frequency,
        data.interval_count ?? 1,
        data.day_of_week ?? null,
        data.day_of_month ?? null,
        data.next_due_date,
        data.notification_time ?? '09:00',
      );
      return result.lastInsertRowId;
    },
    [db],
  );

  const update = useCallback(
    async (
      id: number,
      data: Partial<{
        label: string;
        amount: number;
        category_id: number | null;
        from_account_id: number | null;
        to_account_id: number | null;
        note: string;
        frequency: RecurringFrequency;
        interval_count: number;
        day_of_week: number | null;
        day_of_month: number | null;
        next_due_date: string;
        notification_time: string;
        is_active: number;
      }>,
    ): Promise<void> => {
      const fields: string[] = [];
      const values: any[] = [];

      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (fields.length === 0) return;

      values.push(id);
      await db.runAsync(
        `UPDATE recurring_transactions SET ${fields.join(', ')} WHERE id = ?`,
        ...values,
      );
    },
    [db],
  );

  const remove = useCallback(async (id: number): Promise<void> => {
    await db.runAsync('DELETE FROM recurring_transactions WHERE id = ?', id);
  }, [db]);

  return { list, getById, create, update, remove };
}
