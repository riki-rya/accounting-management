// lib/parsers/sumitomo-csv.ts
import Papa from 'papaparse';
import { CSVTransaction } from '@/lib/types';

/**
 * 三井住友カードのCSVフォーマット（ヘッダーなし）
 * 1行目: ユーザー名, カード番号, カード種類
 * 2行目以降: 利用日, 利用店名, 利用金額, ...
 */

export function parseSumitomoCSV(csvContent: string): CSVTransaction[] {
  const results = Papa.parse<string[]>(csvContent, {
    header: false, // ヘッダーなし
    skipEmptyLines: true,
  });

  if (results.errors.length > 0) {
    console.warn('CSV解析警告:', results.errors);
  }

  const transactions: CSVTransaction[] = [];

  // 1行目はユーザー情報なのでスキップ
  results.data.forEach((row, index) => {
    // 1行目（ユーザー情報）をスキップ
    if (index === 0) return;

    try {
      // 列0: 利用日
      const dateStr = row[0]?.trim();
      if (!dateStr) return; // 利用日が空の場合はスキップ（合計行など）

      // YYYY/MM/DD形式をYYYY-MM-DD形式に変換
      const parts = dateStr.split('/');
      if (parts.length !== 3) return;

      const [year, month, day] = parts;
      const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      // 列1: 利用店名
      const description = row[1]?.trim() || '';
      if (!description) return;

      // 列2: 利用金額
      const amountStr = row[2]?.replace(/,/g, '').trim();
      if (!amountStr) return;
      const amount = -Math.abs(parseFloat(amountStr)); // 支出は負の値

      // 一意のIDを生成
      const externalId = `sumitomo_${date}_${description}_${Math.abs(amount)}`;

      transactions.push({
        date,
        amount,
        description,
        external_id: externalId,
      });
    } catch (error) {
      console.warn(`行 ${index + 1} の解析をスキップしました:`, error);
    }
  });

  if (transactions.length === 0) {
    throw new Error('有効な取引データが見つかりませんでした。CSVフォーマットを確認してください。');
  }

  return transactions;
}

/**
 * 三井住友カードのCSVかどうかを判定
 * 1行目にカード番号のパターン（****-****-****-****）が含まれているかチェック
 */
export function isSumitomoCSV(csvContent: string): boolean {
  const lines = csvContent.split('\n');
  if (lines.length < 2) return false;

  const firstLine = lines[0];

  // カード番号のパターンをチェック（数字-数字の形式）
  // 例: 5334-91**-****-**** または ****-****-****-****
  const hasCardNumber = /\d{4}-[\d*]{4}-[\d*]{4}-[\d*]{4}/.test(firstLine);

  // 2行目が日付で始まるかチェック（YYYY/MM/DD形式）
  const secondLine = lines[1];
  const hasDateFormat = /^\d{4}\/\d{2}\/\d{2}/.test(secondLine);

  return hasCardNumber && hasDateFormat;
}