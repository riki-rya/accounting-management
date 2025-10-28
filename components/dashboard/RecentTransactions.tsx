// components/dashboard/RecentTransactions.tsx
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CategoryIcon } from '@/lib/icon-utils';

interface RecentTransactionsProps {
  transactions: any[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">取引がありません</div>
    );
  }

  return (
    <div>
      <div className="divide-y divide-gray-200">
        {transactions.map((transaction) => {
          const category = transaction.categories;
          const isIncome = category?.type === 'income';
          const amount = Math.abs(Number(transaction.amount) || 0);

          return (
            <div key={transaction.id} className="p-4 hover:bg-gray-50 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  {/* カテゴリアイコン */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${category?.color || '#6B7280'}20`, color: category?.color || '#6B7280' }}
                  >
                    <CategoryIcon icon={category?.icon || 'tag'} className="w-5 h-5" />
                  </div>

                  {/* 取引情報 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{transaction.description || 'メモなし'}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                        style={{ backgroundColor: `${category?.color || '#6B7280'}20`, color: category?.color || '#6B7280' }}
                      >
                        {category?.name || '未分類'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {transaction.transaction_date ? formatDate(transaction.transaction_date) : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 金額 */}
                <div className="text-right ml-4 flex-shrink-0">
                  <p className={`text-lg font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(amount)}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{transaction.source || 'manual'}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* もっと見るリンク */}
      <div className="p-4 border-t border-gray-200">
        <Link href="/transactions" className="flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-700 transition">
          すべての取引を見る
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}