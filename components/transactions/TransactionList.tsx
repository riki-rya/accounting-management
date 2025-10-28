// components/transactions/TransactionList.tsx
'use client';

import { useState, useMemo } from 'react';
import { Transaction, Category } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Edit, Trash2, Filter } from 'lucide-react';
import TransactionFilters from './TransactionFilters';
import TransactionEditModal from './TransactionEditModal';
import { CategoryIcon } from '@/lib/icon-utils';

interface TransactionListProps {
  transactions: any[];
  categories: Category[];
}

export default function TransactionList({ transactions, categories }: TransactionListProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  // フィルタリング
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const category = t.categories;
      
      // カテゴリフィルター
      if (selectedCategory !== 'all' && t.category_id !== selectedCategory) {
        return false;
      }

      // タイプフィルター（収入/支出）
      if (selectedType !== 'all') {
        if (selectedType === 'income' && category?.type !== 'income') {
          return false;
        }
        if (selectedType === 'expense' && category?.type !== 'expense') {
          return false;
        }
      }

      // 検索フィルター
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const description = (t.description || '').toLowerCase();
        const categoryName = (category?.name || '').toLowerCase();
        if (!description.includes(term) && !categoryName.includes(term)) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, selectedCategory, selectedType, searchTerm]);

  const handleDelete = async (id: string) => {
    if (!confirm('この取引を削除してもよろしいですか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/transactions?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert('削除に失敗しました');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('削除に失敗しました');
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-500">この月の取引はありません</p>
      </div>
    );
  }

  return (
    <div>
      {/* フィルターヘッダー */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            <Filter className="w-4 h-4" />
            <span className="font-medium">フィルター</span>
          </button>
          <div className="text-sm text-gray-600">
            {filteredTransactions.length} / {transactions.length} 件
          </div>
        </div>

        {showFilters && (
          <TransactionFilters
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )}
      </div>

      {/* 取引リスト */}
      <div className="divide-y divide-gray-200">
        {filteredTransactions.map((transaction) => {
          const category = transaction.categories;
          const isIncome = category?.type === 'income';
          const amount = Math.abs(transaction.amount);

          return (
            <div
              key={transaction.id}
              className="p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  {/* カテゴリアイコン */}
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${category?.color || '#6B7280'}20` }}
                  >
                    {category?.icon ? (
                      <CategoryIcon
                        icon={category.icon}
                        color={category.color}
                        className="w-6 h-6"
                      />
                    ) : (
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: category?.color || '#6B7280' }}
                      />
                    )}
                  </div>

                  {/* 取引情報 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-gray-900 truncate">
                      {transaction.description || 'メモなし'}
                    </p>
                    <div className="flex items-center space-x-3 mt-1">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${category?.color || '#6B7280'}20`,
                          color: category?.color || '#6B7280',
                        }}
                      >
                        {category?.name || '未分類'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(transaction.transaction_date)}
                      </span>
                      <span className="text-xs text-gray-400 capitalize">
                        {transaction.source}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 金額とアクション */}
                <div className="flex items-center space-x-4 ml-4">
                  <p className={`text-xl font-bold ${
                    isIncome ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isIncome ? '+' : '-'}{formatCurrency(amount)}
                  </p>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingTransaction(transaction)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition"
                      title="編集"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 編集モーダル */}
      {editingTransaction && (
        <TransactionEditModal
          transaction={editingTransaction}
          categories={categories}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </div>
  );
}