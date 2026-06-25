import { useEffect, useRef, useState } from 'react'
import { unlockAccount } from '../api/unlockAccount'
import { StatusCard } from '../components/StatusCard'
import type { UnlockResult, UnlockStatus } from '../types/unlock'

const LOGIN_URL = import.meta.env.VITE_LOGIN_URL
const REDIRECT_DELAY_MS = Number(
  import.meta.env.VITE_REDIRECT_DELAY_MS ?? 3000,
)

const RESULT_MESSAGES: Record<
  Exclude<UnlockResult['type'], 'error'>,
  string
> = {
  unlocked:
    'Hesabınızın engeli başarıyla kaldırıldı. Giriş sayfasına yönlendiriliyorsunuz...',
  already_unlocked:
    'Hesabınız zaten açıktır. Giriş sayfasına yönlendiriliyorsunuz...',
  already_processed:
    'Bu işlem daha önce gerçekleştirilmiştir. Giriş yapabilirsiniz.',
}

function resultToStatus(type: UnlockResult['type']): UnlockStatus {
  switch (type) {
    case 'unlocked':
      return 'success'
    case 'already_unlocked':
    case 'already_processed':
      return 'info'
    case 'error':
      return 'error'
  }
}

export function UnlockAccountPage() {
  const [status, setStatus] = useState<UnlockStatus>('idle')
  const [message, setMessage] = useState('')
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    const token = new URLSearchParams(window.location.search).get('token')
    if (!token) {
      setStatus('error')
      setMessage('Geçersiz bağlantı. Token bulunamadı.')
      return
    }

    const run = async () => {
      setStatus('loading')
      const result = await unlockAccount(token)

      if (result.type === 'error') {
        setStatus('error')
        setMessage(result.message)
        return
      }

      setStatus(resultToStatus(result.type))
      setMessage(RESULT_MESSAGES[result.type])
      setTimeout(() => {
        window.location.href = LOGIN_URL
      }, REDIRECT_DELAY_MS)
    }

    void run()
  }, [])

  const handleLogin = () => {
    window.location.href = LOGIN_URL
  }

  const handleRetry = () => {
    window.location.reload()
  }

  const showLogin = status === 'success' || status === 'info'

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-bilnex-50 to-white px-4 py-12">
      <StatusCard
        status={status === 'idle' ? 'loading' : status}
        message={message}
        onLogin={showLogin ? handleLogin : undefined}
        onRetry={status === 'error' ? handleRetry : undefined}
      />
    </main>
  )
}
