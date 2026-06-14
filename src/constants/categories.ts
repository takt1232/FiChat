import { Category } from '@/types';

export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  // Expense categories
  { name: 'Food & Drinks', icon: '🍽️', type: 'expense', color: '#FF6B6B' },
  { name: 'Transportation', icon: '🚗', type: 'expense', color: '#4ECDC4' },
  { name: 'Shopping', icon: '🛍️', type: 'expense', color: '#FFE66D' },
  { name: 'Utilities', icon: '💡', type: 'expense', color: '#95E1D3' },
  { name: 'Rent', icon: '🏠', type: 'expense', color: '#F38181' },
  { name: 'Entertainment', icon: '🎬', type: 'expense', color: '#AA96DA' },
  { name: 'Health', icon: '🏥', type: 'expense', color: '#FCBAD3' },
  { name: 'Education', icon: '📚', type: 'expense', color: '#C3F0CA' },
  { name: 'Insurance', icon: '🛡️', type: 'expense', color: '#A8D8EA' },
  { name: 'Dining Out', icon: '🍕', type: 'expense', color: '#F7DC6F' },
  { name: 'Groceries', icon: '🛒', type: 'expense', color: '#82E0AA' },
  { name: 'Subscriptions', icon: '📱', type: 'expense', color: '#D7BDE2' },
  // Income categories
  { name: 'Salary', icon: '💰', type: 'income', color: '#2ECC71' },
  { name: 'Freelance', icon: '💻', type: 'income', color: '#3498DB' },
  { name: 'Business', icon: '🏪', type: 'income', color: '#E67E22' },
  { name: 'Investment', icon: '📈', type: 'income', color: '#9B59B6' },
  { name: 'Gifts', icon: '🎁', type: 'income', color: '#E74C3C' },
  { name: 'Refunds', icon: '↩️', type: 'income', color: '#1ABC9C' },
  { name: 'Other Income', icon: '📥', type: 'income', color: '#34495E' },
];

export const ACCOUNT_ICONS: { type: string; icon: string; color: string }[] = [
  { type: 'cash', icon: '💵', color: '#27AE60' },
  { type: 'bank', icon: '🏦', color: '#2980B9' },
  { type: 'ewallet', icon: '📱', color: '#8E44AD' },
  { type: 'credit', icon: '💳', color: '#E74C3C' },
  { type: 'investment', icon: '📊', color: '#F39C12' },
];
