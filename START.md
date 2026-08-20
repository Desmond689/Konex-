# KONEX — Quick start (test on web first)

## 1. Install
```bash
cd KONEX
npm install
```

## 2. Env (optional for UI test)
Edit `.env` if you want real auth:
- `EXPO_PUBLIC_SUPABASE_URL` — your project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — must start with `eyJ...` (Dashboard → Settings → API → anon public)

Without a valid key, Login/Signup UI still opens; login will fail until the key is fixed.

## 3. Run web
```bash
npx expo start --web
```
Or:
```bash
npm run web
```

Open the URL Metro prints (usually http://localhost:8081).

You should see:
- Dark loading shell briefly
- **Login** screen with email/password
- **Forgot Password?**
- **Don't have an account? Sign Up** → Signup screen

## 4. Phone later
```bash
npx expo start
```
Scan QR with Expo Go (same Wi‑Fi). Use tunnel if needed: `npx expo start --tunnel`

## Fixes already in this zip
- Loading no longer stuck blank
- AuthFooter fixed (Sign Up / Sign In links)
- Expo 51-compatible package versions
- Session timeout + safer Supabase client init
- app.config.js for env
