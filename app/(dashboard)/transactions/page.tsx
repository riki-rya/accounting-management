// app/(dashboard)/transactions/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMonthsAgo } from '@/lib/utils';

export default function TransactionsPage() {
  const router = useRouter();

  useEffect(() => {
    // 前月にリダイレクト
    const previousMonth = getMonthsAgo(1);
    router.replace(`/transactions/${previousMonth}`);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">読み込み中...</p>
      </div>
    </div>
  );
}