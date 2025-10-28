// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Cookie設定エラーをキャッチ（middleware内での実行時）
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Cookie削除エラーをキャッチ
          }
        },
      },
    }
  );
}

// 現在のユーザーを取得
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

// ユーザーのロールを取得
export async function getUserRole() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  
  if (!user) return null;

  const { data } = await supabase
    .from('users')
    .select('role_id, roles(name)')
    .eq('id', user.id)
    .single();

  return (data?.roles as any)?.name || 'user';
}