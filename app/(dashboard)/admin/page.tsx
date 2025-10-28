// app/(dashboard)/admin/page.tsx
import { getCurrentUser, getUserRole } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import UserManagement from '@/components/admin/UserManagement';
import { Shield, Users, Activity } from 'lucide-react';

export default async function AdminPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const role = await getUserRole();

  if (role !== 'admin') {
    redirect('/dashboard');
  }

  // 全ユーザーとロール情報を取得
  const supabase = await createClient();
  const [usersResult, rolesResult, statsResult] = await Promise.all([
    supabase
      .from('users')
      .select('*, roles(id, name)')
      .order('created_at', { ascending: false }),
    supabase
      .from('roles')
      .select('*'),
    getAdminStats(supabase),
  ]);

  const users = usersResult.data || [];
  const roles = rolesResult.data || [];

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">管理者画面</h1>
        </div>
        <p className="text-gray-600">
          ユーザー管理とシステム統計
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-blue-700 font-medium">総ユーザー数</span>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-4xl font-bold text-blue-900">
            {statsResult.totalUsers}
          </p>
          <p className="text-sm text-blue-600 mt-2">
            アクティブ: {statsResult.activeUsers}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-green-700 font-medium">総取引数</span>
            <Activity className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-4xl font-bold text-green-900">
            {statsResult.totalTransactions.toLocaleString()}
          </p>
          <p className="text-sm text-green-600 mt-2">
            今月: {statsResult.thisMonthTransactions.toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-purple-700 font-medium">管理者数</span>
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-4xl font-bold text-purple-900">
            {statsResult.adminUsers}
          </p>
          <p className="text-sm text-purple-600 mt-2">
            一般ユーザー: {statsResult.totalUsers - statsResult.adminUsers}
          </p>
        </div>
      </div>

      {/* ユーザー管理テーブル */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            ユーザー管理
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            全ユーザーの管理と設定変更
          </p>
        </div>
        <UserManagement users={users} roles={roles} />
      </div>

      {/* 注意事項 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3">
          ⚠️ 管理者の注意事項
        </h3>
        <ul className="space-y-2 text-sm text-yellow-800">
          <li>• ユーザーを無効化すると、そのユーザーはログインできなくなります</li>
          <li>• 管理者権限は慎重に付与してください</li>
          <li>• ユーザーのデータは閲覧のみ可能で、編集・削除はできません</li>
          <li>• 自分自身の管理者権限を削除しないよう注意してください</li>
        </ul>
      </div>
    </div>
  );
}

async function getAdminStats(supabase: any) {
  // ユーザー統計
  const { data: allUsers } = await supabase
    .from('users')
    .select('id, is_active, role_id, roles(name)');

  const totalUsers = allUsers?.length || 0;
  const activeUsers = allUsers?.filter((u: any) => u.is_active).length || 0;
  const adminUsers = allUsers?.filter((u: any) => u.roles?.name === 'admin').length || 0;

  // 取引統計
  const { count: totalTransactions } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true });

  // 今月の取引数
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0];
  
  const { count: thisMonthTransactions } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .gte('transaction_date', firstDayOfMonth);

  return {
    totalUsers,
    activeUsers,
    adminUsers,
    totalTransactions: totalTransactions || 0,
    thisMonthTransactions: thisMonthTransactions || 0,
  };
}