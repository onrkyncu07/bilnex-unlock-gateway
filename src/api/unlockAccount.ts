const API_BASE = import.meta.env.VITE_API_BASE_URL

export async function unlockAccount(token: string): Promise<void> {
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
    throw new Error(message)
  }

  const result = await response.json()
  if (result !== true) {
    throw new Error('Beklenmeyen API yanıtı.')
  }
}
