// app/page.tsx
import Link from 'next/link';
import { ArrowRight, BarChart3, Upload, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* ヘッダー */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            シンプルで使いやすい
            <br />
            <span className="text-blue-600">家計管理アプリ</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            MoneyForward風のUIで、あなたの家計を簡単に管理
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/signup"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center"
            >
              無料で始める
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition border border-gray-300"
            >
              ログイン
            </Link>
          </div>
        </div>

        {/* 機能紹介 */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              可視化ダッシュボード
            </h3>
            <p className="text-gray-600">
              月次の収支をグラフで一目で把握。カテゴリ別の支出分析も簡単です。
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              CSV一括取り込み
            </h3>
            <p className="text-gray-600">
              楽天カードや三井住友カードの明細CSVを簡単にアップロード。手入力不要です。
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              セキュアなデータ管理
            </h3>
            <p className="text-gray-600">
              Supabaseによる安全な認証とデータ保護。あなたのデータは完全にプライベートです。
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-white rounded-xl shadow-lg p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            今すぐ家計管理を始めましょう
          </h2>
          <p className="text-gray-600 mb-8">
            無料でアカウント作成。クレジットカード不要。
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            無料でアカウント作成
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}