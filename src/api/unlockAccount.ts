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

  if (!response.ok) {
    let message = 'İşlem sırasında bir hata oluştu.'
    try {
      const errors: string[] = await response.json()
      if (Array.isArray(errors) && errors.length > 0) {
        message = errors[0]
      }
    } catch {
      /* ignore parse errors */
    }
    return { type: 'error', message }
  }

  const data: UnlockApiResponse = await response.json()

  if (data.linkAlreadyUsed) {
    return { type: 'already_processed' }
  }
  if (data.alreadyUnlocked) {
    return { type: 'already_unlocked' }
  }
  return { type: 'unlocked' }
}
