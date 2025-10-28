// app/api/transactions/upload/route.ts
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { parseRakutenCSV, isRakutenCSV } from '@/lib/parsers/rakuten-csv';
import { parseSumitomoCSV, isSumitomoCSV } from '@/lib/parsers/sumitomo-csv';
import { UploadResult } from '@/lib/types';
import * as Encoding from 'encoding-japanese';

/**
 * 説明文からカテゴリを自動判定
 */
function findMatchingCategory(description: string, categories: any[]): string | null {
  if (!description) return null;
  
  const lowerDescription = description.toLowerCase();
  
  // キーワードが設定されているカテゴリを検索
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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'CSVファイルを選択してください' },
        { status: 400 }
      );
    }

    // ファイルを読み込み（エンコーディングを自動検出）
    let csvContent: string;
    try {
      const buffer = await file.arrayBuffer();
      const codes = new Uint8Array(buffer);

      // エンコーディングを自動検出
      const detectedEncoding = Encoding.detect(codes);
      console.log('Detected encoding:', detectedEncoding);

      // UTF-8に変換
      const fromEncoding = (typeof detectedEncoding === 'string' && detectedEncoding)
        ? detectedEncoding
        : 'AUTO';

      const unicodeArray = Encoding.convert(codes, {
        to: 'UNICODE',
        from: fromEncoding,
      }) as number[];

      csvContent = Encoding.codeToString(unicodeArray);
    } catch (error) {
      console.error('File read error:', error);
      return NextResponse.json(
        { error: 'ファイルの読み込みに失敗しました' },
        { status: 400 }
      );
    }

    if (!csvContent || csvContent.trim().length === 0) {
      return NextResponse.json(
        { error: 'CSVファイルが空です' },
        { status: 400 }
      );
    }

    // CSVの種類を判定
    let transactions;
    let source: 'rakuten' | 'sumitomo';

    try {
      if (isRakutenCSV(csvContent)) {
        transactions = parseRakutenCSV(csvContent);
        source = 'rakuten';
      } else if (isSumitomoCSV(csvContent)) {
        transactions = parseSumitomoCSV(csvContent);
        source = 'sumitomo';
      } else {
        return NextResponse.json(
          { error: '対応していないCSVフォーマットです。楽天カードまたは三井住友カードのCSVを使用してください。' },
          { status: 400 }
        );
      }
    } catch (parseError: any) {
      console.error('CSV parse error:', parseError);
      return NextResponse.json(
        { error: `CSV解析エラー: ${parseError.message}` },
        { status: 400 }
      );
    }

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: '有効な取引データが見つかりませんでした' },
        { status: 400 }
      );
    }

    console.log(`Parsed ${transactions.length} transactions from ${source} CSV`);

    // ユーザーのカテゴリを取得（自動振り分け用）
    const supabase = await createClient();
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name, keywords, type')
      .eq('user_id', user.id)
      .eq('type', 'expense'); // 支出カテゴリのみ（CSVは通常支出）

    // Supabaseに登録
    const result: UploadResult = {
      success: 0,
      duplicate: 0,
      failed: 0,
      errors: [],
    };

    for (const transaction of transactions) {
      try {
        // 自動カテゴリ振り分け
        const categoryId = categories 
          ? findMatchingCategory(transaction.description, categories)
          : null;

        const { error } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            transaction_date: transaction.date,
            amount: transaction.amount,
            description: transaction.description,
            source: source,
            external_id: transaction.external_id,
            category_id: categoryId, // 自動振り分けまたはnull
          });

        if (error) {
          // 重複エラーの場合
          if (error.code === '23505') {
            result.duplicate++;
          } else {
            result.failed++;
            result.errors.push(`${transaction.description}: ${error.message}`);
            console.error('Insert error:', error);
          }
        } else {
          result.success++;
        }
      } catch (err: any) {
        result.failed++;
        result.errors.push(`${transaction.description}: ${err.message}`);
        console.error('Transaction insert error:', err);
      }
    }

    console.log('Upload result:', result);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: error.message || 'アップロードに失敗しました' },
      { status: 500 }
    );
  }
}