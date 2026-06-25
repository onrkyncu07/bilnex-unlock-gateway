/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_LOGIN_URL: string
  readonly VITE_REDIRECT_DELAY_MS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
