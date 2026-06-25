export type UnlockStatus = 'idle' | 'loading' | 'success' | 'error'

export interface UnlockAccountRequest {
  token: string
}
