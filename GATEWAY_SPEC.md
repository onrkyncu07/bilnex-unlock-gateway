# Bilnex Unlock Account Gateway — Proje Spesifikasyonu

> **Amaç:** E-postadaki engel kaldırma linkine tıklayan kullanıcıyı karşılayan, backend API'ye token gönderen ve sonucu gösterip login sayfasına yönlendiren hafif Vercel gateway uygulaması.

---

## 1. Genel Akış

```
Kullanıcı e-postadaki linke tıklar
  → https://bilnex-unlock-gateway.vercel.app/unlock-account?token={encryptedToken}
  → Gateway sayfası token'ı okur
  → POST {API_BASE_URL}/Auth/unlock-account  { "token": "..." }
  → Başarılı: 3 sn sonra login sayfasına yönlendir
  → Hata: kullanıcıya mesaj göster
```

### Backend referansları (BilnexCloudApi)

| Bileşen | Konum |
|---------|-------|
| E-posta linki üretimi | `TulparSoftware.Shared.Business/Projects/Identities/Auth/Commands/SendUnlockAccountEmailCommand.cs` |
| Token doğrulama + engel kaldırma | `TulparSoftware.Shared.Business/Projects/Identities/Auth/Commands/UnlockAccountByTokenCommand.cs` |
| API endpoint | `POST /Auth/unlock-account` — `TulparSoftware.WebApi/Controllers/Identity/AuthController.cs` |

Token formatı (backend tarafında çözülür, gateway sadece iletir):

- Payload: `{email}|{expireDateTime:O}` (ör. `test@bilnex.com|2026-06-25T23:00:00.0000000Z`)
- AES şifreli Base64 string
- E-postada `Uri.EscapeDataString` ile URL-encode edilmiş halde gelir
- Geçerlilik süresi: **2 saat**

---

## 2. Teknoloji Seçimi

