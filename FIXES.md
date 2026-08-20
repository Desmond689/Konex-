# KONEX fixes applied

## Critical bugs fixed
1. **Blank screen / app closes** — `isLoading` stayed true forever when there was no session or when session fetch failed because `clearAuth()` did not set `isLoading: false`. Fixed in `src/store/authStore.ts`. Also added `finally { setLoading(false) }` in `App.tsx`.
2. **Web blank UI** — `App.tsx` returned `null` while loading. Replaced with a dark loading shell.
3. **Expo SDK 51 dependency mismatches** — `expo-crypto`, `expo-device`, `expo-document-picker`, `expo-notifications` were at v57 (SDK 52+). Aligned to SDK 51 ranges.
4. **Session hang** — Added 8s timeout around `supabase.auth.getSession()`.
5. **Invalid Supabase anon key** — Your `.env` key (`sb_publishable_...`) is NOT a valid Supabase JWT. Real keys start with `eyJ...`. Get it from Supabase Dashboard → Project Settings → API. Client warns instead of crashing.
6. **Env loading** — Added `app.config.js` so public env vars are available.

## After unzip
```bash
cd KONEX
# Edit .env — put real Supabase anon key (starts with eyJ)
npm install
npx expo start
```
You should see the Login screen.
