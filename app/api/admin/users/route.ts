// app/api/admin/users/route.ts
import { createClient, getCurrentUser, getUserRole } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// PUT - ユーザー情報を更新（管理者のみ）
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const role = await getUserRole();

    if (role !== 'admin') {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { user_id, role_id, is_active } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const updateData: any = {};
    if (role_id !== undefined) updateData.role_id = role_id;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user_id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('PUT admin user error:', error);
    return NextResponse.json(
      { error: 'ユーザーの更新に失敗しました' },
      { status: 500 }
    );
  }
}