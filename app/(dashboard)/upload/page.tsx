// app/(dashboard)/upload/page.tsx
import { getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CSVUploader from '@/components/upload/CSVUploader';
import { Upload } from 'lucide-react';

export default async function UploadPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">CSVアップロード</h1>
        <p className="text-gray-600 mt-1">
          クレジットカードの利用明細CSVをアップロードして取引を一括登録
        </p>
      </div>

      {/* アップロードセクション */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              ファイルをアップロード
            </h2>
            <p className="text-sm text-gray-600">
              対応フォーマット: 楽天カード、三井住友カード
            </p>
          </div>
        </div>

        <CSVUploader />
      </div>

      {/* 使い方ガイド */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          📝 使い方ガイド
        </h3>
        <div className="space-y-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">楽天カードの場合：</h4>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>楽天e-NAVIにログイン</li>
              <li>「ご利用明細」→「CSVダウンロード」を選択</li>
              <li>ダウンロードしたCSVファイルをアップロード</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium mb-2">三井住友カードの場合：</h4>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Vpass（三井住友カード会員サイト）にログイン</li>
              <li>「ご利用明細照会」→「CSVダウンロード」を選択</li>
              <li>ダウンロードしたCSVファイルをアップロード</li>
            </ol>
          </div>
          <div className="pt-2 border-t border-blue-200">
            <p className="font-medium">⚠️ 注意事項：</p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
              <li>同じ取引は自動的に重複チェックされます</li>
              <li>アップロード後、カテゴリを手動で設定できます</li>
              <li>CSVファイルは保存されません（セキュリティのため）</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}   