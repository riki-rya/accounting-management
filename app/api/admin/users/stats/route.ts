// app/api/admin/users/stats/route.ts
import { createClient, getCurrentUser, getUserRole } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 取引数を取得
    const { count: transactionCount } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // カテゴリ数を取得
    const { count: categoryCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // 収入・支出の合計を取得
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, categories(type)')
      .eq('user_id', userId);

    let totalIncome = 0;
    let totalExpense = 0;

    transactions?.forEach(t => {
      const type = (t.categories as any)?.type;
      if (type === 'income') {
        totalIncome += Number(t.amount);
      } else {
        totalExpense += Math.abs(Number(t.amount));
      }
    });

    // 最近の取引5件を取得
    const { data: recentTransactions } = await supabase
      .from('transactions')
      .select('id, transaction_date, amount, description')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false })
      .limit(5);

    return NextResponse.json({
      transactionCount: transactionCount || 0,
      categoryCount: categoryCount || 0,
      totalIncome,
      totalExpense,
      recentTransactions: recentTransactions || [],
    });
  } catch (error: any) {
    console.error('GET admin user stats error:', error);
    return NextResponse.json(
      { error: '統計情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}