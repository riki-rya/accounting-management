// lib/parsers/sumitomo-csv.ts
import Papa from 'papaparse';
import { CSVTransaction } from '@/lib/types';

/**
 * 三井住友カードのCSVフォーマット
 * 列: 利用日, 利用店名, 利用金額, 支払区分, 当月請求額
 */
interface SumitomoCSVRow {
  '利用日'?: string;
  '利用店名'?: string;
  '利用金額'?: string;
  '支払区分'?: string;
  '当月請求額'?: string;
}

export function parseSumitomoCSV(csvContent: string): CSVTransaction[] {
  const results = Papa.parse<SumitomoCSVRow>(csvContent, {
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
      // 利用日をパース (例: 2024/01/15 または 01/15)
      const dateStr = row['利用日']?.trim();
      if (!dateStr) return;

      let date: string;
      const parts = dateStr.split('/');
      
      if (parts.length === 3) {
        // YYYY/MM/DD形式
        const [year, month, day] = parts;
        date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      } else if (parts.length === 2) {
        // MM/DD形式（年は現在年を使用）
        const [month, day] = parts;
        const currentYear = new Date().getFullYear();
        date = `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      } else {
        return;
      }

      // 利用金額をパース
      const amountStr = row['利用金額']?.replace(/,/g, '').replace(/円/g, '').trim();
      if (!amountStr) return;
      const amount = -Math.abs(parseFloat(amountStr)); // 支出は負の値

      // 説明文
      const description = row['利用店名']?.trim() || '';
      if (!description) return;

      // 一意のIDを生成
      const externalId = `sumitomo_${date}_${description}_${Math.abs(amount)}`;

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
 * 三井住友カードのCSVかどうかを判定
 */
export function isSumitomoCSV(csvContent: string): boolean {
  const lines = csvContent.split('\n');
  if (lines.length === 0) return false;

  const header = lines[0];
  return (
    header.includes('利用日') &&
    header.includes('利用店名') &&
    header.includes('利用金額')
  );
}