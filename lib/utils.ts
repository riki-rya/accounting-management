// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSSのクラス名を結合
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 金額をフォーマット
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount);
}

/**
 * 日付をフォーマット
 */
export function formatDate(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    // 無効な日付をチェック
    if (isNaN(d.getTime())) {
      return date.toString();
    }
    
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  } catch (error) {
    console.error('Date format error:', error, date);
    // フォールバック: 文字列の日付をそのまま返す
    if (typeof date === 'string') {
      return date;
    }
    return '';
  }
}


/**
 * 月をフォーマット (YYYY-MM → YYYY年MM月)
 */
export function formatMonth(month: string): string {
  try {
    const [year, m] = month.split('-');
    if (!year || !m) return month;
    return `${year}年${m}月`;
  } catch (error) {
    console.error('Month format error:', error, month);
    return month;
  }
}

/**
 * 現在の月をYYYY-MM形式で取得
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * N ヶ月前の月をYYYY-MM形式で取得
 */
export function getMonthsAgo(monthsAgo: number): string {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * 過去N ヶ月の月リストを生成
 */
export function getMonthsList(count: number = 12): string[] {
  const months: string[] = [];
  for (let i = 0; i < count; i++) {
    months.push(getMonthsAgo(i));
  }
  return months;
}

/**
 * パーセンテージを計算
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * 数値を省略形式でフォーマット (例: 1000 → 1K)
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * CSVファイル名から日付を抽出
 */
export function extractDateFromFilename(filename: string): string | null {
  // 例: rakuten_20240115.csv → 2024-01-15
  const match = filename.match(/(\d{4})(\d{2})(\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return null;
}

/**
 * ファイルサイズをフォーマット
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * エラーメッセージを取得
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '不明なエラーが発生しました';
}