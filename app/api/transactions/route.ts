// app/api/transactions/route.ts
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET - 取引一覧を取得
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
    const month = searchParams.get('month');
    const categoryId = searchParams.get('category_id');

    const supabase = await createClient();
    let query = supabase
      .from('transactions')
      .select('*, categories(*)')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false });

    if (month) {
      const startDate = `${month}-01`;
      const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0)
        .toISOString()
        .split('T')[0];
      query = query.gte('transaction_date', startDate).lte('transaction_date', endDate);
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('GET transactions error:', error);
    return NextResponse.json(
      { error: '取引の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST - 新規取引を作成
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
    const { transaction_date, amount, category_id, description, source } = body;

    if (!transaction_date || amount === undefined) {
      return NextResponse.json(
        { error: '日付と金額は必須です' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        transaction_date,
        amount,
        category_id: category_id || null,
        description: description || null,
        source: source || 'manual',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('POST transaction error:', error);
    return NextResponse.json(
      { error: '取引の作成に失敗しました' },
      { status: 500 }
    );
  }
}

// PUT - 取引を更新
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
    const { id, transaction_date, amount, category_id, description } = body;

    if (!id) {
      return NextResponse.json(
        { error: '取引IDが必要です' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 取引が自分のものか確認
    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: '取引が見つかりません' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (transaction_date !== undefined) updateData.transaction_date = transaction_date;
    if (amount !== undefined) updateData.amount = amount;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (description !== undefined) updateData.description = description;

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('PUT transaction error:', error);
    return NextResponse.json(
      { error: '取引の更新に失敗しました' },
      { status: 500 }
    );
  }
}

// DELETE - 取引を削除
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
        { error: '取引IDが必要です' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 取引が自分のものか確認してから削除
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE transaction error:', error);
    return NextResponse.json(
      { error: '取引の削除に失敗しました' },
      { status: 500 }
    );
  }
}
