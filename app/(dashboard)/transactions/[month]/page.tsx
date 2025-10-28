// app/(dashboard)/transactions/[month]/page.tsx
import { getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTransactionsByMonth, getMonthlySummary } from '@/lib/db/helpers';
import { createClient } from '@/lib/supabase/server';
import TransactionList from '@/components/transactions/TransactionList';
import MonthSelector from '@/components/transactions/MonthSelector';
import { formatMonth, getCurrentMonth } from '@/lib/utils';

interface PageProps {
  params: Promise<{
    month: string;
  }>;
}

export default async function TransactionMonthPage({ params }: PageProps) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const { month: monthParam } = await params;
  const month = monthParam || getCurrentMonth();

  // トランザクションとサマリーを取得
  const [transactions, summary, categories] = await Promise.all([
    getTransactionsByMonth(user.id, month),
    getMonthlySummary(user.id, month),
    getUserCategories(user.id),
  ]);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {formatMonth(month)}の取引
          </h1>
          <p className="text-gray-600 mt-1">
            {transactions.length}件の取引
          </p>
        </div>
        <MonthSelector currentMonth={month} />
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700 font-medium">収入</p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            ¥{summary.income.toLocaleString()}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700 font-medium">支出</p>
          <p className="text-2xl font-bold text-red-900 mt-1">
            ¥{summary.expense.toLocaleString()}
          </p>
        </div>
        <div className={`border rounded-lg p-4 ${
          summary.balance >= 0 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-orange-50 border-orange-200'
        }`}>
          <p className={`text-sm font-medium ${
            summary.balance >= 0 ? 'text-blue-700' : 'text-orange-700'
          }`}>
            バランス
          </p>
          <p className={`text-2xl font-bold mt-1 ${
            summary.balance >= 0 ? 'text-blue-900' : 'text-orange-900'
          }`}>
            ¥{summary.balance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 取引一覧 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <TransactionList 
          transactions={transactions} 
          categories={categories}
        />
      </div>
    </div>
  );
}

async function getUserCategories(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name');
  
  return data || [];
}