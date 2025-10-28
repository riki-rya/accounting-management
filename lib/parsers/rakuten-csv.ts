// lib/parsers/rakuten-csv.ts
import Papa from 'papaparse';
import { CSVTransaction } from '@/lib/types';

/**
 * 楽天カードのCSVフォーマット
 * 列: 利用日, 利用店名・商品名, 利用者, 支払方法, 利用金額, 支払月
 */
interface RakutenCSVRow {
  '利用日'?: string;
  '利用店名・商品名'?: string;
  '利用者'?: string;
  '支払方法'?: string;
  '利用金額'?: string;
  '支払月'?: string;
}

export function parseRakutenCSV(csvContent: string): CSVTransaction[] {
  // Shift_JISデコード対応のため、そのまま処理
  const results = Papa.parse<RakutenCSVRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(), // ヘッダーの空白を除去
  });

  if (results.errors.length > 0) {
    console.warn('CSV解析警告:', results.errors);
  }

  const transactions: CSVTransaction[] = [];

  results.data.forEach((row, index) => {
    try {
      // 利用日をパース (例: 2024/01/15)
      const dateStr = row['利用日']?.trim();
      if (!dateStr) return;

      const dateParts = dateStr.split('/');
      if (dateParts.length !== 3) return;

      const [year, month, day] = dateParts;
      const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      // 利用金額をパース (例: "1,234" → -1234)
      const amountStr = row['利用金額']?.replace(/,/g, '').replace(/円/g, '').trim();
      if (!amountStr) return;
      const amount = -Math.abs(parseFloat(amountStr)); // 支出は負の値

      // 説明文
      const description = row['利用店名・商品名']?.trim() || '';
      if (!description) return;

      // 一意のIDを生成（日付 + 店名 + 金額）
      const externalId = `rakuten_${date}_${description}_${Math.abs(amount)}`;

      transactions.push({
        date,
        amount,
        description,
        external_id: externalId,
      });
    } catch (error) {
      console.warn(`行 ${index + 2} の解析をスキップしました:`, error);
    }
  });

  if (transactions.length === 0) {
    throw new Error('有効な取引データが見つかりませんでした。CSVフォーマットを確認してください。');
  }

  return transactions;
}

/**
 * 楽天カードのCSVかどうかを判定
 */
export function isRakutenCSV(csvContent: string): boolean {
  const lines = csvContent.split('\n');
  if (lines.length === 0) return false;

  const header = lines[0];
  return (
    header.includes('利用日') &&
    header.includes('利用店名') &&
    header.includes('利用金額')
  );
}