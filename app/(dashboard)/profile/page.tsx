// app/(dashboard)/profile/page.tsx
import { getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProfileForm from '@/components/profile/ProfileForm';
import { User } from 'lucide-react';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const supabase = await createClient();
  const { data: userData } = await supabase
    .from('users')
    .select('*, roles(name)')
    .eq('id', user.id)
    .single();

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">プロフィール設定</h1>
        <p className="text-gray-600 mt-1">
          アカウント情報の確認と変更
        </p>
      </div>

      {/* プロフィールカード */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user.email}
              </h2>
              <p className="text-sm text-gray-600">
                {userData?.roles?.name === 'admin' ? '管理者' : '一般ユーザー'}
              </p>
            </div>
          </div>
        </div>

        <ProfileForm user={user} />
      </div>

      {/* 注意事項 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3">
          ⚠️ 注意事項
        </h3>
        <ul className="space-y-2 text-sm text-yellow-800">
          <li>• メールアドレスを変更すると、確認メールが送信されます</li>
          <li>• パスワード変更後は、再度ログインが必要です</li>
          <li>• パスワードは6文字以上で設定してください</li>
        </ul>
      </div>
    </div>
  );
}