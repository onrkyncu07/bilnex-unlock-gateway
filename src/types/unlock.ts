export type UnlockStatus = 'idle' | 'loading' | 'success' | 'info' | 'error'

export type UnlockResult =
  | { type: 'unlocked' }
  | { type: 'already_unlocked' }
  | { type: 'already_processed' }
  | { type: 'error'; message: string }

export interface UnlockAccountRequest {
  token: string
}

export interface UnlockApiResponse {
  success: boolean
  alreadyUnlocked: boolean
}
