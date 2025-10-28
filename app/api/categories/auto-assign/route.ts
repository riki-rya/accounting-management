// app/api/categories/auto-assign/route.ts
// 既存の未分類取引に対してカテゴリを一括自動振り分け

import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 説明文からカテゴリを自動判定
 */
function findMatchingCategory(description: string, categories: any[]): string | null {
  if (!description) return null;
  
  const lowerDescription = description.toLowerCase();
  
  for (const category of categories) {
    if (category.keywords && Array.isArray(category.keywords)) {
      for (const keyword of category.keywords) {
        if (lowerDescription.includes(keyword.toLowerCase())) {
          return category.id;
        }
      }
    }
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // ユーザーのカテゴリを取得
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name, keywords, type')
      .eq('user_id', user.id);

    if (!categories || categories.length === 0) {
      return NextResponse.json(
        { error: 'カテゴリが見つかりません' },
        { status: 400 }
      );
    }

    // キーワードが設定されているカテゴリのみ
    const categoriesWithKeywords = categories.filter(
      c => c.keywords && c.keywords.length > 0
    );

    if (categoriesWithKeywords.length === 0) {
      return NextResponse.json(
        { error: 'キーワードが設定されているカテゴリがありません' },
        { status: 400 }
      );
    }

    // 未分類の取引を取得
    const { data: transactions } = await supabase
      .from('transactions')
      .select('id, description, amount')
      .eq('user_id', user.id)
      .is('category_id', null);

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({
        message: '未分類の取引がありません',
        assigned: 0,
        total: 0,
      });
    }

    let assignedCount = 0;

    // 各取引に対してカテゴリを自動判定
    for (const transaction of transactions) {
      // 支出か収入かを判定
      const isIncome = transaction.amount > 0;
      const type = isIncome ? 'income' : 'expense';
      
      // 該当するタイプのカテゴリのみを対象
      const relevantCategories = categoriesWithKeywords.filter(c => c.type === type);
      
      const categoryId = findMatchingCategory(
        transaction.description || '',
        relevantCategories
      );

      if (categoryId) {
        const { error } = await supabase
          .from('transactions')
          .update({ category_id: categoryId })
          .eq('id', transaction.id);

        if (!error) {
          assignedCount++;
        }
      }
    }

    return NextResponse.json({
      message: `${assignedCount}件の取引にカテゴリを自動設定しました`,
      assigned: assignedCount,
      total: transactions.length,
    });
  } catch (error: any) {
    console.error('Auto-assign error:', error);
    return NextResponse.json(
      { error: 'カテゴリの自動振り分けに失敗しました' },
      { status: 500 }
    );
  }
}