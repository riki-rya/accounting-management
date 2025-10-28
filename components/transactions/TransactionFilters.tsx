// components/transactions/TransactionFilters.tsx
'use client';

import { Category } from '@/lib/types';
import { Search } from 'lucide-react';

interface TransactionFiltersProps {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedType: string;
  setSelectedType: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export default function TransactionFilters({
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
  searchTerm,
  setSearchTerm,
}: TransactionFiltersProps) {
  return (
    <div className="mt-4 space-y-4">
      {/* 検索バー */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="取引を検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* タイプフィルター */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            種類
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">すべて</option>
            <option value="income">収入</option>
            <option value="expense">支出</option>
          </select>
        </div>

        {/* カテゴリフィルター */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            カテゴリ
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">すべて</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* リセットボタン */}
      {(selectedCategory !== 'all' || selectedType !== 'all' || searchTerm) && (
        <button
          onClick={() => {
            setSelectedCategory('all');
            setSelectedType('all');
            setSearchTerm('');
          }}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          フィルターをリセット
        </button>
      )}
    </div>
  );
}