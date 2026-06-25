import type { UnlockApiResponse, UnlockResult } from '../types/unlock'

const API_BASE = import.meta.env.VITE_API_BASE_URL

function parseUnlockResponse(raw: unknown): UnlockApiResponse | null {
  if (!raw || typeof raw !== 'object') return null
  const data = raw as Record<string, unknown>
  const success = data.success ?? data.Success
  if (success !== true && success !== 'true') return null

  const alreadyUnlocked = data.alreadyUnlocked ?? data.AlreadyUnlocked
  const linkAlreadyUsed = data.linkAlreadyUsed ?? data.LinkAlreadyUsed

  return {
    success: true,
    alreadyUnlocked: alreadyUnlocked === true || alreadyUnlocked === 'true',
    linkAlreadyUsed: linkAlreadyUsed === true || linkAlreadyUsed === 'true',
  }
}

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

  let raw: unknown
  try {
    raw = await response.json()
  } catch {
    return { type: 'error', message: 'Beklenmeyen API yanıtı.' }
  }

  const data = parseUnlockResponse(raw)
  if (!data) {
    return { type: 'error', message: 'Beklenmeyen API yanıtı.' }
  }

  if (data.linkAlreadyUsed) {
    return { type: 'already_processed' }
  }
  if (data.alreadyUnlocked) {
    return { type: 'already_unlocked' }
  }
  return { type: 'unlocked' }
}
