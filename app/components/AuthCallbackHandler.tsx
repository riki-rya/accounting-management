'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

/**
 * メール認証のコールバックを処理するクライアントコンポーネント
 * ルートページに配置され、code パラメータを検出して /auth/confirm にリダイレクトします
 */
export default function AuthCallbackHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const code = searchParams.get('code')
    const tokenHash = searchParams.get('token_hash')

    // メール認証のパラメータがある場合、/auth/callback にリダイレクト
    if (code || tokenHash) {
      console.log('Detected auth callback, redirecting to /auth/callback')

      // すべてのクエリパラメータを保持してリダイレクト
      const params = new URLSearchParams(searchParams.toString())
      router.replace(`/auth/callback?${params.toString()}`)
    }
  }, [searchParams, router])

  // このコンポーネントは何も表示しない
  return null
}
