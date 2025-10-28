// components/layout/Navbar.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { Menu, X } from 'lucide-react';
import MobileMenu from './MobileMenu';

interface NavbarProps {
  user: User;
  role: string;
}

export default function Navbar({ user, role }: NavbarProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {/* モバイルメニューボタン */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition mr-2"
              >
                {showMobileMenu ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </button>
              
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                家計管理アプリ
              </h1>
              {role === 'admin' && (
                <span className="ml-2 sm:ml-3 px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded">
                  管理者
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-xs sm:text-sm text-gray-700 truncate max-w-[150px] sm:max-w-none">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* モバイルメニュー */}
      {showMobileMenu && (
        <MobileMenu role={role} onClose={() => setShowMobileMenu(false)} />
      )}
    </>
  );
}