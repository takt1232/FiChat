export type AccountType = 'cash' | 'bank' | 'ewallet' | 'credit' | 'investment';

export interface Account {
  id: number;
  name: string;
  type: AccountType;
  balance: number;
  icon: string;
  color: string;
  created_at: number;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  category_id: number | null;
  note: string;
  date: string;
  from_account_id: number | null;
  to_account_id: number | null;
  created_at: number;
}

export interface Goal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  icon: string;
  color: string;
  created_at: number;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  type: 'income' | 'expense';
  color: string;
}

export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export interface RecurringTransaction {
  id: number;
  label: string;
  type: TransactionType;
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
  created_at: number;
}
