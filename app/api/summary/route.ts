// app/api/summary/route.ts
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getMonthlySummary, getCategorySummary } from '@/lib/db/helpers';

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

    if (!month) {
      return NextResponse.json(
        { error: '月が指定されていません' },
        { status: 400 }
      );
    }

    // 月次サマリーとカテゴリサマリーを取得
    const [monthlySummary, categorySummary] = await Promise.all([
      getMonthlySummary(user.id, month),
      getCategorySummary(user.id, month)
    ]);

    return NextResponse.json({
      monthly: monthlySummary,
      categories: categorySummary,
    });
  } catch (error) {
    console.error('Summary API error:', error);
    return NextResponse.json(
      { error: 'サマリーの取得に失敗しました' },
      { status: 500 }
    );
  }
}