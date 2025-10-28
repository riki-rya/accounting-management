// components/dashboard/SummaryCards.tsx
import { MonthlySummary } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface SummaryCardsProps {
  summary: MonthlySummary;
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  // 数値の安全な処理
  const income = Number(summary?.income) || 0;
  const expense = Number(summary?.expense) || 0;
  const balance = Number(summary?.balance) || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 収入カード */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-green-700 font-medium">収入</span>
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-green-900">
          {formatCurrency(income)}
        </p>
        <p className="text-sm text-green-600 mt-1">
          今月の収入合計
        </p>
      </div>

      {/* 支出カード */}
      <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border border-red-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-red-700 font-medium">支出</span>
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-red-900">
          {formatCurrency(expense)}
        </p>
        <p className="text-sm text-red-600 mt-1">
          今月の支出合計
        </p>
      </div>

      {/* バランスカード */}
      <div className={`bg-gradient-to-br p-6 rounded-xl shadow-sm border ${
        balance >= 0
          ? 'from-blue-50 to-indigo-50 border-blue-200'
          : 'from-orange-50 to-red-50 border-orange-200'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`font-medium ${
            balance >= 0 ? 'text-blue-700' : 'text-orange-700'
          }`}>
            バランス
          </span>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            balance >= 0 ? 'bg-blue-100' : 'bg-orange-100'
          }`}>
            <Wallet className={`w-5 h-5 ${
              balance >= 0 ? 'text-blue-600' : 'text-orange-600'
            }`} />
          </div>
        </div>
        <p className={`text-3xl font-bold ${
          balance >= 0 ? 'text-blue-900' : 'text-orange-900'
        }`}>
          {formatCurrency(balance)}
        </p>
        <p className={`text-sm mt-1 ${
          balance >= 0 ? 'text-blue-600' : 'text-orange-600'
        }`}>
          {balance >= 0 ? '黒字' : '赤字'}
        </p>
      </div>
    </div>
  );
}