// components/admin/UserEditModal.tsx
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface UserEditModalProps {
  user: any;
  roles: any[];
  onClose: () => void;
}

export default function UserEditModal({ user, roles, onClose }: UserEditModalProps) {
  const [formData, setFormData] = useState({
    role_id: user.role_id,
    is_active: user.is_active,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          ...formData,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '更新に失敗しました');
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
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            ユーザーを編集
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

          {/* ユーザー情報 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-1">メールアドレス</p>
            <p className="text-gray-900">{user.email}</p>
            <p className="text-xs text-gray-500 mt-2">
              ユーザーID: {user.id}
            </p>
          </div>

          {/* ロール選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ロール
            </label>
            <select
              value={formData.role_id}
              onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name === 'admin' ? '管理者' : '一般ユーザー'}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              管理者は全ユーザーのデータにアクセスできます
            </p>
          </div>

          {/* アクティブ状態 */}
          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  アクティブ状態
                </span>
                <p className="text-xs text-gray-500">
                  無効にするとログインできなくなります
                </p>
              </div>
            </label>
          </div>

          {/* 警告 */}
          {user.roles?.name === 'admin' && formData.role_id !== user.role_id && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ 管理者権限を削除しようとしています。この操作は慎重に行ってください。
              </p>
            </div>
          )}

          {!formData.is_active && user.is_active && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                ⚠️ このユーザーを無効化すると、ログインできなくなります。
              </p>
            </div>
          )}

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
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}