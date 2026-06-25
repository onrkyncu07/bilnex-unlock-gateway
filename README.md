# Bilnex Unlock Account Gateway

E-postadaki engel kaldırma linkine tıklayan kullanıcıları karşılayan, backend API'ye token gönderen ve sonucu gösterip giriş sayfasına yönlendiren hafif Vercel gateway uygulaması.

## Teknoloji

- Vite 5 + React 18 + TypeScript
- React Router (`/unlock-account`)
- Tailwind CSS 4
- Deploy: Vercel

## Kurulum

```bash
npm install
```

## Geliştirme

```bash
npm run dev
```

Uygulama `http://localhost:5173` adresinde açılır. Test için:

```
http://localhost:5173/unlock-account?token=<encryptedToken>
```

Dev ortamında API: `https://apidev.bilnex.cloud`  
Login yönlendirme: `https://dev.bilnex.cloud/auth/login`

## Ortam Değişkenleri

| Değişken | Açıklama |
|----------|----------|
| `VITE_API_BASE_URL` | Backend API base URL |
| `VITE_LOGIN_URL` | Başarı sonrası yönlendirme URL'i |
| `VITE_REDIRECT_DELAY_MS` | Yönlendirme gecikmesi (ms, varsayılan 3000) |

- `.env.development` — local geliştirme
- `.env.production` — production build
- `.env.example` — şablon (Vercel / yeni ortam kurulumu)

## Build

```bash
npm run build
npm run preview
```

## Vercel Deploy

1. GitHub repo'ya push edin
2. Vercel'de **Import Project** → Framework: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variables:

| Variable | Preview / Development | Production |
|----------|----------------------|------------|
| `VITE_API_BASE_URL` | `https://apidev.bilnex.cloud` | `https://api.bilnex.cloud` |
| `VITE_LOGIN_URL` | `https://dev.bilnex.cloud/auth/login` | `https://app.bilnex.cloud/auth/login` |
| `VITE_REDIRECT_DELAY_MS` | `3000` | `3000` |

6. Deploy sonrası production URL: `https://bilnex-unlock-gateway.vercel.app` (backend e-posta linkinde sabit)

`vercel.json` SPA rewrite içerir; tüm route'lar `index.html`'e yönlendirilir.

## Test Senaryoları

| # | Senaryo | Beklenen |
|---|---------|----------|
| 1 | Geçerli token | 200, success UI, login redirect |
| 2 | Token yok | Hata: "Token bulunamadı" |
| 3 | Süresi dolmuş token | API 400, "Linkin süresi dolmuş" |
| 4 | Bozuk token | API 400, "Geçersiz veya süresi dolmuş bağlantı" |
| 5 | Zaten engelli olmayan kullanıcı | API 200 `true`, success + redirect |
| 6 | Dev env | `apidev.bilnex.cloud` + `dev.bilnex.cloud` login |
| 7 | Prod env | `api.bilnex.cloud` + `app.bilnex.cloud` login |

## Akış

```
Kullanıcı e-posta linkine tıklar
  → /unlock-account?token={encryptedToken}
  → POST {API}/Auth/unlock-account
  → Başarılı: 3 sn sonra login sayfasına yönlendir
  → Hata: kullanıcıya mesaj göster
```

Detaylı spesifikasyon için `GATEWAY_SPEC.md` dosyasına bakın.
