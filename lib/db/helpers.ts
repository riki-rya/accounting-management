// lib/db/helpers.ts
import { createClient } from '@/lib/supabase/server';
import { MonthlySummary, CategorySummary } from '@/lib/types';

/**
 * 月次サマリーを取得
 */
export async function getMonthlySummary(userId: string, month: string): Promise<MonthlySummary> {
  const supabase = await createClient();
  
  // month: YYYY-MM形式
  const startDate = `${month}-01`;
  const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0)
    .toISOString()
    .split('T')[0];

  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, categories(type)')
    .eq('user_id', userId)
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate);

  let income = 0;
  let expense = 0;

  transactions?.forEach(t => {
    const type = (t.categories as any)?.type;
    if (type === 'income') {
      income += Number(t.amount);
    } else {
      expense += Math.abs(Number(t.amount));
    }
  });

  return {
    month,
    income,
    expense,
    balance: income - expense,
  };
}

/**
 * 過去N ヶ月のサマリーを取得
 */
export async function getMultipleMonthsSummary(
  userId: string,
  months: number = 6
): Promise<MonthlySummary[]> {
  const summaries: MonthlySummary[] = [];
  const today = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const summary = await getMonthlySummary(userId, month);
    summaries.push(summary);
  }

  return summaries;
}

/**
 * カテゴリ別支出サマリーを取得
 */
export async function getCategorySummary(
  userId: string,
  month: string
): Promise<CategorySummary[]> {
  const supabase = await createClient();
  
  const startDate = `${month}-01`;
  const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0)
    .toISOString()
    .split('T')[0];

  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, category_id, categories(id, name, color, type)')
    .eq('user_id', userId)
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)
    .not('category_id', 'is', null);

  const categoryMap = new Map<string, { name: string; color: string; total: number }>();

  transactions?.forEach(t => {
    const category = t.categories as any;
    if (category?.type === 'expense' && t.category_id) {
      const existing = categoryMap.get(t.category_id);
      const amount = Math.abs(Number(t.amount));
      
      if (existing) {
        existing.total += amount;
      } else {
        categoryMap.set(t.category_id, {
          name: category.name,
          color: category.color,
          total: amount,
        });
      }
    }
  });

  return Array.from(categoryMap.entries()).map(([id, data]) => ({
    category_id: id,
    category_name: data.name,
    color: data.color,
    total: data.total,
  }));
}

/**
 * 最近の取引を取得
 */
export async function getRecentTransactions(userId: string, limit: number = 10) {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('transactions')
    .select('*, categories(name, color, type)')
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  return data || [];
}

/**
 * 月別の取引一覧を取得
 */
export async function getTransactionsByMonth(userId: string, month: string) {
  const supabase = await createClient();
  
  const startDate = `${month}-01`;
  const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0)
    .toISOString()
    .split('T')[0];

  const { data } = await supabase
    .from('transactions')
    .select('*, categories(*)')
    .eq('user_id', userId)
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)
    .order('transaction_date', { ascending: false });

  return data || [];
}