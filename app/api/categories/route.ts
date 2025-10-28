// app/api/categories/route.ts
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET - カテゴリ一覧を取得
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const supabase = await createClient();
    let query = supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (type && (type === 'income' || type === 'expense')) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('GET categories error:', error);
    return NextResponse.json(
      { error: 'カテゴリの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST - 新規カテゴリを作成
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, color, icon, type, keywords } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: '名前と種類は必須です' },
        { status: 400 }
      );
    }

    if (type !== 'income' && type !== 'expense') {
      return NextResponse.json(
        { error: '種類はincomeまたはexpenseである必要があります' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 同名のカテゴリが存在するかチェック
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', name)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: '同じ名前のカテゴリが既に存在します' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        name,
        color: color || '#6B7280',
        icon: icon || 'tag',
        type,
        keywords: keywords || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('POST category error:', error);
    return NextResponse.json(
      { error: 'カテゴリの作成に失敗しました' },
      { status: 500 }
    );
  }
}

// PUT - カテゴリを更新
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, color, icon, keywords } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'カテゴリIDが必要です' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 同名のカテゴリが存在するかチェック（自分以外）
    if (name) {
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', name)
        .neq('id', id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: '同じ名前のカテゴリが既に存在します' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (color) updateData.color = color;
    if (icon) updateData.icon = icon;
    if (keywords !== undefined) updateData.keywords = keywords.length > 0 ? keywords : null;

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { error: 'カテゴリが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('PUT category error:', error);
    return NextResponse.json(
      { error: 'カテゴリの更新に失敗しました' },
      { status: 500 }
    );
  }
}

// DELETE - カテゴリを削除
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'カテゴリIDが必要です' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE category error:', error);
    return NextResponse.json(
      { error: 'カテゴリの削除に失敗しました' },
      { status: 500 }
    );
  }
}