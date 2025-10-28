// components/categories/CategoryForm.tsx
'use client';

import { useState } from 'react';
import { Category } from '@/lib/types';
import { X, Plus, Trash2 } from 'lucide-react';
import { CategoryIcon } from '@/lib/icon-utils';

interface CategoryFormProps {
  type: 'income' | 'expense';
  category?: Category | null;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899',
  '#14B8A6', '#F97316', '#06B6D4', '#A855F7', '#6B7280', '#059669',
];

const PRESET_ICONS = [
  'tag', 'dollar-sign', 'trending-up', 'trending-down',
  'shopping-bag', 'utensils', 'car', 'home',
  'smartphone', 'heart', 'film', 'book',
  'shirt', 'zap', 'coffee', 'gift',
];

export default function CategoryForm({ type, category, onClose }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    color: category?.color || PRESET_COLORS[0],
    icon: category?.icon || 'tag',
    keywords: category?.keywords || [],
  });
  const [newKeyword, setNewKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddKeyword = () => {
    const keyword = newKeyword.trim();
    if (keyword && !formData.keywords.includes(keyword)) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keyword],
      });
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(k => k !== keywordToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = '/api/categories';
      const method = category ? 'PUT' : 'POST';
      const body = category
        ? { id: category.id, ...formData }
        : { ...formData, type };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '保存に失敗しました');
      }

      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className="text-xl font-semibold text-gray-900">
            {category ? 'カテゴリを編集' : 'カテゴリを追加'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* カテゴリ名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              maxLength={100}
              placeholder="例: 食費、給与"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* 自動振り分けキーワード */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              自動振り分けキーワード
            </label>
            <p className="text-xs text-gray-500 mb-3">
              取引の説明文にこれらのキーワードが含まれていると、自動的にこのカテゴリに分類されます
            </p>
            
            {/* キーワード入力 */}
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddKeyword();
                  }
                }}
                placeholder="キーワードを入力"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* キーワードリスト */}
            {formData.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    <span>{keyword}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="ml-2 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* カラー選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              カラー
            </label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-full aspect-square rounded-lg transition ${
                    formData.color === color
                      ? 'ring-2 ring-offset-2 ring-blue-500'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <div className="mt-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
              />
            </div>
          </div>

          {/* アイコン選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              アイコン
            </label>
            <select
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {PRESET_ICONS.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              選択したアイコン: {formData.icon}
            </p>
          </div>

          {/* プレビュー */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">プレビュー</p>
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${formData.color}20` }}
              >
                <CategoryIcon
                  icon={formData.icon}
                  className="w-6 h-6"
                  color={formData.color}
                />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {formData.name || 'カテゴリ名'}
                </p>
                <p className="text-xs text-gray-500">{formData.icon}</p>
                {formData.keywords.length > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    {formData.keywords.length}個のキーワード設定済み
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '保存中...' : category ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}