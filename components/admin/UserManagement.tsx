// components/admin/UserManagement.tsx
'use client';

import { useState } from 'react';
import { User } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { 
  CheckCircle, 
  XCircle, 
  Edit, 
  Eye,
  Shield,
  User as UserIcon 
} from 'lucide-react';
import UserEditModal from './UserEditModal';
import UserDetailsModal from './UserDetailsModal';

interface UserManagementProps {
  users: any[];
  roles: any[];
}

export default function UserManagement({ users, roles }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [viewingUser, setViewingUser] = useState<any>(null);

  // フィルタリング
  const filteredUsers = users.filter(user => {
    // 検索フィルター
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!user.email.toLowerCase().includes(term)) {
        return false;
      }
    }

    // ステータスフィルター
    if (filterStatus === 'active' && !user.is_active) return false;
    if (filterStatus === 'inactive' && user.is_active) return false;

    // ロールフィルター
    if (filterRole !== 'all' && user.role_id !== filterRole) return false;

    return true;
  });

  return (
    <div>
      {/* フィルター */}
      <div className="p-4 border-b border-gray-200 space-y-4">
        <input
          type="text"
          placeholder="メールアドレスで検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />

        <div className="flex space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">すべてのステータス</option>
            <option value="active">アクティブ</option>
            <option value="inactive">無効</option>
          </select>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">すべてのロール</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name === 'admin' ? '管理者' : '一般ユーザー'}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-600">
          {filteredUsers.length} / {users.length} ユーザー
        </div>
      </div>

      {/* ユーザーテーブル */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ユーザー
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ロール
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                登録日
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.email}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {user.id.substring(0, 8)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.roles?.name === 'admin' ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <Shield className="w-3 h-3 mr-1" />
                      管理者
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <UserIcon className="w-3 h-3 mr-1" />
                      一般
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.is_active ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      アクティブ
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <XCircle className="w-3 h-3 mr-1" />
                      無効
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setViewingUser(user)}
                      className="text-blue-600 hover:text-blue-900"
                      title="詳細を見る"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingUser(user)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="編集"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="p-12 text-center text-gray-500">
          ユーザーが見つかりません
        </div>
      )}

      {/* 編集モーダル */}
      {editingUser && (
        <UserEditModal
          user={editingUser}
          roles={roles}
          onClose={() => setEditingUser(null)}
        />
      )}

      {/* 詳細モーダル */}
      {viewingUser && (
        <UserDetailsModal
          user={viewingUser}
          onClose={() => setViewingUser(null)}
        />
      )}
    </div>
  );
}