**Öneri: Vite + React + TypeScript** (hızlı, tek sayfa, Vercel'e kolay deploy)

Alternatif: Next.js App Router (Vercel native; bu kadar basit akış için şart değil)

Stack:

- Vite 6 + React 18 + TypeScript
- React Router (tek route: `/unlock-account`)
- Tailwind CSS (hızlı UI)
- Deploy: Vercel

---

## 3. Ortam Değişkenleri (Dev / Prod)

### `.env.development` (local)

```env
VITE_API_BASE_URL=https://apidev.bilnex.cloud
VITE_LOGIN_URL=https://dev.bilnex.cloud/auth/login
VITE_REDIRECT_DELAY_MS=3000
```

### `.env.production` (Vercel Production)

```env
VITE_API_BASE_URL=https://api.bilnex.cloud
VITE_LOGIN_URL=https://app.bilnex.cloud/auth/login
VITE_REDIRECT_DELAY_MS=3000
```

### Vercel Dashboard → Environment Variables

| Variable | Preview / Development | Production |
|----------|----------------------|------------|
| `VITE_API_BASE_URL` | `https://apidev.bilnex.cloud` | `https://api.bilnex.cloud` |
| `VITE_LOGIN_URL` | `https://dev.bilnex.cloud/auth/login` | `https://app.bilnex.cloud/auth/login` |
| `VITE_REDIRECT_DELAY_MS` | `3000` | `3000` |

> **Not:** Backend e-posta linki şu an sabit: `https://bilnex-unlock-gateway.vercel.app/unlock-account`. Dev ortamında farklı Vercel preview URL kullanılacaksa backend'deki `UnlockGatewayBaseUrl` de ortama göre ayarlanmalı.

---

## 4. API Sözleşmesi

### Request

```
POST {VITE_API_BASE_URL}/Auth/unlock-account
Content-Type: application/json
Accept-Language: tr

{
  "token": "<URL'den alınan token — searchParams.get('token')>"
}
```

### Success (200)

```json
true
```

### Error (400 / 404)

Backend `ExceptionHandlerMiddleware` JSON **string dizisi** döner:

```json
["Linkin süresi dolmuş"]
```

veya

```json
["Geçersiz veya süresi dolmuş bağlantı"]
```

Olası mesajlar (`MessageConst`):

- `Hesabınız bloke edilmiştir. Engel kaldırma linki e-posta adresinize gönderildi.` (login tarafı)
- `Linkin süresi dolmuş`
- `Geçersiz veya süresi dolmuş bağlantı`

### CORS

Backend `AllowAnyOrigin()` kullanıyor → Vercel domain'den doğrudan browser fetch mümkün.

---

## 5. Klasör Yapısı (hedef)

```
bilnex-unlock-gateway/
├── GATEWAY_SPEC.md          ← bu dosya
├── README.md
├── package.json
├── vite.config.ts
├── vercel.json
├── tsconfig.json
├── index.html
├── .env.development
├── .env.production
├── .env.example
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── vite-env.d.ts
    ├── api/
    │   └── unlockAccount.ts
    ├── pages/
    │   └── UnlockAccountPage.tsx
    ├── components/
    │   ├── StatusCard.tsx
    │   └── LoadingSpinner.tsx
    └── types/
        └── unlock.ts
```

---

## 6. Uygulama Gereksinimleri

### Route: `/unlock-account`

Sayfa yüklendiğinde:

1. `const token = new URLSearchParams(window.location.search).get('token')`
2. Token yoksa → hata UI: *"Geçersiz bağlantı. Token bulunamadı."*
3. Token varsa → `POST /Auth/unlock-account`
4. Durumlar:
   - **loading:** "Hesabınızın engeli kaldırılıyor..."
   - **success:** "Hesabınızın engeli başarıyla kaldırıldı. Giriş sayfasına yönlendiriliyorsunuz..."
   - **error:** API'den gelen mesaj veya fallback metin
5. Success sonrası `VITE_REDIRECT_DELAY_MS` (varsayılan 3000ms) bekleyip:

   ```ts
   window.location.href = import.meta.env.VITE_LOGIN_URL
   ```

### UI / UX

- Bilnex markasına uygun sade kart layout (beyaz kart, mavi CTA, logo)
- Logo: `https://dev.bilnex.cloud/images/bilnex-bulut-logo.png`
- Mobil uyumlu
- Success'te manuel "Giriş Yap" butonu (redirect gecikirse)
- Error'da "Tekrar dene" butonu (sayfayı reload)

---

## 7. Örnek Kod Parçaları

### `src/api/unlockAccount.ts`

```ts
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
    } catch { /* ignore */ }
    throw new Error(message)
  }

  const result = await response.json()
  if (result !== true) {
    throw new Error('Beklenmeyen API yanıtı.')
  }
}
```

### `src/pages/UnlockAccountPage.tsx` (iskelet)

```tsx
import { useEffect, useState } from 'react'
import { unlockAccount } from '../api/unlockAccount'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function UnlockAccountPage() {
  const [status, setStatus] = useState<Status>('idle')
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
        setMessage('Hesabınızın engeli başarıyla kaldırıldı.')
        const delay = Number(import.meta.env.VITE_REDIRECT_DELAY_MS ?? 3000)
        setTimeout(() => {
          window.location.href = import.meta.env.VITE_LOGIN_URL
        }, delay)
      } catch (err) {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'Bilinmeyen hata')
      }
    }

    run()
  }, [])

  // ... StatusCard ile loading / success / error render
}
```

### `vercel.json` (SPA rewrite)

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 8. Kurulum Komutları (agent veya geliştirici)

```bash
npm create vite@latest bilnex-unlock-gateway -- --template react-ts
cd bilnex-unlock-gateway
npm install react-router-dom
npm install -D tailwindcss @tailwindcss/vite
```

`vite.config.ts` içine Tailwind plugin ekle, ardından bu spec'teki dosyaları oluştur.

---

## 9. Vercel Deploy Checklist

- [ ] GitHub repo oluştur ve push et
- [ ] Vercel'de "Import Project"
- [ ] Framework Preset: **Vite**
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Production env variables tanımla
- [ ] Preview branch'ler için Development env variables tanımla
- [ ] Custom domain (opsiyonel): `bilnex-unlock-gateway.vercel.app` zaten backend'de hardcoded
- [ ] Deploy sonrası gerçek e-posta linkiyle uçtan uca test

---

## 10. Test Senaryoları

| # | Senaryo | Beklenen |
|---|---------|----------|
| 1 | Geçerli token | 200, success UI, login redirect |
| 2 | Token yok | Hata: "Token bulunamadı" |
| 3 | Süresi dolmuş token | API 400, "Linkin süresi dolmuş" |
| 4 | Bozuk token | API 400, "Geçersiz veya süresi dolmuş bağlantı" |
| 5 | Zaten engelli olmayan kullanıcı | API 200 `true`, yine success + redirect |
| 6 | Dev env | `apidev.bilnex.cloud` + `dev.bilnex.cloud` login |
| 7 | Prod env | `api.bilnex.cloud` + `app.bilnex.cloud` login |

---

## 11. Backend ile Senkronizasyon Notları

1. E-posta linki backend'de sabit:
   `https://bilnex-unlock-gateway.vercel.app/unlock-account`
   → Prod gateway bu URL'de deploy edilmeli.

2. Dev test için iki seçenek:
   - **A)** Backend'de `UnlockGatewayBaseUrl`'i dev API ortamında preview URL yap
   - **B)** Prod gateway'i kullan ama env'de dev API'ye bağlan (karışıklık riski — önerilmez)

3. İleride backend'deki sabit URL config'e taşınabilir:

   ```json
   "UnlockGateway": {
     "BaseUrl": "https://bilnex-unlock-gateway.vercel.app/unlock-account"
   }
   ```

---

## 12. Agent Talimatı (yeni klasörde çalışırken)

Bu dosyayı (`GATEWAY_SPEC.md`) içeren boş veya yeni bir klasörde agent'a şunu söyle:

> "GATEWAY_SPEC.md dosyasını oku ve Vite + React + TypeScript ile bilnex-unlock-gateway projesini sıfırdan oluştur. Dev ve prod ortam dosyalarını, unlock-account sayfasını, API entegrasyonunu ve vercel.json'u hazırla. Tailwind ile Bilnex markasına uygun minimal UI yap."

Agent şunları yapmalı:

1. Vite React TS projesi scaffold
2. React Router ile `/unlock-account` route
3. `unlockAccount` API servisi
4. Loading / success / error UI
5. `.env.development`, `.env.production`, `.env.example`
6. `vercel.json`
7. `README.md` (deploy + test adımları)
8. `npm run build` hatasız çalışmalı

---

## 13. Hızlı Karar: React vs Alternatif

| Seçenek | Süre | Not |
|---------|------|-----|
| **Vite + React** | ~30 dk | Tercih edilen; tek sayfa, hafif |
| Next.js | ~45 dk | Vercel native ama bu iş için fazla |
| Vanilla HTML+JS | ~15 dk | En hızlı ama bakım zor |

**Sonuç:** React tercihinle uyumlu ve hızlı olan **Vite + React + TS** yeterli.
