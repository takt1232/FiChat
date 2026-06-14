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
