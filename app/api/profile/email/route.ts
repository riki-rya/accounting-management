// app/api/profile/email/route.ts
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'メールアドレスが必要です' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // メール変更確認用のリダイレクトURLを設定（サーバー側で処理）
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`;

    const { error } = await supabase.auth.updateUser({
      email
    }, {
      emailRedirectTo: redirectUrl,
    });

    if (error) {
      throw error;
    }

    // usersテーブルも更新
    await supabase
      .from('users')
      .update({ email })
      .eq('id', user.id);

    return NextResponse.json({ 
      message: '確認メールを送信しました' 
    });
  } catch (error: any) {
    console.error('Email update error:', error);
    return NextResponse.json(
      { error: error.message || 'メールアドレスの更新に失敗しました' },
      { status: 500 }
    );
  }
}