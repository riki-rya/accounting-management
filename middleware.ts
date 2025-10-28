// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export default async function middleware(request: NextRequest) {
  // リダイレクトループ防止：リダイレクト回数をチェック
  const redirectCount = request.headers.get('x-redirect-count');
  if (redirectCount && parseInt(redirectCount) > 5) {
    console.error('Too many redirects detected');
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // 認証が必要なルート
  const protectedRoutes = ['/dashboard', '/transactions', '/upload', '/categories', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // 未認証ユーザーを/loginへリダイレクト
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // /adminルートの場合、管理者権限チェック
  if (request.nextUrl.pathname.startsWith('/admin') && user) {
    const { data: userData } = await supabase
      .from('users')
      .select('role_id, roles(name)')
      .eq('id', user.id)
      .single();

    // `roles` can be returned as an array (e.g. [{ name: 'admin' }]), so normalize access
    const roleName = Array.isArray(userData?.roles)
      ? (userData?.roles as any[])[0]?.name
      : (userData as any)?.roles?.name;

    if (roleName !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // ログイン済みユーザーが/login, /signupにアクセスした場合
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};