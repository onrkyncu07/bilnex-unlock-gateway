import type { UnlockApiResponse, UnlockResult } from '../types/unlock'

const API_BASE = import.meta.env.VITE_API_BASE_URL

export async function unlockAccount(token: string): Promise<UnlockResult> {
  const response = await fetch(`${API_BASE}/Auth/unlock-account`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': 'tr',
    },
    body: JSON.stringify({ token }),
  })

  if (response.ok) {
    const data: UnlockApiResponse = await response.json()
    if (data.success && data.alreadyUnlocked) {
      return { type: 'already_unlocked' }
    }
    if (data.success) {
      return { type: 'unlocked' }
    }
    return { type: 'error', message: 'Beklenmeyen API yanıtı.' }
  }

  let message = 'İşlem sırasında bir hata oluştu.'
  try {
    const errors: string[] = await response.json()
    if (Array.isArray(errors) && errors.length > 0) {
      message = errors[0]
      if (message.includes('daha önce gerçekleştirilmiştir')) {
        return { type: 'already_processed' }
      }
    }
  } catch {
    /* ignore parse errors */
  }

  return { type: 'error', message }
}
