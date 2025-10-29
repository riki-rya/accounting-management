// app/auth/callback/route.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  console.log('Auth callback received:', { code: code ? 'present' : 'missing' })

  // 最終的なリダイレクト先を決定
  const allowedPaths = ['/dashboard', '/profile', '/transactions']
  const isValidRedirect = allowedPaths.some(path => next.startsWith(path))
  const redirectPath = isValidRedirect ? next : '/dashboard'

  // リダイレクトレスポンスを先に作成（成功時用）
  const response = NextResponse.redirect(
    new URL(`/confirm?success=true&next=${encodeURIComponent(redirectPath)}`, requestUrl.origin)
  )

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })  // 同じresponseに設定
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  try {
    let user = null

    // codeパラメータがある場合は、まずセッションに交換
    if (code) {
      console.log('Exchanging code for session...')
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Code exchange error:', exchangeError.message)
        return NextResponse.redirect(
          new URL(`/confirm?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
        )
      }

      user = data.user
      console.log('Code exchange successful:', user?.email)
    } else {
      // codeがない場合は、既存のセッションを確認
      console.log('No code, checking existing session...')
      const { data, error } = await supabase.auth.getUser()

      if (error || !data.user) {
        console.error('Session verification failed:', error?.message || 'No user found')
        return NextResponse.redirect(
          new URL('/confirm?error=認証に失敗しました', requestUrl.origin)
        )
      }

      user = data.user
      console.log('User authenticated via existing session:', user.email)
    }

    if (!user) {
      console.error('No user after authentication')
      return NextResponse.redirect(
        new URL('/confirm?error=認証に失敗しました', requestUrl.origin)
      )
    }

    // usersテーブルにレコードが存在するか確認
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingUser) {
      console.log('Creating new user record for:', user.email)

      // roleを取得
      const { data: roleData } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'user')
        .single()

      // usersテーブルにレコード作成
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          role_id: roleData?.id,
        })

      // 重複エラー（23505）は無視
      if (insertError && insertError.code !== '23505') {
        console.error('User insert error:', insertError)
        return NextResponse.redirect(
          new URL('/confirm?error=ユーザー情報の作成に失敗しました', requestUrl.origin)
        )
      }

      console.log('User record created successfully')
    } else {
      console.log('User record already exists')
    }

    console.log('Authentication successful, redirecting to confirm page')

    // 既にクッキーが設定されたresponseをそのまま返す
    return response
  } catch (error: any) {
    console.error('Unexpected error in auth callback:', error)
    return NextResponse.redirect(
      new URL('/confirm?error=予期しないエラーが発生しました', requestUrl.origin)
    )
  }
}
