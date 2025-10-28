// components/upload/CSVUploader.tsx
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function CSVUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      setStatus('idle');
      setError('');
    } else {
      setError('CSVファイルを選択してください');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus('idle');
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('ファイルを選択してください');
      return;
    }

    setStatus('uploading');
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/transactions/upload', {
        method: 'POST',
        body: formData,
      });

      const contentType = response.headers.get('content-type');
      
      // レスポンスがJSONかどうか確認
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 500));
        throw new Error('サーバーから予期しないレスポンスが返されました。ブラウザのコンソールを確認してください。');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'アップロードに失敗しました');
      }

      setStatus('success');
      setResult(data);

      // 3秒後にダッシュボードへリダイレクト
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 3000);
    } catch (err: any) {
      console.error('Upload error:', err);
      setStatus('error');
      setError(err.message || 'アップロードに失敗しました');
    }
  };

  const resetUpload = () => {
    setFile(null);
    setStatus('idle');
    setResult(null);
    setError('');
  };

  return (
    <div className="space-y-6">
      {/* ドロップゾーン */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center transition
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }
        `}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="csv-upload"
        />
        
        {!file ? (
          <label htmlFor="csv-upload" className="cursor-pointer block">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              CSVファイルをドラッグ＆ドロップ
            </p>
            <p className="text-sm text-gray-500 mb-4">
              または クリックしてファイルを選択
            </p>
            <span className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              ファイルを選択
            </span>
          </label>
        ) : (
          <div className="space-y-4">
            <FileText className="w-12 h-12 text-blue-600 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                {file.name}
              </p>
              <p className="text-sm text-gray-500">
                {formatFileSize(file.size)}
              </p>
            </div>
            <button
              onClick={resetUpload}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              ファイルを変更
            </button>
          </div>
        )}
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-900">エラー</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* 成功表示 */}
      {status === 'success' && result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold text-green-900">
              アップロード完了
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {result.success}
              </p>
              <p className="text-sm text-green-700">登録成功</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {result.duplicate}
              </p>
              <p className="text-sm text-orange-700">重複</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {result.failed}
              </p>
              <p className="text-sm text-red-700">失敗</p>
            </div>
          </div>
          <p className="text-sm text-green-700 mt-4 text-center">
            ダッシュボードに移動します...
          </p>
        </div>
      )}

      {/* アップロードボタン */}
      {file && status !== 'success' && (
        <button
          onClick={handleUpload}
          disabled={status === 'uploading'}
          className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {status === 'uploading' ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              アップロード中...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 mr-2" />
              アップロード
            </>
          )}
        </button>
      )}
    </div>
  );
}