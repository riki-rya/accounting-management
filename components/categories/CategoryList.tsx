'use client';

import { useState } from 'react';
import { Category } from '@/lib/types';
import { Plus, Edit, Trash2 } from 'lucide-react';
import CategoryForm from './CategoryForm';
import { CategoryIcon } from '@/lib/icon-utils';

interface CategoryListProps {
  categories: Category[];
  type: 'income' | 'expense';
}

export default function CategoryList({ categories, type }: CategoryListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」カテゴリを削除してもよろしいですか？\nこのカテゴリの取引は未分類になります。`)) {
      return;
    }

    try {
      const response = await fetch(`/api/categories?id=${id}`, {
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

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  return (
    <div>
      <div className="divide-y divide-gray-200">
        {categories.map((category) => (
          <div
            key={category.id}
            className="p-4 hover:bg-gray-50 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* カテゴリアイコン */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <CategoryIcon
                    icon={category.icon}
                    color={category.color}
                    className="w-5 h-5"
                  />
                </div>

                {/* カテゴリ名 */}
                <div>
                  <p className="font-medium text-gray-900">
                    {category.name}
                  </p>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 hover:bg-blue-50 rounded-lg transition"
                  title="編集"
                >
                  <Edit className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => handleDelete(category.id, category.name)}
                  className="p-2 hover:bg-red-50 rounded-lg transition"
                  title="削除"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 追加ボタン */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-gray-600 hover:text-blue-600"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">カテゴリを追加</span>
        </button>
      </div>

      {/* カテゴリフォームモーダル */}
      {showForm && (
        <CategoryForm
          type={type}
          category={editingCategory}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}