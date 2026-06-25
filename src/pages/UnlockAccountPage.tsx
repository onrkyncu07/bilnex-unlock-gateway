import { useEffect, useState } from 'react'
import { unlockAccount } from '../api/unlockAccount'
import { StatusCard } from '../components/StatusCard'
import type { UnlockStatus } from '../types/unlock'

const LOGIN_URL = import.meta.env.VITE_LOGIN_URL
const REDIRECT_DELAY_MS = Number(
  import.meta.env.VITE_REDIRECT_DELAY_MS ?? 3000,
)

export function UnlockAccountPage() {
  const [status, setStatus] = useState<UnlockStatus>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token')
    if (!token) {
      setStatus('error')
      setMessage('Geçersiz bağlantı. Token bulunamadı.')
      return
    }

    const run = async () => {
      setStatus('loading')
      try {
        await unlockAccount(token)
        setStatus('success')
        setMessage(
          'Hesabınızın engeli başarıyla kaldırıldı. Giriş sayfasına yönlendiriliyorsunuz...',
        )
        setTimeout(() => {
          window.location.href = LOGIN_URL
        }, REDIRECT_DELAY_MS)
      } catch (err) {
        setStatus('error')
        setMessage(
          err instanceof Error ? err.message : 'Bilinmeyen hata',
        )
      }
    }

    void run()
  }, [])

  const handleLogin = () => {
    window.location.href = LOGIN_URL
  }

  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-bilnex-50 to-white px-4 py-12">
      <StatusCard
        status={status === 'idle' ? 'loading' : status}
        message={message}
        onLogin={status === 'success' ? handleLogin : undefined}
        onRetry={status === 'error' ? handleRetry : undefined}
      />
    </main>
  )
}
