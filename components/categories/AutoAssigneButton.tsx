// components/categories/AutoAssignButton.tsx
'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

export default function AutoAssignButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleAutoAssign = async () => {
    if (!confirm('未分類の取引に対して、設定されたキーワードに基づいてカテゴリを自動で振り分けます。\nよろしいですか？')) {
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/categories/auto-assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 500));
        throw new Error('サーバーから予期しないレスポンスが返されました');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '自動振り分けに失敗しました');
      }

      setResult(data.message);
      
      // 2秒後にページをリロード
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error('Auto-assign error:', error);
      alert(error.message || '自動振り分けに失敗しました');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={handleAutoAssign}
        disabled={loading}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>振り分け中...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>未分類取引に一括適用</span>
          </>
        )}
      </button>
      
      {result && (
        <p className="mt-2 text-sm text-green-600 font-medium">
          {result}
        </p>
      )}
    </div>
  );
}