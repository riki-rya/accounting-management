// app/(dashboard)/dashboard/page.tsx
import { getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { 
  getMonthlySummary, 
  getMultipleMonthsSummary, 
  getCategorySummary,
  getRecentTransactions 
} from '@/lib/db/helpers';
import { getCurrentMonth } from '@/lib/utils';
import SummaryCards from '@/components/dashboard/SummaryCards';
import MonthlyChart from '@/components/dashboard/MonthlyChart';
import CategoryPieChart from '@/components/dashboard/CategoryPieChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const currentMonth = getCurrentMonth();
  
  // 並行してデータ取得
  const [
    currentSummary,
    monthlySummaries,
    categorySummary,
    recentTransactions
  ] = await Promise.all([
    getMonthlySummary(user.id, currentMonth),
    getMultipleMonthsSummary(user.id, 6),
    getCategorySummary(user.id, currentMonth),
    getRecentTransactions(user.id, 10)
  ]);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}の収支
        </p>
      </div>

      {/* サマリーカード */}
      <SummaryCards summary={currentSummary} />

      {/* グラフエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* 月次推移グラフ */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            過去6ヶ月の推移
          </h2>
          <MonthlyChart data={monthlySummaries} />
        </div>

        {/* カテゴリ別円グラフ */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            カテゴリ別支出
          </h2>
          <CategoryPieChart data={categorySummary} />
        </div>
      </div>

      {/* 最近の取引 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            最近の取引
          </h2>
        </div>
        <RecentTransactions transactions={recentTransactions} />
      </div>
    </div>
  );
}