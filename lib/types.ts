// lib/types.ts
export interface User {
  id: string;
  email: string;
  role_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  role?: Role;
}

export interface Role {
  id: string;
  name: 'user' | 'admin';
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  type: 'income' | 'expense';
  keywords: string[] | null; // 自動振り分けキーワード
  created_at: string;
  updated_at: string;
}

export interface CategoryMaster {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: 'income' | 'expense';
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  transaction_date: string;
  amount: number;
  category_id: string | null;
  description: string | null;
  source: 'rakuten' | 'sumitomo' | 'manual';
  external_id: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface MonthlySummary {
  month: string; // YYYY-MM形式
  income: number;
  expense: number;
  balance: number;
}

export interface CategorySummary {
  category_id: string;
  category_name: string;
  color: string;
  total: number;
}

export interface CSVTransaction {
  date: string;
  amount: number;
  description: string;
  external_id: string;
}

export interface UploadResult {
  success: number;
  duplicate: number;
  failed: number;
  errors: string[];
}