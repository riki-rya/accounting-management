'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type ConfirmationStatus = 'success' | 'error' | 'expired' | 'invalid'

export default function ConfirmPage() {
  const [status, setStatus] = useState<ConfirmationStatus>('error')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [redirectPath, setRedirectPath] = useState<string>('/dashboard')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const successParam = searchParams.get('success')
    const errorParam = searchParams.get('error')
    const nextParam = searchParams.get('next')

    if (nextParam) {
      setRedirectPath(decodeURIComponent(nextParam))
    }

    if (successParam === 'true') {
      // 認証成功
      setStatus('success')
    } else if (errorParam) {
      const decodedError = decodeURIComponent(errorParam)
      console.error('Auth error:', decodedError)

      // エラーの種類に応じてステータスを設定
      if (decodedError.includes('expired') || decodedError.includes('期限切れ')) {
        setStatus('expired')
        setErrorMessage('認証リンクの有効期限が切れています。')
      } else if (decodedError.includes('invalid')) {
        setStatus('invalid')
        setErrorMessage('認証リンクが無効です。URLを確認してください。')
      } else {
        setStatus('error')
        setErrorMessage(decodedError || 'メール認証に失敗しました。')
      }
    } else {
      setStatus('invalid')
      setErrorMessage('不正なアクセスです。')
    }
  }, [searchParams])

  const handleGoToDashboard = () => {
    router.push(redirectPath)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'success' && (
            <>
              <div className="rounded-full h-12 w-12 bg-green-100 mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                メール認証が完了しました！
              </h2>
              <p className="mt-2 text-gray-600">
                アカウントの登録が完了しました。
                <br />
                ダッシュボードから家計管理を始めましょう。
              </p>
              <div className="mt-6">
                <button
                  onClick={handleGoToDashboard}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  ダッシュボードへ
                </button>
              </div>
            </>
          )}

          {status === 'expired' && (
            <>
              <div className="rounded-full h-12 w-12 bg-yellow-100 mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                リンクの有効期限切れ
              </h2>
              <p className="mt-2 text-gray-600">{errorMessage}</p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/signup')}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  再度サインアップする
                </button>
              </div>
            </>
          )}

          {(status === 'error' || status === 'invalid') && (
            <>
              <div className="rounded-full h-12 w-12 bg-red-100 mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                認証に失敗しました
              </h2>
              <p className="mt-2 text-gray-600">{errorMessage}</p>
              <div className="mt-6 space-x-4">
                <button
                  onClick={() => router.push('/login')}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  ログインページへ
                </button>
                <button
                  onClick={() => router.push('/signup')}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  サインアップページへ
                </button>
              </div>
            </>
          )}
        </div>

        {/* セキュリティ情報 */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>このページは安全な接続で保護されています</p>
        </div>
      </div>
    </div>
  )
}
