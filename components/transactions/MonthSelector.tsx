// components/transactions/MonthSelector.tsx
'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMonth } from '@/lib/utils';

interface MonthSelectorProps {
  currentMonth: string;
}

export default function MonthSelector({ currentMonth }: MonthSelectorProps) {
  const router = useRouter();

  const getPreviousMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1); // month-2 because month is 1-indexed
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const getNextMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month, 1); // month is 0-indexed after conversion
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const handlePrevious = () => {
    router.push(`/transactions/${getPreviousMonth()}`);
  };

  const handleNext = () => {
    const nextMonth = getNextMonth();
    const today = new Date();
    const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    // 未来の月には移動しない
    if (nextMonth <= currentYearMonth) {
      router.push(`/transactions/${nextMonth}`);
    }
  };

  const isCurrentMonth = () => {
    const today = new Date();
    const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    return currentMonth === currentYearMonth;
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handlePrevious}
        className="p-2 hover:bg-gray-100 rounded-lg transition"
        title="前月"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>
      
      <div className="px-4 py-2 bg-gray-100 rounded-lg min-w-[140px] text-center">
        <span className="font-semibold text-gray-900">
          {formatMonth(currentMonth)}
        </span>
      </div>

      <button
        onClick={handleNext}
        disabled={isCurrentMonth()}
        className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        title="次月"
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
}