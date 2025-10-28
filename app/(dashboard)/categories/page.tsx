// app/(dashboard)/categories/page.tsx
import { getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CategoryList from '@/components/categories/CategoryList';
import AutoAssignButton from '@/components/categories/AutoAssigneButton';
import { Tag } from 'lucide-react';

export default async function CategoriesPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  // ユーザーのカテゴリを取得
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('type', { ascending: true })
    .order('name', { ascending: true });

  // 収入と支出に分類
  const incomeCategories = categories?.filter(c => c.type === 'income') || [];
  const expenseCategories = categories?.filter(c => c.type === 'expense') || [];

  // キーワードが設定されているカテゴリがあるかチェック
  const hasKeywords = categories?.some(c => c.keywords && c.keywords.length > 0) || false;

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">カテゴリ管理</h1>
          <p className="text-gray-600 mt-1">
            収入と支出のカテゴリを管理します
          </p>
        </div>
        
        {/* 一括振り分けボタン */}
        {hasKeywords && <AutoAssignButton />}
      </div>

      {/* カテゴリリスト */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 収入カテゴリ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Tag className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  収入カテゴリ
                </h2>
                <p className="text-sm text-gray-600">
                  {incomeCategories.length}件
                </p>
              </div>
            </div>
          </div>
          <CategoryList categories={incomeCategories} type="income" />
        </div>

        {/* 支出カテゴリ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <Tag className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  支出カテゴリ
                </h2>
                <p className="text-sm text-gray-600">
                  {expenseCategories.length}件
                </p>
              </div>
            </div>
          </div>
          <CategoryList categories={expenseCategories} type="expense" />
        </div>
      </div>

      {/* 使い方ガイド */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          💡 カテゴリのヒント
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• カテゴリを追加すると、取引の分類がより詳細になります</li>
          <li>• 色を変更すると、グラフやリストで見分けやすくなります</li>
          <li>• <strong>キーワードを設定すると、CSVアップロード時に自動でカテゴリが振り分けられます</strong></li>
          <li>• 例: 「食費」に「スーパー」「コンビニ」を設定すると、それらを含む取引が自動分類されます</li>
          <li>• 「未分類取引に一括適用」ボタンで、既存の取引にもキーワードを適用できます</li>
          <li>• カテゴリを削除すると、そのカテゴリの取引は「未分類」になります</li>
        </ul>
      </div>
    </div>
  );
}