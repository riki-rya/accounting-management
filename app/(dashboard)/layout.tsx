// app/(dashboard)/layout.tsx
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { User } from '@supabase/supabase-js';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const supabase = await createClient();

  // ユーザー情報とロールを取得
  const { data: userData } = await supabase
    .from('users')
    .select('*, roles(name)')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} role={userData?.roles?.name || 'user'} />
      
      <div className="flex">
        <Sidebar role={userData?.roles?.name || 'user'} />
        
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}