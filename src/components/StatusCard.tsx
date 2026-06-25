import type { UnlockStatus } from '../types/unlock'
import { LoadingSpinner } from './LoadingSpinner'

const BILNEX_LOGO =
  'https://dev.bilnex.cloud/images/bilnex-bulut-logo.png'

interface StatusCardProps {
  status: UnlockStatus
  message: string
  onLogin?: () => void
  onRetry?: () => void
}

export function StatusCard({
  status,
  message,
  onLogin,
  onRetry,
}: StatusCardProps) {
  const isLoading = status === 'loading'
  const isSuccess = status === 'success'
  const isInfo = status === 'info'
  const isError = status === 'error'

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg shadow-bilnex-900/5 ring-1 ring-bilnex-100">
      <div className="mb-6 flex justify-center">
        <img
          src={BILNEX_LOGO}
          alt="Bilnex Bulut"
          className="h-12 w-auto"
        />
      </div>

      <div className="mb-6 flex flex-col items-center gap-4 text-center">
        {isLoading && <LoadingSpinner />}

        {isSuccess && (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
            aria-hidden
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}

        {isInfo && (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full bg-bilnex-50 text-bilnex-600"
            aria-hidden
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
              />
            </svg>
          </div>
        )}

        {isError && (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600"
            aria-hidden
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        )}

        <h1 className="text-lg font-semibold text-bilnex-900">
          {isLoading && 'Hesap Engel Kaldırma'}
          {isSuccess && 'İşlem Başarılı'}
          {isInfo && 'Bilgi'}
          {isError && 'İşlem Başarısız'}
        </h1>

        <p className="text-sm leading-relaxed text-bilnex-600">
          {isLoading
            ? 'Hesabınızın engeli kaldırılıyor...'
            : message}
        </p>
      </div>

      {(isSuccess || isInfo) && onLogin && (
        <button
          type="button"
          onClick={onLogin}
          className="w-full rounded-lg bg-bilnex-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-bilnex-700 focus:outline-none focus:ring-2 focus:ring-bilnex-500 focus:ring-offset-2"
        >
          Giriş Yap
        </button>
      )}

      {isError && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="w-full rounded-lg bg-bilnex-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-bilnex-700 focus:outline-none focus:ring-2 focus:ring-bilnex-500 focus:ring-offset-2"
        >
          Tekrar Dene
        </button>
      )}
    </div>
  )
}
