 // components/profile/ProfileForm.tsx
'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Mail, Lock, Save } from 'lucide-react';

interface ProfileFormProps {
  user: User;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [email, setEmail] = useState(user.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/profile/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'メールアドレスの更新に失敗しました');
      }

      setSuccess('確認メールを送信しました。メールを確認してください。');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('新しいパスワードが一致しません');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'パスワードの更新に失敗しました');
      }

      setSuccess('パスワードを更新しました。再度ログインしてください。');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // 3秒後にログインページへ
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* メッセージ表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* メールアドレス変更 */}
      <form onSubmit={handleEmailUpdate} className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-blue-600" />
            メールアドレスの変更
          </h3>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            新しいメールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading || email === user.email}
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? '更新中...' : 'メールアドレスを更新'}
        </button>
      </form>

      <div className="border-t border-gray-200" />

      {/* パスワード変更 */}
      <form onSubmit={handlePasswordUpdate} className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-blue-600" />
            パスワードの変更
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新しいパスワード
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新しいパスワード（確認）
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !newPassword || !confirmPassword}
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? '更新中...' : 'パスワードを更新'}
        </button>
      </form>
    </div>
  );
}