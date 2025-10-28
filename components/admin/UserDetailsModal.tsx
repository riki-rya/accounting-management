// components/admin/UserDetailsModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

interface UserDetailsModalProps {
  user: any;
  onClose: () => void;
}

export default function UserDetailsModal({ user, onClose }: UserDetailsModalProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`/api/admin/users/stats?user_id=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className="text-xl font-semibold text-gray-900">
            ユーザー詳細
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          {/* 基本情報 */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              基本情報
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">メールアドレス</p>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ロール</p>
                <p className="text-gray-900 font-medium">
                  {user.roles?.name === 'admin' ? '管理者' : '一般ユーザー'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ステータス</p>
                <p className="text-gray-900 font-medium">
                  {user.is_active ? 'アクティブ' : '無効'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">登録日</p>
                <p className="text-gray-900 font-medium">
                  {formatDate(user.created_at)}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">ユーザーID</p>
                <p className="text-gray-900 font-mono text-xs">
                  {user.id}
                </p>
              </div>
            </div>
          </div>

          {/* 統計情報 */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : stats ? (
            <>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  統計情報
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-700 mb-1">取引数</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {stats.transactionCount}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-700 mb-1">カテゴリ数</p>
                    <p className="text-2xl font-bold text-green-900">
                      {stats.categoryCount}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-700 mb-1">総収入</p>
                    <p className="text-xl font-bold text-purple-900">
                      {formatCurrency(stats.totalIncome)}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-red-700 mb-1">総支出</p>
                    <p className="text-xl font-bold text-red-900">
                      {formatCurrency(stats.totalExpense)}
                    </p>
                  </div>
                </div>
              </div>

              {/* 最近の取引 */}
              {stats.recentTransactions && stats.recentTransactions.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    最近の取引（5件）
                  </h4>
                  <div className="space-y-3">
                    {stats.recentTransactions.map((t: any) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {t.description || 'メモなし'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(t.transaction_date)}
                          </p>
                        </div>
                        <p className={`text-sm font-bold ${
                          t.amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {t.amount >= 0 ? '+' : ''}{formatCurrency(t.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              統計情報の取得に失敗しました
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}