// components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Receipt, 
  Upload, 
  Tag, 
  Shield,
  User
} from 'lucide-react';

interface SidebarProps {
  role: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'ダッシュボード',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: '取引履歴',
      href: '/transactions',
      icon: Receipt,
    },
    {
      name: 'CSVアップロード',
      href: '/upload',
      icon: Upload,
    },
    {
      name: 'カテゴリ管理',
      href: '/categories',
      icon: Tag,
    },
    {
      name: 'プロフィール',
      href: '/profile',
      icon: User,
    },
  ];

  if (role === 'admin') {
    navigation.push({
      name: '管理者画面',
      href: '/admin',
      icon: Shield,
    });
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] hidden md:block">
      <nav className="p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-4 py-3 text-sm font-medium rounded-lg transition
                ${isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}